<template>
  <div
    class="login-bk"
    :class="{ 'is-on': lampOn }"
    :style="lampVars"
  >
    <h1 class="welcome-title">欢迎来到维克多的智前端学习平台</h1>

    <div class="login-shell">
      <svg
        class="lamp"
        viewBox="0 0 333 484"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g class="lamp__shade shade">
          <ellipse class="shade__opening" cx="165" cy="220" rx="130" ry="20" />
          <ellipse
            class="shade__opening-shade"
            cx="165"
            cy="220"
            rx="130"
            ry="20"
            fill="url(#opening-shade)"
          />
        </g>
        <g class="lamp__base base">
          <path
            class="base__side"
            d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z"
          />
          <path
            d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z"
            fill="url(#side-shading)"
          />
          <ellipse class="base__top" cx="165" cy="430" rx="80" ry="20" />
          <ellipse cx="165" cy="430" rx="80" ry="20" fill="url(#base-shading)" />
        </g>
        <g class="lamp__post post">
          <path
            class="post__body"
            d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z"
          />
          <path
            d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z"
            fill="url(#post-shading)"
          />
        </g>
        <g class="lamp__cords cords" :class="{ 'is-pulled': cordPulled }">
          <path
            class="cord cord--animated"
            d="M124 187.023s17.007 21.921 17.007 34.846c0 12.925-11.338 23.231-17.007 34.846-5.669 11.615-17.007 21.921-17.007 34.846 0 12.925 17.007 34.846 17.007 34.846"
            stroke-width="6"
            stroke-linecap="round"
          />
          <line
            class="cord cord--dummy"
            x1="124"
            y1="190"
            :x2="cordEnd.x"
            :y2="cordEnd.y"
            stroke-width="6"
            stroke-linecap="round"
          />
        </g>
        <path
          class="lamp__light"
          d="M290.5 193H39L0 463.5c0 11.046 75.478 20 165.5 20s167-11.954 167-23l-42-267.5z"
          fill="url(#light)"
        />
        <g class="lamp__top top">
          <path
            class="top__body"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z"
            fill="url(#top-shading)"
          />
        </g>
        <g class="lamp__face face">
          <g class="lamp__mouth">
            <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" fill="#141414" />
            <clipPath id="login-lamp-mouth" x="129" y="142" width="72" height="36">
              <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" />
            </clipPath>
            <g clip-path="url(#login-lamp-mouth)">
              <circle class="lamp__tongue" cx="179.4" cy="172.6" r="18" />
            </g>
          </g>
          <g class="lamp__eyes">
            <path
              class="lamp__eye lamp__stroke"
              d="M115 135c0-5.523-5.82-10-13-10s-13 4.477-13 10"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              class="lamp__eye lamp__stroke"
              d="M241 135c0-5.523-5.82-10-13-10s-13 4.477-13 10"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </g>
        <defs>
          <linearGradient id="opening-shade" x1="35" y1="220" x2="295" y2="220" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stop-color="var(--shade)" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="base-shading" x1="85" y1="444" x2="245" y2="444" gradientUnits="userSpaceOnUse">
            <stop stop-color="var(--b-1)" />
            <stop offset="0.8" stop-color="var(--b-2)" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="side-shading" x1="119" y1="430" x2="245" y2="430" gradientUnits="userSpaceOnUse">
            <stop stop-color="var(--b-3)" />
            <stop offset="1" stop-color="var(--b-4)" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="post-shading" x1="150" y1="288" x2="180" y2="288" gradientUnits="userSpaceOnUse">
            <stop stop-color="var(--b-1)" />
            <stop offset="1" stop-color="var(--b-2)" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="light" x1="165.5" y1="218.5" x2="165.5" y2="483.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="var(--l-1)" stop-opacity=".2" />
            <stop offset="1" stop-color="var(--l-2)" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="top-shading" x1="56" y1="110" x2="295" y2="110" gradientUnits="userSpaceOnUse">
            <stop stop-color="var(--t-1)" stop-opacity=".8" />
            <stop offset="1" stop-color="var(--t-2)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <circle
          class="lamp__hit"
          cx="124"
          cy="347"
          r="66"
          fill="#C4C4C4"
          fill-opacity=".1"
          @pointerdown="startPull"
          @pointermove="movePull"
          @pointerup="finishPull"
          @pointercancel="cancelPull"
          @click="toggleLamp"
        />
      </svg>

      <section
        class="welcome-copy"
        :class="{ 'welcome-muted': lampOn }"
        aria-label="学习平台介绍"
      >
        <p class="welcome-instruction">Pull the lamp cord to access the system</p>
      </section>

      <div class="login-form" :class="{ active: lampOn }">
        <h2>{{ activeTab === 'login' ? '登录' : '注册' }}</h2>
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="登录" name="login">
            <el-form
              :rules="loginRules"
              :model="loginForm"
              label-width="auto"
              label-position="top"
            >
              <el-form-item label="学号" prop="studentId">
                <el-input
                  v-model="loginForm.studentId"
                  :prefix-icon="User"
                  placeholder="请输入学号"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="loginForm.password"
                  :prefix-icon="Lock"
                  placeholder="请输入密码"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" class="full-width-btn" @click="handleLogin">
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="注册" name="register">
            <el-form
              :rules="registerRules"
              :model="registerForm"
              label-width="auto"
              label-position="top"
            >
              <el-form-item label="学号" prop="studentId">
                <el-input
                  v-model="registerForm.studentId"
                  :prefix-icon="User"
                  placeholder="请输入学号"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="registerForm.password"
                  :prefix-icon="Lock"
                  placeholder="请输入密码"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="姓名" prop="name">
                <el-input v-model="registerForm.name" placeholder="请输入姓名" />
              </el-form-item>
              <el-form-item label="班级" prop="class_name">
                <el-input
                  v-model="registerForm.class_name"
                  placeholder="请输入班级"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" class="full-width-btn" @click="handleRegister">
                  注册
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <footer class="login-footer">© 2026 维克多学习平台 · 智前端 Elearning</footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { apiPostLogin, apiPostRegister } from '@/api/user'
import router from '../../router'
import { ElMessage } from 'element-plus'

