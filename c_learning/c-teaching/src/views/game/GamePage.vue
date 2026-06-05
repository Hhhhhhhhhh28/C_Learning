<template>
  <div class="game-page">
    <h1>游戏化学习</h1>

    <section class="game-summary" aria-label="学习等级概览">
      <div class="summary-main">
        <span class="summary-eyebrow">Learning Dashboard</span>
        <h2>当前等级: {{ currentLevel }}</h2>
        <p>{{ currentLevelDescription }}</p>
        <div class="next-level-tip">
          <span>{{ nextLevelName }}</span>
          <strong>{{ upgradeTip }}</strong>
        </div>
      </div>

      <div class="summary-stats">
        <div class="summary-stat">
          <span>当前积分</span>
          <strong>{{ totalPoints }}</strong>
        </div>
        <div class="summary-stat">
          <span>距离下一等级</span>
          <strong>{{ pointsToNext }}积分</strong>
        </div>
      </div>

      <div class="summary-progress">
        <div class="progress-meta">
          <span>升级进度</span>
          <span>{{ levelProgress }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${levelProgress}%` }"></div>
        </div>
      </div>
    </section>

    <el-tabs v-model="activeTab" class="game-tabs">
      <el-tab-pane label="等级系统" name="levels">
        <section class="achievement-section" aria-label="学习成就徽章">
          <div class="achievement-title">
            <span>成就徽章</span>
            <p>完成学习、练习和复盘任务后逐步点亮徽章。</p>
          </div>
          <div class="achievement-grid">
            <article
              v-for="badge in achievementBadges"
              :key="badge.name"
              class="achievement-card"
              :class="{ earned: badge.earned }"
            >
              <span class="achievement-icon">{{ badge.icon }}</span>
              <div>
                <strong>{{ badge.name }}</strong>
                <p>{{ badge.description }}</p>
              </div>
              <span class="achievement-status">{{ badge.earned ? '已获得' : '未获得' }}</span>
            </article>
          </div>
        </section>

        <div class="levels-container">
          <el-card
            v-for="level in levels"
            :key="level.id"
            class="level-card"
            :class="{ locked: level.status === 0, completed: level.status === 2 }"
          >
            <template #header>
              <div class="level-header">
                <span class="level-number">第 {{ level.level_number }} 关</span>
                <span class="level-name">{{ level.level_name }}</span>
              </div>
            </template>
            <div class="level-content">
              <p class="level-description">{{ level.description }}</p>
              <div class="level-requirements">
                <p>所需积分: {{ level.required_points }}</p>
                <p>所需任务: {{ level.required_tasks }}</p>
              </div>
              <div class="level-status">
                <span v-if="level.status === 0" class="status locked">未解锁</span>
                <span v-else-if="level.status === 1" class="status unlocked">已解锁</span>
                <span v-else-if="level.status === 2" class="status completed">已完成</span>
                <span v-else class="status locked">未解锁</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="任务系统" name="tasks">
        <div class="tasks-container">
          <el-card
            v-for="task in gamifiedTasks"
            :key="task.id"
            class="task-card gamified-task-card"
            :class="{ completed: task.completed }"
          >
            <template #header>
              <div class="task-header">
                <span class="task-name">{{ task.title }}</span>
                <span class="task-reward-tag">+{{ task.reward }} 积分</span>
              </div>
            </template>
            <div class="task-content">
              <p class="task-description">{{ task.description }}</p>
              <div class="task-footer">
                <span class="task-status-pill" :class="[task.status, { completed: task.completed }]">
                  {{ getTaskStatusText(task) }}
                </span>
                <el-button
                  type="primary"
                  class="go-task-btn"
                  :disabled="task.completed"
                  @click="goCompleteTask(task)"
                >
                  去完成
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="积分系统" name="points">
        <div class="points-container">
          <section class="points-summary-grid">
            <div v-for="item in pointsSummary" :key="item.label" class="points-summary-card">
              <span>{{ item.label }}</span>
              <strong :class="{ gold: item.gold }">{{ item.value }}</strong>
            </div>
          </section>

          <div class="points-system-grid">
            <el-card class="points-rules-card">
              <template #header>
                <div class="points-header">
                  <span>积分规则</span>
                </div>
              </template>
              <div class="points-rules-list">
                <div v-for="rule in pointsRules" :key="rule.title" class="points-rule-item">
                  <span class="point-rule-icon">{{ rule.icon }}</span>
                  <div>
                    <span>{{ rule.title }}</span>
                    <p>{{ rule.description }}</p>
                  </div>
                  <strong>+{{ rule.points }} 积分</strong>
                </div>
              </div>
              <div class="points-growth-tip">
                <span>今日积分目标</span>
                <p>完成 1 次章节练习，可获得 +20 积分。</p>
                <p>成长提示：连续学习和复习错题可以更快提升等级。</p>
              </div>
            </el-card>

            <el-card class="points-records-card">
              <template #header>
                <div class="points-header">
                  <span>最近积分记录</span>
                </div>
              </template>
              <div class="points-empty-state">
                <template v-if="!pointsHistory.length">
                  <span>暂无积分记录</span>
                  <p>完成课程学习、练习或错题复习后将自动生成记录。</p>
                </template>
                <div v-else class="points-record-list">
                  <div v-for="record in pointsHistory.slice(0, 6)" :key="record.id" class="points-record-item">
                    <span class="point-record-icon">{{ getPointSourceIcon(record.source) }}</span>
                    <div>
                      <span>{{ record.title || getPointSourceLabel(record.source) }}</span>
                      <em>{{ getPointSourceType(record.source) }}</em>
                      <p>{{ formatPointDate(record.created_at) }}</p>
                    </div>
                    <strong>+{{ record.points }} 积分</strong>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="排行榜" name="leaderboard">
        <div class="leaderboard-container">
          <el-card class="leaderboard-card">
            <template #header>
              <div class="leaderboard-header">
                <span>积分排行榜</span>
              </div>
            </template>
            <el-table
              :data="leaderboardDisplay"
              :row-class-name="getLeaderboardRowClass"
              class="gamified-leaderboard"
              style="width: 100%"
            >
              <el-table-column label="排名" width="110">
                <template #default="{ $index }">
                  <span class="rank-badge" :class="getRankClass($index + 1)">
                    <span class="rank-icon">{{ getRankIcon($index + 1) }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="姓名">
                <template #default="{ row }">
                  <span class="leaderboard-user">
                    {{ row.name }}
                    <span v-if="row.isCurrent" class="me-badge">我</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="class_name" label="班级" />
              <el-table-column label="等级" width="130">
                <template #default="{ row }">
                  <span class="level-pill">{{ row.level || getUserLevel(row.total_points) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="积分" width="130">
                <template #default="{ row }">
                  <span class="leaderboard-points">{{ row.total_points }}</span>
                </template>
              </el-table-column>
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
import { apiGetLevels, apiGetTasks, apiCompleteTask, apiGetPoints, apiGetLeaderboard } from '@/api/game'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('levels')
const levels = ref([])
const tasks = ref([])
const pointsHistory = ref([])
const totalPoints = ref(0)
const todayPoints = ref(0)
const weekPoints = ref(0)
const currentLevel = ref('入门级')
const levelProgress = ref(0)
const pointsToNext = ref(100)
const leaderboard = ref([])
const mockLeaderboard = [
  { name: 'Victor', class_name: '前端 1 班', total_points: 680 },
  { name: 'ISABEL', class_name: '前端 2 班', total_points: 520 },
  { name: 'Weikaduo', class_name: '前端 1 班', total_points: 430 },
  { name: '当前用户', class_name: '前端 3 班', total_points: 300, isCurrent: true },
  { name: 'Ming', class_name: '前端 2 班', total_points: 180 },
  { name: 'Luna', class_name: '前端 1 班', total_points: 90 }
]
const leaderboardDisplay = computed(() => (leaderboard.value.length ? leaderboard.value : mockLeaderboard))
const pointsSummary = computed(() => [
  { label: '当前积分', value: totalPoints.value, gold: true },
  { label: '今日获得', value: todayPoints.value, gold: true },
  { label: '本周获得', value: weekPoints.value, gold: true },
  { label: '当前等级', value: currentLevel.value, gold: false }
])
const levelMeta = [
  { name: '入门级', min: 0, next: 100, nextName: '基础级', description: '正在建立前端学习基础，适合完成课程学习与基础练习。' },
  { name: '基础级', min: 100, next: 300, nextName: '进阶级', description: '已经具备基础知识，可以通过章节练习和错题复盘提升稳定性。' },
  { name: '进阶级', min: 300, next: 600, nextName: '专家级', description: '进入综合应用阶段，适合挑战 JavaScript 与综合练习。' },
  { name: '专家级', min: 600, next: null, nextName: '满级挑战', description: '已达到高阶学习阶段，可以持续完成综合项目和高难度练习。' },
]
const currentLevelInfo = computed(() => {
  return levelMeta.find(level => level.name === currentLevel.value) || levelMeta[0]
})
const nextLevelName = computed(() => currentLevelInfo.value.nextName)
const currentLevelDescription = computed(() => currentLevelInfo.value.description)
const upgradeTip = computed(() => {
  if (!currentLevelInfo.value.next) {
    return '已达到当前等级体系最高阶段，继续积累积分保持领先。'
  }
  return `还差 ${pointsToNext.value} 积分升级到 ${nextLevelName.value}`
})
const pointsRules = [
  { icon: '📘', title: '完成课程学习', description: '学习一个知识点并进入详情页完成阅读。', points: 10 },
  { icon: '📝', title: '完成章节测试', description: '完成一次 HTML、CSS 或 JavaScript 章节测验。', points: 20 },
  { icon: '🔁', title: '错题复习', description: '进入错题本复盘薄弱知识点。', points: 15 },
  { icon: '🤖', title: 'AI 提问学习', description: '使用 AI智能辅助 提出一个学习问题。', points: 5 },
  { icon: '🔥', title: '连续学习打卡', description: '保持连续学习节奏，形成稳定习惯。', points: 10 }
]
const gamifiedTasks = [
  {
    id: 'course-study',
    title: '完成一次课程学习',
    description: '进入课程模块，完成一个前端知识点的学习记录。',
    reward: 10,
    status: 'doing',
    completed: false,
    target: { path: '/cources' }
  },
  {
    id: 'chapter-practice',
    title: '完成一次章节练习',
    description: '选择一个章节测验，检验 HTML、CSS 或 JavaScript 掌握情况。',
    reward: 20,
    status: 'todo',
    completed: false,
    target: { path: '/question', query: { sectionId: 1 } }
  },
  {
    id: 'wrong-review',
    title: '复习错题本',
    description: '查看错题分析，优先处理重复出错的薄弱知识点。',
    reward: 15,
    status: 'todo',
    completed: false,
    target: { path: '/errorquestion' }
  },
  {
    id: 'ai-question',
    title: '使用 AI智能辅助 提问',
    description: '向 AI 学习助手提出一个前端学习问题，获得提示和解释。',
    reward: 5,
    status: 'done',
    completed: true,
    target: { path: '/ai' }
  },
  {
    id: 'daily-checkin',
    title: '连续学习打卡',
    description: '保持学习节奏，连续打卡可以获得额外成长积分。',
    reward: 10,
    status: 'doing',
    completed: false,
    target: { path: '/cources' }
  },
  {
    id: 'accuracy-80',
    title: '章节练习正确率达到 80%',
    description: '在任意一次测验中达到 80% 正确率，证明你掌握得很稳。',
    reward: 50,
    status: 'todo',
    completed: false,
    target: { path: '/question', query: { sectionId: 3 } }
  }
]
const achievementBadges = computed(() => [
  {
    icon: '🌱',
    name: '初学者',
    description: '完成首次登录并进入学习平台。',
    earned: true,
  },
  {
    icon: '🧭',
    name: '前端探索者',
    description: '完成 3 个课程模块后获得。',
    earned: totalPoints.value >= 30,
  },
  {
    icon: '🧹',
    name: '错题清理者',
    description: '完成一次错题本复习。',
    earned: pointsHistory.value.some(item => item.source === 'wrong' || item.source === 'review'),
  },
  {
    icon: '🔥',
    name: '连续学习达人',
    description: '连续学习 3 天后点亮。',
    earned: weekPoints.value >= 30,
  },
  {
    icon: '🤖',
    name: 'AI学习助手',
    description: '使用 AI智能辅助 提问后获得。',
    earned: gamifiedTasks.some(task => task.id === 'ai-question' && task.completed),
  },
])

// 加载等级信息
const loadLevels = async () => {
  try {
    const { data } = await apiGetLevels()
    levels.value = data
  } catch (error) {
    ElMessage.error('加载等级信息失败')
  }
}

// 加载任务列表
const loadTasks = async () => {
  try {
    const { data } = await apiGetTasks()
    tasks.value = data
  } catch (error) {
    ElMessage.error('加载任务列表失败')
  }
}

// 完成任务
const completeTask = async taskId => {
  try {
    const { data } = await apiCompleteTask(taskId)
    ElMessage.success(`任务完成！获得 ${data.points} 积分`)
    // 重新加载任务和积分
    loadTasks()
    loadPoints()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '完成任务失败')
  }
}

const goCompleteTask = task => {
  if (task.target) {
    router.push(task.target)
  }
}

const getUserLevel = points => {
  if (points >= 600) return '专家级'
  if (points >= 300) return '进阶级'
  if (points >= 100) return '基础级'
  return '入门级'
}

const getPointSourceLabel = source => {
  if (source === 'quiz') return '完成测验'
  if (source === 'quiz_bonus') return '正确率奖励'
  if (source === 'task') return '完成任务'
  if (source === 'study') return '学习奖励'
  if (source === 'wrong' || source === 'review') return '错题复习'
  if (source === 'ai') return 'AI 提问学习'
  if (source === 'checkin') return '连续学习打卡'
  return '积分奖励'
}
const getPointSourceIcon = source => {
  if (source === 'quiz') return '📝'
  if (source === 'quiz_bonus') return '🎯'
  if (source === 'task') return '✅'
  if (source === 'study') return '📘'
  if (source === 'wrong' || source === 'review') return '🔁'
  if (source === 'ai') return '🤖'
  if (source === 'checkin') return '🔥'
  return '⭐'
}
const getPointSourceType = source => {
  if (source === 'quiz' || source === 'quiz_bonus') return '测验'
  if (source === 'study') return '课程'
  if (source === 'wrong' || source === 'review') return '错题'
  if (source === 'ai') return 'AI'
  if (source === 'checkin') return '打卡'
  return '任务'
}

const formatPointDate = value => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getRankClass = rank => {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return 'rank-normal'
}
const getRankIcon = rank => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

const getTaskStatusText = task => {
  if (task.completed || task.status === 'done') return '已完成'
  if (task.status === 'doing') return '进行中'
  return '未完成'
}

const getLeaderboardRowClass = ({ row, rowIndex }) => {
  const classes = []
  if (rowIndex < 3) classes.push(`top-${rowIndex + 1}-row`)
  if (row.isCurrent) classes.push('current-user-row')
  return classes.join(' ')
}

// 加载积分信息
const loadPoints = async () => {
  try {
    const { data } = await apiGetPoints()
    pointsHistory.value = Array.isArray(data.points) ? data.points : []
    totalPoints.value = data.totalPoints || 0
    todayPoints.value = data.todayPoints || 0
    weekPoints.value = data.weekPoints || 0
    currentLevel.value = data.currentLevel || getUserLevel(data.totalPoints || 0)
    levelProgress.value = Math.max(0, Math.min(100, data.progress || 0))
    pointsToNext.value = data.pointsToNext || 0
  } catch (error) {
    ElMessage.error('加载积分信息失败')
  }
}

// 加载排行榜
const loadLeaderboard = async () => {
  try {
    const { data } = await apiGetLeaderboard()
    leaderboard.value = data
  } catch (error) {
    ElMessage.error('加载排行榜失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadLevels()
  loadTasks()
  loadPoints()
  loadLeaderboard()
})
</script>

<style lang="scss" scoped>
.game-page {
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

  .game-tabs {
    margin-top: 20px;
  }

  .game-summary {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
    gap: 22px;
    margin: 0 0 26px;
    padding: 26px;
    border: 1px solid rgba(118, 183, 255, 0.2);
    border-radius: 24px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.14), rgba(124, 92, 255, 0.08)),
      rgba(12, 18, 27, 0.72);
    box-shadow:
      0 28px 80px rgba(0, 0, 0, 0.28),
      0 0 34px rgba(64, 158, 255, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(18px);
  }

  .summary-main {
    min-width: 0;
  }

  .summary-eyebrow {
    display: inline-flex;
    margin-bottom: 10px;
    color: #a8d2ff;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .summary-main h2 {
    margin: 0;
    color: #fff;
    font-size: clamp(1.7rem, 2.5vw, 2.6rem);
    line-height: 1.2;
    letter-spacing: 0.03em;
    text-shadow: 0 0 28px rgba(64, 158, 255, 0.22);
  }

  .summary-main p {
    max-width: 620px;
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.68);
    font-size: 16px;
    line-height: 1.7;
  }

  .next-level-tip {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
    padding: 10px 14px;
    border: 1px solid rgba(118, 183, 255, 0.2);
    border-radius: 999px;
    background: rgba(64, 158, 255, 0.1);
  }

  .next-level-tip span {
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(124, 92, 255, 0.18);
    color: #c9bbff;
    font-size: 15px;
    font-weight: 900;
  }

  .next-level-tip strong {
    color: rgba(255, 255, 255, 0.86);
    font-size: 16px;
    line-height: 1.4;
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .summary-stat {
    min-height: 112px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    background: rgba(7, 11, 18, 0.34);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .summary-stat span {
    display: block;
    margin-bottom: 12px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 15px;
    font-weight: 700;
  }

  .summary-stat strong {
    color: #fff;
    font-size: clamp(2rem, 3vw, 3rem);
    line-height: 1;
    text-shadow: 0 0 24px rgba(124, 92, 255, 0.28);
  }

  .summary-progress {
    grid-column: 1 / -1;
  }

  .progress-meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 10px;
    color: rgba(255, 255, 255, 0.74);
    font-size: 15px;
    font-weight: 700;
  }

  .progress-track {
    position: relative;
    height: 12px;
    overflow: hidden;
    border: 1px solid rgba(118, 183, 255, 0.16);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
  }

  .progress-fill {
    width: 0%;
    min-width: 10px;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(135deg, #409eff, #7c5cff);
    box-shadow: 0 0 20px rgba(64, 158, 255, 0.45);
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.el-tabs__item) {
    color: rgba(255, 255, 255, 0.66);
    font-size: 17px;
    font-weight: 700;
    transition: color 0.25s ease;
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

  .levels-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 22px;
    margin-top: 22px;
  }

  .achievement-section {
    margin-top: 22px;
    padding: 22px;
    border: 1px solid rgba(118, 183, 255, 0.16);
    border-radius: 22px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(124, 92, 255, 0.06)),
      rgba(12, 18, 27, 0.64);
    box-shadow:
      0 22px 60px rgba(0, 0, 0, 0.22),
      0 0 24px rgba(64, 158, 255, 0.1);
    backdrop-filter: blur(16px);
  }

  .achievement-title {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .achievement-title span {
    color: #fff;
    font-size: 24px;
    font-weight: 900;
  }

  .achievement-title p {
    margin: 0;
    color: rgba(255, 255, 255, 0.62);
    font-size: 15px;
    line-height: 1.6;
  }

  .achievement-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
  }

  .achievement-card {
    position: relative;
    min-height: 168px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    background: rgba(7, 11, 18, 0.3);
    opacity: 0.74;
  }

  .achievement-card.earned {
    opacity: 1;
    border-color: rgba(247, 201, 72, 0.34);
    background:
      linear-gradient(135deg, rgba(247, 201, 72, 0.1), rgba(64, 158, 255, 0.06)),
      rgba(7, 11, 18, 0.36);
    box-shadow: 0 0 22px rgba(247, 201, 72, 0.12);
  }

  .achievement-icon {
    display: inline-flex;
    margin-bottom: 12px;
    font-size: 30px;
    line-height: 1;
  }

  .achievement-card strong {
    display: block;
    color: #fff;
    font-size: 18px;
    line-height: 1.35;
  }

  .achievement-card p {
    margin: 8px 0 36px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 15px;
    line-height: 1.55;
  }

  .achievement-status {
    position: absolute;
    left: 18px;
    bottom: 16px;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(64, 158, 255, 0.12);
    color: #a8d2ff;
    font-size: 15px;
    font-weight: 900;
  }

  .achievement-card.earned .achievement-status {
    background: rgba(247, 201, 72, 0.14);
    color: #f7d76d;
  }

  .tasks-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    gap: 22px;
    margin-top: 22px;
  }

  .points-container {
    display: flex;
    flex-direction: column;
    gap: 22px;
    margin-top: 22px;
  }

  .points-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
  }

  .points-summary-card {
    min-height: 132px;
    padding: 22px;
    border: 1px solid rgba(118, 183, 255, 0.16);
    border-radius: 20px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.12), rgba(124, 92, 255, 0.07)),
      rgba(12, 18, 27, 0.7);
    box-shadow:
      0 22px 60px rgba(0, 0, 0, 0.22),
      0 0 24px rgba(64, 158, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(16px);
  }

  .points-summary-card span {
    display: block;
    margin-bottom: 16px;
    color: rgba(255, 255, 255, 0.66);
    font-size: 15px;
    font-weight: 800;
  }

  .points-summary-card strong {
    color: #fff;
    font-size: clamp(1.9rem, 3vw, 3rem);
    line-height: 1;
    text-shadow: 0 0 24px rgba(64, 158, 255, 0.22);
  }

  .points-summary-card strong.gold {
    color: #f7c948;
    text-shadow: 0 0 24px rgba(247, 201, 72, 0.24);
  }

  .points-system-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 22px;
  }

  .points-rules-card,
  .points-records-card {
    width: 100%;
    min-height: 0;
    height: auto;
    align-self: start;
  }

  :deep(.points-rules-card .el-card__body),
  :deep(.points-records-card .el-card__body) {
    height: auto;
  }

  .points-rules-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .points-rule-item,
  .points-record-item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    min-height: 72px;
    padding: 16px 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    text-align: left;
  }

  .point-rule-icon,
  .point-record-icon {
    width: 40px;
    height: 40px;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: rgba(64, 158, 255, 0.12);
    font-size: 20px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .points-rule-item > div {
    min-width: 0;
    flex: 1;
  }

  .points-rule-item {
    background: rgba(7, 11, 18, 0.32);
    color: rgba(255, 255, 255, 0.78);
    transition:
      transform 0.25s ease,
      border-color 0.25s ease,
      background 0.25s ease;
  }

  .points-rule-item:hover {
    transform: translateX(4px);
    border-color: rgba(118, 183, 255, 0.28);
    background: rgba(64, 158, 255, 0.1);
  }

  .points-rule-item > div > span {
    display: block;
    font-weight: 700;
    font-size: 16px;
  }

  .points-rule-item p {
    margin: 4px 0 0;
    color: rgba(255, 255, 255, 0.54);
    font-size: 15px;
    line-height: 1.55;
  }

  .points-rule-item strong {
    font-size: 17px;
    color: #f7c948;
    font-weight: 900;
    white-space: nowrap;
    text-shadow: 0 0 18px rgba(247, 201, 72, 0.22);
  }

  .points-growth-tip {
    margin-top: 14px;
    padding: 16px 18px;
    border: 1px solid rgba(118, 183, 255, 0.18);
    border-radius: 16px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.12), rgba(124, 92, 255, 0.08)),
      rgba(7, 11, 18, 0.22);
  }

  .points-growth-tip span {
    display: block;
    color: #fff;
    font-size: 17px;
    font-weight: 900;
  }

  .points-growth-tip p {
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.68);
    font-size: 15px;
    line-height: 1.6;
  }

  .points-empty-state {
    display: flex;
    min-height: 220px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28px;
    border: 1px dashed rgba(118, 183, 255, 0.24);
    border-radius: 18px;
    background: rgba(7, 11, 18, 0.22);
    text-align: center;
  }

  .points-empty-state span {
    color: #fff;
    font-size: 22px;
    font-weight: 900;
  }

  .points-empty-state p {
    max-width: 320px;
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.7;
  }

  .points-record-list {
    display: flex;
    width: 100%;
    max-height: 520px;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .points-record-list::-webkit-scrollbar {
    width: 5px;
  }

  .points-record-list::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(118, 183, 255, 0.32);
  }

  .points-record-item {
    background: rgba(255, 255, 255, 0.045);
  }

  .points-record-item > div {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
  }

  .points-record-item > div > span {
    color: #fff;
    font-size: 16px;
    font-weight: 800;
  }

  .points-record-item em {
    width: fit-content;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(124, 92, 255, 0.14);
    color: #c9bbff;
    font-size: 14px;
    font-style: normal;
    font-weight: 800;
  }

  .points-record-item p {
    margin: 0;
    color: rgba(255, 255, 255, 0.54);
    font-size: 14px;
    line-height: 1.45;
  }

  .points-record-item strong {
    color: #f7c948;
    font-size: 17px;
    font-weight: 950;
    white-space: nowrap;
    text-shadow: 0 0 18px rgba(247, 201, 72, 0.22);
  }

  .leaderboard-container {
    margin-top: 22px;
  }

  .rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 56px;
    min-height: 34px;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.74);
    font-weight: 900;
  }

  .rank-gold {
    border: 1px solid rgba(247, 201, 72, 0.44);
    background: rgba(247, 201, 72, 0.16);
    color: #f7c948;
    box-shadow: 0 0 18px rgba(247, 201, 72, 0.2);
  }

  .rank-silver {
    border: 1px solid rgba(210, 220, 235, 0.38);
    background: rgba(210, 220, 235, 0.14);
    color: #dbe7f5;
    box-shadow: 0 0 16px rgba(210, 220, 235, 0.12);
  }

  .rank-bronze {
    border: 1px solid rgba(205, 127, 50, 0.42);
    background: rgba(205, 127, 50, 0.14);
    color: #d99a5c;
    box-shadow: 0 0 16px rgba(205, 127, 50, 0.14);
  }

  .rank-icon {
    font-size: 18px;
    line-height: 1;
  }

  .leaderboard-user {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-weight: 800;
  }

  .me-badge {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 3px 9px;
    border: 1px solid rgba(64, 158, 255, 0.42);
    border-radius: 999px;
    background: rgba(64, 158, 255, 0.16);
    color: #a8d2ff;
    font-size: 14px;
    font-weight: 900;
    box-shadow: 0 0 16px rgba(64, 158, 255, 0.18);
  }

  .level-pill {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 5px 12px;
    border: 1px solid rgba(124, 92, 255, 0.34);
    border-radius: 999px;
    background: rgba(124, 92, 255, 0.14);
    color: #c9bbff;
    font-size: 15px;
    font-weight: 900;
    white-space: nowrap;
  }

  .leaderboard-points {
    color: #f7c948;
    font-size: 24px;
    font-weight: 950;
    text-shadow: 0 0 20px rgba(247, 201, 72, 0.28);
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

  .level-card,
  .task-card {
    transition:
      transform 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease,
      opacity 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(118, 183, 255, 0.42);
      box-shadow:
        0 26px 80px rgba(0, 0, 0, 0.32),
        0 0 28px rgba(64, 158, 255, 0.16);
    }

    &.locked,
    &.expired {
      opacity: 0.72;
    }

    &.completed {
      border-color: rgba(103, 194, 58, 0.46);
      box-shadow:
        0 24px 70px rgba(0, 0, 0, 0.28),
        0 0 24px rgba(103, 194, 58, 0.18);
    }
  }

  .gamified-task-card {
    position: relative;
    overflow: hidden;
    height: 100%;
  }

  .gamified-task-card::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.12), transparent 42%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .gamified-task-card:hover::before {
    opacity: 1;
  }

  :deep(.gamified-task-card .el-card__body) {
    height: calc(100% - 58px);
  }

  .gamified-task-card .task-content {
    display: flex;
    min-height: 172px;
    flex-direction: column;
    justify-content: space-between;
  }

  .level-header,
  .task-header,
  .points-header,
  .leaderboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }

  .task-header {
    align-items: flex-start;
  }

  .level-number {
    font-size: 17px;
    font-weight: bold;
    color: #76b7ff;
  }

  .level-name,
  .task-name {
    font-size: 21px;
    font-weight: bold;
    color: #fff;
    line-height: 1.35;
  }

  .gamified-task-card .task-name {
    min-width: 0;
    font-size: 20px;
    line-height: 1.35;
    overflow-wrap: break-word;
  }

  .level-description,
  .task-description {
    margin: 12px 0;
    color: rgba(255, 255, 255, 0.68);
    font-size: 16px;
    line-height: 1.65;
  }

  .level-requirements {
    margin: 12px 0;
    color: rgba(255, 255, 255, 0.72);
    font-size: 16px;
    line-height: 1.5;
  }

  .level-requirements p {
    margin: 6px 0;
  }

  .level-status,
  .task-status {
    margin-top: 12px;
  }

  .task-type {
    font-size: 15px;
    padding: 5px 12px;
    border: 1px solid rgba(103, 194, 58, 0.3);
    border-radius: 999px;
    background: rgba(103, 194, 58, 0.12);
    color: #9be47a;
  }

  .task-reward-tag {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 6px 13px;
    border: 1px solid rgba(247, 201, 72, 0.34);
    border-radius: 999px;
    background: rgba(247, 201, 72, 0.14);
    color: #f8d873;
    font-size: 16px;
    font-weight: 800;
    white-space: nowrap;
    box-shadow: 0 0 18px rgba(247, 201, 72, 0.12);
  }

  .points-reward,
  .total-points {
    font-weight: bold;
    color: #f7c948;
    text-shadow: 0 0 20px rgba(247, 201, 72, 0.22);
  }

  .complete-btn {
    width: 100%;
    margin-top: 12px;
  }

  .task-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 18px;
  }

  .task-status-pill {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 6px 14px;
    border: 1px solid rgba(247, 201, 72, 0.34);
    border-radius: 999px;
    background: rgba(247, 201, 72, 0.14);
    color: #f7d76d;
    font-size: 16px;
    font-weight: 800;
    white-space: nowrap;
  }

  .task-status-pill.completed {
    border-color: rgba(103, 194, 58, 0.34);
    background: rgba(103, 194, 58, 0.16);
    color: #9be47a;
  }

  .task-status-pill.doing {
    border-color: rgba(64, 158, 255, 0.34);
    background: rgba(64, 158, 255, 0.16);
    color: #a8d2ff;
  }

  .go-task-btn {
    min-width: 112px;
    min-height: 40px;
    font-size: 16px;
  }

  .total-points {
    margin: 20px 0;
    text-align: center;
    font-size: 48px;
  }

  .points-history-card {
    margin-top: 20px;
  }

  .status {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 15px;
    font-weight: 700;

    &.locked {
      border: 1px solid rgba(245, 108, 108, 0.34);
      background: rgba(245, 108, 108, 0.16);
      color: #ff9f9f;
    }

    &.unlocked {
      border: 1px solid rgba(64, 158, 255, 0.34);
      background: rgba(64, 158, 255, 0.16);
      color: #a8d2ff;
    }

    &.completed {
      border: 1px solid rgba(103, 194, 58, 0.34);
      background: rgba(103, 194, 58, 0.16);
      color: #9be47a;
    }

    &.pending {
      border: 1px solid rgba(247, 201, 72, 0.34);
      background: rgba(247, 201, 72, 0.16);
      color: #f7d76d;
    }

    &.expired {
      border: 1px solid rgba(144, 147, 153, 0.34);
      background: rgba(144, 147, 153, 0.16);
      color: #c7c9cf;
    }
  }

  :deep(.el-button--primary) {
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #409eff, #7c5cff);
    box-shadow: 0 12px 28px rgba(64, 158, 255, 0.26);
    font-size: 16px;
    font-weight: 700;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  :deep(.el-button--primary:hover),
  :deep(.el-button--primary:focus) {
    transform: translateY(-2px);
    box-shadow:
      0 12px 28px rgba(64, 158, 255, 0.3),
      0 0 18px rgba(64, 158, 255, 0.2);
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

  :deep(.gamified-leaderboard .el-table__row) {
    transition:
      transform 0.25s ease,
      background 0.25s ease,
      box-shadow 0.25s ease;
  }

  :deep(.gamified-leaderboard .el-table__row:hover td.el-table__cell) {
    background: rgba(64, 158, 255, 0.13);
  }

  :deep(.gamified-leaderboard .top-1-row td.el-table__cell) {
    background: linear-gradient(90deg, rgba(247, 201, 72, 0.14), rgba(247, 201, 72, 0.04));
    box-shadow: inset 0 0 22px rgba(247, 201, 72, 0.1);
  }

  :global(.theme-light) & {
    background: var(--theme-page-bg);
    color: var(--theme-text-primary);

    h1,
    .summary-main h2,
    .achievement-title span,
    .achievement-card strong,
    .level-header,
    .task-header,
    .points-header,
    .leaderboard-header,
    .level-name,
    .task-name,
    .leaderboard-user {
      color: var(--theme-text-primary);
      text-shadow: none;
    }

    .game-summary,
    .achievement-section,
    .achievement-card,
    .points-summary-card,
    :deep(.el-card) {
      border-color: var(--theme-border-color);
      background: var(--theme-panel-bg);
      box-shadow: var(--theme-shadow);
    }

    .summary-stat,
    .points-rule-item,
    .points-record-item,
    .points-growth-tip,
    .points-empty-state {
      border-color: var(--theme-border-color);
      background: var(--theme-card-bg);
      color: var(--theme-text-secondary);
    }

    .summary-main p,
    .achievement-title p,
    .achievement-card p,
    .summary-stat span,
    .progress-meta,
    .points-summary-card span,
    .level-description,
    .task-description,
    .level-requirements,
    .points-growth-tip p,
    .points-empty-state p,
    .points-record-item p {
      color: var(--theme-text-secondary);
    }

    .points-growth-tip span {
      color: var(--theme-text-primary);
    }

    .summary-eyebrow,
    .level-number {
      color: var(--theme-text-accent);
    }

    .next-level-tip,
    .achievement-status,
    .point-rule-icon,
    .point-record-icon,
    .points-record-item em {
      background: var(--theme-accent-soft);
      color: var(--theme-text-accent);
    }

    .summary-stat strong,
    .points-summary-card strong,
    .points-summary-card strong.gold,
    .points-rule-item strong,
    .points-record-item strong,
    .leaderboard-points,
    .points-reward,
    .total-points {
      color: var(--theme-warning-text);
      text-shadow: none;
    }

    :deep(.el-tabs__nav-wrap::after),
    :deep(.el-card__header) {
      border-color: var(--theme-border-color);
      background: var(--theme-card-bg);
    }

    :deep(.el-tabs__item) {
      color: var(--theme-text-secondary);
    }

    :deep(.el-tabs__item:hover),
    :deep(.el-tabs__item.is-active) {
      color: var(--theme-text-accent);
      text-shadow: none;
    }

    :deep(.el-table) {
      --el-table-bg-color: transparent;
      --el-table-tr-bg-color: var(--theme-table-row-bg);
      --el-table-header-bg-color: var(--theme-table-header-bg);
      --el-table-row-hover-bg-color: var(--theme-accent-soft);
      --el-table-border-color: var(--theme-border-color);
      --el-table-text-color: var(--theme-text-secondary);
      --el-table-header-text-color: var(--theme-text-primary);
      border-color: var(--theme-border-color);
      background: var(--theme-card-bg);
    }

    :deep(.el-table th.el-table__cell) {
      background: var(--theme-table-header-bg);
      color: var(--theme-text-primary);
    }

    :deep(.gamified-leaderboard .el-table__row:hover td.el-table__cell) {
      background: var(--theme-accent-soft);
    }

    .rank-silver {
      color: var(--theme-info-text);
    }
  }

  :deep(.gamified-leaderboard .top-2-row td.el-table__cell) {
    background: linear-gradient(90deg, rgba(210, 220, 235, 0.11), rgba(210, 220, 235, 0.035));
    box-shadow: inset 0 0 20px rgba(210, 220, 235, 0.08);
  }

  :deep(.gamified-leaderboard .top-3-row td.el-table__cell) {
    background: linear-gradient(90deg, rgba(205, 127, 50, 0.12), rgba(205, 127, 50, 0.035));
    box-shadow: inset 0 0 20px rgba(205, 127, 50, 0.08);
  }

  :deep(.gamified-leaderboard .current-user-row td.el-table__cell) {
    border-top: 1px solid rgba(64, 158, 255, 0.24);
    border-bottom: 1px solid rgba(64, 158, 255, 0.24);
    background: rgba(64, 158, 255, 0.12);
  }
}

@media screen and (max-width: 1100px) {
  .game-page {
    .tasks-container {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .achievement-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media screen and (max-width: 768px) {
  .game-page {
    padding: 24px 16px 48px;

    .game-summary {
      grid-template-columns: 1fr;
      padding: 20px;
    }

    .summary-stats {
      grid-template-columns: 1fr;
    }

    .summary-stat {
      min-height: auto;
    }

    .points-summary-grid,
    .points-system-grid,
    .achievement-grid {
      grid-template-columns: 1fr;
    }

    .levels-container,
    .tasks-container {
      grid-template-columns: 1fr;
    }

    .achievement-title {
      align-items: flex-start;
      flex-direction: column;
    }
  }
}
</style>
