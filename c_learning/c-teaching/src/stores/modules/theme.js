import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const THEME_STORAGE_KEY = 'app-theme'
const validThemes = ['dark', 'light']

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  return validThemes.includes(savedTheme) ? savedTheme : 'dark'
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(getInitialTheme())

  const themeClass = computed(() => `theme-${theme.value}`)
  const isDark = computed(() => theme.value === 'dark')

  const setTheme = nextTheme => {
    if (!validThemes.includes(nextTheme)) return
    theme.value = nextTheme
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  const toggleTheme = () => {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    theme,
    themeClass,
    isDark,
    setTheme,
    toggleTheme,
  }
})
