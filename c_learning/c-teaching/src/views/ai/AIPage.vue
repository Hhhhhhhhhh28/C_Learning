<template>
  <div class="ai-page">
    <h1>AI智能辅助</h1>

    <section class="ai-capabilities" aria-label="AI智能辅助能力">
      <article
        v-for="capability in aiCapabilities"
        :key="capability.title"
        class="capability-card"
      >
        <span class="capability-icon">{{ capability.icon }}</span>
        <div>
          <strong>{{ capability.title }}</strong>
          <p>{{ capability.description }}</p>
        </div>
      </article>
    </section>

    <el-card class="ai-chat-card">
      <template #header>
        <div class="ai-chat-header">
          <span>AI学习助手</span>
          <span class="source-badge external">外部AI对话</span>
        </div>
      </template>
      <div class="ai-chat-body">
        <el-input
          v-model="chatMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入你的学习问题，例如：请用中文解释什么是HTML"
        />
        <div class="example-questions" aria-label="示例问题">
          <button
            v-for="question in exampleQuestions"
            :key="question"
            type="button"
            @click="useExampleQuestion(question)"
          >
            {{ question }}
          </button>
        </div>
        <div v-if="chatReply" class="ai-chat-reply">
          {{ chatReply }}
        </div>
        <div class="ai-chat-actions">
          <el-button
            type="primary"
            :loading="chatLoading"
            :disabled="!chatMessage.trim()"
            @click="sendChatMessage"
          >
            发送
          </el-button>
        </div>
      </div>
    </el-card>
    
    <el-tabs v-model="activeTab" class="ai-tabs">
      <el-tab-pane label="学习路径" name="paths">
        <div class="rule-panel">
          <el-card class="insight-card primary-insight">
            <template #header>
              <div class="path-header">
                <span class="path-name">推荐学习路径</span>
                <span class="source-badge internal">系统规则</span>
                <span class="path-difficulty difficulty-2">{{ learnerSnapshot.stage }}</span>
              </div>
            </template>
            <div class="insight-body">
              <div>
                <p class="insight-label">当前阶段</p>
                <strong>{{ learnerSnapshot.stage }}</strong>
              </div>
              <div>
                <p class="insight-label">推荐下一步</p>
                <strong>{{ roadmapRecommendation.nextTopic }}</strong>
              </div>
              <div>
                <p class="insight-label">路径进度</p>
                <el-progress :percentage="learnerSnapshot.progress" :format="() => `${learnerSnapshot.progress}%`" />
              </div>
              <p class="recommend-basis">推荐依据：{{ roadmapRecommendation.reason }}</p>
            </div>
          </el-card>

          <div class="roadmap-grid">
            <div
              v-for="step in roadmapSteps"
              :key="step.title"
              class="roadmap-step"
              :class="{ active: step.active, done: step.done }"
            >
              <span class="step-index">{{ step.index }}</span>
              <div>
                <strong>{{ step.title }}</strong>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="paths-container">
          <el-card v-for="path in displayedLearningPaths" :key="path.id" class="path-card">
            <template #header>
              <div class="path-header">
                <span class="path-name">{{ path.path_name }}</span>
                <span class="path-difficulty" :class="`difficulty-${path.difficulty}`">
                  {{ getDifficultyText(path.difficulty) }}
                </span>
              </div>
            </template>
            <div class="path-content">
              <p class="path-description">{{ path.description }}</p>
              <p class="path-recommended">推荐人群: {{ path.recommended_for }}</p>
              <div class="path-progress" v-if="path.progress !== undefined">
                <el-progress :percentage="path.progress || 0" :format="() => `${path.progress || 0}%`" />
                <span class="progress-text">{{ path.status === 1 ? '已完成' : '进行中' }}</span>
              </div>
              <div class="path-actions">
                <el-button v-if="path.progress === undefined" type="primary" @click="startPath(path.id)">开始学习</el-button>
                <el-button v-else type="info" @click="viewPathDetail(path.id)">查看详情</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="学习建议" name="suggestions">
        <div class="status-grid">
          <el-card class="metric-card">
            <span>当前学习状态</span>
            <strong>{{ studyStatusLabel }}</strong>
          </el-card>
          <el-card class="metric-card">
            <span>最近测验</span>
            <strong>{{ learnerSnapshot.recentQuizScore }}%</strong>
          </el-card>
          <el-card class="metric-card">
            <span>错题数量</span>
            <strong>{{ learnerSnapshot.wrongQuestionCount }}</strong>
          </el-card>
          <el-card class="metric-card">
            <span>学习时长</span>
            <strong>{{ learnerSnapshot.studyDuration }}分钟</strong>
          </el-card>
        </div>

        <div class="suggestions-container">
          <el-card v-for="suggestion in ruleSuggestions" :key="suggestion.id" class="suggestion-card" :class="{ 'unread': !suggestion.is_read }">
            <template #header>
              <div class="suggestion-header">
                <span class="suggestion-type">{{ getSuggestionTypeText(suggestion.type) }}</span>
                <span class="suggestion-time">{{ formatTime(suggestion.created_at) }}</span>
              </div>
            </template>
            <div class="suggestion-content">
              <p class="suggestion-text">{{ suggestion.suggestion }}</p>
              <p class="recommend-basis">推荐依据：{{ suggestion.basis }}</p>
              <div class="suggestion-actions">
                <el-button
                  v-if="suggestion.actionText && suggestion.actionPath"
                  type="primary"
                  @click="goRecommendation(suggestion)"
                >
                  {{ suggestion.actionText }}
                </el-button>
                <el-button v-if="suggestion.fromServer && !suggestion.is_read" type="text" @click="markAsRead(suggestion.id)">标记为已读</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="难度调整" name="difficulty">
        <div class="difficulty-container">
          <el-card class="difficulty-card difficulty-assessment-card">
            <template #header>
              <div class="difficulty-header">
                <span>难度评估结果</span>
                <span class="source-badge internal">系统规则</span>
                <span class="path-difficulty difficulty-3">{{ difficultyRecommendation.level }}</span>
              </div>
            </template>
            <div class="difficulty-summary">
              <div>
                <span>建议难度</span>
                <strong>{{ difficultyRecommendation.level }}</strong>
              </div>
              <div>
                <span>推荐练习</span>
                <strong>{{ difficultyRecommendation.exercise }}</strong>
              </div>
              <p class="recommend-basis">推荐依据：{{ difficultyRecommendation.reason }}</p>
            </div>
          </el-card>

          <el-card class="difficulty-card" v-if="displayedDifficultyAdjustments.length">
            <template #header>
              <div class="difficulty-header">
                <span>难度调整记录</span>
              </div>
            </template>
            <el-table :data="displayedDifficultyAdjustments" style="width: 100%">
              <el-table-column prop="know_name" label="知识点" />
              <el-table-column prop="old_difficulty" label="原难度" width="100" />
              <el-table-column prop="new_difficulty" label="新难度" width="100" />
              <el-table-column prop="reason" label="调整原因" />
              <el-table-column prop="created_at" label="调整时间" />
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  apiGetLearningPaths,
  apiStartLearningPath,
  apiGetSuggestions,
  apiMarkSuggestionAsRead,
  apiGetDifficultyAdjustments,
  apiPostAIChat,
} from '@/api/ai'
import { apiGetAllPoints } from '@/api/chapters'
import { apiGetStudyPoints, apiGetStudyStatus } from '@/api/home'
import { getErrorQuestion } from '@/api/question'
import { useUserStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const activeTab = ref('paths')
const learningPaths = ref([])
const suggestions = ref([])
const difficultyAdjustments = ref([])
const studyStatus = ref({})
const studyPoints = ref([])
const allKnowledgePoints = ref([])
const wrongQuestions = ref([])
const chatMessage = ref('')
const chatReply = ref('')
const chatLoading = ref(false)
const userStore = useUserStore()

const aiCapabilities = [
  {
    icon: '问',
    title: '智能问答',
    description: '输入前端学习问题，获得概念解释、代码提示和复习方向。',
  },
  {
    icon: '荐',
    title: '学习建议',
    description: '根据学习进度、错题数量和测验表现推荐下一步学习内容。',
  },
  {
    icon: '结',
    title: '知识点总结',
    description: '围绕 HTML、CSS、JavaScript 的核心知识生成重点归纳。',
  },
  {
    icon: '析',
    title: '错题分析',
    description: '结合错题本识别薄弱知识点，帮助学生更有目标地复习。',
  },
  {
    icon: '路',
    title: '学习路径推荐',
    description: '按照入门、基础、进阶阶段组织前端学习路线。',
  },
]

const exampleQuestions = [
  'HTML 语义化标签有什么作用？',
  'CSS Flex 布局和 Grid 布局有什么区别？',
  'JavaScript 中 let、const 和 var 的区别是什么？',
  '如何根据错题复习前端知识点？',
]

const fallbackLearnerState = {
  currentCourse: '前端基础',
  currentTopic: 'HTML 文档结构',
  nextTopic: 'CSS选择器与盒模型',
  progress: 35,
  recentQuizScore: 72,
  wrongQuestionCount: 8,
  studyDuration: 17,
  completedTopics: ['HTML 基础结构'],
  learnerLevel: '基础巩固',
}

const fallbackLearningPaths = [
  {
    id: 'rule-html',
    path_name: 'HTML基础',
    description: '先掌握页面骨架、常用标签和语义化结构，为后续样式与交互学习打基础。',
    recommended_for: '初学者 / 基础巩固阶段',
    difficulty: 1,
    progress: 60,
    status: 0,
  },
  {
    id: 'rule-css',
    path_name: 'CSS基础',
    description: '重点学习选择器、盒模型、布局方式和响应式页面组织。',
    recommended_for: '已完成HTML基础的学生',
    difficulty: 2,
    progress: 25,
    status: 0,
  },
  {
    id: 'rule-js',
    path_name: 'JavaScript基础',
    description: '学习变量、数据类型、函数、事件和DOM操作，逐步完成交互练习。',
    recommended_for: '具备HTML/CSS基础的学生',
    difficulty: 3,
    progress: 0,
    status: 0,
  },
]

const normalizePercent = value => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, Math.min(100, Math.round(number)))
}

