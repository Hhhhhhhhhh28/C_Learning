<script setup></script>

<template>
  <div class="title">
    <span>👋</span>
    <span>你好，我是你的ai助手</span>
  </div>
</template>

<style scoped lang="scss">
@mixin talk-body {
  flex: 1;
  padding: $padding-xl;
  display: flex;
  flex-direction: column;
  gap: 50px;
  overflow-y: auto;
}
.talk-none {
  @include talk-body();
  .title {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: $font-size-xl;
  }
}
</style>
