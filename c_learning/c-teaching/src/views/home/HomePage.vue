<template>
  <div class="home-page">
    <HeaderCm />
    <MainCm v-if="Number(authority)">
      <section class="home-hero">
        <div class="hero-copy">
          <p class="eyebrow">Victor Elearning Dashboard</p>
          <h1>欢迎回来，继续点亮前端学习</h1>
          <p>智前端 Elearning 聚焦 HTML、CSS 与 JavaScript，帮助学生完成课程学习、练习巩固、错题复盘与智能辅助。</p>
        </div>
        <div class="hero-status">
          <span>学习进度</span>
          <strong>{{ plan }}%</strong>
        </div>
      </section>

      <div class="top">
        <div>
          <h2 v-if="studentStatus?.pointName">上次学到</h2>
          <h2 v-else>先去课程页看看吧</h2>
          <span class="study">
            <p>{{ studentStatus?.pointName || '无' }}</p>
            <el-button
              v-show="studentStatus?.pointName"
              type="primary"
              @click="handleStudy"
              >继续学习</el-button
            >
          </span>
          <p class="next-study">
            下一个知识点：{{ studentStatus?.nextPointName || '无' }}
          </p>
        </div>
      </div>
      <div class="four-data">
        <div class="item">
          <span class="title">学习时长</span>
          <span class="num">{{ mini }}</span>
        </div>
        <div class="item">
          <span class="title">进度</span>
          <span class="num">{{ plan }}%</span>
        </div>
        <div class="item">
          <span class="title">知识点</span>
          <span class="num">{{ studyPoints.length }}/{{ points.length }}</span>
        </div>
        <div class="item">
          <span class="title">当前积分</span>
          <span class="num">{{ currentPoints }}</span>
        </div>
      </div>
      <section class="quick-section">
        <div class="section-title">
          <span>快速入口</span>
          <p>学习、练习、错题、AI 与游戏化模块集中入口，适合课堂展示和日常使用。</p>
        </div>
        <div class="quick-grid">
          <button v-for="item in quickLinks" :key="item.title" type="button" @click="goPage(item.path)">
            <span>{{ item.icon }}</span>
            <strong>{{ item.title }}</strong>
            <em>{{ item.desc }}</em>
          </button>
        </div>
      </section>
      <div class="data">
        <!-- 折线图 -->
        <OneCom :point-list="points" />
        <!-- 圆环 进度-->
        <TowCom :point-list="points" />
      </div>
    </MainCm>
    <MainCm v-else>
      <section class="home-hero">
        <div class="hero-copy">
          <p class="eyebrow">Start Your Path</p>
          <h1>完成测试，开启专属学习路线</h1>
          <p>系统会根据你的基础生成适合的前端学习节奏。</p>
          <div class="hero-actions">
            <el-button type="primary" @click="handleTest">进入测试</el-button>
            <el-button @click="goPage('/cources')">查看课程</el-button>
          </div>
        </div>
      </section>
      <div class="top-todo">
        <h2>请先测试，测试后可选择课程学习</h2>
        <span>
          <el-button type="primary" @click="handleTest">进入测试</el-button>
        </span>
      </div>
      <div class="data-todo">
        <el-empty description="测试后再查看数据" />
      </div>
    </MainCm>
  </div>
</template>

<script setup>
import MainCm from '../../components/MainCm.vue'
import OneCom from './components/OneCom.vue'
import TowCom from './components/TowCom.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/index.js'
// api
import { apiGetStudyStatus, apiGetStudyPoints } from '@/api/home.js'
import { apiGetAllPoints } from '@/api/chapters.js'
import { apiGetStauts, getUserInfo } from '@/api/user.js'
const router = useRouter()
const userStore = useUserStore()
const userInfo = ref({})

const quickLinks = [
  { icon: '📘', title: '课程学习', desc: 'HTML / CSS / JavaScript', path: '/cources' },
  { icon: '📝', title: '章节练习', desc: '快速进入测验', path: '/question' },
  { icon: '🔁', title: '错题本', desc: '复盘薄弱知识点', path: '/errorquestion' },
  { icon: '🤖', title: 'AI智能辅助', desc: '学习建议与问答', path: '/ai' },
  { icon: '🏆', title: '游戏化学习', desc: '积分任务与排行', path: '/game' },
  { icon: '👤', title: '个人中心', desc: '查看个人信息', path: '/my' },
]