const learnerSnapshot = computed(() => {
  const paths = Array.isArray(learningPaths.value) ? learningPaths.value : []
  const progressedPaths = paths.filter(path => path.progress !== undefined && path.progress !== null)
  const pathProgress = progressedPaths.length
    ? normalizePercent(progressedPaths.reduce((sum, path) => sum + Number(path.progress || 0), 0) / progressedPaths.length)
    : 0
  const studiedPointIds = new Set(studyPoints.value.map(point => point.knowPointId || point.knowledge_point_id))
  const studiedFromAllPoints = allKnowledgePoints.value.filter(point => point.knowState === 0)
  const studiedCount = studiedFromAllPoints.length || studiedPointIds.size
  const studiedProgress = studiedCount && allKnowledgePoints.value.length
    ? normalizePercent((studiedCount / allKnowledgePoints.value.length) * 100)
    : 0
  const progress = pathProgress || studiedProgress || fallbackLearnerState.progress
  const completedFromPaths = paths
    .filter(path => path.status === 1 || Number(path.progress || 0) >= 100)
    .map(path => path.path_name)
  const completedFromStudy = (studiedFromAllPoints.length
    ? studiedFromAllPoints
    : allKnowledgePoints.value.filter(point => studiedPointIds.has(point.id))
  )
    .map(point => point.knowName || point.know_name || point.pointName || point.name)
    .filter(Boolean)
  const completedTopics = completedFromPaths.length ? completedFromPaths : completedFromStudy
  const latestServerSuggestion = suggestions.value?.[0]?.suggestion || ''
  const recentQuizScore = latestServerSuggestion.includes('高')
    ? 88
    : latestServerSuggestion.includes('低')
      ? 55
      : fallbackLearnerState.recentQuizScore
  const wrongQuestionCount = Math.max(
    wrongQuestions.value.length || fallbackLearnerState.wrongQuestionCount,
    suggestions.value?.filter(item => !item.is_read).length || 0,
  )
  const stage = progress >= 70 || recentQuizScore >= 85
    ? '进阶提升'
    : progress >= 35 || recentQuizScore >= 60
      ? '基础巩固'
      : '入门构建'

  return {
    ...fallbackLearnerState,
    progress,
    recentQuizScore,
    wrongQuestionCount,
    completedTopics: completedTopics.length ? completedTopics : fallbackLearnerState.completedTopics,
    currentTopic:
      studyStatus.value?.pointName ||
      paths.find(path => Number(path.progress || 0) < 100)?.path_name ||
      fallbackLearnerState.currentTopic,
    nextTopic: studyStatus.value?.nextPointName || fallbackLearnerState.nextTopic,
    studyDuration: Math.max(Math.round(Number(userStore.totalTime || 0) / 60), fallbackLearnerState.studyDuration),
    learnerLevel: stage,
    stage,
  }
})

