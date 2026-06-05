<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  apiGetNotes,
  apiAddNotes,
  apiDeleteNote,
  apiPutNote,
  apiGetSerchNotes,
} from '@/api/notes.js'
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import hljs from 'highlight.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
// 使用主题
VMdEditor.use(vuepressTheme, {
  Hljs: hljs,
})

const targetElement = ref('')

onMounted(() => {
  targetElement.value = '.target'
})

// 编辑器实例
const editorRef = ref()

// 编辑数据，用于去传参/添加/修改笔记
const postData = ref({
  id: 0,
  content: '',
  isStar: false,
  isDelete: false,
})

// 编辑状态
const isEditor = ref(false)

// 总条数
const countAll = ref(0)
const countStar = ref(0)
const countDelete = ref(0)

// 分类列表
const category = computed(() => [
  {
    index: '1',
    title: '全部笔记',
    icon: 'Document',
    total: countAll.value,
  },
  {
    index: '2',
    title: '星标',
    icon: 'Star',
    total: countStar.value,
  },
  {
    index: '3',
    title: '最近删除',
    icon: 'Delete',
    total: countDelete.value,
  },
])

// 当前分类index
const currentCategoryIndex = ref(category.value[0].index || '0')

// 笔记列表
const notes = ref([])

// 搜索模糊词
const inputSerch = ref('')

// 搜索笔记函数
async function getSearchNotes() {
  if (inputSerch.value === '') {
    return switchCategory(currentCategoryIndex.value)
  }
  const { data } = await apiGetSerchNotes(inputSerch.value)
  notes.value = data.map(item => ({
    id: item.id,
    content: item.context,
    date: item.createTime,
    isStar: item.isStar === 1 ? true : false,
    isDelete: item.orDelete === 1 ? true : false,
  }))
}

// 获取笔记列表
async function getNotes() {
  const {
    data: { notebooks, noteCount: cAll, starCount: _cStar, deleteCount: cDet },
  } = await apiGetNotes()
  const filterNotes = notebooks.map(item => ({
    id: item.id,
    content: item.context,
    date: formatDate(item.createTime),
    isStar: item.isStar === 1 ? true : false,
    isDelete: item.orDelete === 1 ? true : false,
  }))
  switch (currentCategoryIndex.value) {
    case '1':
      notes.value = filterNotes.filter(item => !item.isDelete)
      break
    case '2':
      notes.value = filterNotes.filter(item => item.isStar && !item.isDelete)
      break
    case '3':
      notes.value = filterNotes.filter(item => item.isDelete)
      break
    default:
      notes.value = filterNotes
  }
  countAll.value = cAll - cDet
  countStar.value = filterNotes.filter(
    item => item.isStar && !item.isDelete,
  ).length
  countDelete.value = cDet
  // postData.value = { ...notes.value[0] }
}

// 删除笔记
async function deleteNote(item) {
  Object.assign(postData.value, item)
  postData.value.isDelete = true
  await apiPutNote(postData.value)
  await switchCategory(currentCategoryIndex.value)
  postData.value = { ...notes.value[0] }
  ElMessage.success('删除成功')
}

// 切换分类
async function switchCategory(index) {
  currentCategoryIndex.value = index
  await getNotes()
}

// 取消编辑按钮回调
function handleCancel() {
  isEditor.value = false
  postData.value = { ...notes.value[0] }
}

// 下拉框的编辑按钮
const handleEdit = note => {
  isEditor.value = true
  postData.value = { ...note }
}

// 笔记编辑确定按钮回调
async function editNote(_item) {
  isEditor.value = false
  if (postData.value.id === 0) {
    await apiAddNotes(postData.value)
    await switchCategory(currentCategoryIndex.value)
    // postData.value = { ...notes.value[0] }
  } else {
    await apiPutNote(postData.value)
    await switchCategory(currentCategoryIndex.value)
  }
}

// 收藏/取消收藏笔记
async function starNote(item) {
  Object.assign(postData.value, item)
  postData.value.isStar = !item.isStar
  await apiPutNote(postData.value)
  await switchCategory(currentCategoryIndex.value)
}

