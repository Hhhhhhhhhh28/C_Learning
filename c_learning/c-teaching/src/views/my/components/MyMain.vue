<template>
  <main>
    <!-- 用户信息卡片 -->
    <el-card shadow="never" class="info-card">
      <div class="avatar-section">
        <el-avatar :size="96" :src="avatarPreview" class="profile-avatar" />
        <div class="avatar-actions">
          <div class="avatar-title">个人头像</div>
          <div class="avatar-subtitle">仅保存当前登录用户的头像</div>
          <input
            ref="avatarInputRef"
            class="avatar-input"
            type="file"
            accept="image/*"
            @change="handleAvatarSelected"
          />
          <el-button type="primary" @click="triggerAvatarUpload">更换头像</el-button>
        </div>
      </div>

      <div v-for="filed in userInfoFiled" :key="filed.value" class="filed">
        <div class="label">{{ filed.label }}</div>
        <input
          v-if="isEditing && filed.value !== 'password'"
          v-model="tempUserInfo[filed.value]"
          :disabled="filed.value === 'stuNum'"
          class="input-field"
        />
        <span v-else class="display-field">
          {{ filed.value === 'password' ? '******' : userInfo[filed.value] }}
          <el-button
            v-if="filed.value === 'password'"
            link
            type="primary"
            class="password-action"
            @click="passwordDialogVisible = true"
          >
            修改密码
          </el-button>
        </span>
      </div>
      <!-- 按钮区域 -->
      <div class="buttonDiv">
        <el-button
          v-if="!isEditing"
          type="primary"
          class="edit-button"
          @click="startEditing"
        >
          修改个人信息
        </el-button>
        <template v-else>
          <el-button type="success" @click="confirmEdit">确定</el-button>
          <el-button type="danger" @click="cancelEdit">取消</el-button>
        </template>
      </div>
    </el-card>
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="420px"
      class="password-dialog"
    >
      <el-form label-position="top" class="password-form">
        <el-form-item label="原密码">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closePasswordDialog">取消</el-button>
        <el-button type="primary" @click="handleUpdatePassword">确认修改</el-button>
      </template>
    </el-dialog>
    <!-- 错题本 -->
    <!-- <ErrorQustion /> -->
  </main>
</template>

<script setup>
// import ErrorQustion from './ErrorQustion.vue'
import { reactive, ref, onMounted } from 'vue'
import { ElButton, ElMessage } from 'element-plus'

import { getUserInfo, updateAvatar, updatePassword, updateUserInfo } from '@/api/user.js'
import { useUserStore } from '@/stores/index.js'

// 初始化用户信息
const userStore = useUserStore()
const userInfo = ref({})
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const avatarPreview = ref(defaultAvatar)
const avatarInputRef = ref(null)
const passwordDialogVisible = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const normalizeUserInfo = data => ({
  ...data,
  stuNum: data?.stuNum || data?.stu_num || data?.studentId || data?.student_id || '',
  name: data?.name || '',
  className: data?.className || data?.class_name || '',
  password: '******',
  avatarUrl: data?.avatarUrl || data?.avatar_url || defaultAvatar,
})
const handleGetUserInfo = async () => {
  userInfo.value = normalizeUserInfo(await getUserInfo())
  avatarPreview.value = userInfo.value.avatarUrl || defaultAvatar
  userStore.setUserInfo(userInfo.value)
}
const userInfoFiled = [
  {
    value: 'stuNum',
    label: '学号',
  },
  {
    value: 'name',
    label: '姓名',
  },
  {
    value: 'className',
    label: '班级',
  },
  {
    value: 'password',
    label: '密码',
  },
]
onMounted(async () => {
  await handleGetUserInfo()
})
// 编辑状态
const isEditing = ref(false)

// 临时存储用户信息
const tempUserInfo = reactive({})

// 开始编辑
const startEditing = () => {
  Object.assign(tempUserInfo, userInfo.value) //userInfo->tempUserInfo
  isEditing.value = true
}

// 确认修改
const confirmEdit = async () => {
  await updateUserInfo({
    name: tempUserInfo.name,
    className: tempUserInfo.className,
  })
  await handleGetUserInfo()
  isEditing.value = false
  ElMessage.success('个人信息已保存')
}

// 取消修改
const cancelEdit = () => {
  for (let key in tempUserInfo) {
    delete tempUserInfo[key]
  }
  isEditing.value = false
}

const triggerAvatarUpload = () => {
  avatarInputRef.value?.click()
}

const handleAvatarSelected = event => {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = async () => {
    const avatarUrl = reader.result
    const oldAvatar = avatarPreview.value
    try {
      avatarPreview.value = avatarUrl
      await updateAvatar({ avatar_url: avatarUrl })
      await handleGetUserInfo()
      ElMessage.success('头像已更新')
    } catch (error) {
      avatarPreview.value = oldAvatar
    }
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const closePasswordDialog = () => {
  passwordDialogVisible.value = false
  resetPasswordForm()
}

const handleUpdatePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    ElMessage.error('请完整填写密码信息')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }
  await updatePassword({ ...passwordForm })
  ElMessage.success('密码修改成功')
  closePasswordDialog()
}
</script>