const displayedLearningPaths = computed(() => {
  return learningPaths.value?.length ? learningPaths.value : fallbackLearningPaths
})

const roadmapRecommendation = computed(() => {
  const state = learnerSnapshot.value

  if (state.progress < 35 || state.recentQuizScore < 60) {
    return {
      nextTopic: 'HTML基础与语义化标签',
      reason: '当前基础掌握度仍需巩固，先补齐页面结构与标签语义可以降低后续学习难度。',
    }
  }

  if (state.completedTopics.some(topic => String(topic).toLowerCase().includes('html')) && state.progress < 70) {
    return {
      nextTopic: state.nextTopic || 'CSS选择器与盒模型',
      reason: '系统检测到你已经接触HTML相关内容，下一步适合进入CSS选择器、盒模型和页面布局。',
    }
  }

  if (state.recentQuizScore >= 85 && state.wrongQuestionCount <= 3) {
    return {
      nextTopic: state.nextTopic || 'JavaScript事件与综合练习',
      reason: '最近测验表现较好，适合进入更高阶的交互逻辑和综合应用训练。',
    }
  }

  return {
    nextTopic: state.nextTopic || 'CSS选择器与盒模型',
    reason: '已具备HTML基础，需要通过CSS布局和样式规则建立完整页面表达能力。',
  }
})

