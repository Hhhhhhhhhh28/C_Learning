<template>
  <!-- 错题本 -->
  <el-card shadow="never" style="margin-top: 20px">
    <template #header>
      <div class="header">
        <span>错题本</span>
        <span>共{{ errorQuestionList.length }}题</span>
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
    <el-table :data="errorQuestionList" style="width: 100%" height="300">
      <el-table-column prop="title" label="题目" />
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
          <el-button link type="primary" size="small">做同类型</el-button>
        </template>
      </el-table-column>
    </el-table>
    <ErrorQsDetail
      :visible="dialogTableVisible"
      :current-row="currentRow"
      @update:visible="dialogTableVisible = $event"
    />
  </el-card>
</template>

<script setup>
// 引入api
import { getErrorQuestion } from '@/api/question'
// 引入组件
import ErrorQsDetail from './ErrorQsDetail.vue'
// 引入仓库
import { useUserStore } from '@/stores/index'
// 引入hook
import { onMounted, ref } from 'vue'

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
}

// 获取错题列表函数
const getErrorQuestionList = async () => {
  const {
    data: { showTopicResults = [] } = {},
  } = await getErrorQuestion({
    stuId: userStore.studentId,
  })
  allErrorQuestionList.value = Array.isArray(showTopicResults) ? showTopicResults : []
  applyCourseFilter()
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
// 生命周期函数 挂载后获取错题列表
onMounted(() => {
  getErrorQuestionList()
})
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  gap: $margin-s;
  span {
    font-size: 1.6rem;
    font-weight: 500;
    color: $primary-color;
  }
}

</style>
