<template>
  <div
    class="courses-page"
    :class="{
      'theme-html': currentSection === 0,
      'theme-css': currentSection === 1,
      'theme-js': currentSection === 2,
    }"
  >
    <HeaderCm />
    <div class="main">
    <div class="select-box">
      <ul class="section">
        <el-button
          v-for="(item, i) in sections"
          :key="item.sectionId"
          :class="[
            { active: i === currentSection },
            `tab-${item.sectionName.toLowerCase()}`,
          ]"
          round
          @click="handleSectionClick(i, item.sectionId)"
        >
          {{ item.sectionName }}
        </el-button>
      </ul>
      <ul class="status">
        <el-button round type="primary" @click="goToCompiler">
          <el-icon>
            <Edit />
          </el-icon>
          在线编译
        </el-button>
      </ul>
    </div>
    <div v-if="filterKnowledges.length !== 0" class="knowledges">
      <div v-for="item in filterKnowledges" :key="item.id" class="knowledge-card"
        @click="goToDetail(item.id, item.sectionId, item.knowState)">
        <span class="card-header">
          <h5 :style="{ color: activeColor[item.knowState] }">
            {{ item.knowId }}.{{ item.knowName }}
          </h5>
          <el-rate v-model="item.hierarchy" :colors="['#409eff', '#409eff', '#409eff']" disabled show-score
            text-color="#409eff" score-template="重点" size="small" />
          <el-rate v-model="item.difficulty" disabled :colors="['#409eff', '#409eff', '#409eff']" show-score
            text-color="#409eff" score-template="难度" size="small" />
          <span class="expertly">熟练度：{{ item.expertly }}</span>
        </span>
        <p :style="{ backgroundColor: activeInfoColor[item.knowState] }">
          {{ item.describe }}
        </p>
      </div>
    </div>
    <el-empty v-else style="width: 100%" :image="empty" />
    <el-backtop :right="100" :bottom="100" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 引入 debounce 函数
import { debounce } from 'lodash'
import empty from '@/assets/images/empty_1.png'
// 导入api
import { apiGetAllPoints } from '@/api/chapters'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
const activeColor = ref(['#67c23a', '#67c23a', '#f56c6c'])
const activeInfoColor = ref([
  'rgb(239.8, 248.9, 235.3)',
  'rgb(239.8, 248.9, 235.3)',
  'rgb(254, 240.3, 240.3)',
])
const router = useRouter()

const currentSection = ref(0)

// 过滤参数
const courcesReq = ref({
  sectionId: 1,
})

// 顶部课程分类
const sections = ref([
  {
    sectionId: 1,
    sectionName: 'HTML',
  },
  {
    sectionId: 2,
    sectionName: 'CSS',
  },
  {
    sectionId: 3,
    sectionName: 'JavaScript',
  },
])

// 知识点列表
const knowledges = ref([])
const filterKnowledges = ref([])
// 获取所有知识点列表
const getAllPoints = async () => {
  const res = await apiGetAllPoints(210047301)
  knowledges.value = res.data.knowPointList
  filterKnowledges.value = filter(courcesReq.value.sectionId)
}
getAllPoints()

// 跳转到在线编译页面
const goToCompiler = () => {
  router.push('/compiler')
}

// 选择章节按钮回调
const handleSectionClick = (i, sectionId) => {
  currentSection.value = i
  courcesReq.value.sectionId = sectionId
  filterKnowledges.value = filter(sectionId)
}

// 定义防抖函数
const debouncedWarning = debounce(() => {
  ElMessage.warning('请先学习前置知识点')
}, 500)
// 跳转到知识点详情页
const goToDetail = (pointId, sectionId, knowState) => {
  if (knowState == 2) {
    // 调用防抖函数
    debouncedWarning()
  } else {
    router
      .push({
        path: '/knowledgeDetail',
        query: { pointId, sectionId },
      })
      .catch(error => {
        // 处理路由跳转失败的情况
        ElMessage.error(`路由跳转失败: ${error.message}`)
      })
  }
}

// 每个分类只展示前 5 节课，避免旧数据混在一起。
const filter = sectionId => {
  return knowledges.value
    .filter(item => item.sectionId === sectionId)
    .sort((a, b) => a.knowId - b.knowId)
    .slice(0, 5)
}
</script>

<style lang="scss" scoped>
.courses-page {
  --course-accent: #ff7a45;
  --course-accent-2: #ff4d4f;
  --course-rgb: 255, 122, 69;
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 0%, rgba(var(--course-rgb), 0.2), transparent 30%),
    radial-gradient(circle at 82% 20%, rgba(207, 92, 255, 0.12), transparent 24%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;
}

.courses-page.theme-css {
  --course-accent: #409eff;
  --course-accent-2: #7c5cff;
  --course-rgb: 64, 158, 255;
}

.courses-page.theme-js {
  --course-accent: #f7c948;
  --course-accent-2: #f59e0b;
  --course-rgb: 247, 201, 72;
}

.main {
  min-height: calc(100vh - 88px);
  padding: 26px 3 * $padding-xxl 72px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: transparent;
  color: #fff;
}

.courses-page :deep(.header) {
  width: min(1180px, calc(100% - 32px));
  height: 72px;
  margin: 16px auto 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(7, 11, 18, 0.78) !important;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.3),
    0 0 24px rgba(var(--course-rgb), 0.12);
  backdrop-filter: blur(18px);
}