// 进入测试按钮
const handleTest = () => {
  router.push({
    path: '/question',
    query: {
      sectionId: 3,
    },
  })
}

const goPage = path => {
  if (path === '/question') {
    goPractice()
    return
  }
  router.push(path)
}

const goPractice = () => {
  router.push({
    path: '/question',
    query: {
      sectionId: 1,
    },
  })
}

const studentStatus = ref({})
// 1.获取学生学习情况
const getStudyStatus = async () => {
  const res = await apiGetStudyStatus()
  studentStatus.value = res.data
}

// 3.获取所有知识点列表
const points = ref([])
const getAllPoints = async () => {
  const res = await apiGetAllPoints(userInfo.value.stuNum)
  points.value = res.data.knowPointList
}

// 4.获取已学知识点列表
const studyPoints = ref([])
const getStudyPoints = async () => {
  const res = await apiGetStudyPoints(userInfo.value.stuNum)
  studyPoints.value = res.data
}

// 获取学生信息
const getStudentInfo = async () => {
  const res = await getUserInfo()
  userInfo.value = res
  localStorage.setItem('userInfo', JSON.stringify(res))
  userStore.setUserInfo(res)
}

// 继续学习按钮
const handleStudy = () => {
  router.push({
    path: '/knowledgeDetail',
    query: {
      pointId: studentStatus.value.knowPointId,
      sectionId: studentStatus.value.sectionId,
    },
  })
}

const plan = computed(() => {
  if (points.value.length === 0) {
    return 0 // 避免除零错误
  }
  return Math.ceil((studyPoints.value.length / points.value.length) * 100)
})

const currentPoints = computed(() => {
  return Number(userInfo.value.total_points || userInfo.value.points || 0)
})

// 时间转换
const mini = computed(() => {
  if (userStore.totalTime < 60) {
    return userStore.totalTime + 's'
  }
  const minutes = Math.ceil(userStore.totalTime / 60)
  if (minutes >= 100) {
    return (minutes / 60).toFixed(1) + 'h'
  }
  return minutes + 'min'
})

const authority = ref()
// 获取学生状态
const getStatus = async () => {
  const { data } = await apiGetStauts()
  authority.value = data
  localStorage.setItem('authority', data)
}