<style lang="scss" scoped>
@use 'sass:math';

main {
  width: min(920px, calc(100% - 32px));
  margin: 0 auto;
  padding: 34px 0 0;
}

.info-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  background: rgba(12, 18, 27, 0.68);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.28),
    0 0 24px rgba(64, 158, 255, 0.1);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: #fff;
  backdrop-filter: blur(16px);

  .avatar-section {
    display: flex;
    align-items: center;
    gap: 22px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(124, 92, 255, 0.06)),
      rgba(255, 255, 255, 0.045);

    .profile-avatar {
      flex: 0 0 auto;
      border: 2px solid rgba(118, 183, 255, 0.35);
      box-shadow: 0 0 24px rgba(64, 158, 255, 0.18);
    }

    .avatar-actions {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .avatar-title {
      color: #fff;
      font-size: $font-size-xl;
      font-weight: 800;
    }

    .avatar-subtitle {
      margin-bottom: 4px;
      color: rgba(255, 255, 255, 0.58);
      font-size: $font-size-m;
    }

    .avatar-input {
      display: none;
    }
  }

  .filed {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 16px 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.045);

    .label {
      font-size: $font-size-xl;
      color: rgba(255, 255, 255, 0.68);
      font-weight: bold;
      width: 120px;
    }

    .input-field,
    .display-field {
      font-size: $font-size-l;
      color: rgba(255, 255, 255, 0.88);
      min-width: 300px;
      padding: $padding-m $padding-xl;
      border-radius: $border-radius-s;
    }

    .input-field {
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.08);
      outline: none;
      transition:
        border-color 0.3s ease,
        box-shadow 0.3s ease,
        background 0.3s ease;

      &:focus {
        border-color: #76b7ff;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 14px rgba(64, 158, 255, 0.22);
      }
    }

    .display-field {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background-color: transparent;
      border: none;
    }

    .password-action {
      color: #76b7ff;
      font-weight: 700;
    }
  }

  .buttonDiv {
    display: flex;
    justify-content: flex-end;
    gap: $padding-m;

    .edit-button {
      width: 200px;
    }

    :deep(.el-button) {
      font-size: $font-size-xl;
      padding: $padding-m $padding-xl;
      border-radius: 10px;
      border: none;
      font-weight: 700;
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow:
          0 12px 28px rgba(64, 158, 255, 0.3),
          0 0 18px rgba(64, 158, 255, 0.2);
      }
    }

    :deep(.el-button--primary),
    :deep(.el-button--success) {
      background: linear-gradient(135deg, #409eff, #7c5cff);
      color: #fff;
      box-shadow: 0 12px 28px rgba(64, 158, 255, 0.24);
    }

    :deep(.el-button--danger) {
      background: linear-gradient(135deg, #f56c6c, #e11d48);
      color: #fff;
    }
  }
}

:deep(.password-dialog) {
  border-radius: 18px;
  background: rgba(12, 18, 27, 0.92);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.34),
    0 0 24px rgba(64, 158, 255, 0.12);
  backdrop-filter: blur(18px);
}

:deep(.password-dialog .el-dialog__title),
:deep(.password-dialog .el-form-item__label) {
  color: #fff;
}

:deep(.password-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.password-dialog .el-input__wrapper) {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

:deep(.password-dialog .el-input__inner) {
  color: #fff;
}

:deep(.password-dialog .el-button--primary) {
  border: none;
  background: linear-gradient(135deg, #409eff, #7c5cff);
}

// 移动端样式调整
@media screen and (max-width: 768px) {
  main {
    width: calc(100% - 20px);
    padding-top: 20px;
  }

  .info-card {
    padding: 22px;
  }

  .info-card .avatar-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-card .filed {
    margin-top: $margin-m; // 调整字段之间的间距
    flex-direction: column;
    align-items: flex-start;
    gap: $padding-m;
  }

  .info-card .filed .label {
    width: auto;
    font-size: $font-size-l;
  }

  .info-card .filed .input-field,
  .info-card .filed .display-field {
    min-width: auto;
    width: 100%;
    font-size: $font-size-m;
    padding: $padding-s $padding-m;
  }

  .info-card .buttonDiv {
    justify-content: center;
  }

  .info-card .buttonDiv .edit-button {
    width: 100%;
  }

  .info-card .buttonDiv .el-button {
    font-size: $font-size-m;
    padding: $padding-s $padding-m;
  }
  .buttonDiv {
    margin-top: $margin-xl;
  }
}
</style>
