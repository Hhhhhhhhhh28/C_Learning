<template>
  <div class="my-page">
    <HeaderCm />
    <MyMain />
  </div>
</template>

<script setup>
import HeaderCm from '@/components/HeaderCm.vue'
import MyMain from '@/views/my/components/MyMain.vue'
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  padding-bottom: 56px;
  background:
    radial-gradient(circle at 18% 0%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 82% 20%, rgba(207, 92, 255, 0.12), transparent 24%),
    linear-gradient(180deg, #0f1724 0%, #101923 46%, #070b12 100%);
  color: #fff;
}

.my-page :deep(.header) {
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

.my-page :deep(.logo) {
  color: #fff;
  text-shadow: 0 0 18px rgba(64, 158, 255, 0.42);
}

.my-page :deep(nav li),
.my-page :deep(.user span) {
  color: rgba(255, 255, 255, 0.78);
}

.my-page :deep(nav li:hover),
.my-page :deep(nav li.active) {
  color: #76b7ff;
}

@media screen and (max-width: 768px) {
  .my-page :deep(.header) {
    width: calc(100% - 20px);
    height: auto;
    min-height: 64px;
    margin-top: 10px;
    padding: 12px;
    gap: 12px;
  }
}
</style>
