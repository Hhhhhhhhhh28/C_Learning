<script setup>
import SubHeader from '@/components/SubHeader.vue'
import LButton from '@/components/LButton.vue'
import { computed, onMounted, ref } from 'vue'
import QuestionResultItem from '@/views/result/components/QuestionResultItem.vue'
import ProblemViewDot from '@/components/problemViewDot.vue'
import { useRoute, useRouter } from 'vue-router'
import { getAnswer, getNextKnowledge } from '@/api/question.js'
import { useUserStore } from '@/stores/index.js'
import LLMTalk from '@/views/knowledge/components/LLMTalk/index.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
// 结果
const result = ref()

const safePercent = value => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

const correctRateText = computed(() => `${(safePercent(result.value?.correctRate) * 100).toFixed(0)}%`)
const maturityText = computed(() => `${(safePercent(result.value?.maturity) * 100).toFixed(1)}%`)
const correctCountText = computed(() => {
  const correctCount = Number(result.value?.correctCount)
  const total = Array.isArray(result.value?.showTopicResponses)
    ? result.value.showTopicResponses.length
    : 0
  return `${Number.isFinite(correctCount) ? correctCount : 0}/${total}`
})

const handleGetAnswer = async () => {
  const data = await getAnswer({
    ...route.query,
    studentId: userStore.studentId,
    knowPointId: route.query.pointId ?? 1,
  })
  data.showTopicResponses = data.showTopicResponses?.map((item, index) => {
    return {
      ...item,
      no: index + 1,
      type: 'radio',
    }
  })
  result.value = data
}

onMounted(() => handleGetAnswer())
// 重新测试回调函数
const handleResetTest = () => {
  // 传递路由参数并跳转
  router.push({
    path: '/question',
    query: {
      pointId: route.query.pointId,
      sectionId: route.query.sectionId,
    },
  })
}

// 学习下一个知识点
const nextknowPointId = ref()
const nextSectionId = ref()
const getNextKnowledgePoint = async () => {
  const data = {
    knowPointId: route.query.pointId,
    sectionId: route.query.sectionId,
  }
  const response = await getNextKnowledge(data)
  nextknowPointId.value = response?.knowPointId
  nextSectionId.value = response?.sectionId
  router.push({
    path: '/knowledgeDetail',
    query: {
      pointId: nextknowPointId.value,
      sectionId: nextSectionId.value,
      studentId: userStore.studentId,
    },
  })
}
</script>

