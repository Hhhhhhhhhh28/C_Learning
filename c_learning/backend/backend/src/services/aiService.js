import { config } from '../config.js'

const MAX_RETRY_AFTER_MS = 3000
const DEFAULT_RETRY_DELAY_MS = 600

class AIProviderError extends Error {
  constructor(message, { status, detail, body, retryAfterMs, temporary = false } = {}) {
    super(message)
    this.name = 'AIProviderError'
    this.status = status
    this.detail = detail
    this.body = body
    this.retryAfterMs = retryAfterMs
    this.temporary = temporary
  }
}

const buildMessages = ({ message, context = {} }) => {
  const contextLines = [
    context.currentCourse ? `当前课程：${context.currentCourse}` : '',
    context.currentTopic ? `当前知识点：${context.currentTopic}` : '',
  ].filter(Boolean)

  const systemPrompt = [
    '你是一个前端学习平台的中文 AI 学习助手。',
    '回答要清晰、简洁、适合初学者。',
    '优先解释 HTML、CSS、JavaScript 和前端基础概念。',
    '如果有课程上下文，请结合上下文回答。',
  ].join('\n')

  const userContent = contextLines.length
    ? `${contextLines.join('\n')}\n\n用户问题：${message}`
    : message

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ]
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const parseRetryAfterMs = retryAfter => {
  if (!retryAfter) return null

  const seconds = Number(retryAfter)
  if (Number.isFinite(seconds)) {
    return Math.max(0, Math.min(seconds * 1000, MAX_RETRY_AFTER_MS))
  }

  const retryDate = new Date(retryAfter).getTime()
  if (Number.isFinite(retryDate)) {
    return Math.max(0, Math.min(retryDate - Date.now(), MAX_RETRY_AFTER_MS))
  }

  return null
}

const isTemporaryAIError = (status, detail = '') => {
  const normalizedDetail = String(detail).toLowerCase()

  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    normalizedDetail.includes('rate limit') ||
    normalizedDetail.includes('temporarily') ||
    normalizedDetail.includes('temporary') ||
    normalizedDetail.includes('overloaded') ||
    normalizedDetail.includes('timeout') ||
    normalizedDetail.includes('unavailable')
  )
}

const getErrorDetail = (data, rawText) => {
  return (
    data?.error?.message ||
    data?.message ||
    data?.error ||
    rawText ||
    'AI provider request failed'
  )
}

const getChatCompletionsUrl = () => {
  return `${config.ai.baseUrl.replace(/\/+$/, '')}/chat/completions`
}

const requestChatCompletion = async ({ messages, attempt }) => {
  const response = await fetch(getChatCompletionsUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.ai.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.ai.model,
      messages,
      stream: false,
    }),
  })

  const rawText = await response.text()
  let data = null
  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch (_error) {
    data = null
  }

  if (!response.ok) {
    const detail = getErrorDetail(data, rawText)
    const retryAfterMs = parseRetryAfterMs(response.headers.get('retry-after'))
    const temporary = isTemporaryAIError(response.status, detail)

    console.error('AI provider request failed', {
      provider: config.ai.provider,
      status: response.status,
      model: config.ai.model,
      attempt,
      temporary,
      retryAfterMs,
      body: data || rawText || null,
    })

    throw new AIProviderError(`AI provider request failed: ${response.status} - ${detail}`, {
      status: response.status,
      detail,
      body: data || rawText || null,
      retryAfterMs,
      temporary,
    })
  }

  const reply = data?.choices?.[0]?.message?.content?.trim()
  if (!reply) {
    throw new AIProviderError('AI provider returned an empty response', {
      status: response.status,
      body: data || rawText || null,
      temporary: false,
    })
  }

  return reply
}

export const sendAIChat = async ({ message, context }) => {
  if (!config.ai.apiKey) {
    throw new Error('ChatAnywhere API key is not configured')
  }

  if (!config.ai.model) {
    throw new Error('ChatAnywhere model is not configured')
  }

  if (typeof fetch !== 'function') {
    throw new Error('Backend runtime does not support fetch. Please use Node.js 18+.')
  }

  const messages = buildMessages({ message, context })

  try {
    const reply = await requestChatCompletion({
      messages,
      attempt: 'primary',
    })

    return {
      reply,
      model: config.ai.model,
      notice: '',
    }
  } catch (error) {
    if (!error.temporary) {
      throw error
    }

    const retryDelayMs = error.retryAfterMs ?? DEFAULT_RETRY_DELAY_MS
    console.warn('Temporary AI provider failure; retrying chat request', {
      provider: config.ai.provider,
      status: error.status,
      model: config.ai.model,
      retryDelayMs,
    })

    if (retryDelayMs > 0) {
      await sleep(retryDelayMs)
    }
  }

  try {
    const reply = await requestChatCompletion({
      messages,
      attempt: 'retry',
    })

    return {
      reply,
      model: config.ai.model,
      notice: '',
    }
  } catch (error) {
    if (error.temporary) {
      throw new Error('当前AI对话服务较繁忙，请稍后再试')
    }

    throw error
  }
}

export const getStudySuggestion = async ({ message, context }) => {
  return sendAIChat({ message, context })
}