const roadmapSteps = computed(() => {
  const progress = learnerSnapshot.value.progress
  return [
    {
      index: '01',
      title: 'HTML基础',
      description: '文档结构、常用标签、语义化页面组织。',
      done: progress >= 34,
      active: progress < 34,
    },
    {
      index: '02',
      title: 'CSS基础',
      description: '选择器、盒模型、布局与响应式样式。',
      done: progress >= 67,
      active: progress >= 34 && progress < 67,
    },
    {
      index: '03',
      title: 'JavaScript基础',
      description: '变量、函数、事件、DOM与基础交互。',
      done: progress >= 100,
      active: progress >= 67,
    },
  ]
})

const studyStatusLabel = computed(() => {
  const { recentQuizScore, wrongQuestionCount, studyDuration } = learnerSnapshot.value
  if (recentQuizScore < 60) return '需要回顾基础'
  if (wrongQuestionCount >= 8) return '建议优先整理错题'
  if (studyDuration < 30) return '建议增加学习时长'
  if (recentQuizScore >= 85) return '可以挑战进阶内容'
  return '稳定推进中'
})

const ruleSuggestions = computed(() => {
  const state = learnerSnapshot.value
  const builtInSuggestions = []

  if (state.recentQuizScore < 60) {
    builtInSuggestions.push({
      id: 'rule-low-score',
      type: 'resource',
      is_read: false,
      created_at: new Date(),
      suggestion: `继续学习当前知识点“${state.currentTopic}”，完成基础例题后再进行测验。`,
      basis: `最近测验正确率为 ${state.recentQuizScore}%，低于基础掌握线。`,
      actionText: '进入课程学习',
      actionPath: '/cources',
    })
  } else if (state.recentQuizScore < 85) {
    builtInSuggestions.push({
      id: 'rule-medium-score',
      type: 'path',
      is_read: false,
      created_at: new Date(),
      suggestion: `先强化“${state.currentTopic}”中的易错概念，再进入下一主题学习。`,
      basis: `最近测验正确率为 ${state.recentQuizScore}%，适合巩固后继续推进。`,
      actionText: '查看课程',
      actionPath: '/cources',
    })
  } else {
    builtInSuggestions.push({
      id: 'rule-high-score',
      type: 'path',
      is_read: false,
      created_at: new Date(),
      suggestion: `学习下一主题“${state.nextTopic}”，并尝试完成一次综合练习来提升迁移应用能力。`,
      basis: `最近测验正确率达到 ${state.recentQuizScore}%，具备进入进阶内容的条件。`,
      actionText: '进入练习',
      actionPath: '/question',
      actionQuery: { sectionId: 3 },
    })
  }

  if (state.wrongQuestionCount >= 5) {
    builtInSuggestions.push({
      id: 'rule-wrong-book',
      type: 'resource',
      is_read: false,
      created_at: new Date(),
      suggestion: '查看错题本，优先复盘重复出错的知识点，再进行同类题训练。',
      basis: `当前待处理错题约 ${state.wrongQuestionCount} 题，错题复盘收益更高。`,
      actionText: '查看错题本',
      actionPath: '/errorquestion',
    })
  }

  if (state.studyDuration < 30) {
    builtInSuggestions.push({
      id: 'rule-study-time',
      type: 'resource',
      is_read: false,
      created_at: new Date(),
      suggestion: '先完成一轮图文学习和代码示例阅读，再进入测验环节。',
      basis: `本次学习时长约 ${state.studyDuration} 分钟，建议先补足理解时间。`,
      actionText: '继续学习',
      actionPath: '/cources',
    })
  }

  const serverSuggestions = (suggestions.value || []).map(item => ({
    ...item,
    fromServer: true,
    basis: '来自系统已有学习建议记录。',
  }))

  return [...builtInSuggestions, ...serverSuggestions].slice(0, 6)
})

const difficultyRecommendation = computed(() => {
  const state = learnerSnapshot.value

  if (state.recentQuizScore < 60 || state.wrongQuestionCount >= 10) {
    return {
      level: '基础',
      exercise: '基础概念题 + 错题复盘',
      reason: `正确率 ${state.recentQuizScore}%，错题数量 ${state.wrongQuestionCount}，应先降低题目跨度并巩固基础。`,
    }
  }

  if (state.recentQuizScore >= 85 && state.progress >= 65 && state.wrongQuestionCount <= 4) {
    return {
      level: '提高',
      exercise: '综合应用题 + 项目化练习',
      reason: `正确率 ${state.recentQuizScore}%，路径进度 ${state.progress}%，适合提高题目综合度。`,
    }
  }

  return {
    level: '进阶',
    exercise: '同类强化题 + 下一主题预习',
    reason: `当前正确率和学习进度处于稳定区间，适合保持中等难度并逐步增加综合训练。`,
  }
})

