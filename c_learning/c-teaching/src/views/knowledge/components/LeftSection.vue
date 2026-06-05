<template>
  <div ref="leftDom" class="left">
    <!-- ai总结 -->
    <div class="ai-summary">
      <div class="top">
        <h5>AI智能总结</h5>
        <span class="icon" @click="handleCopy(pointDetail.summary)"
          ><el-icon size="20"><CopyDocument /></el-icon>复制</span
        >
      </div>
      <div class="content">{{ pointDetail.summary }}</div>
      <!-- <div class="question">
        关联问题：
        <p
          v-for="item in relationQuestion"
          :key="item"
          href=""
          @click="handleSendQuestion(item)"
        >
          {{ item }}
        </p>
      </div>
      <div class="input">
        <el-input
          v-model="questionMessage"
          placeholder="基于该文章向ai提问"
        ></el-input>
        <el-button>发送</el-button>
      </div> -->
    </div>
    <!-- 教程内容 -->
    <el-tabs
      v-model="activeName"
      class="demo-tabs"
      @tab-click="handleClickTab"
    >
      <el-tab-pane label="图文" name="text"
        ><section
          v-if="pointDetail.course"
          ref="targetBox"
          v-parsemd="pointDetail.course"
          class="markdown-container"
        ></section>
        <el-empty v-else :image="empty" />
      </el-tab-pane>
    </el-tabs>

    <footer>
      <span
        >关联知识：<el-tag
          v-for="tag in pointDetail.relationName"
          :key="tag"
          style="margin-right: 5px"
          >{{ tag }}</el-tag
        ></span
      >
      <el-button type="primary" @click="handleTest">去测试</el-button>
    </footer>
    <el-button
      v-show="showSendButton"
      :style="{
        position: 'absolute',
        zIndex: '999',
        top: `${sendButtonPosition.y}px`,
        left: `${sendButtonPosition.x}px`,
      }"
      type="primary"
      @click="sendQuestion"
      >AI解释</el-button
    >
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/index'
// 引入hooks
import { useCopy } from '@/hooks/useCopy'
// 引入api
import { apiGetPointDetail } from '@/api/chapters'
import { useRoute, useRouter } from 'vue-router'
import empty from '@/assets/images/empty.png'

const { handleCopy } = useCopy()
// leftDom实例
const leftDom = ref()
// 获取路由参数
const route = useRoute()
const router = useRouter()
// 从路由参数中解析出章节id和知识点id
const { pointId, sectionId } = route.query
// 获取user仓库
const userStore = useUserStore()

// 定义知识点详情
const pointDetail = ref({
  course: '',
  context: '',
  summary: '',
  relationName: [],
})

// 获取知识点详情教程
const getPointDetail = async () => {
  const res = await apiGetPointDetail({
    pointId,
    sectionId,
    studentId: userStore.studentId,
  })
  pointDetail.value = res.data
}

// 去测试按钮回调
const handleTest = () => {
  router.push({ path: '/question', query: { pointId: pointId, sectionId } })
}

const activeName = ref('text')
const handleClickTab = tab => {
  activeName.value = tab.name
}

const targetBox = ref(null)

const showSendButton = ref(false)
const sendButtonPosition = ref({ x: 0, y: 0 })
const selectedText = ref('')

const handleSelectionChange = () => {
  const selection = window.getSelection()
  if (!selection.rangeCount) return

  const range = selection.getRangeAt(0)
  const container = range.commonAncestorContainer
  const boxElement = targetBox.value

  if (boxElement.contains(container) || boxElement === container) {
    const text = selection.toString()
    if (text) {
      const rect = range.getBoundingClientRect()
      sendButtonPosition.value = {
        x: rect.left + document.documentElement.scrollLeft,
        y: rect.top + document.documentElement.scrollTop - 130,
      }
      selectedText.value = text
      showSendButton.value = true
    } else {
      showSendButton.value = false
    }
  }
}

const emits = defineEmits(['send-question'])

const sendQuestion = () => {
  emits('send-question', `解释：${selectedText.value}`)
  showSendButton.value = false
  selectedText.value = ''
  window.getSelection().removeAllRanges()
}

const handleMouseEnter = () => {
  document.addEventListener('selectionchange', handleSelectionChange)
}

const handleMouseLeave = () => {
  document.removeEventListener('selectionchange', handleSelectionChange)
}

