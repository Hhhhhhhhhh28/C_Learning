<template>
  <div class="compiler-page">
    <HeaderCm />
    <div class="compiler-container">
    <div class="editor-section">
      <div class="tab-bar">
        <button :class="{ active: activeTab === 'html' }" @click="activeTab = 'html'">
          HTML
        </button>
        <button :class="{ active: activeTab === 'css' }" @click="activeTab = 'css'">
          CSS
        </button>
        <button :class="{ active: activeTab === 'javascript' }" @click="activeTab = 'javascript'">
          JavaScript
        </button>
      </div>
      <div class="code-editor">
        <textarea v-model="code[activeTab]" :placeholder="`在此输入 ${activeTab} 代码...`"
          @keydown.tab="handleTab"></textarea>
      </div>
      <div class="actions">
        <el-button type="primary" :loading="isRunning" @click="runCode">
          <el-icon>
            <VideoPlay />
          </el-icon>
          运行代码
        </el-button>
        <el-button type="success" :loading="isEvaluating" @click="evaluateCode">
          <el-icon>
            <Check />
          </el-icon>
          评测代码
        </el-button>
        <el-button @click="clearCode">
          <el-icon>
            <Delete />
          </el-icon>
          清空
        </el-button>
      </div>
    </div>
    <div class="preview-section">
      <div class="preview-header">
        <span>执行结果</span>
        <el-button size="small" text @click="refreshPreview">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
      <div class="result-content">
        <div v-if="evaluationResult" class="evaluation-result">
          <h3>评测结果</h3>
          <div class="result-status" :class="{ success: evaluationResult.success, error: !evaluationResult.success }">
            {{ evaluationResult.message }}
          </div>
          <div v-if="evaluationResult.details" class="result-details">
            <div class="detail-item">
              <span class="label">语法检查:</span>
              <span :class="{ success: evaluationResult.details.syntax === '通过', error: evaluationResult.details.syntax === '错误' }">
                {{ evaluationResult.details.syntax }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">功能测试:</span>
              <span :class="{ success: evaluationResult.details.functional === '通过', error: evaluationResult.details.functional === '错误' }">
                {{ evaluationResult.details.functional }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">性能评估:</span>
              <span>{{ evaluationResult.details.performance }}</span>
            </div>
            <div class="detail-item" v-if="evaluationResult.details.output">
              <span class="label">程序输出:</span>
              <pre class="output">{{ evaluationResult.details.output }}</pre>
            </div>
            <div v-if="evaluationResult.details.errors && evaluationResult.details.errors.length > 0" class="errors">
              <h4>错误信息:</h4>
              <ul>
                <li v-for="(error, index) in evaluationResult.details.errors" :key="index">
                  <span v-if="error.line" class="error-line">第 {{ error.line }} 行: </span>
                  {{ error.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div v-else class="preview-content">
          <iframe :srcdoc="previewHtml" class="preview-frame" sandbox="allow-scripts"></iframe>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, Delete, Refresh, Check } from '@element-plus/icons-vue'
import HeaderCm from '@/components/HeaderCm.vue'
import request from '@/utils/request'

const activeTab = ref('html')
const isRunning = ref(false)
const isEvaluating = ref(false)
const evaluationResult = ref(null)

const code = ref({
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>前端语言示例</title>
</head>
<body>
  <h1>欢迎使用前端语言在线编译器</h1>
  <p>在左侧编辑代码，点击"运行代码"查看效果</p>
</body>
</html>`,
  css: `body {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  color: #fff;
}

h1 {
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

p {
  font-size: 1.2em;
  opacity: 0.9;
}`,
  javascript: `// 在这里编写 JavaScript 代码
console.log('Hello, 前端语言!');
document.body.innerHTML += '<p>JavaScript 执行成功！</p>';`,
})

const previewHtml = computed(() => {
  const htmlCode = code.value.html
  const cssCode = `<style>${code.value.css}</style>`
  const jsCode = `<script>
    try {
      ${code.value.javascript}
    } catch(e) {
      document.body.innerHTML += '<p style="color:red;">错误: ' + e.message + '</p>';
    }
  <\/script>`

  return htmlCode.replace('</head>', `${cssCode}</head>`).replace('</body>', `${jsCode}</body>`)
})

const handleTab = e => {
  e.preventDefault()
  const textarea = e.target
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  code.value[activeTab.value] = code.value[activeTab.value].substring(0, start) + '  ' + code.value[activeTab.value].substring(end)
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 2
  }, 0)
}

const runCode = () => {
  isRunning.value = true
  setTimeout(() => {
    isRunning.value = false
    ElMessage.success('代码执行完成！')
  }, 300)
}

const evaluateCode = async () => {
  // 合并所有代码进行评测
  const combinedCode = {
    html: code.value.html,
    css: code.value.css,
    javascript: code.value.javascript
  }

  if (!combinedCode.html.trim() && !combinedCode.css.trim() && !combinedCode.javascript.trim()) {
    ElMessage.warning('请输入代码后再进行评测')
    return
  }

  isEvaluating.value = true
  try {
    const response = await request.post('/api/compiler/evaluate', {
      code: JSON.stringify(combinedCode),
      language: 'frontend'
    })
    evaluationResult.value = response.data
    if (response.data.success) {
      ElMessage.success('评测成功！')
    } else {
      ElMessage.error('评测失败，代码存在问题')
    }
  } catch (error) {
    ElMessage.error('评测请求失败，请稍后重试')
    console.error('评测失败:', error)
  } finally {
    isEvaluating.value = false
  }
}

const clearCode = () => {
  code.value = {
    html: '',
    css: '',
    javascript: '',
  }
  evaluationResult.value = null
  ElMessage.info('代码已清空')
}

const refreshPreview = () => {
  runCode()
}
</script>

<style lang="scss" scoped>
.compiler-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 0%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 82% 20%, rgba(207, 92, 255, 0.12), transparent 24%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;
}

.compiler-page :deep(.header) {
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

.compiler-page :deep(.logo) {
  color: #fff;
  text-shadow: 0 0 18px rgba(64, 158, 255, 0.42);
}

.compiler-page :deep(nav li),
.compiler-page :deep(.user span) {
  color: rgba(255, 255, 255, 0.78);
}

.compiler-page :deep(nav li:hover),
.compiler-page :deep(nav li.active) {
  color: #76b7ff;
}

.compiler-container {
  display: flex;
  height: calc(100vh - 108px);
  padding: 24px;
  gap: 24px;
  background: transparent;
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(12, 18, 27, 0.68);
  overflow: hidden;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.3),
    0 0 24px rgba(64, 158, 255, 0.1);
  backdrop-filter: blur(16px);
}

.tab-bar {
  display: flex;
  padding: 8px;
  gap: 8px;
  background: rgba(7, 11, 18, 0.72);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  button {
    padding: 10px 18px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.72);
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    transition:
      transform 0.25s ease,
      background 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    &:hover {
      background: rgba(64, 158, 255, 0.14);
      border-color: rgba(118, 183, 255, 0.42);
      color: #fff;
      transform: translateY(-1px);
    }

    &.active {
      background: linear-gradient(135deg, #409eff, #7c5cff);
      color: #fff;
      border-color: rgba(118, 183, 255, 0.72);
      box-shadow: 0 10px 24px rgba(64, 158, 255, 0.24);
    }
  }
}

.code-editor {
  flex: 1;
  background: #101621;
  border-radius: 0 0 16px 16px;

  textarea {
    width: 100%;
    height: 100%;
    padding: 16px;
    background: linear-gradient(180deg, #111827 0%, #0b111b 100%);
    border: none;
    color: #dbeafe;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    outline: none;

    &::placeholder {
      color: rgba(219, 234, 254, 0.34);
    }
  }
}

.actions {
  padding: 12px;
  background: rgba(7, 11, 18, 0.72);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
  justify-content: center;
}

.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.14), rgba(124, 92, 255, 0.08)),
    rgba(12, 18, 27, 0.68);
  overflow: hidden;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.3),
    0 0 24px rgba(64, 158, 255, 0.1);
  backdrop-filter: blur(16px);
}

.preview-header {
  padding: 12px 16px;
  background: rgba(7, 11, 18, 0.62);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #fff;
}

.result-content {
  flex: 1;
  overflow: hidden;

  .preview-content {
    height: 100%;

    .preview-frame {
      width: 100%;
      height: 100%;
      border: 12px solid rgba(7, 11, 18, 0.24);
      background: #fff;
      border-radius: 0 0 16px 16px;
    }
  }

  .evaluation-result {
    height: 100%;
    padding: 20px;
    overflow-y: auto;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(124, 92, 255, 0.06)),
      rgba(12, 18, 27, 0.74);
    color: rgba(255, 255, 255, 0.82);

    h3 {
      margin-top: 0;
      color: #fff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    .result-status {
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-weight: bold;

      &.success {
        background-color: rgba(103, 194, 58, 0.12);
        color: #67c23a;
        border: 1px solid rgba(103, 194, 58, 0.28);
      }

      &.error {
        background-color: rgba(245, 108, 108, 0.12);
        color: #f56c6c;
        border: 1px solid rgba(245, 108, 108, 0.28);
      }
    }

    .result-details {
      .detail-item {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;

        .label {
          font-weight: bold;
          margin-bottom: 5px;
          color: rgba(255, 255, 255, 0.62);
        }

        span {
          &.success {
            color: #67c23a;
          }

          &.error {
            color: #f56c6c;
          }
        }

        .output {
          background: rgba(7, 11, 18, 0.68);
          padding: 10px;
          border-radius: 10px;
          margin: 5px 0 0 0;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 14px;
          white-space: pre-wrap;
          color: #dbeafe;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
      }

      .errors {
        margin-top: 20px;

        h4 {
          color: #f56c6c;
          margin-bottom: 10px;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            background-color: rgba(245, 108, 108, 0.12);
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 10px;
            border-left: 4px solid #f56c6c;
            color: rgba(255, 255, 255, 0.78);

            .error-line {
              font-weight: bold;
              margin-right: 5px;
            }
          }
        }
      }
    }
  }
}

:deep(.actions .el-button) {
  height: 40px;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    opacity 0.25s ease;
}

:deep(.actions .el-button:hover),
:deep(.actions .el-button:focus) {
  transform: translateY(-2px);
  box-shadow:
    0 12px 28px rgba(64, 158, 255, 0.24),
    0 0 18px rgba(64, 158, 255, 0.18);
}

:deep(.actions .el-button--primary) {
  background: linear-gradient(135deg, #409eff, #7c5cff);
}

:deep(.actions .el-button--success) {
  background: linear-gradient(135deg, #67c23a, #22c55e);
}

:deep(.actions .el-button:not(.el-button--primary):not(.el-button--success)) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

:deep(.preview-header .el-button) {
  color: #76b7ff;
}

@media (max-width: 768px) {
  .compiler-page :deep(.header) {
    width: calc(100% - 20px);
    height: auto;
    min-height: 64px;
    margin-top: 10px;
    padding: 12px;
    gap: 12px;
  }

  .compiler-container {
    flex-direction: column;
    height: auto;
    padding: 16px;
  }

  .editor-section,
  .preview-section {
    min-height: 400px;
  }
}
</style>