const displayedDifficultyAdjustments = computed(() => {
  return difficultyAdjustments.value?.length ? difficultyAdjustments.value : [
    {
      know_name: learnerSnapshot.value.currentTopic,
      old_difficulty: '基础',
      new_difficulty: difficultyRecommendation.value.level,
      reason: difficultyRecommendation.value.reason,
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
  ]
})

const sendChatMessage = async () => {
  const message = chatMessage.value.trim()
  if (!message) return

  chatLoading.value = true
  try {
    const { data } = await apiPostAIChat({
      message,
      context: {
        currentCourse: '前端基础',
        currentTopic: activeTab.value === 'paths' ? '学习路径' : 'AI智能辅助',
      },
    })
    const reply = data?.reply || 'AI暂时没有返回内容，请稍后再试。'
    chatReply.value = data?.notice ? `${data.notice}\n\n${reply}` : reply
  } catch (error) {
    console.warn('AI chat failed:', getAIErrorMessage(error))
    chatReply.value = '当前AI对话服务较繁忙，请稍后再试。学习路径、学习建议和难度调整仍可正常使用。'
  } finally {
    chatLoading.value = false
  }
}

const useExampleQuestion = question => {
  chatMessage.value = question
}

const goRecommendation = suggestion => {
  router.push({
    path: suggestion.actionPath,
    query: suggestion.actionQuery || {},
  })
}

const loadSystemLearningData = async () => {
  try {
    const { data } = await apiGetStudyStatus()
    studyStatus.value = data || {}
  } catch (error) {
    studyStatus.value = {}
    console.warn('加载学习状态失败，已使用本地学习状态:', error)
  }

  try {
    const { data } = await apiGetStudyPoints(userStore.studentId)
    studyPoints.value = Array.isArray(data) ? data : []
  } catch (error) {
    studyPoints.value = []
    console.warn('加载已学知识点失败，已使用本地完成记录:', error)
  }

  try {
    const { data } = await apiGetAllPoints(userStore.studentId)
    allKnowledgePoints.value = Array.isArray(data?.knowPointList) ? data.knowPointList : []
  } catch (error) {
    allKnowledgePoints.value = []
    console.warn('加载知识点列表失败，已使用本地进度估算:', error)
  }

  try {
    const {
      data: { showTopicResults = [] } = {},
    } = await getErrorQuestion({ stuId: userStore.studentId })
    wrongQuestions.value = Array.isArray(showTopicResults) ? showTopicResults : []
  } catch (error) {
    wrongQuestions.value = []
    console.warn('加载错题数据失败，已使用本地错题数量:', error)
  }
}

const getAIErrorMessage = error => {
  if (typeof error === 'string') return error
  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.data?.message ||
    '未知错误'
  )
}

// 加载学习路径
const loadLearningPaths = async () => {
  try {
    const { data } = await apiGetLearningPaths()
    learningPaths.value = Array.isArray(data) ? data : []
  } catch (error) {
    learningPaths.value = []
    console.warn('加载学习路径失败，已使用本地规则推荐:', error)
  }
}

// 开始学习路径
const startPath = async (pathId) => {
  try {
    await apiStartLearningPath(pathId)
    ElMessage.success('开始学习路径成功')
    loadLearningPaths()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '开始学习路径失败')
  }
}

// 查看路径详情
const viewPathDetail = async (pathId) => {
  // 这里可以跳转到路径详情页或显示弹窗
  ElMessageBox.alert(`查看路径 ${pathId} 详情`, '路径详情', {
    confirmButtonText: '确定'
  })
}

// 加载学习建议
const loadSuggestions = async () => {
  try {
    const { data } = await apiGetSuggestions()
    suggestions.value = Array.isArray(data) ? data : []
  } catch (error) {
    suggestions.value = []
    console.warn('加载学习建议失败，已使用本地规则推荐:', error)
  }
}

// 标记建议为已读
const markAsRead = async (suggestionId) => {
  try {
    await apiMarkSuggestionAsRead(suggestionId)
    ElMessage.success('标记为已读成功')
    loadSuggestions()
  } catch (error) {
    ElMessage.error('标记为已读失败')
  }
}

// 加载难度调整记录
const loadDifficultyAdjustments = async () => {
  try {
    const { data } = await apiGetDifficultyAdjustments()
    difficultyAdjustments.value = Array.isArray(data) ? data : []
  } catch (error) {
    difficultyAdjustments.value = []
    console.warn('加载难度调整记录失败，已使用本地难度评估:', error)
  }
}

// 获取难度文本
const getDifficultyText = (difficulty) => {
  const texts = ['', '简单', '中等', '困难', '很困难', '专家']
  return texts[difficulty] || '未知'
}