<template>
  <div class="result-page">
    <SubHeader title="测试结果" :can-back="false">
      <template #right>
        <div class="headerRight">
          <div>对AI评估结果不满意?</div>
          <LButton @click="handleResetTest">重新测试</LButton>
        </div>
      </template>
    </SubHeader>

    <main>
      <el-scrollbar class="scroll-box">
        <div class="topBox">
          <div class="box">
            <div>{{ correctRateText }}</div>
            <div>正确率</div>
          </div>
          <div class="box">
            <div>{{ correctCountText }}</div>
            <div>答对题数</div>
          </div>
          <div class="box">
            <div>{{ route.query.time }}s</div>
            <div>用时</div>
          </div>
          <div class="box">
            <div>{{ maturityText }}</div>
            <div>熟练程度</div>
          </div>
        </div>
        <div class="questionBox">
          <QuestionResultItem
            v-for="(item, index) in result?.showTopicResponses"
            :key="index"
            :option="item"
          />
        </div>
      </el-scrollbar>
      <LLMTalk />
    </main>

    <footer>
      <div class="footerBox">
        <div class="left">
          <div class="viewDotBox">
            <ProblemViewDot
              v-for="item in result?.showTopicResponses"
              :key="item"
              :error="
                Boolean(item.studentAnswer) && item.studentAnswer !== item.answer
              "
              :value="item.studentAnswer"
              complete-color="#00ff0c"
            >
              {{ item.no }}
            </ProblemViewDot>
          </div>
          <div class="tipBox">
            <div>
              <ProblemViewDot value="1" error></ProblemViewDot>
              <span>错误</span>
            </div>
            <div>
              <ProblemViewDot complete-color="#00ff0c" value="1"></ProblemViewDot>
              <span>正确</span>
            </div>
            <div>
              <ProblemViewDot></ProblemViewDot>
              <span>未完成</span>
            </div>
          </div>
        </div>
        <div class="footerActions">
          <LButton border @click="() => router.push('/')">返回首页</LButton>
          <LButton
            v-if="result?.maturity >= 0.8"
            border
            @click="getNextKnowledgePoint"
            >学习下一章</LButton
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.result-page {
  min-height: 100vh;
  padding-bottom: 112px;
  background:
    radial-gradient(circle at 18% 0%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 82% 18%, rgba(124, 92, 255, 0.16), transparent 28%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;
}

.result-page > :deep(header) {
  width: min(1180px, calc(100% - 32px));
  margin: 16px auto 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(7, 11, 18, 0.72);
  color: #fff;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(18px);
}

.headerRight {
  display: flex;
  align-items: center;
  gap: $padding-xl;
  color: rgba(255, 255, 255, 0.78);
}

.result-page :deep(button) {
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #409eff, #7c5cff);
  box-shadow: 0 12px 28px rgba(64, 158, 255, 0.26);
  color: #fff;
  font-weight: 800;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.result-page :deep(button.border) {
  border: none;
  background: linear-gradient(135deg, #409eff, #7c5cff);
  color: #fff;
}

.result-page :deep(button:hover) {
  transform: translateY(-2px);
  box-shadow:
    0 12px 28px rgba(64, 158, 255, 0.32),
    0 0 18px rgba(124, 92, 255, 0.22);
}

.topBox {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  padding: 0;
  .box {
    min-height: 132px;
    font-size: 2 * $font-size-xxl;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    border: 1px solid rgba(118, 183, 255, 0.16);
    border-radius: 20px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.12), rgba(124, 92, 255, 0.07)),
      rgba(12, 18, 27, 0.7);
    box-shadow:
      0 22px 60px rgba(0, 0, 0, 0.22),
      0 0 24px rgba(64, 158, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
    padding: 22px;
    color: #fff;
    backdrop-filter: blur(16px);
  }

  .box > div:first-child {
    color: #f7c948;
    font-size: clamp(2rem, 3vw, 3.2rem);
    font-weight: 950;
    line-height: 1;
    text-shadow: 0 0 24px rgba(247, 201, 72, 0.24);
  }

  .box > div:last-child {
    color: rgba(255, 255, 255, 0.66);
    font-size: 15px;
    font-weight: 800;
  }
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
  .scroll-box {
    width: 100%;
    min-width: 0;
    height: calc(100vh - 250px);
    overflow-y: auto;
    .questionBox {
      display: flex;
      flex-direction: column;
      gap: 22px;
      padding-top: 28px;
    }
  }
}

.result-page :deep(.right) {
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

.result-page :deep(.right-top),
.result-page :deep(.right-bottom) {
  background: rgba(7, 11, 18, 0.64);
  border-radius: 0;
}

.result-page :deep(.talk),
.result-page :deep(.talk-none) {
  justify-content: flex-start;
  align-items: stretch;
  background: transparent;
}

.result-page :deep(.talk) {
  padding-top: 20px;
}

.result-page :deep(.talk-none) {
  align-items: flex-start;
  padding-top: 20px;
}

.result-page :deep(.message-left) {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.84) !important;
}

.result-page :deep(.message-right) {
  background: linear-gradient(135deg, #409eff, #7c5cff) !important;
  box-shadow: 0 12px 24px rgba(64, 158, 255, 0.18);
}

.result-page :deep(.right-bottom .el-input__wrapper) {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.result-page :deep(.right-bottom .el-input__inner) {
  color: #fff;
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

.footerActions {
  display: flex;
  gap: 20px;
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

:global(.theme-light) .result-page {
  background: var(--theme-page-bg);
  color: var(--theme-text-primary);

  > :deep(header),
  .topBox .box,
  :deep(.right),
  footer {
    border-color: var(--theme-border-color);
    background: var(--theme-panel-bg);
    color: var(--theme-text-primary);
    box-shadow: var(--theme-shadow);
  }

  .headerRight,
  footer,
  footer .tipBox {
    color: var(--theme-text-secondary);
  }

  .topBox .box > div:first-child {
    color: var(--theme-warning-text);
    text-shadow: none;
  }

  .topBox .box > div:last-child {
    color: var(--theme-text-secondary);
  }

  :deep(.right-top),
  :deep(.right-bottom),
  :deep(.message-left) {
    border-color: var(--theme-border-color);
    background: var(--theme-card-bg) !important;
    color: var(--theme-text-secondary) !important;
  }

  :deep(.right-bottom .el-input__wrapper) {
    border-color: var(--theme-border-color);
    background: var(--theme-input-bg);
  }

  :deep(.right-bottom .el-input__inner) {
    color: var(--theme-input-text);
  }

  footer :deep(.dot) {
    border-color: var(--theme-border-color);
    color: var(--theme-text-primary);
    box-shadow: none;
  }
}

@media screen and (max-width: 768px) {
  .result-page {
    padding-bottom: 140px;
  }

  .result-page > :deep(header) {
    width: calc(100% - 24px);
    margin-top: 12px;
  }

  .headerRight {
    flex-direction: column;
    gap: $padding-s;
  }

  .topBox {
    grid-template-columns: 1fr;
    gap: $padding-m;
    padding: 0 $padding-s;

    .box {
      width: 100%;
      font-size: $font-size-xl;
      padding: $padding-m;
    }
  }

  main {
    display: block;
    width: 100%;
    gap: 0;
    min-height: auto;
    padding: 20px 12px;

    .scroll-box {
      height: auto;
    }
  }

  footer {
    height: auto;
    padding: $padding-m;

    .footerBox {
      flex-direction: column;
      gap: $padding-m;
      width: 100%;

      .left {
        flex-direction: column;
        align-items: flex-start;
        gap: $padding-m;

        .viewDotBox {
          min-width: auto;
        }
      }
    }
  }

  .footerActions {
    flex-wrap: wrap;
    gap: $padding-m;
  }
}
</style>