const activeTab = ref('login')
const lampOn = ref(false)
const cordPulled = ref(false)
const isPulling = ref(false)
const pullStart = ref({ x: 0, y: 0 })
const cordEnd = ref({ x: 124, y: 348 })
const hue = ref(320)

const lampVars = computed(() => {
  const on = lampOn.value ? 1 : 0

  return {
    '--on': on,
    '--shade-hue': hue.value,
    '--glow-color': `hsl(${hue.value}, 40%, 45%)`,
    '--glow-color-dark': `hsl(${hue.value}, 40%, 35%)`,
  }
})

// 登录表单
const loginForm = ref({
  studentId: '',
  password: '',
})

const loginRules = {
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// 注册表单
const registerForm = ref({
  studentId: '',
  password: '',
  name: '',
  class_name: '',
})

const registerRules = {
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  class_name: [{ required: true, message: '请输入班级', trigger: 'blur' }],
}

const toggleLamp = () => {
  if (isPulling.value) return
  lampOn.value = !lampOn.value
  hue.value = Math.floor(Math.random() * 360)
}

const startPull = event => {
  isPulling.value = true
  pullStart.value = { x: event.clientX, y: event.clientY }
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

const movePull = event => {
  if (!isPulling.value) return

  const x = 124 + (event.clientX - pullStart.value.x) * 0.28
  const y = 348 + Math.max(0, event.clientY - pullStart.value.y) * 0.45
  cordEnd.value = {
    x: Math.min(176, Math.max(72, x)),
    y: Math.min(420, Math.max(348, y)),
  }
}

const finishPull = event => {
  if (!isPulling.value) return

  const distance = Math.hypot(
    event.clientX - pullStart.value.x,
    event.clientY - pullStart.value.y,
  )
  isPulling.value = false
  cordPulled.value = true
  cordEnd.value = { x: 124, y: 348 }

  window.setTimeout(() => {
    cordPulled.value = false
  }, 250)

  if (distance > 30) {
    toggleLamp()
  }
}

const cancelPull = () => {
  isPulling.value = false
  cordEnd.value = { x: 124, y: 348 }
}

// 登录按钮点击事件
const handleLogin = async () => {
  try {
    const {
      data: { jwt, authority },
    } = await apiPostLogin(loginForm.value)
    localStorage.setItem('token', jwt)
    localStorage.setItem('authority', authority)
    router.push('/')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  }
}

// 注册按钮点击事件
const handleRegister = async () => {
  try {
    await apiPostRegister(registerForm.value)
    ElMessage.success('注册成功，请登录')
    activeTab.value = 'login'
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '注册失败')
  }
}
</script>

<style lang="scss" scoped>
.login-bk {
  --cord: hsl(210, 0%, calc((40 + (var(--on, 0) * 50)) * 1%));
  --opening: hsl(
    50,
    calc((10 + (var(--on, 0) * 80)) * 1%),
    calc((20 + (var(--on, 0) * 70)) * 1%)
  );
  --feature: #0a0a0a;
  --accent: 210;
  --tongue: #e06952;
  --base-top: hsl(var(--accent), 0%, calc((40 + (var(--on, 0) * 40)) * 1%));
  --base-side: hsl(var(--accent), 0%, calc((20 + (var(--on, 0) * 40)) * 1%));
  --post: hsl(var(--accent), 0%, calc((20 + (var(--on, 0) * 40)) * 1%));
  --b-1: hsla(45, 0%, calc((50 + (var(--on, 0) * 50)) * 1%), 0.85);
  --b-2: hsla(45, 0%, calc((20 + (var(--on, 0) * 30)) * 1%), 0.25);
  --b-3: hsla(45, 0%, calc((20 + (var(--on, 0) * 30)) * 1%), 0.5);
  --b-4: hsla(45, 0%, calc((20 + (var(--on, 0) * 30)) * 1%), 0.25);
  --l-1: hsla(45, calc((0 + (var(--on, 0) * 20)) * 1%), calc((50 + (var(--on, 0) * 50)) * 1%), 0.85);
  --l-2: hsla(45, calc((0 + (var(--on, 0) * 20)) * 1%), calc((50 + (var(--on, 0) * 50)) * 1%), 0.85);
  --t-1: hsl(var(--shade-hue), calc((0 + (var(--on, 0) * 20)) * 1%), calc((30 + (var(--on, 0) * 60)) * 1%));
  --t-2: hsl(var(--shade-hue), calc((0 + (var(--on, 0) * 20)) * 1%), calc((20 + (var(--on, 0) * 35)) * 1%));
  --t-3: hsl(var(--shade-hue), calc((0 + (var(--on, 0) * 20)) * 1%), calc((10 + (var(--on, 0) * 20)) * 1%));

  width: 100%;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 34px 20px 58px;
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.08), transparent 24%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.welcome-title {
  z-index: 2;
  margin: 0;
  color: #fff;
  font-size: clamp(29px, 3.7vw, 49px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.06em;
  text-align: center;
  pointer-events: none;
  text-shadow: 0 14px 34px rgba(0, 0, 0, 0.42);
}

.welcome-copy {
  width: min(560px, 100%);
  color: #fff;
  text-align: center;
  pointer-events: none;
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  animation: welcome-fade-in 0.8s ease-out both;
  transition:
    opacity 0.4s ease,
    transform 0.4s ease,
    visibility 0.4s ease;
}

.welcome-copy.welcome-muted {
  opacity: 0.42;
  transform: translateY(-4px);
}

.welcome-instruction {
  margin: 0;
  font-size: clamp(12px, 1.4vw, 14px);
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.62);
}

.login-shell {
  width: min(560px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 20px 0 0;
}

.lamp {
  width: clamp(210px, 34vmin, 320px);
  height: auto;
  overflow: visible;
  filter: drop-shadow(0 24px 34px rgba(0, 0, 0, 0.34));
}

.cord {
  stroke: var(--cord);
}

.cord--animated {
  display: none;
}

.cords {
  transform: translateX(-10px);
}

.cords.is-pulled .cord--animated {
  display: block;
  animation: cord-wave 0.22s ease-in-out;
}

.cords.is-pulled .cord--dummy {
  display: none;
}

.lamp__tongue {
  fill: var(--tongue);
}

.lamp__hit {
  cursor: pointer;
  opacity: 0;
  touch-action: none;
}

.lamp__feature {
  fill: var(--feature);
}

.lamp__stroke {
  stroke: var(--feature);
}

.lamp__mouth,
.lamp__light {
  opacity: var(--on, 0);
  transition: opacity 0.35s ease;
}

.lamp__eye {
  transform: rotate(180deg) translateY(50%);
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.35s ease;
}

.is-on .lamp__eye {
  transform: rotate(0deg) translateY(0);
}

.shade__opening {
  fill: var(--opening);
}

.shade__opening-shade {
  opacity: calc(1 - var(--on, 0));
  transition: opacity 0.35s ease;
}

.post__body {
  fill: var(--post);
}

.base__top {
  fill: var(--base-top);
}

.base__side {
  fill: var(--base-side);
}

.top__body {
  fill: var(--t-3);
}

.login-form {
  width: min(360px, 100%);
  max-height: 0;
  min-height: 0;
  margin-top: 0;
  padding: 0 26px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 18px;
  background: rgba(12, 18, 27, 0.68);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0);
  backdrop-filter: blur(16px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: scale(0.96) translateY(18px);
  transition:
    opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    max-height 0.45s ease,
    margin-top 0.35s ease,
    padding 0.35s ease,
    visibility 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

.login-form.active {
  max-height: 560px;
  margin-top: 2px;
  padding: 24px 26px 22px;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: scale(1) translateY(0);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.38),
    0 0 26px color-mix(in srgb, var(--glow-color) 58%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.login-form h2 {
  margin: 0 0 12px;
  color: #fff;
  font-family: monospace;
  font-size: 28px;
  text-align: center;
  text-shadow: 0 0 8px var(--glow-color);
}

.login-footer {
  position: absolute;
  left: 50%;
  bottom: 18px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  pointer-events: none;
  transform: translateX(-50%);
}

.login-tabs {
  width: 100%;
}

.full-width-btn {
  width: 100%;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.12);
}

:deep(.el-tabs__item) {
  color: #9ca3af;
  font-weight: 600;
}

:deep(.el-tabs__item.is-active),
:deep(.el-form-item__label) {
  color: #fff;
  text-shadow: 0 0 5px var(--glow-color);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--glow-color);
  box-shadow: 0 0 10px var(--glow-color);
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: none;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--glow-color);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 10px var(--glow-color);
}

:deep(.el-input__inner) {
  color: #fff;
}

:deep(.el-input__inner::placeholder),
:deep(.el-input__prefix) {
  color: #7c8087;
}

:deep(.el-button--primary) {
  height: 44px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--glow-color), var(--glow-color-dark));
  font-weight: 700;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

:deep(.el-button--primary:hover),
:deep(.el-button--primary:focus) {
  transform: translateY(-2px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.3),
    0 0 20px var(--glow-color);
}

@keyframes cord-wave {
  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(8px);
  }
}

@keyframes welcome-fade-in {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 760px) {
  .login-bk {
    justify-content: center;
    padding: 28px 16px 54px;
  }

  .welcome-title {
    width: min(360px, 100%);
    font-size: 27px;
    line-height: 1.22;
  }

  .welcome-copy {
    width: min(360px, 100%);
  }

  .welcome-instruction {
    font-size: 12px;
  }

  .login-shell {
    gap: 14px;
    padding-top: 18px;
  }

  .lamp {
    width: min(58vw, 238px);
  }

  .login-form {
    width: min(340px, 100%);
  }

  .login-form.active {
    padding: 22px 22px 20px;
  }

  .login-form h2 {
    font-size: 26px;
  }

  .login-footer {
    width: calc(100% - 32px);
    bottom: 14px;
    font-size: 12px;
  }
}
</style>