// 获取建议类型文本
const getSuggestionTypeText = (type) => {
  const texts = {
    'difficulty': '难度调整',
    'resource': '资源推荐',
    'path': '学习路径'
  }
  return texts[type] || '其他'
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 页面加载时获取数据
onMounted(() => {
  loadSystemLearningData()
  loadLearningPaths()
  loadSuggestions()
  loadDifficultyAdjustments()
})
</script>

<style lang="scss" scoped>
.ai-page {
  min-height: 100vh;
  padding: 34px min(5vw, 56px) 72px;
  background:
    radial-gradient(circle at 18% 0%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 82% 20%, rgba(207, 92, 255, 0.12), transparent 24%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;

  h1 {
    margin: 0 0 24px;
    color: #fff;
    font-size: clamp(3rem, 4vw, 5.2rem);
    line-height: 1.15;
    letter-spacing: 0.04em;
    text-shadow: 0 18px 42px rgba(0, 0, 0, 0.36);
  }

  .ai-tabs {
    margin-top: 20px;
  }

  .ai-capabilities {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }

  .capability-card {
    min-height: 138px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(124, 92, 255, 0.06)),
      rgba(12, 18, 27, 0.62);
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.22),
      0 0 20px rgba(64, 158, 255, 0.08);
    backdrop-filter: blur(16px);
    transition:
      transform 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-3px);
      border-color: rgba(118, 183, 255, 0.34);
      box-shadow:
        0 22px 58px rgba(0, 0, 0, 0.28),
        0 0 24px rgba(64, 158, 255, 0.14);
    }

    strong {
      display: block;
      color: #fff;
      font-size: 18px;
      line-height: 1.4;
    }

    p {
      margin: 10px 0 0;
      color: rgba(255, 255, 255, 0.62);
      font-size: 15px;
      line-height: 1.6;
    }
  }

  .capability-icon {
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: linear-gradient(135deg, #409eff, #7c5cff);
    color: #fff;
    font-size: 16px;
    font-weight: 900;
    box-shadow: 0 10px 22px rgba(64, 158, 255, 0.22);
  }

  .ai-chat-card {
    margin-bottom: 20px;
  }

  .ai-chat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }

  .ai-chat-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .example-questions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    button {
      min-height: 38px;
      padding: 8px 14px;
      border: 1px solid rgba(118, 183, 255, 0.2);
      border-radius: 999px;
      background: rgba(64, 158, 255, 0.08);
      color: #a8d2ff;
      font-size: 15px;
      line-height: 1.35;
      cursor: pointer;
      transition:
        background 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        border-color: rgba(118, 183, 255, 0.42);
        background: rgba(64, 158, 255, 0.15);
        color: #fff;
      }
    }
  }

  .ai-chat-reply {
    padding: 16px 18px;
    border: 1px solid rgba(118, 183, 255, 0.18);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.78);
    font-size: 16px;
    line-height: 1.7;
    white-space: pre-wrap;
  }

  .ai-chat-actions {
    display: flex;
    justify-content: flex-end;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.el-tabs__item) {
    color: rgba(255, 255, 255, 0.66);
    font-size: 16px;
    font-weight: 700;
    transition: color 0.25s ease;
  }

  :deep(.el-textarea__inner) {
    font-size: 16px;
    line-height: 1.6;
  }

  :deep(.el-textarea__inner::placeholder) {
    font-size: 15px;
  }

  :deep(.el-card__body) {
    font-size: 16px;
    line-height: 1.6;
  }

  :deep(.el-tabs__item:hover),
  :deep(.el-tabs__item.is-active) {
    color: #76b7ff;
    text-shadow: 0 0 16px rgba(64, 158, 255, 0.38);
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(135deg, #409eff, #7c5cff);
    box-shadow: 0 0 18px rgba(64, 158, 255, 0.45);
  }

  .paths-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 22px;
    margin-top: 22px;
  }

  :deep(.el-card) {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    background: rgba(12, 18, 27, 0.68);
    box-shadow:
      0 24px 70px rgba(0, 0, 0, 0.28),
      0 0 24px rgba(64, 158, 255, 0.1);
    color: #fff;
    backdrop-filter: blur(16px);
  }

  :deep(.el-card__header) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(7, 11, 18, 0.34);
  }

  .rule-panel {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    gap: 22px;
    margin-top: 22px;
  }

  .path-header {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .path-name {
    font-size: 21px;
    font-weight: bold;
    color: #fff;
    line-height: 1.4;
  }

  .path-difficulty {
    flex: 0 0 auto;
    margin-left: auto;
    font-size: 14px;
    padding: 5px 12px;
    border-radius: 999px;
    font-weight: 700;

    &.difficulty-1 {
      border: 1px solid rgba(103, 194, 58, 0.34);
      background: rgba(103, 194, 58, 0.16);
      color: #9be47a;
    }

    &.difficulty-2 {
      border: 1px solid rgba(64, 158, 255, 0.34);
      background: rgba(64, 158, 255, 0.16);
      color: #a8d2ff;
    }

    &.difficulty-3 {
      border: 1px solid rgba(247, 201, 72, 0.34);
      background: rgba(247, 201, 72, 0.16);
      color: #f7d76d;
    }

    &.difficulty-4 {
      border: 1px solid rgba(245, 108, 108, 0.34);
      background: rgba(245, 108, 108, 0.16);
      color: #ff9f9f;
    }

    &.difficulty-5 {
      border: 1px solid rgba(144, 147, 153, 0.34);
      background: rgba(144, 147, 153, 0.16);
      color: #c7c9cf;
    }
  }

  .source-badge {
    flex: 0 0 auto;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.02em;

    &.external {
      border: 1px solid rgba(124, 92, 255, 0.34);
      background: rgba(124, 92, 255, 0.16);
      color: #c8bdff;
    }

    &.internal {
      border: 1px solid rgba(64, 158, 255, 0.32);
      background: rgba(64, 158, 255, 0.14);
      color: #a8d2ff;
    }
  }

  .insight-card {
    height: 100%;
  }

  .insight-body {
    display: grid;
    gap: 16px;

    strong {
      display: block;
      margin-top: 4px;
      color: #fff;
      font-size: 24px;
      line-height: 1.35;
    }
  }

  .insight-label {
    margin: 0;
    color: rgba(255, 255, 255, 0.55);
    font-size: 15px;
    line-height: 1.5;
  }

  .recommend-basis {
    margin: 10px 0 0;
    padding: 14px 16px;
    border: 1px solid rgba(118, 183, 255, 0.16);
    border-radius: 14px;
    background: rgba(64, 158, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
    font-size: 15px;
    line-height: 1.7;
  }

  .roadmap-grid {
    display: grid;
    gap: 14px;
  }

  .roadmap-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    min-height: 112px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    background: rgba(12, 18, 27, 0.58);
    box-shadow: 0 16px 44px rgba(0, 0, 0, 0.18);

    &.active {
      border-color: rgba(118, 183, 255, 0.42);
      box-shadow:
        0 20px 56px rgba(0, 0, 0, 0.24),
        0 0 24px rgba(64, 158, 255, 0.16);
    }

    &.done {
      border-color: rgba(103, 194, 58, 0.28);
      background: rgba(103, 194, 58, 0.08);
    }

    strong {
      color: #fff;
      font-size: 18px;
      line-height: 1.45;
    }

    p {
      margin: 8px 0 0;
      color: rgba(255, 255, 255, 0.62);
      font-size: 15px;
      line-height: 1.6;
    }
  }

  .step-index {
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: linear-gradient(135deg, #409eff, #7c5cff);
    color: #fff;
    font-weight: 800;
    box-shadow: 0 10px 22px rgba(64, 158, 255, 0.24);
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-top: 22px;
  }

  .metric-card {
    :deep(.el-card__body) {
      display: grid;
      gap: 8px;
    }

    span {
      color: rgba(255, 255, 255, 0.58);
      font-size: 15px;
      line-height: 1.45;
    }

    strong {
      color: #fff;
      font-size: 30px;
      line-height: 1.2;
    }
  }

  .path-card {
    transition:
      transform 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(118, 183, 255, 0.42);
      box-shadow:
        0 26px 80px rgba(0, 0, 0, 0.32),
        0 0 28px rgba(64, 158, 255, 0.16);
    }

    .path-description {
      margin: 12px 0;
      color: rgba(255, 255, 255, 0.68);
      font-size: 16px;
      line-height: 1.7;
    }

    .path-recommended {
      margin: 12px 0;
      font-size: 15px;
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.56);
    }

    .path-progress {
      margin: 14px 0;
    }

    .progress-text {
      font-size: 15px;
      color: #9be47a;
      margin-top: 8px;
      display: block;
    }

    .path-actions {
      margin-top: 14px;
    }
  }

  :deep(.el-progress-bar__outer) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.el-progress-bar__inner) {
    background: linear-gradient(135deg, #409eff, #7c5cff);
    box-shadow: 0 0 16px rgba(64, 158, 255, 0.35);
  }

  :deep(.el-progress__text) {
    color: rgba(255, 255, 255, 0.78);
  }

  .suggestions-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 22px;
    margin-top: 22px;
  }

  .suggestion-card {
    transition:
      transform 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(118, 183, 255, 0.42);
      box-shadow:
        0 26px 80px rgba(0, 0, 0, 0.32),
        0 0 28px rgba(64, 158, 255, 0.16);
    }

    &.unread {
      border-left: 4px solid #409eff;
    }

    .suggestion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .suggestion-type {
      font-size: 14px;
      padding: 5px 12px;
      border: 1px solid rgba(64, 158, 255, 0.34);
      border-radius: 999px;
      background: rgba(64, 158, 255, 0.16);
      color: #a8d2ff;
      font-weight: 700;
    }

    .suggestion-time {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.52);
      line-height: 1.45;
    }

    .suggestion-text {
      margin: 12px 0;
      color: rgba(255, 255, 255, 0.72);
      font-size: 16px;
      line-height: 1.7;
    }

    .suggestion-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }
  }

  .difficulty-container {
    display: grid;
    gap: 22px;
    margin-top: 22px;
  }

  .difficulty-card {
    .difficulty-header {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #fff;
      font-weight: 700;
    }
  }

  .difficulty-summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    span {
      display: block;
      margin-bottom: 8px;
      color: rgba(255, 255, 255, 0.56);
      font-size: 15px;
      line-height: 1.45;
    }

    strong {
      display: block;
      color: #fff;
      font-size: 28px;
      line-height: 1.25;
    }

    .recommend-basis {
      grid-column: 1 / -1;
    }
  }

  :deep(.el-button) {
    border-radius: 10px;
    min-height: 40px;
    font-size: 15px;
    font-weight: 700;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  :deep(.el-button--primary),
  :deep(.el-button--info) {
    border: none;
    background: linear-gradient(135deg, #409eff, #7c5cff);
    color: #fff;
    box-shadow: 0 12px 28px rgba(64, 158, 255, 0.26);
  }

  :deep(.el-button--primary:hover),
  :deep(.el-button--info:hover),
  :deep(.el-button--primary:focus),
  :deep(.el-button--info:focus) {
    transform: translateY(-2px);
    box-shadow:
      0 12px 28px rgba(64, 158, 255, 0.3),
      0 0 18px rgba(64, 158, 255, 0.2);
  }

  :deep(.el-button--text) {
    color: #76b7ff;
  }

  :global(.theme-light) & {
    .capability-card {
      border-color: var(--theme-border-color);
      background: var(--theme-card-bg);
      box-shadow: var(--theme-shadow);

      strong {
        color: var(--theme-text-primary);
      }

      p {
        color: var(--theme-text-secondary);
      }
    }

    .ai-chat-header {
      color: var(--theme-text-primary);
    }

    .example-questions button {
      border-color: var(--theme-border-color);
      background: var(--theme-accent-soft);
      color: var(--theme-accent);

      &:hover {
        border-color: var(--theme-border-strong);
        color: var(--theme-accent-hover);
      }
    }

    .ai-chat-reply {
      border-color: var(--theme-border-color);
      background: var(--theme-card-bg);
      color: var(--theme-text-secondary);
    }

    .path-name,
    .insight-body strong,
    .roadmap-step strong,
    .metric-card strong,
    .difficulty-summary strong,
    .difficulty-header {
      color: var(--theme-text-primary);
    }

    .insight-label,
    .roadmap-step p,
    .metric-card span,
    .difficulty-summary span,
    .recommend-basis {
      color: var(--theme-text-secondary);
    }

    .source-badge.external,
    .source-badge.internal {
      color: var(--theme-accent);
      background: rgba(37, 99, 235, 0.08);
      border-color: rgba(37, 99, 235, 0.22);
    }

    .recommend-basis,
    .roadmap-step {
      border-color: var(--theme-border-color);
      background: var(--theme-card-bg);
      box-shadow: var(--theme-shadow-card);
    }
  }

  :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: rgba(255, 255, 255, 0.035);
    --el-table-header-bg-color: rgba(7, 11, 18, 0.64);
    --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.12);
    --el-table-border-color: rgba(255, 255, 255, 0.1);
    --el-table-text-color: rgba(255, 255, 255, 0.78);
    --el-table-header-text-color: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    background: rgba(7, 11, 18, 0.32);
  }

  :deep(.el-table th.el-table__cell) {
    background: rgba(7, 11, 18, 0.72);
    color: rgba(255, 255, 255, 0.72);
  }

  :deep(.el-table tr),
  :deep(.el-table td.el-table__cell) {
    background: transparent;
  }

  :deep(.el-table td.el-table__cell),
  :deep(.el-table th.el-table__cell.is-leaf) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
}

@media screen and (max-width: 768px) {
  .ai-page {
    padding: 24px 16px 48px;

    .paths-container,
    .suggestions-container,
    .ai-capabilities,
    .rule-panel,
    .status-grid,
    .difficulty-summary {
      grid-template-columns: 1fr;
    }

    .path-header,
    .suggestion-header {
      align-items: flex-start;
      flex-direction: column;
    }
  }
}
</style>
