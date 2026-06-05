<template>
  <div class="knowledge-page">
    <HeaderCm></HeaderCm>
    <div class="content-box">
      <LeftStudy v-if="!isMobile"></LeftStudy>
      <LeftSection @send-question="callChildMethod"></LeftSection>
      <div class="aiTalk">
        <LLMTalk ref="llmTalkRef"></LLMTalk>
      </div>
      <el-backtop :right="50" :bottom="100" />
    </div>
  </div>
</template>

<script setup>
import HeaderCm from '../../components/HeaderCm.vue'
import LeftStudy from '@/views/knowledge/components/LeftStudy.vue'
import LLMTalk from '@/views/knowledge/components/LLMTalk/index.vue'
import LeftSection from '@/views/knowledge/components/LeftSection'
import { ref, computed } from 'vue'
// 创建一个 ref 来引用子组件实例
const llmTalkRef = ref(null)
// 定义一个方法来调用子组件的暴露方法
const callChildMethod = selectText => {
  if (llmTalkRef.value) {
    llmTalkRef.value.handleSendQuestion(selectText)
  }
}
// 检测是否为移动端
const isMobile = computed(() => window.innerWidth <= 768)
</script>

<style scoped lang="scss">
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

@font-face {
  font-family: 'DingTalk'; // 自定义字体名称
  src: url('@/assets/fonts/DingTalk-JinBuTi.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.content-box {
  position: relative;
  width: 94vw;
  max-width: 1680px;
  // 高度根据子盒子自适应
  min-height: 0;
  height: auto;
  display: grid;
  grid-template-columns: minmax(220px, 22%) minmax(620px, 56%) minmax(260px, 22%);
  align-items: start;
  justify-items: stretch;
  justify-content: center;
  gap: 14px;
  padding: 0 0 22px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 14px;
  margin-bottom: 42px;

  > * {
    align-self: start;
  }

  .aiTalk {
    width: 100%;
    min-width: 0;
    max-width: none;
    align-self: start;
  }
  .ai-help {
    position: fixed;
    top: 110px;
    right: 50px;
    background-color: $primary-color;
    color: #fff;
    font-size: 2 * $font-size-xl;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    &::after {
      content: 'Ai助手';
      position: absolute;
      top: 110%;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      opacity: 0;
      visibility: hidden;
      /* 确保文字横向显示 */
      writing-mode: horizontal-tb;
      white-space: nowrap; /* 防止文字换行 */
      transition:
        opacity 0.3s,
        visibility 0.3s;
    }

    &:hover::after {
      opacity: 1;
      visibility: visible;
    }
  }
}

.knowledge-page {
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 18% 0%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 82% 18%, rgba(124, 92, 255, 0.16), transparent 28%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;
}

.knowledge-page :deep(.header) {
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

.knowledge-page :deep(.logo) {
  color: #fff;
  text-shadow: 0 0 18px rgba(64, 158, 255, 0.42);
}

.knowledge-page :deep(nav li),
.knowledge-page :deep(.user span) {
  color: rgba(255, 255, 255, 0.78);
}

.knowledge-page :deep(nav li:hover),
.knowledge-page :deep(nav li.active) {
  color: #76b7ff;
}

.knowledge-page :deep(.right) {
  position: sticky;
  top: 104px;
  width: 100%;
  max-width: none;
  min-height: 0;
  height: 520px;
  align-self: start;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  background: rgba(12, 18, 27, 0.68);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.28),
    0 0 24px rgba(64, 158, 255, 0.1);
  color: #fff;
  backdrop-filter: blur(16px);
}

.knowledge-page :deep(.right-top),
.knowledge-page :deep(.right-bottom) {
  flex: 0 0 auto;
  background: rgba(7, 11, 18, 0.64);
  border-radius: 0;
}

.knowledge-page :deep(.talk),
.knowledge-page :deep(.talk-none) {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  align-items: stretch;
  justify-content: flex-start;
  background: transparent;
}

.knowledge-page :deep(.talk) {
  padding: 20px 16px 16px;
  gap: 18px;
}

.knowledge-page :deep(.talk-none) {
  justify-content: flex-start;
  align-items: flex-start;
  padding: 20px 18px 18px;
}

.knowledge-page :deep(.talk-none .title) {
  align-items: flex-start;
  text-align: left;
}

.knowledge-page :deep(.right-bottom) {
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -14px 28px rgba(0, 0, 0, 0.16);
}

.knowledge-page :deep(.message-left) {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.84) !important;
}

