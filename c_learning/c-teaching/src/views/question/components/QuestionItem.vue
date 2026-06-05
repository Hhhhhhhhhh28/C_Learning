<script setup>
import Stars from '@/components/Stars.vue'
import { onMounted, watch, ref } from 'vue'

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
  spentTime: {
    type: Number,
    required: false,
  },
  resetTimer: {
    type: Function,
    required: false,
  },
  isLastQuestion: {
    type: Boolean,
    default: false,
  },
  currentQuestionNumber: {
    type: Number,
    default: 0,
  },
  totalQuestionCount: {
    type: Number,
    default: 0,
  },
  disabled: Boolean,
})
// 定义 model，指定 modelValue 的类型为字符串，因为在模板中使用的是单选框，值通常为字符串类型
const model = defineModel({
  type: String,
  required: false,
})
const options = ref('')
watch(
  () => props.option,
  (newVal, _oldVal) => {
    if (newVal.id) {
      if (newVal.topicType == 0) {
        options.value = newVal
      } else {
        let info = { ...newVal }
        let title = info.title.split('\\\\n')
        title.forEach((item, index) => {
          title[index] = item.replace(/\\\\\\"/g, '')
          title[index] = item.replace('```', '')
          title[index] = item.replace(/\\\\\\/g, '')
          title[index] = item.replace(/\\\\/g, '')
          title[index] = item.replace(/\\/g, '')
        })
        options.value = {
          ...info,
          title: title,
        }
      }
    }
  },
  {
    immediate: true,
  },
)
onMounted(() => {})
</script>

<template>
  <div class="questionItem">
    <div class="info">
      <div class="questionMeta">
        <div class="type">单选题</div>
        <div class="questionNumber">
          第 {{ currentQuestionNumber || 0 }} / {{ totalQuestionCount || 0 }} 题
        </div>
      </div>
      <div class="starBox">
        <div class="label">难度：</div>
        <Stars :num="options?.difficulty" />
      </div>
      <div class="starBox">
        <div class="label">重点：</div>
        <Stars :num="options?.hierarchy" />
      </div>
      <!-- <div class="tagBox">
        <Tag :text="option?.knowPointName" />
      </div> -->
    </div>

    <div>
      <div class="title">{{ options?.title }}</div>
      <el-radio-group v-model="model" class="radioGroup" :disabled="disabled">
        <el-radio
          v-for="(item, index) in options?.option"
          :key="index"
          :label="item.key + ':  ' + item.value"
          :value="item.key"
        />
      </el-radio-group>
    </div>
    <slot> </slot>
  </div>
</template>

<style scoped lang="scss">
.questionItem {
  width: min(100%, 980px);
  min-height: 520px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.12), rgba(124, 92, 255, 0.07)),
    rgba(12, 18, 27, 0.72);
  box-shadow:
    0 28px 80px rgba(0, 0, 0, 0.28),
    0 0 34px rgba(64, 158, 255, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  padding: 32px;
  color: #fff;
  backdrop-filter: blur(18px);
  .info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $padding-xxl;
    .questionMeta {
      display: inline-flex;
      align-items: center;
      gap: $padding-m;
      flex-shrink: 0;
    }
    .type {
      background: linear-gradient(135deg, #409eff, #7c5cff);
      color: white;
      font-size: $font-size-xl;
      padding: $padding-s;
      border-radius: 9999px;
      box-shadow: 0 10px 24px rgba(64, 158, 255, 0.22);
    }
    .questionNumber {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 4px 10px;
      border: 1px solid rgba(64, 158, 255, 0.32);
      border-radius: 9999px;
      background: rgba(64, 158, 255, 0.14);
      color: #a8d2ff;
      font-size: $font-size-l;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .starBox {
      display: flex;
      align-items: center;
      .label {
        color: rgba(255, 255, 255, 0.72);
        font-size: $font-size-xxl;
      }
    }
    .tagBox {
      display: flex;
      align-items: center;
      gap: $padding-s;
    }
  }
  .title {
    margin: 34px 0 24px;
    color: #fff;
    font-size: clamp(2rem, 2.5vw, 3rem);
    font-weight: 800;
    line-height: 1.35;
    text-shadow: 0 0 24px rgba(64, 158, 255, 0.18);
  }
  .radioGroup {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: start;
    width: 100%;
    padding-left: 0;
  }

  :deep(.el-radio) {
    width: 100%;
    min-height: 58px;
    height: auto;
    margin-right: 0;
    padding: 14px 16px;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.055);
    color: rgba(255, 255, 255, 0.78);
    transition:
      transform 0.25s ease,
      border-color 0.25s ease,
      background 0.25s ease,
      box-shadow 0.25s ease;
  }

  :deep(.el-radio:hover) {
    transform: translateY(-2px);
    border-color: rgba(118, 183, 255, 0.38);
    background: rgba(64, 158, 255, 0.11);
    box-shadow: 0 12px 26px rgba(64, 158, 255, 0.12);
  }

  :deep(.el-radio.is-checked) {
    border-color: rgba(118, 183, 255, 0.58);
    background:
      linear-gradient(135deg, rgba(64, 158, 255, 0.22), rgba(124, 92, 255, 0.15)),
      rgba(255, 255, 255, 0.08);
    box-shadow:
      0 14px 32px rgba(64, 158, 255, 0.2),
      0 0 20px rgba(124, 92, 255, 0.16);
  }

  :deep(.el-radio__label) {
    color: rgba(255, 255, 255, 0.82);
    font-size: 16px;
    font-weight: 650;
    line-height: 1.6;
    white-space: normal;
  }

  :deep(.el-radio.is-checked .el-radio__label) {
    color: #fff;
  }

  :deep(.el-radio__inner) {
    border-color: rgba(255, 255, 255, 0.35);
    background: rgba(7, 11, 18, 0.8);
  }

  :deep(.el-radio__input.is-checked .el-radio__inner) {
    border-color: #76b7ff;
    background: #409eff;
  }
}
.submit {
  position: absolute;
  top: 270px;
  left: 40px;
}
.result {
  position: absolute;
  top: 260px;
  width: 100%;
  height: 100px;
  padding: $padding-xl;
  margin-top: $padding-xl;
  font-size: $margin-l;
  line-height: 25px;
  margin-top: 50px;
}
.title_item {
  margin-bottom: 4px;
}
.Answer {
  display: flex;
  align-items: center;
  gap: $padding-s;
  margin-top: 20px;
}
.answerInput {
  width: 300px;
}

@media screen and (max-width: 768px) {
  .questionItem {
    width: 100%;
    min-height: auto;
    padding: 20px;

    .info {
      flex-wrap: wrap;
      gap: 8px;

      .questionMeta {
        gap: 8px;
      }

      .type {
        font-size: 14px;
      }

      .questionNumber {
        font-size: 14px;
      }

      .starBox {
        .label {
          font-size: 14px;
        }
      }
    }

    .title {
      font-size: 16px;
      margin: 16px 0;
    }

    .radioGroup {
      padding-left: 0;
    }
  }
}
</style>
