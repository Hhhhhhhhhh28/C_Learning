<template>
  <div class="header">
    <div class="logo">前端语言AI教学平台</div>
    <nav>
      <ul>
        <li
          v-for="r in headRoutes"
          :key="r.path"
          :class="{ active: r.path === $route.path }"
          @click="handleToPath(r.path)"
        >
          <!-- <el-icon v-if="r.meta.icon">
            <component :is="r.meta.icon" />
          </el-icon> -->
          <!-- <router-link></router-link> -->
          {{ r.meta.title }}
        </li>
      </ul>
    </nav>
    <div class="user">
      <el-tooltip
        effect="dark"
        :content="themeStore.isDark ? '切换浅色模式' : '切换深色模式'"
        placement="bottom"
      >
        <button
          class="theme-toggle"
          type="button"
          :aria-label="themeStore.isDark ? '切换浅色模式' : '切换深色模式'"
          @click="themeStore.toggleTheme"
        >
          <el-icon>
            <Moon v-if="themeStore.isDark" />
            <Sunny v-else />
          </el-icon>
        </button>
      </el-tooltip>
      <span>{{ displayUserInfo?.name }}</span>
      <el-dropdown>
        <el-avatar :src="avatarUrl" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="r in dropdownRoutes" :key="r.path">
              <el-icon v-if="r.meta.icon">
                <component :is="r.meta.icon" />
              </el-icon>
              <router-link :to="r.path">{{ r.meta.title }}</router-link>
            </el-dropdown-item>
            <el-dropdown-item @click="handleOut"
              ><el-icon><SwitchButton /></el-icon> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { getUserInfo, apiPostOutLogin } from '@/api/user.js'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore, useUserStore } from '@/stores/index'
const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const dropdownRoutes = computed(() => {
  return router.getRoutes().filter(r => r.meta && r.meta.show === 'dropdown')
})
const headRoutes = computed(() => {
  return router.getRoutes().filter(r => r.meta && r.meta.show === 'header')
})

const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
const displayUserInfo = computed(() => {
  return userStore.userInfo?.name ? userStore.userInfo : userInfo.value
})
const avatarUrl = computed(() => {
  const info = displayUserInfo.value || {}
  return info.avatarUrl || info.avatar_url || defaultAvatar
})
const handleGetUserInfo = async () => {
  userInfo.value = await getUserInfo('210047301')
  userStore.setUserInfo(userInfo.value)
}

const handleToPath = path => {
  router.push(path)
}

// 退出登录
const handleOut = async () => {
  await apiPostOutLogin()
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.push('/login')
}
onMounted(async () => {
  await handleGetUserInfo()
})
</script>

<style lang="scss" scoped>
@media screen and (max-width: 768px) {
  .logo {
    display: none;
  }
}

@font-face {
  font-family: 'DingTalk'; // 自定义字体名称
  src: url('@/assets/fonts/DingTalk-JinBuTi.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.header {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 99999;
  width: 100%;
  height: $header-height;
  border: 1px solid var(--theme-border-color);
  border-radius: $border-radius-s;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 clamp(16px, 2vw, 28px);
  gap: clamp(18px, 2.4vw, 42px);
  background: var(--theme-panel-bg-strong);
  box-shadow: var(--theme-shadow), var(--theme-glow);
  color: var(--theme-text-primary);
  backdrop-filter: var(--theme-glass-blur);
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease,
    box-shadow 0.25s ease;
}
.logo {
  flex: 0 0 auto;
  color: var(--theme-accent);
  font-size: clamp(2.3rem, 3vw, 4rem);
  font-family: 'DingTalk';
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 0 18px color-mix(in srgb, var(--theme-accent) 32%, transparent);
}
nav {
  flex: 1;
  min-width: 0;
  ul {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(18px, 2.2vw, 34px);
    min-width: 0;
    li {
      font-size: clamp(14px, 1vw, #{$font-size-l});
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $margin-s;
      flex: 0 0 auto;
      white-space: nowrap;
      color: var(--theme-text-secondary);
      cursor: pointer;
      transition: all 0.3s ease;
      &:hover {
        color: var(--theme-accent);
      }
      &.active {
        color: var(--theme-accent);
      }
    }
  }
}
.user {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(10px, 1.4vw, #{$margin-xl});

  .theme-toggle {
    width: 38px;
    height: 38px;
    border: 1px solid var(--theme-border-strong);
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-accent-soft);
    color: var(--theme-accent);
    cursor: pointer;
    transition:
      transform 0.25s ease,
      border-color 0.25s ease,
      background 0.25s ease,
      color 0.25s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: var(--theme-accent);
      background: var(--theme-input-bg);
      color: var(--theme-accent-hover);
    }
  }

  span {
    font-size: $font-size-xl;
    white-space: nowrap;
    color: var(--theme-text-primary);
  }
  img {
    width: 2.5 * $font-size-xl;
    height: 2.5 * $font-size-xl;
    border-radius: 50%;
  }
}
</style>
