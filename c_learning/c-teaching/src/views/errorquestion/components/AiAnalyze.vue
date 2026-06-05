<template>
  <el-card shadow="never" style="margin-top: 20px">
    <template #header>
      <div class="analysis-header">
        <h2>{{ isEnhanced ? 'AI增强分析' : 'ai分析结果' }}</h2>
        <span v-if="isEnhancing" class="analysis-hint">正在生成更详细的AI分析...</span>
        <span v-else-if="enhanceFailed" class="analysis-hint">当前AI分析服务暂时不可用，已显示基础分析</span>
      </div>
    </template>
    <div
      v-loading="isLoading"
      element-loading-text="加载错题数据中..."
      class="ai-content"
      :style="{ height: isLoading ? '150px' : 'auto' }"
    >
      <div v-for="item in aiAnaArr" :key="item" class="item">
        <h5>{{ item.title }}</h5>
        <p>{{ item.contentText }}</p>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import {
  apiGetEnhancedAiAnalyze,
  createWrongQuestionBasicAnalysis,
} from '@/api/aiTalk'
import { getErrorQuestion } from '@/api/question'
import { useUserStore } from '@/stores/index'
const fallbackAnalyze = [
  {
    title: 'AI分析暂不可用',
    contentText: '当前AI分析服务暂时不可用，请稍后重试。你仍然可以查看错题详情，并使用“做同类型”进行强化练习。',
  },
]
const aiAnaArr = ref([])
const isLoading = ref(false)
const isEnhancing = ref(false)
const isEnhanced = ref(false)
const enhanceFailed = ref(false)
const userStore = useUserStore()

const getAnalyze = async () => {
  isLoading.value = true
  try {
    const {
      data: { showTopicResults = [] } = {},
    } = await getErrorQuestion({
      stuId: userStore.studentId,
    })

    aiAnaArr.value = createWrongQuestionBasicAnalysis(showTopicResults)
    isLoading.value = false
    isEnhancing.value = true

    try {
      const enhancedAnalyze = await apiGetEnhancedAiAnalyze(showTopicResults)
      aiAnaArr.value = enhancedAnalyze
      isEnhanced.value = true
      enhanceFailed.value = false
    } catch (error) {
      console.warn('Enhanced AI analysis failed, keeping basic analysis:', error)
      enhanceFailed.value = true
    } finally {
      isEnhancing.value = false
    }
  } catch (error) {
    console.warn('Load wrong question analysis failed:', error)
    aiAnaArr.value = fallbackAnalyze
    enhanceFailed.value = true
  } finally {
    isLoading.value = false
  }
}
getAnalyze()
</script>

<style lang="scss" scoped>
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

:deep(.el-card__body) {
  padding: 22px;
}

h2 {
  margin: 0;
  font-family: Roboto;
  font-size: 20px;
  font-weight: bold;
  font-feature-settings: 'kern' on;
  color: #ffffff;
}
.analysis-header {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.analysis-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.62);
}
.ai-content {
  display: flex;
  gap: 0px 10px;
  flex-wrap: wrap;
  align-content: flex-start;
  margin-top: $margin-l;
  .item {
    &:nth-child(1) {
      background: rgba(64, 158, 255, 0.13);
    }
    &:nth-child(2) {
      background: rgba(103, 194, 58, 0.12);
    }
    &:nth-child(3) {
      background: rgba(247, 201, 72, 0.13);
    }
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 10px;
    flex-wrap: wrap;
    align-content: flex-start;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    h5 {
      font-family: Roboto;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      font-feature-settings: 'kern' on;
      color: #ffffff;
    }
    p {
      font-family: Roboto;
      font-size: 16px;
      font-weight: normal;
      line-height: 24px;
      font-feature-settings: 'kern' on;
      color: rgba(255, 255, 255, 0.72);
    }
  }
}

@media screen and (max-width: 768px) {
  .ai-content {
    flex-direction: column;
    margin-top: $margin-s;
    gap: $margin-m;
    .item {
      padding: 16px;
      h5 {
        font-size: 14px;
        line-height: 20px;
      }
      p {
        font-size: 14px;
        line-height: 20px;
      }
    }
  }
}
</style>