// 格式化日期
function formatDate(isoDate) {
  const date = new Date(isoDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 添加笔记按钮回调
async function handleAddNote() {
  if (currentCategoryIndex.value == 1) {
    Object.assign(postData.value, {
      id: 0,
      content: '',
      isStar: false,
      isDelete: false,
    })
  } else if (currentCategoryIndex.value == 2) {
    Object.assign(postData.value, {
      id: 0,
      content: '',
      isStar: true,
      isDelete: false,
    })
  }
  isEditor.value = true
}

// 下载笔记按钮函数
function downloadMarkdown(note) {
  const markdownContent = note.content
  const blob = new Blob([markdownContent], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // 从content中提取标题作为文件名
  const titleMatch = markdownContent.match(/# (.+)/)
  const fileName = titleMatch ? titleMatch[1] : '未命名笔记'
  a.download = `${fileName}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// 全部清除按钮/彻底删除按钮函数
async function permanentlyDeleteNote(id) {
  ElMessageBox.confirm('笔记将被彻底删除，此操作不能撤销', '确定删除笔记?', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = notes.value.map(item => item.id)
      if (id) {
        await apiDeleteNote([id])
      } else {
        await apiDeleteNote(ids)
      }
      await switchCategory(currentCategoryIndex.value)
      postData.value = { ...notes.value[0] }
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 还原笔记函数
async function restoreNote() {
  postData.value.isDelete = false
  await apiPutNote(postData.value)
  await switchCategory(currentCategoryIndex.value)
}

onMounted(() => {
  getNotes()
})
</script>

<template>
  <div class="notes-page">
    <HeaderCm />
    <div class="noteContent">
      <div class="left">
        <el-button type="primary" icon="plus" @click="handleAddNote"
          >写笔记</el-button
        >
        <el-menu :default-active="currentCategoryIndex" class="el-menu-vertical-demo">
          <el-menu-item
            v-for="item in category"
            :key="item.index"
            :index="item.index"
            style="display: flex; justify-content: space-between"
            @click="switchCategory(item.index)"
          >
            <div class="title">
              <el-icon><component :is="item.icon"></component></el-icon>
              <span>{{ item.title }}</span>
            </div>
            <i>{{ item.total }}</i>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="center">
        <!-- 搜索笔记 -->
        <el-input
          v-model="inputSerch"
          placeholder="搜索笔记"
          prefix-icon="search"
          @input="getSearchNotes"
        />
        <!-- 仅在最近删除时展示的信息提醒和一键清除按钮 -->
        <div v-if="currentCategoryIndex === '3'" class="deleteInfo">
          <el-button
            type="danger"
            :icon="'delete'"
            size="small"
            plain
            :disabled="notes.length === 0"
            @click="permanentlyDeleteNote(null)"
            >全部清除</el-button
          >
          <p>被删除的笔记保留30天后将清除</p>
        </div>
        <!-- 笔记列表区域 -->
        <div v-if="notes.length" class="notes">
          <div
            v-for="item in notes"
            :key="item"
            class="note-item"
            :class="{ active: postData.id === item.id }"
            @click="Object.assign(postData, item)"
          >
            <span class="time">
              <el-icon><Clock /></el-icon>
              <span>{{ item.date }}</span>
            </span>
            <div class="content">
              <p>
                {{ item.content }}
              </p>
            </div>
            <div class="footer">
              <el-dropdown
                placement="bottom-end"
                :append-to="targetElement"
                trigger="click"
              >
                <el-icon><More /></el-icon>
                <template #dropdown>
                  <!-- 不是最近删除显示 -->
                  <el-dropdown-menu v-if="currentCategoryIndex !== '3'">
                    <el-dropdown-item @click="handleEdit(item)">
                      <el-icon><EditPen /></el-icon>编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="deleteNote(item)">
                      <el-icon><Delete /></el-icon>删除
                    </el-dropdown-item>
                    <el-dropdown-item @click="starNote(item)">
                      <el-icon>
                        <component :is="item.isStar ? 'star-filled' : 'star'"
                      /></el-icon>
                      收藏
                    </el-dropdown-item>
                    <el-dropdown-item @click="downloadMarkdown(item)">
                      <el-icon><Download /></el-icon>下载
                    </el-dropdown-item>
                  </el-dropdown-menu>
                  <!-- 是最近删除显示 -->
                  <el-dropdown-menu v-else>
                    <el-dropdown-item @click="restoreNote(item)">
                      <el-icon><Back /></el-icon>还原
                    </el-dropdown-item>
                    <el-dropdown-item @click="permanentlyDeleteNote(item.id)">
                      <el-icon><Delete /></el-icon>彻底删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
        <!-- 无笔记列表时展示 -->
        <div v-else class="notes empty-notes">
          <img
            src="https://lf-cdn-tos.bytescm.com/obj/static/xitu_extension/static/inspiration.29187097.svg"
            alt=""
          />
        </div>
      </div>
      <div class="right">
        <!-- 操作，删除列表不展示 -->
        <div v-if="currentCategoryIndex !== '3'" class="work">
          <span v-if="!isEditor" class="work-inline">
            <el-button
              type="primary"
              plain
              :disabled="!postData.id"
              @click="isEditor = true"
              ><el-icon><EditPen /></el-icon>编辑</el-button
            >
          </span>
          <span v-else class="work-inline">
            <!-- <p>
              保存于2024-03-23 12:22<el-icon><Loading /></el-icon>
            </p> -->
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="editNote">确定</el-button>
          </span>
        </div>
        <div v-if="!postData.id && !isEditor" class="editor-empty-state">
          <div class="empty-orb">
            <el-icon><component :is="'Document'" /></el-icon>
          </div>
          <h3>选择一条笔记</h3>
          <p>从左侧列表选择笔记进行预览，或点击“写笔记”开始记录新的学习内容。</p>
        </div>
        <v-md-editor
          v-else
          ref="editorRef"
          v-model="postData.content"
          :mode="isEditor ? 'editable' : 'preview'"
          height="100%"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notes-page {
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 18% 0%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 82% 18%, rgba(124, 92, 255, 0.16), transparent 28%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;
}

.notes-page :deep(.header) {
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

.notes-page :deep(.logo) {
  color: #fff;
  text-shadow: 0 0 18px rgba(64, 158, 255, 0.42);
}

.notes-page :deep(nav li),
.notes-page :deep(.user span) {
  color: rgba(255, 255, 255, 0.78);
}

.notes-page :deep(nav li:hover),
.notes-page :deep(nav li.active) {
  color: #76b7ff;
}

.noteContent {
  width: min(1420px, calc(100% - 32px));
  min-height: calc(100vh - 112px);
  display: grid;
  grid-template-columns: 220px 340px minmax(0, 1fr);
  align-items: stretch;
  gap: 18px;
  padding: 22px 0 32px;
  margin: 0 auto;

  .left {
    min-width: 0;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(124, 92, 255, 0.06)),
      rgba(12, 18, 27, 0.72);
    box-shadow:
      0 24px 70px rgba(0, 0, 0, 0.26),
      0 0 24px rgba(64, 158, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(16px);

    :deep(.el-button--primary) {
      width: 100%;
      min-height: 44px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(135deg, #409eff, #7c5cff);
      box-shadow: 0 14px 30px rgba(64, 158, 255, 0.26);
      color: #fff;
      font-weight: 900;
    }

    :deep(.el-menu) {
      border-right: 0;
      background: transparent;
    }

    :deep(.el-menu-item) {
      height: 48px;
      margin-bottom: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.045);
      color: rgba(255, 255, 255, 0.78);
      transition:
        background 0.25s ease,
        border-color 0.25s ease,
        box-shadow 0.25s ease,
        transform 0.25s ease;
    }

    :deep(.el-menu-item:hover),
    :deep(.el-menu-item.is-active) {
      border-color: rgba(118, 183, 255, 0.36);
      background: rgba(64, 158, 255, 0.14);
      color: #fff;
      box-shadow: 0 12px 28px rgba(64, 158, 255, 0.16);
      transform: translateY(-1px);
    }

    .title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
    }

    i {
      color: #a8d2ff;
      font-style: normal;
      font-weight: 900;
    }
  }

  .center {
    min-width: 0;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    background: rgba(12, 18, 27, 0.68);
    box-shadow:
      0 24px 70px rgba(0, 0, 0, 0.26),
      0 0 24px rgba(64, 158, 255, 0.1);
    backdrop-filter: blur(16px);

    :deep(.el-input__wrapper) {
      min-height: 44px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.08);
      box-shadow: none;
    }

    :deep(.el-input__wrapper.is-focus) {
      border-color: rgba(118, 183, 255, 0.48);
      box-shadow: 0 0 18px rgba(64, 158, 255, 0.16);
    }

    :deep(.el-input__inner) {
      color: #fff;
    }

    :deep(.el-input__inner::placeholder) {
      color: rgba(255, 255, 255, 0.42);
    }

    .deleteInfo {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      gap: $margin-s;
      border: 1px solid rgba(245, 108, 108, 0.18);
      border-radius: 14px;
      background: rgba(245, 108, 108, 0.08);

      p {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.62);
      }
    }

    .notes {
      display: flex;
      flex-direction: column;
      gap: $margin-m;
      min-height: 0;
      padding-right: 4px;
      overflow-y: auto;
      scrollbar-color: rgba(118, 183, 255, 0.28) transparent;

      .note-item {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: $margin-s;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.055);

        transition: all 0.3s ease; // 过渡效果，平滑过渡;
        &.active {
          border-color: rgba(118, 183, 255, 0.54);
          background:
            linear-gradient(135deg, rgba(64, 158, 255, 0.18), rgba(124, 92, 255, 0.1)),
            rgba(255, 255, 255, 0.07);
          box-shadow:
            0 14px 32px rgba(64, 158, 255, 0.18),
            0 0 18px rgba(124, 92, 255, 0.12);
        }
        &:hover {
          // 悬浮
          border-color: rgba(118, 183, 255, 0.34);
          box-shadow: 0 14px 30px rgba(64, 158, 255, 0.12);
          transform: translateY(-2px);
        }

        .time {
          display: flex;
          align-items: center;
          gap: $margin-s;
          span {
            font-size: 12px;
            color: rgba(168, 210, 255, 0.72);
          }
        }

        .content {
          height: 30px; // 固定高度，防止内容溢出导致布局崩;
          display: flex;
          flex-direction: column;
          gap: $margin-s;
          line-height: 3; // 行高;
          // 超过两行省略
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1; // 控制显示的行数
          line-clamp: 1; // 定义标准属性，提高兼容性，控制显示的行数
          -webkit-box-orient: vertical;
          p {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.82);
          }
        }

        .footer {
          display: flex;
          justify-content: flex-end;
          color: rgba(255, 255, 255, 0.68);
        }
      }

      &.empty-notes {
        min-height: 360px;
        align-items: center;
        justify-content: center;
        border: 1px dashed rgba(118, 183, 255, 0.2);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.04);

        img {
          width: min(220px, 70%);
          opacity: 0.58;
          filter: saturate(0.8) brightness(0.88);
        }
      }
    }
  }

  .right {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 22px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(124, 92, 255, 0.05)),
      rgba(12, 18, 27, 0.72);
    box-shadow:
      0 24px 70px rgba(0, 0, 0, 0.28),
      0 0 24px rgba(64, 158, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(16px);

    .work {
      display: flex;
      justify-content: end;
      align-items: center;
      gap: $margin-s;
      padding: 0;

      .work-inline {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;

        p {
          flex: 1;
          font-size: $font-size-l;
          color: rgba(255, 255, 255, 0.62);
          margin-right: $margin-l;
        }
      }

      :deep(.el-button) {
        border-radius: 12px;
        border-color: rgba(118, 183, 255, 0.26);
        background: rgba(255, 255, 255, 0.08);
        color: #dce8ff;
      }

      :deep(.el-button--primary) {
        border: none;
        background: linear-gradient(135deg, #409eff, #7c5cff);
        box-shadow: 0 12px 28px rgba(64, 158, 255, 0.22);
        color: #fff;
      }
    }

    .v-md-editor {
      min-height: 0;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      background: rgba(7, 11, 18, 0.42);
      box-shadow: none;
    }
  }
}

.notes-page :deep(.v-md-editor),
.notes-page :deep(.v-md-editor__main),
.notes-page :deep(.v-md-editor__editor-wrapper),
.notes-page :deep(.v-md-editor__preview-wrapper) {
  background: transparent;
}

.notes-page :deep(.v-md-editor__toolbar) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(7, 11, 18, 0.72);
  color: rgba(255, 255, 255, 0.78);
}

.notes-page :deep(.v-md-editor__toolbar-item) {
  color: rgba(255, 255, 255, 0.72);
}

.notes-page :deep(.v-md-editor__toolbar-item:hover) {
  color: #76b7ff;
  background: rgba(64, 158, 255, 0.12);
}

.notes-page :deep(.v-md-textarea-editor textarea),
.notes-page :deep(.v-md-textarea-editor pre),
.notes-page :deep(.github-markdown-body) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.84) !important;
}

.notes-page :deep(.github-markdown-body h1),
.notes-page :deep(.github-markdown-body h2),
.notes-page :deep(.github-markdown-body h3),
.notes-page :deep(.github-markdown-body h4),
.notes-page :deep(.github-markdown-body h5),
.notes-page :deep(.github-markdown-body h6) {
  color: #fff;
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

.notes-page :deep(.github-markdown-body p),
.notes-page :deep(.github-markdown-body li) {
  color: rgba(255, 255, 255, 0.82);
}

.notes-page :deep(.github-markdown-body pre),
.notes-page :deep(.github-markdown-body code) {
  background: rgba(7, 11, 18, 0.72) !important;
  color: #dce8ff;
}

/* Theme-consistent finish pass for nested note surfaces and editor chrome. */
.notes-page {
  background: var(--theme-page-bg);
  color: var(--theme-text-primary);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.notes-page :deep(.header) {
  border-color: var(--theme-border-color) !important;
  background: var(--theme-panel-bg-strong) !important;
  box-shadow:
    var(--theme-shadow),
    var(--theme-glow);
}

.notes-page :deep(.logo) {
  color: var(--theme-text-primary);
  text-shadow: var(--theme-glow);
}

.notes-page :deep(nav li),
.notes-page :deep(.user span) {
  color: var(--theme-text-secondary);
}

.notes-page :deep(nav li:hover),
.notes-page :deep(nav li.active) {
  color: var(--theme-text-accent);
}

.noteContent {
  align-items: stretch;

  .left,
  .center,
  .right {
    border-color: var(--theme-border-color);
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(124, 92, 255, 0.05)),
      var(--theme-panel-bg);
    box-shadow:
      var(--theme-shadow),
      var(--theme-glow),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    color: var(--theme-text-primary);
    backdrop-filter: var(--theme-glass-blur);
  }

  .left {
    :deep(.el-button--primary) {
      min-height: 46px;
      border-radius: 14px;
      background: var(--theme-button-bg);
      color: var(--theme-button-text);
      box-shadow: 0 14px 30px rgba(64, 158, 255, 0.22);
      font-weight: 900;
      letter-spacing: 0.02em;
      transition:
        transform 0.22s ease,
        box-shadow 0.22s ease;
    }

    :deep(.el-button--primary:hover) {
      transform: translateY(-2px);
      box-shadow:
        0 16px 34px rgba(64, 158, 255, 0.28),
        var(--theme-glow);
    }

    :deep(.el-menu-item) {
      height: 50px;
      border-color: var(--theme-border-color);
      background: var(--theme-card-bg);
      color: var(--theme-text-secondary);
      font-weight: 800;
    }

    :deep(.el-menu-item:hover),
    :deep(.el-menu-item.is-active) {
      border-color: var(--theme-border-strong);
      background: var(--theme-accent-soft);
      color: var(--theme-text-accent);
      box-shadow: 0 12px 28px rgba(64, 158, 255, 0.14);
    }

    .title,
    .title span {
      color: inherit;
    }

    i {
      min-width: 28px;
      height: 24px;
      display: inline-grid;
      place-items: center;
      border: 1px solid var(--theme-border-strong);
      border-radius: 999px;
      background: var(--theme-accent-soft);
      color: var(--theme-text-accent);
      font-size: 12px;
      line-height: 1;
    }
  }

  .center {
    .notes {
      gap: 14px;
      padding-right: 6px;
    }

    :deep(.el-input__wrapper) {
      min-height: 46px;
      border-color: var(--theme-border-color);
      border-radius: 14px;
      background: var(--theme-input-bg);
      transition:
        border-color 0.22s ease,
        box-shadow 0.22s ease,
        background 0.22s ease;
    }

    :deep(.el-input__wrapper.is-focus) {
      border-color: var(--theme-border-strong);
      box-shadow: 0 0 18px rgba(64, 158, 255, 0.14);
    }

    :deep(.el-input__inner) {
      color: var(--theme-text-primary);
    }

    :deep(.el-input__inner::placeholder) {
      color: var(--theme-text-muted);
    }

    .deleteInfo {
      border-color: rgba(196, 29, 29, 0.22);
      background: rgba(196, 29, 29, 0.07);

      p {
        color: var(--theme-error-text);
      }
    }

    .notes .note-item {
      min-height: 116px;
      padding: 15px;
      border-color: var(--theme-border-color);
      border-radius: 16px;
      background: var(--theme-card-bg);
      color: var(--theme-text-secondary);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

      &.active {
        border-color: var(--theme-border-strong);
        background:
          linear-gradient(135deg, rgba(64, 158, 255, 0.16), rgba(124, 92, 255, 0.08)),
          var(--theme-card-bg);
        box-shadow:
          0 14px 32px rgba(64, 158, 255, 0.16),
          var(--theme-glow);
      }

      &:hover {
        border-color: var(--theme-border-strong);
      }

      .time,
      .time span {
        color: var(--theme-text-accent);
        font-weight: 800;
      }

      .content,
      .content p {
        color: var(--theme-text-secondary);
        line-height: 1.7;
      }

      .footer {
        margin-top: auto;
        color: var(--theme-text-muted);
      }

      .footer :deep(.el-icon) {
        width: 28px;
        height: 28px;
        border-radius: 10px;
        display: inline-grid;
        place-items: center;
        transition:
          background 0.2s ease,
          color 0.2s ease;
      }

      .footer :deep(.el-icon:hover) {
        background: var(--theme-accent-soft);
        color: var(--theme-text-accent);
      }
    }

    .notes.empty-notes {
      border-color: var(--theme-border-strong);
      background: var(--theme-card-bg);

      img {
        opacity: 0.66;
      }
    }
  }

  .right {
    min-height: 620px;

    .work {
      min-height: 46px;

      .work-inline p {
        color: var(--theme-text-muted);
      }

      :deep(.el-button) {
        min-height: 38px;
        padding: 0 16px;
        border-color: var(--theme-border-color);
        border-radius: 12px;
        background: var(--theme-card-bg);
        color: var(--theme-text-primary);
        font-weight: 800;
      }

      :deep(.el-button--primary) {
        background: var(--theme-button-bg);
        color: var(--theme-button-text);
      }
    }

    .v-md-editor {
      border-color: var(--theme-border-color);
      border-radius: 18px;
      background: var(--theme-panel-bg-strong);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .editor-empty-state {
      flex: 1;
      min-height: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 36px;
      border: 1px dashed var(--theme-border-strong);
      border-radius: 18px;
      background:
        radial-gradient(circle at 50% 28%, rgba(64, 158, 255, 0.14), transparent 34%),
        var(--theme-card-bg);
      color: var(--theme-text-secondary);
      text-align: center;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);

      .empty-orb {
        width: 70px;
        height: 70px;
        display: grid;
        place-items: center;
        border: 1px solid var(--theme-border-strong);
        border-radius: 50%;
        background:
          linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(124, 92, 255, 0.14)),
          var(--theme-card-bg);
        color: var(--theme-text-accent);
        box-shadow: var(--theme-glow);
        font-size: 30px;
      }

      h3 {
        margin: 0;
        color: var(--theme-text-primary);
        font-size: 24px;
        font-weight: 900;
        letter-spacing: 0.02em;
      }

      p {
        max-width: 360px;
        margin: 0;
        color: var(--theme-text-muted);
        font-size: 14px;
        line-height: 1.7;
      }
    }
  }
}

.notes-page :deep(.el-dropdown-menu) {
  border-color: var(--theme-border-color);
  background: var(--theme-panel-bg-strong);
  box-shadow: var(--theme-shadow);
}

.notes-page :deep(.el-dropdown-menu__item) {
  color: var(--theme-text-secondary);
}

.notes-page :deep(.el-dropdown-menu__item:hover) {
  background: var(--theme-accent-soft);
  color: var(--theme-text-accent);
}

.notes-page :deep(.v-md-editor),
.notes-page :deep(.v-md-editor__main),
.notes-page :deep(.v-md-editor__editor-wrapper),
.notes-page :deep(.v-md-editor__preview-wrapper),
.notes-page :deep(.v-md-editor__left-area),
.notes-page :deep(.v-md-editor__right-area) {
  background: transparent !important;
  color: var(--theme-text-primary) !important;
}

.notes-page :deep(.v-md-editor__toolbar) {
  border-bottom-color: var(--theme-border-color);
  background: var(--theme-panel-bg-strong);
  color: var(--theme-text-secondary);
  backdrop-filter: var(--theme-glass-blur);
}

.notes-page :deep(.v-md-editor__toolbar-item) {
  margin: 2px;
  border-radius: 8px;
  color: var(--theme-text-secondary);
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.notes-page :deep(.v-md-editor__toolbar-item:hover),
.notes-page :deep(.v-md-editor__toolbar-item--active) {
  background: var(--theme-accent-soft);
  color: var(--theme-text-accent);
}

.notes-page :deep(.v-md-textarea-editor textarea),
.notes-page :deep(.v-md-textarea-editor pre),
.notes-page :deep(.github-markdown-body) {
  background: transparent !important;
  color: var(--theme-text-secondary) !important;
  font-size: 15px;
  line-height: 1.8;
}

.notes-page :deep(.v-md-textarea-editor textarea) {
  caret-color: var(--theme-accent);
}

.notes-page :deep(.github-markdown-body h1),
.notes-page :deep(.github-markdown-body h2),
.notes-page :deep(.github-markdown-body h3),
.notes-page :deep(.github-markdown-body h4),
.notes-page :deep(.github-markdown-body h5),
.notes-page :deep(.github-markdown-body h6) {
  color: var(--theme-text-primary);
  border-bottom-color: var(--theme-border-color);
}

.notes-page :deep(.github-markdown-body p),
.notes-page :deep(.github-markdown-body li),
.notes-page :deep(.github-markdown-body td),
.notes-page :deep(.github-markdown-body th) {
  color: var(--theme-text-secondary);
}

.notes-page :deep(.github-markdown-body blockquote) {
  color: var(--theme-text-muted);
  border-left-color: var(--theme-border-strong);
}

.notes-page :deep(.github-markdown-body pre) {
  border: 1px solid var(--theme-border-color);
  border-radius: 14px;
  background: rgba(7, 17, 31, 0.94) !important;
}

.notes-page :deep(.github-markdown-body code) {
  background: rgba(64, 158, 255, 0.12) !important;
  color: var(--theme-category-js-text);
}

.notes-page :deep(.github-markdown-body pre code) {
  background: transparent !important;
  color: #dce8ff;
}

// 移动端样式适配
@media screen and (max-width: 768px) {
  .notes-page :deep(.header) {
    width: calc(100% - 24px);
    margin-top: 12px;
  }

  .noteContent {
    width: calc(100% - 24px);
    display: flex;
    flex-direction: column;
    height: auto;
    min-height: auto;
    padding: 18px 0 28px;
  }

  .noteContent .left,
  .noteContent .center,
  .noteContent .right {
    width: 100%;
    box-sizing: border-box;
  }

  .noteContent .left {
    width: 100%;
  }

  .noteContent .center .notes .note-item .content {
    height: auto;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .noteContent .right .v-md-editor {
    height: 400px;
  }
}
</style>
