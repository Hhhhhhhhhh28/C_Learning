<script setup>
import SubHeader from '@/components/SubHeader.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import QuestionItem from '@/views/question/components/QuestionItem.vue'
import { formatTime } from '@/utils/dateUtils.js'
import { useRoute } from 'vue-router'
import { handleGetAndSubmitQuestion } from '@/api/question.js'
import { useUserStore } from '@/stores/index.js'
import HeaderCm from '@/components/HeaderCm.vue'
import { to404 } from '@/router/index.js'
import LLMTalk from '@/views/knowledge/components/LLMTalk'
import ProblemViewDot from '@/components/problemViewDot.vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const questionInfo = ref()
// 做题总时间
const totalTime = ref(0)

// 题目
const question = computed(() => {
  if (
    questionInfo.value?.showTopicResultList &&
    questionInfo.value?.showTopicResultList.length > 0
  ) {
    return {
      topicType: questionInfo.value.topicType,
      ...questionInfo.value.showTopicResultList[
        questionInfo.value.showTopicResultList.length - 1
      ],
    }
  }
  return {}
})
const currentQuestionKey = computed(() => `${question.value?.id || 'empty'}-${questionInfo.value?.showTopicResultList?.length || 0}`)
const questionNumber = computed(() => {
  const current =
    Number(questionInfo.value?.currentQuestionNumber) ||
    questionInfo.value?.showTopicResultList?.length ||
    0
  const total = Number(questionInfo.value?.totalQuestionCount) || fixedQuestionNumbers.length || current || 0

  return { current, total }
})
const currentQuestionNumber = computed(() => questionNumber.value.current)
const totalQuestionCount = computed(() => questionNumber.value.total)
// 相同类型的题目
const _similarQuestion = ref()
const _handleSimilarQuestion = async () => {}
// if (route.query.topicId) {

// }
// 答案
const answer = ref()
// 是否已提交
const submitted = ref(false)
const loadingNext = ref(false)
// 题目的回答状态
const _questionStatus = ref(Array(10).fill(false))
// 是否存在下一题
const hasNext = ref(true)
// 时间相关逻辑
const _time = ref(0)
const showTimeString = computed(() => formatTime(totalTime.value))
const timeInterval = ref()

// const restartTiming = () => {
//   totalTime.value = 1
//   clearInterval(timeInterval.value)
//   timeInterval.value = setInterval(() => {
//     totalTime.value += 1
//   }, 1000)
// }
// 启动计时器
const startTiming = () => {
  if (!timeInterval.value) {
    timeInterval.value = setInterval(() => {
      totalTime.value += 1
    }, 1000)
  }
}
// 停止计时函数
const _stopTiming = () => {
  clearInterval(timeInterval.value)
}
// 重置计时器方法
// const resetTimer = () => {
//   stopTiming()
//   restartTiming()
// }
// defineExpose({
//   resetTimer,
// })

onMounted(() => {
  getQuestion()
  totalTime.value = 1
  startTiming()
})

onUnmounted(() => {
  clearInterval(timeInterval.value)
})
// 获取题目
const getQuestion = async () => {
  const normalizedPointId = route.query.pointId ?? 0
  if (route.query.sectionId && route.query.pointId) {
    questionInfo.value = await handleGetAndSubmitQuestion({
      sectionId: route.query.sectionId,
      knowPointId: normalizedPointId,
      pointId: normalizedPointId,
      answerTime: route.query.answerTime,
      stuAnswer: route.query.stuAnswer,
      // stuAnswer: route.query.topicType == 0? route.query.stuAnswer:'',
      // fillAnswer: route.query.topicType == 1?route.query.stuAnswer:'',
      topicId: route.query.topicId ?? 0,
      studentId: userStore.studentId,
    })
    hasNext.value = questionInfo.value.hasNext
    answer.value = ''
    //resetTimer()
  } else if (route.query.sectionId) {
    questionInfo.value = await handleGetAndSubmitQuestion({
      sectionId: route.query.sectionId,
      pointId: 0,
      knowPointId: normalizedPointId,
      answerTime: totalTime.value,
      stuAnswer: route.query.stuAnswer,
      topicId: route.query.topicId ?? 0,
      studentId: userStore.studentId,
    })
    hasNext.value = questionInfo.value.hasNext
    answer.value = ''
    //resetTimer()
  } else {
    to404()
  }
}
// 下一题
const nextQuestion = async () => {
  if (!answer.value || !question.value?.id || loadingNext.value) return

  loadingNext.value = true
  try {
    const data = await handleGetAndSubmitQuestion({
      sectionId: route.query.sectionId,
      knowPointId: route.query.pointId ?? 0,
      pointId: route.query.pointId ?? 0,
      answerTime: totalTime.value,
      stuAnswer: answer.value,
      topicId: question.value.id,
      studentId: userStore.studentId,
    })
    questionInfo.value = data
    hasNext.value = Boolean(data?.hasNext)
    answer.value = ''
    const nextTopic = data?.showTopicResultList?.[data.showTopicResultList.length - 1]
    if (nextTopic?.id) {
      router.replace({
        path: '/question',
        query: {
          ...route.query,
          topicId: nextTopic.id,
          topicType: data.topicType,
        },
      }).catch(() => {})
    }
  } finally {
    loadingNext.value = false
  }
}