.knowledge-page :deep(.message-right) {
  background: linear-gradient(135deg, #409eff, #7c5cff) !important;
  box-shadow: 0 12px 24px rgba(64, 158, 255, 0.18);
}

.knowledge-page :deep(.right-bottom .el-input__wrapper) {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.knowledge-page :deep(.right-bottom .el-input__inner) {
  color: #fff;
}

/* Theme-consistent finish pass for knowledge detail nested surfaces. */
.knowledge-page {
  background: var(--theme-page-bg);
  color: var(--theme-text-primary);
}

.knowledge-page :deep(.header) {
  border-color: var(--theme-border-color) !important;
  background: var(--theme-panel-bg-strong) !important;
  box-shadow:
    var(--theme-shadow),
    var(--theme-glow);
}

.knowledge-page :deep(.logo) {
  color: var(--theme-text-primary);
  text-shadow: var(--theme-glow);
}

.knowledge-page :deep(nav li),
.knowledge-page :deep(.user span) {
  color: var(--theme-text-secondary);
}

.knowledge-page :deep(nav li:hover),
.knowledge-page :deep(nav li.active) {
  color: var(--theme-text-accent);
}

.knowledge-page :deep(.left-study),
.knowledge-page :deep(.left),
.knowledge-page :deep(.right) {
  color: var(--theme-text-primary);
}

.knowledge-page :deep(.study-time),
.knowledge-page :deep(.study-recommend),
.knowledge-page :deep(.ai-summary),
.knowledge-page :deep(.demo-tabs),
.knowledge-page :deep(footer),
.knowledge-page :deep(.right) {
  border-color: var(--theme-border-color);
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(124, 92, 255, 0.05)),
    var(--theme-panel-bg);
  box-shadow:
    var(--theme-shadow),
    var(--theme-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.knowledge-page :deep(.time-header),
.knowledge-page :deep(.recommend-header),
.knowledge-page :deep(.ai-summary h5),
.knowledge-page :deep(.learning-section-title) {
  color: var(--theme-text-primary);
  text-shadow: none;
}

.knowledge-page :deep(.time),
.knowledge-page :deep(.language) {
  color: var(--theme-warning-text);
  text-shadow: none;
}

.knowledge-page :deep(.study-recommend a),
.knowledge-page :deep(footer span),
.knowledge-page :deep(.ai-summary .content),
.knowledge-page :deep(.markdown-container p),
.knowledge-page :deep(.markdown-container li),
.knowledge-page :deep(.learning-section-body) {
  color: var(--theme-text-secondary);
}

.knowledge-page :deep(.study-recommend a) {
  border-radius: 10px;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.knowledge-page :deep(.study-recommend a:hover) {
  background: var(--theme-accent-soft);
  color: var(--theme-text-accent);
}

.knowledge-page :deep(.ai-summary .content),
.knowledge-page :deep(.right-top),
.knowledge-page :deep(.right-bottom),
.knowledge-page :deep(.talk-none),
.knowledge-page :deep(.message-left) {
  border-color: var(--theme-border-color);
  background: var(--theme-card-bg) !important;
}

.knowledge-page :deep(.demo-tabs > .el-tabs__content),
.knowledge-page :deep(.el-tabs__content) {
  background: var(--theme-card-bg);
  color: var(--theme-text-secondary);
}

.knowledge-page :deep(.el-tabs__header) {
  background: var(--theme-panel-bg-strong);
}

.knowledge-page :deep(.el-tabs__nav-wrap::after) {
  background-color: var(--theme-border-color);
}

.knowledge-page :deep(.el-tabs__item) {
  color: var(--theme-text-secondary);
}

.knowledge-page :deep(.el-tabs__item:hover),
.knowledge-page :deep(.el-tabs__item.is-active) {
  color: var(--theme-text-accent);
  text-shadow: none;
}

.knowledge-page :deep(.learning-section) {
  border-color: var(--theme-border-color);
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(124, 92, 255, 0.05)),
    var(--theme-card-bg);
  box-shadow:
    0 14px 34px rgba(30, 64, 112, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.knowledge-page :deep(.learning-section-header) {
  background: rgba(64, 158, 255, 0.06);
  color: var(--theme-text-primary);
}

.knowledge-page :deep(.learning-section-header:hover) {
  background: var(--theme-accent-soft);
}

.knowledge-page :deep(.learning-section-icon) {
  background: var(--theme-accent-soft);
  color: var(--theme-text-accent);
}

.knowledge-page :deep(.learning-section-body > h1:first-child),
.knowledge-page :deep(.learning-section-body > h2:first-child),
.knowledge-page :deep(.learning-section-body > h3:first-child),
.knowledge-page :deep(.markdown-container h1),
.knowledge-page :deep(.markdown-container h2),
.knowledge-page :deep(.markdown-container h3),
.knowledge-page :deep(.markdown-container h4),
.knowledge-page :deep(.markdown-container h5),
.knowledge-page :deep(.markdown-container h6) {
  color: var(--theme-text-primary);
  text-shadow: none;
}

.knowledge-page :deep(.markdown-container a) {
  color: var(--theme-text-accent);
}

.knowledge-page :deep(.markdown-container code) {
  background: rgba(64, 158, 255, 0.12);
  color: var(--theme-category-js-text);
}

.knowledge-page :deep(.markdown-container pre) {
  border-color: var(--theme-border-color);
  background: rgba(7, 17, 31, 0.96) !important;
  box-shadow: 0 18px 42px rgba(7, 17, 31, 0.2);
}

.knowledge-page :deep(.markdown-container pre code) {
  background: transparent !important;
  color: #dce8ff;
}

.knowledge-page :deep(.code-actions) {
  border-bottom-color: rgba(255, 255, 255, 0.1);
  background: rgba(7, 17, 31, 0.72);
}

.knowledge-page :deep(.copy-button),
.knowledge-page :deep(.explain-button),
.knowledge-page :deep(.message-right),
.knowledge-page :deep(.el-button--primary) {
  background: var(--theme-button-bg) !important;
  color: var(--theme-button-text) !important;
}

.knowledge-page :deep(.el-tag) {
  border-color: var(--theme-border-strong);
  background: var(--theme-accent-soft);
  color: var(--theme-text-accent);
}

.knowledge-page :deep(.right) {
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.07), rgba(124, 92, 255, 0.04)),
    var(--theme-panel-bg);
}

.knowledge-page :deep(.talk),
.knowledge-page :deep(.talk-none) {
  background: transparent;
}

.knowledge-page :deep(.message-left) {
  color: var(--theme-text-secondary) !important;
}

.knowledge-page :deep(.message-left *),
.knowledge-page :deep(.talk-none .title),
.knowledge-page :deep(.talk-none .title *) {
  color: inherit !important;
}

.knowledge-page :deep(.right-bottom) {
  border-top-color: var(--theme-border-color);
  box-shadow: 0 -14px 28px rgba(30, 64, 112, 0.12);
}

.knowledge-page :deep(.right-bottom .el-input__wrapper) {
  border-color: var(--theme-border-color);
  background: var(--theme-input-bg);
}

.knowledge-page :deep(.right-bottom .el-input__inner) {
  color: var(--theme-text-primary);
}

:global(.theme-light) .knowledge-page {
  :deep(.code-actions) {
    border-bottom-color: var(--theme-border-color);
    background: var(--theme-code-header-bg);
    color: var(--theme-code-text);
  }

  :deep(.language) {
    color: rgba(229, 237, 248, 0.82);
  }

  :deep(.markdown-container pre) {
    border-color: var(--theme-border-color);
    background: var(--theme-code-bg) !important;
  }

  :deep(.markdown-container pre code) {
    color: var(--theme-code-text);
  }

  :deep(.markdown-container code:not(pre code)) {
    background: rgba(64, 158, 255, 0.1);
    color: var(--theme-warning-text);
  }

  :deep(.copy-button),
  :deep(.explain-button) {
    box-shadow: 0 10px 22px rgba(64, 158, 255, 0.18);
  }

  :deep(.right-bottom .el-input__inner::placeholder) {
    color: var(--theme-placeholder-color);
  }
}

@media (max-width: 1180px) {
  .content-box {
    width: calc(100vw - 24px);
    grid-template-columns: minmax(190px, 22%) minmax(460px, 56%) minmax(230px, 22%);
    gap: 12px;
    padding: 0 0 24px;

    .aiTalk {
      min-width: 0;
    }
  }

  .knowledge-page :deep(.right) {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .content-box {
    display: flex;
    flex-direction: column;
    width: calc(100vw - 24px);
    padding: 0 $padding-s;
    margin-top: $margin-l;
  }

  .aiTalk {
    width: 100%;
    min-width: 0;
  }

  .knowledge-page :deep(.right) {
    position: static;
    height: 70vh;
  }

  .ai-help {
    right: 20px;
    font-size: 1.5 * $font-size-xl;
  }
}
</style>
