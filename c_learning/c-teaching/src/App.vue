<script setup>
import { computed, watch } from 'vue'
import { useThemeStore } from '@/stores/index'

const themeStore = useThemeStore()
const themeClass = computed(() => themeStore.themeClass)

watch(
  () => themeStore.theme,
  theme => {
    const classes = ['theme-dark', 'theme-light']
    document.documentElement.classList.remove(...classes)
    document.body.classList.remove(...classes)
    document.documentElement.classList.add(`theme-${theme}`)
    document.body.classList.add(`theme-${theme}`)
  },
  { immediate: true },
)
</script>

<template>
  <div :class="['app-root', themeClass]">
    <router-view></router-view>
  </div>
</template>

<style scoped lang="scss">
.app-root {
  min-height: 100vh;
  background: var(--theme-page-bg);
  color: var(--theme-text-primary);
  transition:
    background 0.25s ease,
    color 0.25s ease;
}
</style>
