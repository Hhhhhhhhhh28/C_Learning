<template>
  <div class="left-study">
    <!-- 学习时长 -->
    <div class="study-time">
      <span class="time-header">学习时长</span>
      <span class="time">{{ formattedStudyTime }}</span>
    </div>
    <!-- 推荐学习 -->
    <div class="study-recommend">
      <span class="recommend-header">推荐学习</span>
      <ul>
        <a href="https://juejin.cn/post/6892199770106888199?searchId=202503231848084FC53F1486D15F276CEA"
          target="_blank">前端语言重点——指针篇（一文让你完全搞懂指针）</a>
        <a href="https://juejin.cn/post/7317844669228695587?searchId=202503231858287EB9E6C0F622602EC3F6"
          target="_blank">深入解析 前端语言中的 for 循环、break 和 continue</a>
        <a href="https://juejin.cn/post/7239715208791736376?searchId=20250323190133350B50620458903FA56A"
          target="_blank">前端语言编程-结构体</a>
        <a href="https://juejin.cn/post/7033711811006464030?searchId=202503231903006C5AAC599A4B8E37E9EB"
          target="_blank">漫谈前端语言内存管理</a>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useUserStore } from '@/stores/index'
const userStore = useUserStore()
// 定义在线学习时间
const studyTime = ref(0)
let timer = null

// 格式化时间函数
const formatTime = seconds => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

// 计算属性，返回格式化后的时间
const formattedStudyTime = computed(() => formatTime(studyTime.value))
// 在组件挂载后启动计时器
onMounted(() => {
  timer = setInterval(() => {
    studyTime.value++
  }, 1000)
})

// 在组件卸载前清除计时器
onUnmounted(() => {
  const studyTimeValue = parseInt(studyTime.value) // 确保 studyTime 是数字类型
  userStore.changeTotalTime(studyTimeValue)
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.left-study {
  width: 100%;
  min-width: 0;
  max-width: none;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  align-self: flex-start;
  gap: 14px;
}

.study-time {
  width: 100%;
  min-height: 92px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.12), rgba(124, 92, 255, 0.07)),
    rgba(12, 18, 27, 0.7);
  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.22),
    0 0 24px rgba(64, 158, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(16px);

  .time-header {
    color: #a8d2ff;
    font-size: 20px;
    font-weight: bold;
  }

  .time {
    color: #f7c948;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 0 0 20px rgba(247, 201, 72, 0.2);
  }
}

.study-recommend {
  width: 100%;
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(12, 18, 27, 0.7);
  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.22),
    0 0 24px rgba(64, 158, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  padding: 16px;
  backdrop-filter: blur(16px);

  .recommend-header {
    color: #fff;
    font-size: $font-size-m * 2;
    font-weight: bold;
    margin: 10px;
    text-shadow: 0 0 18px rgba(64, 158, 255, 0.22);
  }

  ul {
    width: 100%;
    margin-top: 12px;

    a {
      padding: 9px 8px;
      // border-bottom: 1px solid #ccc;
      color: rgba(255, 255, 255, 0.72);
      text-decoration: none;
      font-size: $font-size-m;
      // 单行文本溢出省略号
      white-space: nowrap; // 禁止文本换行
      overflow: hidden; // 隐藏溢出的内容
      text-overflow: ellipsis; // 用省略号表示溢出的文本
      display: block; // 使 a 标签以块级元素显示，确保样式生效

      &:hover {
        color: #76b7ff;
      }
    }
  }
}

@media (max-width: 768px) {
  .left-study {
    width: 100%;
    max-width: none;
    min-width: 0;
    min-height: 0;
  }

  .study-recommend ul a {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
}

@media (min-width: 769px) and (max-width: 1180px) {
  .left-study {
    min-width: 210px;
  }
}
</style>