const handleAIExplain = code => {
  emits('send-question', '请解释以下代码' + code)
}

const handleAddCodeBlock = (targetBox, aiExplainFunc) => {
  if (!targetBox) return

  const codeBlocks = targetBox.querySelectorAll('pre code')

  codeBlocks.forEach(codeBlock => {
    let language = codeBlock.classList[1].split('-')[1]
    const preElement = codeBlock.parentElement
    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('code-actions')

    const copyButton = document.createElement('button')
    copyButton.classList.add('copy-button')
    copyButton.textContent = '复制代码'
    copyButton.addEventListener('click', () => {
      handleCopy(codeBlock.textContent)
    })

    const aiExplainButton = document.createElement('button')
    aiExplainButton.classList.add('explain-button')
    aiExplainButton.textContent = '代码解读'
    aiExplainButton.addEventListener('click', () => {
      aiExplainFunc(codeBlock.textContent)
    })

    const languageSpan = document.createElement('span')
    languageSpan.textContent = language
    languageSpan.classList.add('language')

    buttonContainer.appendChild(languageSpan)
    buttonContainer.appendChild(copyButton)
    buttonContainer.appendChild(aiExplainButton)
    preElement.insertBefore(buttonContainer, preElement.firstChild)
  })
}

const updateSectionHeight = section => {
  const body = section.querySelector('.learning-section-body')
  if (!body) return
  body.style.maxHeight = section.classList.contains('is-open')
    ? `${body.scrollHeight}px`
    : '0px'
}

const createLearningSection = ({ heading, nodes, isOpen }) => {
  const section = document.createElement('article')
  section.className = `learning-section${isOpen ? ' is-open' : ''}`

  const header = document.createElement('button')
  header.type = 'button'
  header.className = 'learning-section-header'

  const title = document.createElement('span')
  title.className = 'learning-section-title'
  title.textContent = heading?.textContent?.trim() || '学习内容'

  const icon = document.createElement('span')
  icon.className = 'learning-section-icon'
  icon.textContent = '⌄'

  const body = document.createElement('div')
  body.className = 'learning-section-body'

  nodes.forEach(node => body.appendChild(node))
  header.appendChild(title)
  header.appendChild(icon)
  section.appendChild(header)
  section.appendChild(body)

  header.addEventListener('click', () => {
    section.classList.toggle('is-open')
    updateSectionHeight(section)
  })

  return section
}

const handleBuildCollapsibleSections = targetBox => {
  if (!targetBox || targetBox.dataset.collapsibleReady === 'true') return

  const sourceNodes = Array.from(targetBox.childNodes).filter(node => {
    return node.nodeType !== Node.TEXT_NODE || node.textContent.trim()
  })

  if (!sourceNodes.length) return

  const headingTags = ['H1', 'H2', 'H3']
  const groups = []
  let currentGroup = null

  sourceNodes.forEach(node => {
    const isHeading =
      node.nodeType === Node.ELEMENT_NODE && headingTags.includes(node.tagName)

    if (isHeading) {
      currentGroup = { heading: node, nodes: [node] }
      groups.push(currentGroup)
      return
    }

    if (!currentGroup) {
      currentGroup = { heading: null, nodes: [] }
      groups.push(currentGroup)
    }
    currentGroup.nodes.push(node)
  })

  targetBox.innerHTML = ''
  targetBox.classList.add('is-collapsible')

  groups.forEach((group, index) => {
    targetBox.appendChild(
      createLearningSection({
        heading: group.heading,
        nodes: group.nodes,
        isOpen: false,
      })
    )
  })

  targetBox.dataset.collapsibleReady = 'true'
  requestAnimationFrame(() => {
    targetBox
      .querySelectorAll('.learning-section')
      .forEach(section => updateSectionHeight(section))
  })
}

onMounted(async () => {
  await getPointDetail()
  await nextTick()

  if (targetBox.value) {
    handleAddCodeBlock(targetBox.value, handleAIExplain)
    handleBuildCollapsibleSections(targetBox.value)
    targetBox.value.addEventListener('mouseenter', handleMouseEnter)
    targetBox.value.addEventListener('mouseleave', handleMouseLeave)
  }
})

