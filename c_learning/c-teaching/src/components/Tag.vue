<script setup>
const props = defineProps({
  text: { type: String, required: true },
})
</script>

<template>
  <div class="tag">{{ props.text }}</div>
</template>

<style scoped lang="scss">
.tag {
  display: inline-block;
  background-color: var(--theme-accent-soft, #e6f4ff);
  border: 1px solid var(--theme-border-strong, #bae0ff);
  border-radius: 4px;
  padding: $padding-s;
  color: var(--theme-text-accent, $primary-color);
}
</style>