.courses-page :deep(.logo) {
  color: #fff;
  text-shadow: 0 0 18px rgba(var(--course-rgb), 0.42);
}

.courses-page :deep(nav li),
.courses-page :deep(.user span) {
  color: rgba(255, 255, 255, 0.78);
}

.courses-page :deep(nav li:hover),
.courses-page :deep(nav li.active) {
  color: var(--course-accent);
}

.select-box {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(12, 18, 27, 0.68);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(16px);

  .active {
    border-color: rgba(var(--course-rgb), 0.78);
    background: linear-gradient(135deg, var(--course-accent), var(--course-accent-2));
    color: #fff;
    box-shadow:
      0 12px 28px rgba(var(--course-rgb), 0.26),
      0 0 18px rgba(var(--course-rgb), 0.2);
  }

  .section {
    margin: 0;
    display: flex;
    gap: 12px;
  }
}

:deep(.select-box .el-button) {
  min-width: 92px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.86);
  font-weight: 700;
  box-shadow: none;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

:deep(.select-box .el-button:hover),
:deep(.select-box .el-button:focus) {
  border-color: rgba(var(--course-rgb), 0.6);
  background: rgba(var(--course-rgb), 0.16);
  color: #fff;
  transform: translateY(-2px);
}

:deep(.select-box .el-button--primary) {
  border: none;
  background: linear-gradient(135deg, var(--course-accent), var(--course-accent-2));
  color: #fff;
  box-shadow: 0 12px 28px rgba(var(--course-rgb), 0.26);
}

:deep(.select-box .tab-html) {
  --tab-accent: #ff7a45;
  --tab-rgb: 255, 122, 69;
}

:deep(.select-box .tab-css) {
  --tab-accent: #409eff;
  --tab-rgb: 64, 158, 255;
}

:deep(.select-box .tab-javascript) {
  --tab-accent: #f7c948;
  --tab-rgb: 247, 201, 72;
}

:deep(.select-box .tab-html),
:deep(.select-box .tab-css),
:deep(.select-box .tab-javascript) {
  color: var(--tab-accent);
  border-color: rgba(var(--tab-rgb), 0.28);
}

:deep(.select-box .tab-html:not(.active):hover),
:deep(.select-box .tab-css:not(.active):hover),
:deep(.select-box .tab-javascript:not(.active):hover) {
  border-color: rgba(var(--tab-rgb), 0.55);
  background: rgba(var(--tab-rgb), 0.14);
  box-shadow: 0 10px 24px rgba(var(--tab-rgb), 0.14);
}

.knowledges {
  width: 100%;
  margin: 28px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;

  .knowledge-card {
    width: calc((100% - 24px) / 2);
    border: 1px solid rgba(var(--course-rgb), 0.22);
    background: rgba(12, 18, 27, 0.68);
    border-radius: 18px;
    padding: 24px;
    cursor: pointer;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(16px);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease,
      border-color 0.3s ease,
      background 0.3s ease;

    /* 鼠标悬停时的样式 */
    &:hover {
      border-color: rgba(var(--course-rgb), 0.48);
      background: rgba(18, 28, 42, 0.78);
      box-shadow:
        0 26px 80px rgba(0, 0, 0, 0.32),
        0 0 28px rgba(var(--course-rgb), 0.18);
      transform: translateY(-5px); // 卡片向上移动 5px，产生上浮效果
    }

    .card-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      align-items: center;
      column-gap: 22px;
      row-gap: 12px;
      margin-bottom: 16px;

      h5 {
        grid-column: 1 / -1;
        margin: 0;
        color: var(--course-accent) !important;
        font-size: $font-size-xl;
        font-weight: bold;
        line-height: 1.35;
        text-shadow: 0 0 16px rgba(var(--course-rgb), 0.18);
        overflow-wrap: anywhere;
      }

      .expertly {
        min-width: max-content;
        font-size: $font-size-l;
        color: var(--course-accent);
        white-space: nowrap;
      }
    }

    p {
      margin: 0;
      font-size: $font-size-l;
      color: rgba(255, 255, 255, 0.72);
      background: rgba(var(--course-rgb), 0.08) !important;
      border: 1px solid rgba(var(--course-rgb), 0.12);
      border-radius: 12px;
      padding: 10px 12px;
      line-height: 2.5;
      // 多行文本溢出显示省略号
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

:deep(.knowledge-card .el-rate__text) {
  color: var(--course-accent) !important;
  white-space: nowrap;
}

:deep(.knowledge-card .el-rate__icon) {
  color: rgba(255, 255, 255, 0.18);
}

:deep(.knowledge-card .el-rate) {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

:deep(.knowledge-card .el-rate__item) {
  flex: 0 0 auto;
}

:deep(.el-empty__description p) {
  color: rgba(255, 255, 255, 0.62);
}

:deep(.el-backtop) {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(12, 18, 27, 0.74);
  color: var(--course-accent);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

// 移动端样式调整
@media screen and (max-width: 768px) {
  .main {
    padding: 20px $padding-xl 48px;
  }

  :deep(.header) {
    width: calc(100% - 20px);
    height: auto;
    min-height: 64px;
    margin-top: 10px;
    padding: 12px;
    gap: 12px;
  }

  .select-box {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .select-box .section {
    flex-wrap: wrap;
    gap: $margin-m;
    justify-content: stretch;
  }

  .knowledges .knowledge-card {
    width: 100%;

    .card-header {
      grid-template-columns: 1fr;
      align-items: flex-start;
      gap: $margin-s;
    }
  }
}
</style>