const submit = async () => {
  if (!answer.value || !question.value?.id) return

  router.replace({
    path: '/result',
    query: {
      ...route.query,
      topicId: question.value.id,
      stuAnswer: answer.value,
      topicType: questionInfo.value.topicType,
      knowPointId: route.query.pointId ?? 0,
      answerTime: totalTime.value,
      time: totalTime.value,
    },
  })
}
// 底部题号设置
// 固定题号数组
const fixedQuestionNumbers = Array.from({ length: 10 }, (_, i) => i + 1)

// 动态计算每个题号的状态
// 由于 questionStatusList 未被使用，根据规则将变量名改为以 _ 开头
const _questionStatusList = computed(() => {
  const statusList = []
  for (let i = 0; i < fixedQuestionNumbers.length; i++) {
    if (i < questionInfo.value?.showTopicResultList?.length) {
      // 已加载的题目
      statusList.push({
        number: i + 1,
        isCurrent: i === questionInfo.value.showTopicResultList.length - 1,
        isCompleted: true,
      })
    } else {
      // 尚未加载的题目
      statusList.push({
        number: i + 1,
        isCurrent: false,
        isCompleted: false,
      })
    }
  }
  return statusList
})
</script>
<template>
  <div class="question-page">
    <HeaderCm />
    <SubHeader title="测试中" exit-text="退出答题">
      <template #right>
        {{ showTimeString }}
      </template>
    </SubHeader>
    <main>
      <div class="questionBox">
        <QuestionItem
          :key="currentQuestionKey"
          v-model="answer"
          :option="question"
          :disabled="submitted"
          :current-question-number="currentQuestionNumber"
          :total-question-count="totalQuestionCount"
        >
          <!--        <div class="answer" v-if="submitted">-->
          <!--          <div class="judge">正确答案:{{result?.showTopicResponses[0]?.answer}};你的答案:{{result?.showTopicResponses[0]?.studentAnswer}}</div>-->
          <!--          <div class="analysis">AI:解析:{{result?.showTopicResponses[0]?.analysis}}</div>-->
          <!--        </div>-->
          <div class="questionActions">
            <el-button v-show="!hasNext" :disabled="!answer" @click="submit">提交</el-button>
            <el-button
              v-show="hasNext"
              :disabled="!answer || loadingNext"
              :loading="loadingNext"
              @click="nextQuestion"
              >下一题</el-button
            >
          </div>
        </QuestionItem>
      </div>
      <LLMTalk />
    </main>

    <footer>
      <div class="footerBox">
        <div class="left">
          <div class="viewDotBox">
            <ProblemViewDot
              v-for="(status, index) in questionInfo?.showTopicResultList"
              :key="index"
              :value="index !== questionInfo.showTopicResultList.length - 1"
              :index="index"
            >
              {{ index + 1 }}
            </ProblemViewDot>
          </div>

          <!-- 提示信息模块 -->
          <div class="tipBox">
            <div>
              <ProblemViewDot :value="true"></ProblemViewDot>
              <span>已做</span>
            </div>
            <div>
              <ProblemViewDot :value="false"></ProblemViewDot>
              <span>未完成</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.question-page {
  min-height: 100vh;
  padding-bottom: 112px;
  background:
    radial-gradient(circle at 18% 0%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 82% 18%, rgba(124, 92, 255, 0.16), transparent 28%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;
}

.question-page :deep(.header) {
  width: min(1180px, calc(100% - 32px));
  height: 72px;
  margin: 16px auto 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(7, 11, 18, 0.78) !important;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.3),
    0 0 24px rgba(64, 158, 255, 0.12);
  backdrop-filter: blur(18px);
}

.question-page :deep(.logo) {
  color: #fff;
  text-shadow: 0 0 18px rgba(64, 158, 255, 0.42);
}

.question-page :deep(nav li),
.question-page :deep(.user span) {
  color: rgba(255, 255, 255, 0.78);
}

.question-page :deep(nav li:hover),
.question-page :deep(nav li.active) {
  color: #76b7ff;
}

