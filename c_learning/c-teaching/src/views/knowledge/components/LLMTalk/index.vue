<template>
  <div class="right">
    <TalkHeader @clear-talk="handleClearTalk" />
    <div v-if="talkGroupArr.length !== 0" ref="scrollContainer" class="talk">
      <TalkGroup
        v-model:talk-group-arr="talkGroupArr"
        :dialog-visible="dialogVisible"
        @update:dialog-visible="handleShare"
        @send-question="handleSendQuestion"
      />
    </div>
    <div v-else class="talk-none">
      <TalkNoMsg />
    </div>
    <TalkInput @send-question="handleSendQuestion" />
  </div>
  <SelectMessage
    v-model:dialog-visible="dialogVisible"
    :share-index="shareIndex"
    :talk-group-arr="talkGroupArr"
  />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
// 引入组件
import TalkHeader from './TalkHeader.vue'
import TalkNoMsg from './TalkNoMsg.vue'
import TalkGroup from './TalkGroup.vue'
import TalkInput from './TalkInput.vue'
import SelectMessage from './SelectMessage.vue'
// 引入api
import { apiPostTalk } from '@/api/aiTalk.js'

const dialogVisible = ref(false)

const shareIndex = ref(-1)

const question = ref('')
const talkGroupArr = ref(JSON.parse(localStorage.getItem('talkGroupArr')) || [])

const handleSendQuestion = async selectedText => {
  talkGroupArr.value.push({
    question: selectedText,
    answer: '等待响应',
  })
  let buffQestion = selectedText
  question.value = ''
  talkGroupArr.value[talkGroupArr.value.length - 1].answer = ''
  try {
    await getChat(buffQestion)
    localStorage.setItem('talkGroupArr', JSON.stringify(talkGroupArr.value))
  } catch (error) {
    const message = getAIErrorMessage(error)
    const htmlStr = `<div class="error">糟糕出错了！请重试！<br>${message}</div>`
    talkGroupArr.value[talkGroupArr.value.length - 1].answer += htmlStr
  }
}

const getChat = async content => {
  const res = await apiPostTalk(content)
  const reply = res?.data?.reply
  if (!reply) {
    throw new Error(res?.message || 'AI没有返回内容')
  }
  const notice = res?.data?.notice
  talkGroupArr.value[talkGroupArr.value.length - 1].answer += notice
    ? `${notice}<br><br>${reply}`
    : reply
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

const handleClearTalk = () => {
  talkGroupArr.value = []
  localStorage.removeItem('talkGroupArr')
}

const handleShare = index => {
  dialogVisible.value = true
  shareIndex.value = index
}

const scrollContainer = ref(null)

watch(
  () => talkGroupArr.value[talkGroupArr.value.length - 1]?.answer,
  () => {
    if (talkGroupArr.value.length > 0 && scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  },
  { deep: true },
)

onMounted(() => {
  if (talkGroupArr.value.length > 0 && scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
})

defineExpose({ handleSendQuestion })
</script>

<style lang="scss" scoped>
.font-10 {
  // 恢复字体大小
  font-size: 10px;
}

/* 定义 slide-fade 动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(300px);
  opacity: 0;
}
@mixin talk-body {
  flex: 1;
  min-height: 0;
  padding: 20px $padding-xl $padding-xl;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 18px;
  overflow-y: auto;
}
.right {
  width: 100%;
  height: 520px;
  max-width: none;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  background-color: rgb(240, 244, 251);
  transition: all 0.5s ease;
  .talk {
    @include talk-body();
    // 滚动条颜色改变
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgb($primary-color, 0.1);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      background-color: rgb(240, 244, 251);
    }
  }
  .talk-none {
    @include talk-body();
    justify-content: flex-start;
    align-items: flex-start;
  }
}

// 移动端暂时先不显示
@media screen and (max-width: 768px) {
  .right {
    display: none;
  }
}
</style>
