import axios from 'axios'
import service from '@/utils/aiRequest.js'
import backendService from '@/utils/request.js'
// 引入仓库
import { useUserStore } from '@/stores/index'
import { getErrorQuestion } from './question'
import {
  generateConfigChapter,
  generateConfigTopic,
  generateConfigProficiency,
} from '@/utils/aiAPI/zhipuConfig.js'
// ai对话接口
export const apiPostAiTalk = question =>
  axios.get('http://47.122.30.214:8101/api/knowPoint/aiAsk', {
    params: { question },
  })
// ai对话接口Node版流式响应
export const apiPostAiTalkNode = question =>
  axios.get('http://127.0.0.1:3007/api/aiTalk', {
    params: { question },
  })

// 获取题目--全是这个章节的相关的
/**
 *
 * @param {*} chapter 章节id
 * @param {*} questionCount 题目数量
 * @returns
 */
export const apiPostChapterAi = (chapter, questionCount) =>
  service({
    method: 'post',
    url: '',
    data: generateConfigChapter(chapter, questionCount),
  })

/**
 * 获取题目--全是某一章节某一个知识点的相关的
 * @param {*} chapter 章节id
 * @param {*} topic 知识点id
 * @param {*} questionCount 题目数量
 * @returns
 */
export const apiPostTopicAi = (chapter, topic, questionCount) =>
  service({
    method: 'post',
    url: '',
    data: generateConfigTopic(chapter, topic, questionCount),
  })

/**
 * 获取知识点熟练度
 * @param {*} question 题目
 * @param {*} useranswer 用户答案
 * @returns
 */
export const apiPostProficiencyAi = (question, useranswer) =>
  service({
    method: 'post',
    url: '',
    data: generateConfigProficiency(question, useranswer),
  })

/**
 * AI 对话：统一走后端 AI 代理，避免前端暴露密钥。
 */
export const apiPostTalk = question =>
  backendService.post('/api/ai/chat', {
    message: question,
    context: {
      currentCourse: '前端基础',
      currentTopic: 'AI对话',
    },
  })

const countBy = (list, getter) => {
  return list.reduce((map, item) => {
    const key = getter(item) || '未分类'
    map[key] = (map[key] || 0) + 1
    return map
  }, {})
}

const formatTopEntries = (map, limit = 3) => {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

export const createWrongQuestionBasicAnalysis = showTopicResults => {
  const wrongQuestions = Array.isArray(showTopicResults) ? showTopicResults : []

  if (!wrongQuestions.length) {
    return [
      {
        title: '错题概况',
        contentText: '当前没有错题记录，说明近期练习表现较稳定。建议继续保持学习节奏，并定期完成小测验巩固知识。',
      },
      {
        title: '薄弱知识点',
        contentText: '暂无明显薄弱知识点。可以优先学习下一主题，遇到新错题后系统会继续生成分析。',
      },
      {
        title: '学习建议',
        contentText: '建议保持“学习内容 → 完成练习 → 查看结果 → 复盘错题”的闭环学习方式。',
      },
    ]
  }

  const byKnowledge = formatTopEntries(countBy(wrongQuestions, item => item.knowPointName))
  const byDifficulty = formatTopEntries(countBy(wrongQuestions, item => `难度${item.difficulty || 0}`))
  const byHierarchy = formatTopEntries(countBy(wrongQuestions, item => `重点${item.hierarchy || 0}`))
  const weakKnowledgeText = byKnowledge
    .map(([name, count]) => `${name}（${count}题）`)
    .join('、')
  const difficultyText = byDifficulty
    .map(([name, count]) => `${name}：${count}题`)
    .join('，')
  const hierarchyText = byHierarchy
    .map(([name, count]) => `${name}：${count}题`)
    .join('，')

  return [
    {
      title: '错题概况',
      contentText: `当前错题共 ${wrongQuestions.length} 题。${difficultyText ? `难度分布为 ${difficultyText}。` : ''}`,
    },
    {
      title: '薄弱知识点',
      contentText: weakKnowledgeText
        ? `主要薄弱点集中在：${weakKnowledgeText}。建议先复盘这些知识点，再做同类型练习。`
        : '错题知识点分布暂不明确，建议从最近出错的题目开始复盘。',
    },
    {
      title: '学习建议',
      contentText: `${hierarchyText ? `重点分布为 ${hierarchyText}。` : ''}建议优先查看错题详情，理解正确答案和解析，然后使用“做同类型”进行强化训练。`,
    },
  ]
}

const parseAnalyzeReply = reply => {
  if (!reply || typeof reply !== 'string') return null

  const jsonText = reply
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(jsonText)
    return Array.isArray(parsed) ? parsed : null
  } catch (_error) {
    return null
  }
}

export const apiGetEnhancedAiAnalyze = async showTopicResults => {
  const compactQuestions = (showTopicResults || []).slice(0, 20).map(item => ({
    title: item.title,
    knowPointName: item.knowPointName,
    difficulty: item.difficulty,
    hierarchy: item.hierarchy,
    studentAnswer: item.studentAnswer,
  }))

  const { data } = await backendService.post('/api/ai/chat', {
    message: [
      '请基于以下错题数据生成错题本AI分析。',
      '必须只返回JSON数组，不要返回Markdown，不要解释。',
      '数组包含3项，每项格式为：{"title":"...","contentText":"..."}。',
      '三个title分别围绕：错题概况、薄弱知识点、学习建议。',
      `错题数据：${JSON.stringify(compactQuestions)}`,
    ].join('\n'),
    context: {
      currentCourse: '前端基础',
      currentTopic: '错题本AI分析',
    },
  })

  const parsed = parseAnalyzeReply(data?.reply)
  if (!parsed) {
    throw new Error('AI分析返回格式不可用')
  }

  return parsed
}

/**
 * ai分析
 * @returns
 */
export const apiGetAiAnalyze = async showTopicResults => {
  const userStore = useUserStore()
  let wrongQuestions = showTopicResults
  if (!Array.isArray(wrongQuestions)) {
    const {
      data: { showTopicResults: fetchedResults },
    } = await getErrorQuestion({
      stuId: userStore.studentId,
    })
    wrongQuestions = fetchedResults
  }
  const fallback = createWrongQuestionBasicAnalysis(wrongQuestions)

  try {
    return await apiGetEnhancedAiAnalyze(wrongQuestions)
  } catch (error) {
    console.warn('AI analysis failed, using internal fallback:', error)
    return fallback
  }
}
