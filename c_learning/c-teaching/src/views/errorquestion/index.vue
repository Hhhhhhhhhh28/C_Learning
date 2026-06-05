<template>
  <div class="error-page">
    <HeaderCm />
    <div class="content-box">
      <AiAnalyze />
      <el-card shadow="never" style="margin-top: 20px">
        <template #header>
          <div class="head">
            <span>错题本</span>
            <span>共{{ errCount }}题</span>
          </div>
        </template>
        <el-select
          v-model="selectOption"
          style="width: 200px"
          @change="handleChangeCourse"
        >
          <el-option
            v-for="item in courseOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-table
          v-if="errorQuestionList.length > 0"
          v-loading="isLoading"
          stripe
          :data="errorQuestionList"
          style="width: 100%"
          height="550"
        >
          <el-table-column prop="title" label="题目">
            <template #default="scope">
              <p v-parsemd="scope.row.title"></p>
            </template>
          </el-table-column>
          <el-table-column prop="knowPointName" label="知识点" width="180">
            <template #default="scope">
              <el-tag>{{ scope.row.knowPointName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度">
            <template #default="scope">
              <el-rate v-model="scope.row.difficulty" disabled />
            </template>
          </el-table-column>
          <el-table-column prop="hierarchy" label="重点">
            <template #default="scope">
              <el-rate v-model="scope.row.hierarchy" disabled />
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleVisibelity(row)"
              >
                查看详情
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="handleWordSameQs(row)"
                >做同类型</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else :image="empty" />
        <ErrorQsDetail v-model="dialogTableVisible" :current-row="currentRow" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 引入api
import { getErrorQuestion } from '@/api/question'
// 引入组件
import ErrorQsDetail from './components/ErrorQsDetail.vue'
import AiAnalyze from './components/AiAnalyze.vue'
import HeaderCm from '@/components/HeaderCm.vue'
// 引入仓库
import { useUserStore } from '@/stores/index'
import empty from '@/assets/images/empty_1.png'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const userStore = useUserStore()
// 课程分类选择变量
const selectOption = ref('all')
//控制弹窗显隐变量
const dialogTableVisible = ref(false)
//当前查看的行数据
const currentRow = ref({})
// 课程分类列表变量
const courseOptions = [
  { value: 'all', text: '全部' },
  { value: 'html', text: 'HTML' },
  { value: 'css', text: 'CSS' },
  { value: 'javascript', text: 'JavaScript' },
]
// 错题列表变量
const errorQuestionList = ref([])
const allErrorQuestionList = ref([])
// 所有错题数量
const errCount = ref(0)
// 控制是否加载
const isLoading = ref(false)

const getQuestionSectionId = item => {
  return Number(item.sectionId || item.section_id || item.section || item.chapterId || item.chapter_id || 0)
}

const inferQuestionCategory = item => {
  const sectionId = getQuestionSectionId(item)
  if (sectionId === 1) return 'html'
  if (sectionId === 2) return 'css'
  if (sectionId === 3) return 'javascript'

  const text = [
    item.title,
    item.knowPointName,
    item.knowName,
    item.course,
    item.courseName,
    item.category,
    item.type,
    item.knowledgeType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/javascript|\bjs\b|变量|函数|事件|数组|对象|dom|let|const|var|作用域/.test(text)) {
    return 'javascript'
  }
  if (/css|样式|布局|flex|grid|盒模型|选择器|浮动|定位|margin|padding/.test(text)) {
    return 'css'
  }
  return 'html'
}

const applyCourseFilter = () => {
  const list = Array.isArray(allErrorQuestionList.value) ? allErrorQuestionList.value : []
  errorQuestionList.value =
    selectOption.value === 'all'
      ? list
      : list.filter(item => inferQuestionCategory(item) === selectOption.value)
  errCount.value = errorQuestionList.value.length
}

// 获取错题列表函数
const getErrorQuestionList = async () => {
  isLoading.value = true
  try {
    const {
      data: { showTopicResults = [] } = {},
    } = await getErrorQuestion({
      stuId: userStore.studentId,
    })
    allErrorQuestionList.value = Array.isArray(showTopicResults) ? showTopicResults : []
    applyCourseFilter()
  } finally {
    isLoading.value = false
  }
}
// 选择课程分类变化函数
const handleChangeCourse = () => {
  applyCourseFilter()
}
// 查看详情函数
const handleVisibelity = row => {
  dialogTableVisible.value = true
  currentRow.value = row
}
// 做同类型函数
const handleWordSameQs = row => {
  router.push({
    path: '/exercise',
    query: {
      topicId: row.id,
    },
  })
}
// 生命周期函数 挂载后获取错题列表
onMounted(() => {
  getErrorQuestionList()
})
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  padding-bottom: 56px;
  background:
    radial-gradient(circle at 18% 0%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 82% 20%, rgba(207, 92, 255, 0.12), transparent 24%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;
}

.error-page :deep(.header) {
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

.error-page :deep(.logo) {
  color: #fff;
  text-shadow: 0 0 18px rgba(64, 158, 255, 0.42);
}

.error-page :deep(nav li),
.error-page :deep(.user span) {
  color: rgba(255, 255, 255, 0.78);
}

.error-page :deep(nav li:hover),
.error-page :deep(nav li.active) {
  color: #76b7ff;
}

.content-box {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 8px 0 0;
}

.content-box :deep(.el-card) {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  background: rgba(12, 18, 27, 0.68);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.28),
    0 0 24px rgba(64, 158, 255, 0.1);
  color: #fff;
  backdrop-filter: blur(16px);
}

.content-box :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(7, 11, 18, 0.34);
}

.content-box :deep(.el-card__body) {
  padding: 22px;
}

.head {
  display: flex;
  gap: $margin-s;
  span {
    font-size: 2rem;
    font-weight: bold;
    color: #fff;
  }
}

:deep(.el-select) {
  margin-bottom: 18px;
}

:deep(.el-select .el-input__wrapper) {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

:deep(.el-select .el-input__inner) {
  color: #fff;
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
  font-weight: 700;
}

:deep(.el-table tr),
:deep(.el-table td.el-table__cell) {
  background: transparent;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 255, 255, 0.045);
}

:deep(.el-table td.el-table__cell),
:deep(.el-table th.el-table__cell.is-leaf) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

:deep(.el-table__body p) {
  color: rgba(255, 255, 255, 0.78);
}

:deep(.el-button.is-link) {
  color: #76b7ff;
  font-weight: 700;
}

:deep(.el-button.is-link:hover) {
  color: #a8d2ff;
}

:deep(.el-tag) {
  border-color: rgba(64, 158, 255, 0.28);
  background: rgba(64, 158, 255, 0.12);
  color: #a8d2ff;
}

:deep(.el-rate__icon) {
  color: rgba(255, 255, 255, 0.22);
}

:deep(.el-empty__description p) {
  color: rgba(255, 255, 255, 0.62);
}

@media screen and (max-width: 768px) {
  .error-page :deep(.header) {
    width: calc(100% - 20px);
    height: auto;
    min-height: 64px;
    margin-top: 10px;
    padding: 12px;
    gap: 12px;
  }

  .content-box {
    width: calc(100% - 20px);
  }
}
</style>