onUnmounted(() => {
  if (targetBox.value) {
    targetBox.value.removeEventListener('mouseenter', handleMouseEnter)
    targetBox.value.removeEventListener('mouseleave', handleMouseLeave)
  }
  document.removeEventListener('selectionchange', handleSelectionChange)
})
</script>

<style lang="scss" scoped>
.left {
  width: 100%;
  max-width: none;
  min-width: 0;
  max-height: none;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  scrollbar-color: transparent transparent;
  scrollbar-width: thin;
  overflow: visible;
  transition: all 0.5s ease;
  .ai-summary {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.12), rgba(124, 92, 255, 0.07)),
      rgba(12, 18, 27, 0.72);
    box-shadow:
      0 24px 70px rgba(0, 0, 0, 0.26),
      0 0 24px rgba(64, 158, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    color: #fff;
    backdrop-filter: blur(16px);
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      h5 {
        color: #fff;
        font-size: 1.35rem;
        font-family: DingTalk;
        text-shadow: 0 0 18px rgba(64, 158, 255, 0.22);
      }
      .icon {
        display: flex;
        font-size: $font-size-xl;
        align-items: center;
        gap: $margin-s;
        cursor: pointer;
        color: #a8d2ff;
        transition: all 0.3s ease;
        &:hover {
          color: #fff;
        }
      }
    }
    .content {
      flex: 1;
      max-height: 132px;
      padding: 12px;
      color: rgba(255, 255, 255, 0.78);
      font-size: $font-size-l;
      line-height: 1.5;
      border: 1px solid rgba(118, 183, 255, 0.14);
      border-radius: 16px;
      background: rgba(7, 11, 18, 0.34);
      white-space: pre-wrap;
      overflow-y: auto;
    }
    .question {
      display: flex;
      margin: $margin-l 0;
      font-size: $font-size-l;
      color: $text-color;
      p {
        color: $primary-color;
        margin-right: $margin-s;
        cursor: pointer;
      }
    }
    .input {
      display: flex;
    }
  }
  .play-video {
    width: 100%;
    height: 450px;
    border-radius: 0 0 18px 18px;
    background: rgba(7, 11, 18, 0.34);
    padding: 0 $padding-xl;
    video {
      width: 100%;
      border-radius: 16px;
    }
  }
  .demo-tabs > .el-tabs__content {
    color: rgba(255, 255, 255, 0.78);
    font-size: 32px;
    font-weight: 600;
  }
  .demo-tabs {
    width: 100%;
    margin: 8px 0 6px;
    overflow: visible;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    background: rgba(12, 18, 27, 0.72);
    box-shadow:
      0 24px 70px rgba(0, 0, 0, 0.26),
      0 0 24px rgba(64, 158, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(16px);
    .el-tabs__nav-scroll {
      padding-left: 20px;
    }
  }

  :deep(.el-tabs__header) {
    margin: 0;
    background: rgba(7, 11, 18, 0.46);
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.el-tabs__item) {
    color: rgba(255, 255, 255, 0.66);
    font-weight: 800;
  }

  :deep(.el-tabs__item:hover),
  :deep(.el-tabs__item.is-active) {
    color: #76b7ff;
    text-shadow: 0 0 16px rgba(64, 158, 255, 0.32);
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(135deg, #409eff, #7c5cff);
    box-shadow: 0 0 18px rgba(64, 158, 255, 0.45);
  }

  :deep(.el-tabs__content) {
    padding: 12px;
    overflow: visible;
    background: rgba(7, 11, 18, 0.2);
  }

  :deep(.el-tab-pane) {
    background: transparent;
  }

  :deep(.markdown-container),
  :deep(.markdown-container *) {
    background-color: transparent;
  }

  :deep(.markdown-container) {
    display: block;
    min-height: 0;
    padding: 0;
    overflow: visible;
    word-break: break-word;
    color: rgba(255, 255, 255, 0.84);
  }

  :deep(.markdown-container) {
    font-size: 16px;
    line-height: 1.8;
  }

  :deep(.markdown-container.is-collapsible) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  :deep(.learning-section) {
    overflow: hidden;
    border: 1px solid rgba(118, 183, 255, 0.16);
    border-radius: 14px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(124, 92, 255, 0.06)),
      rgba(7, 11, 18, 0.5);
    box-shadow:
      0 18px 46px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  :deep(.learning-section-header) {
    width: 100%;
    border: 0;
    padding: 9px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    background: rgba(255, 255, 255, 0.04);
    color: #fff;
    cursor: pointer;
    text-align: left;
  }

  :deep(.learning-section-header:hover) {
    background: rgba(64, 158, 255, 0.1);
  }

  :deep(.learning-section-title) {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0;
    line-height: 1.35;
    text-shadow: 0 0 18px rgba(64, 158, 255, 0.24);
  }

  :deep(.learning-section-icon) {
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(64, 158, 255, 0.14);
    color: #a8d2ff;
    font-size: 18px;
    line-height: 1;
    transition: transform 0.3s ease;
  }

  :deep(.learning-section.is-open .learning-section-icon) {
    transform: rotate(180deg);
  }

  :deep(.learning-section-body) {
    max-height: 0;
    overflow: hidden;
    padding: 0 14px;
    color: rgba(255, 255, 255, 0.82);
    transition:
      max-height 0.36s ease,
      padding 0.36s ease;
  }

  :deep(.learning-section.is-open .learning-section-body) {
    padding: 2px 14px 14px;
  }

  :deep(.learning-section-body > h1:first-child),
  :deep(.learning-section-body > h2:first-child),
  :deep(.learning-section-body > h3:first-child) {
    margin-top: 8px;
    font-size: 16px;
    color: rgba(168, 210, 255, 0.82);
  }

  :deep(.markdown-container h1),
  :deep(.markdown-container h2),
  :deep(.markdown-container h3),
  :deep(.markdown-container h4),
  :deep(.markdown-container h5),
  :deep(.markdown-container h6) {
    color: #fff;
    margin: 18px 0 12px;
    line-height: 1.35;
    text-shadow: 0 0 18px rgba(64, 158, 255, 0.18);
  }

  :deep(.markdown-container h1) {
    font-size: 30px;
  }

  :deep(.markdown-container h2) {
    font-size: 24px;
  }

  :deep(.markdown-container h3) {
    font-size: 20px;
  }

  :deep(.markdown-container p),
  :deep(.markdown-container li) {
    margin: 10px 0;
    color: rgba(255, 255, 255, 0.82);
    font-weight: 500;
  }

  :deep(.markdown-container a) {
    color: #76b7ff;
  }

  :deep(.markdown-container code) {
    border-radius: 6px;
    background: rgba(7, 11, 18, 0.72);
    color: #f7c948;
    padding: 2px 6px;
  }

  :deep(.markdown-container pre) {
    overflow: visible;
    margin: 18px 0 22px;
    border: 1px solid rgba(118, 183, 255, 0.14);
    border-radius: 16px;
    background: #07111f !important;
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
  }

  :deep(.markdown-container pre code) {
    display: block;
    overflow-x: auto;
    background: transparent !important;
    color: #dce8ff;
    padding: 18px;
  }

  :deep(.code-actions) {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
  }

  :deep(.language) {
    margin-right: auto;
    color: rgba(255, 255, 255, 0.54);
    font-size: 13px;
    font-weight: 800;
  }

  :deep(.copy-button),
  :deep(.explain-button) {
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #409eff, #7c5cff);
    color: #fff;
    padding: 6px 12px;
    cursor: pointer;
    font-weight: 800;
  }

  footer {
    width: 100%;
    min-height: 64px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: rgba(12, 18, 27, 0.72);
    box-shadow:
      0 22px 60px rgba(0, 0, 0, 0.22),
      0 0 24px rgba(64, 158, 255, 0.1);
    padding: 10px 16px;
    margin-top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    span {
      color: rgba(255, 255, 255, 0.78);
      font-size: $font-size-m;
    }
  }

  :deep(.el-button--primary) {
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #409eff, #7c5cff);
    box-shadow: 0 12px 28px rgba(64, 158, 255, 0.26);
    font-weight: 800;
  }

  :deep(.el-tag) {
    border-color: rgba(64, 158, 255, 0.28);
    background: rgba(64, 158, 255, 0.14);
    color: #a8d2ff;
  }
}

@media (max-width: 768px) {
  .left {
    max-width: 100%;
    min-width: 0;
    min-height: 0;
    max-height: none;
  }

  .play-video {
    height: auto;
  }

  .video {
    height: auto;
  }
}

@media (min-width: 769px) and (max-width: 1180px) {
  .left {
    min-width: 460px;
  }
}
</style>