.question-page > :deep(header) {
  width: min(1180px, calc(100% - 32px));
  margin: 16px auto 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(7, 11, 18, 0.72);
  color: #fff;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(18px);
}

main {
  width: min(1280px, calc(100% - 48px));
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  align-items: start;
  gap: 24px;
  min-height: calc(100vh - 250px);
  height: auto;
  padding: 28px 0;
  margin: 0 auto;
  .questionBox {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: $padding-xxl;
    align-items: stretch;
  }
}

.questionActions {
  display: flex;
  justify-content: flex-end;
  margin-top: 28px;
}

.questionActions :deep(.el-button) {
  min-width: 120px;
  min-height: 42px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #409eff, #7c5cff);
  box-shadow: 0 12px 28px rgba(64, 158, 255, 0.26);
  color: #fff;
  font-weight: 800;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    opacity 0.25s ease;
}

.questionActions :deep(.el-button:hover),
.questionActions :deep(.el-button:focus) {
  transform: translateY(-2px);
  box-shadow:
    0 12px 28px rgba(64, 158, 255, 0.32),
    0 0 18px rgba(124, 92, 255, 0.22);
}

.questionActions :deep(.el-button.is-disabled) {
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.46);
  box-shadow: none;
}

.question-page :deep(.right) {
  position: sticky;
  top: 120px;
  width: 360px;
  max-width: 360px;
  height: 520px;
  max-height: 520px;
  align-self: start;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  background: rgba(12, 18, 27, 0.68);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.28),
    0 0 24px rgba(64, 158, 255, 0.1);
  color: #fff;
  backdrop-filter: blur(16px);
}

.question-page :deep(.right-top),
.question-page :deep(.right-bottom) {
  background: rgba(7, 11, 18, 0.64);
  border-radius: 0;
}

.question-page :deep(.talk),
.question-page :deep(.talk-none) {
  justify-content: flex-start;
  align-items: stretch;
  background: transparent;
}

.question-page :deep(.talk) {
  padding-top: 20px;
}

.question-page :deep(.talk-none) {
  align-items: flex-start;
  padding-top: 20px;
}

.question-page :deep(.message-left) {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.84) !important;
}

.question-page :deep(.message-right) {
  background: linear-gradient(135deg, #409eff, #7c5cff) !important;
  box-shadow: 0 12px 24px rgba(64, 158, 255, 0.18);
}

.question-page :deep(.right-bottom .el-input__wrapper) {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.question-page :deep(.right-bottom .el-input__inner) {
  color: #fff;
}

.question-page :deep(.right-bottom .el-button) {
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #409eff, #7c5cff);
  color: #fff;
}

.question-nav {
  position: absolute;
  bottom: 45px;
  right: 45px;
  margin-top: 20px;
  text-align: center;
}

footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(7, 11, 18, 0.76);
  padding: 18px 0;
  height: 100px;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  color: rgba(255, 255, 255, 0.78);
  box-shadow: 0 -18px 60px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(18px);

  .footerBox {
    display: flex;
    height: 100%;
    justify-content: space-between;
    align-items: center;
    width: $main-width;
    margin: 0 auto;

    .left {
      display: flex;
      align-items: center;

      .viewDotBox {
        min-width: 200px;
        display: flex;
        gap: 10px;
      }

      .tipBox {
        display: flex;
        align-items: center;
        gap: $padding-xl;
        margin-left: 20px;

        & > div {
          display: flex;
          align-items: center;
          gap: $padding-s;
        }
      }
    }
  }
}

footer :deep(.dot) {
  width: 30px;
  height: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 14px rgba(64, 158, 255, 0.18);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}
.answer {
  width: 100%;
  font-size: 16px;
  margin-top: $padding-xxl;
  .judge,
  .analysis {
    margin: $padding-xxl;
  }
}

@media screen and (max-width: 768px) {
  .question-page {
    padding-bottom: 140px;
  }

  .question-page :deep(.header),
  .question-page > :deep(header) {
    width: calc(100% - 24px);
    margin-top: 12px;
  }

  main {
    width: 100%;
    display: block;
    height: auto;
    min-height: auto;
    margin: 0;
    padding: 20px 12px;

    .questionBox {
      width: 100%;
      height: auto;
      float: none;
    }
  }

  .LL-Talk {
    position: static;
    width: 100%;
    height: 300px;
    margin: 16px 0;
  }

  footer {
    position: static;
    height: auto;
    padding: 16px;

    .footerBox {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;

      .left {
        flex-direction: column;
        align-items: flex-start;

        .viewDotBox {
          margin-bottom: 16px;
        }
      }
    }
  }
}
</style>