onMounted(async () => {
  await getStudentInfo()
  getStatus()
  if (authority.value !== 1) {
    getStudyStatus()
    getAllPoints()
    getStudyPoints()
  }
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 48px;
  background:
    radial-gradient(circle at 20% 0%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 80% 18%, rgba(207, 92, 255, 0.12), transparent 24%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;
}

:deep(.header) {
  width: min(1180px, calc(100% - 32px));
  height: 72px;
  margin: 16px auto 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(12, 18, 27, 0.74);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

:deep(.logo) {
  color: #fff;
  font-size: clamp(2.2rem, 3vw, 3.8rem);
  text-shadow: 0 0 18px rgba(64, 158, 255, 0.42);
}

:deep(nav li),
:deep(.user span) {
  color: rgba(255, 255, 255, 0.78);
}

:deep(nav li:hover),
:deep(nav li.active) {
  color: #76b7ff;
}

:deep(main) {
  width: min(1120px, calc(100% - 32px));
  margin-top: 28px;
  margin-bottom: 0;
}

.home-hero,
.quick-section,
.top,
.top-todo,
.four-data,
.data,
.data-todo {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  background: rgba(12, 18, 27, 0.68);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(16px);
}

.home-hero {
  min-height: 210px;
  padding: 34px 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.22), rgba(12, 18, 27, 0.62)),
    rgba(12, 18, 27, 0.68);
}

.hero-copy {
  max-width: 680px;
}

.eyebrow {
  margin: 0 0 12px;
  color: rgba(118, 183, 255, 0.92);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-hero h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(2.8rem, 2.2vw, 3.4rem);
  line-height: 1.15;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-shadow: 0 18px 42px rgba(0, 0, 0, 0.36);
}

.home-hero p:last-child {
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1.6rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.hero-actions :deep(.el-button) {
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.86);
  font-size: 1.5rem;
  font-weight: 800;
}

.hero-actions :deep(.el-button--primary) {
  border: none;
  background: linear-gradient(135deg, #409eff, #7c5cff);
  color: #fff;
}

.hero-status {
  min-width: 160px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  text-align: center;
}

.hero-status span {
  display: block;
  color: rgba(255, 255, 255, 0.68);
  font-size: 1.4rem;
}

.hero-status strong {
  display: block;
  margin-top: 8px;
  color: #76b7ff;
  font-family: DingTalk;
  font-size: 4.2rem;
}

.quick-section {
  margin-top: 24px;
  padding: 26px;
}

.section-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.section-title span {
  color: #fff;
  font-size: 2.2rem;
  font-weight: 900;
}

.section-title p {
  max-width: 620px;
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 1.5rem;
  line-height: 1.6;
}

.top,
.top-todo {
  min-height: 180px;
  margin-top: 24px;
  padding: 30px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.top h2,
.top-todo h2 {
  margin: 0;
  color: #76b7ff;
  font-size: clamp(2.8rem, 3.4vw, 4.4rem);
}

.study {
  width: 100%;
  margin-top: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.study p {
  margin: 0;
  color: #fff;
  font-size: 2.4rem;
  font-weight: 700;
}

.next-study {
  margin: 20px 0 0;
  color: rgba(255, 255, 255, 0.58);
  font-size: 1.4rem;
}

.four-data {
  width: 100%;
  margin-top: 24px;
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.four-data .item {
  min-height: 126px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
}

.four-data .title {
  color: rgba(255, 255, 255, 0.68);
  font-size: 1.5rem;
}

.four-data .num {
  color: #76b7ff;
  font-family: DingTalk;
  font-size: 4rem;
  text-shadow: 0 0 22px rgba(64, 158, 255, 0.28);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.quick-grid button {
  min-height: 118px;
  padding: 16px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.quick-grid button:hover {
  transform: translateY(-3px);
  border-color: rgba(118, 183, 255, 0.28);
  background: rgba(64, 158, 255, 0.1);
}

.quick-grid button span {
  display: block;
  margin-bottom: 8px;
  font-size: 2.2rem;
}

.quick-grid button strong {
  display: block;
  font-size: 1.5rem;
  line-height: 1.35;
}

.quick-grid button em {
  display: block;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.56);
  font-size: 1.3rem;
  font-style: normal;
  line-height: 1.45;
}

.data,
.data-todo {
  width: 100%;
  min-height: 360px;
  margin-top: 24px;
  padding: 26px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.data-todo {
  justify-content: center;
}

:deep(.chart-one),
:deep(.chart-tow) {
  min-height: 300px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
}

:deep(.el-button--primary) {
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #409eff, #7c5cff);
  box-shadow: 0 12px 28px rgba(64, 158, 255, 0.26);
}

:deep(.el-empty__description p) {
  color: rgba(255, 255, 255, 0.62);
}

:global(.theme-light) .home-page {
  .quick-section {
    border-color: rgba(15, 23, 42, 0.08);
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 18px 48px rgba(15, 23, 42, 0.1);
  }

  .quick-section .section-title span,
  .quick-grid button strong {
    color: #0f172a;
  }

  .quick-section .section-title p,
  .quick-grid button em {
    color: #475569;
  }

  .quick-grid button {
    border-color: rgba(15, 23, 42, 0.1);
    background: #f8fafc;
    color: #0f172a;
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
  }

  .quick-grid button:hover {
    border-color: rgba(37, 99, 235, 0.22);
    background: #eef6ff;
  }
}

@media screen and (max-width: 768px) {
  .home-page {
    padding-bottom: 28px;
  }

  :deep(.header) {
    width: calc(100% - 20px);
    height: auto;
    min-height: 64px;
    margin-top: 10px;
    padding: 12px;
    gap: 12px;
  }

  :deep(main) {
    width: calc(100% - 20px);
    margin-top: 16px;
  }

  .home-hero,
  .quick-section,
  .top,
  .top-todo,
  .four-data,
  .data,
  .data-todo {
    border-radius: 16px;
  }

  .home-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 26px 22px;
  }

  .home-hero h1 {
    max-width: 100%;
    font-size: clamp(2rem, 6vw, 2.8rem);
  }

  .hero-status {
    width: 100%;
  }

  .study {
    flex-direction: column;
    align-items: flex-start;
  }

  .four-data {
    grid-template-columns: 1fr;
  }

  .section-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .data {
    flex-wrap: wrap;
    padding: 18px;
  }
}
</style>
