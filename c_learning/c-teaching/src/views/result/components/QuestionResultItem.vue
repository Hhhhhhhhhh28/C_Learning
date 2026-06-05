<script setup>
import Stars from '@/components/Stars.vue'
import Tag from '@/components/Tag.vue'
import CircleProgress from '@/components/CircleProgress.vue'
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  option: { type: Object, required: true },
})
// 定义 model 时指定 modelValue 的类型，这里假设为字符串类型，可根据实际情况修改
const model = defineModel({
  type: String,
  default: undefined,
})
const getRadioClassName = key => {
  if (props.option.studentAnswer === key) {
    if (props.option.answer === key) {
      return 'right'
    } else {
      return 'error'
    }
  } else if (props.option.answer === key) {
    return 'right'
  } else {
    return ''
  }
}
</script>

<template>
  <div class="questionItem">
    <div class="info">
      <div class="type">{{ option.type === 'radio' ? '单选题' : '' }}</div>
      <div class="starBox">
        <div class="label">难度：</div>
        <Stars :num="option.difficulty" />
      </div>
      <div class="starBox">
        <div class="label">重点：</div>
        <Stars :num="option.hierarchy" />
      </div>

      <div class="tagBox">
        <Tag
          v-for="(item, index) in option.tags"
          :key="index"
          :text="item.tagName"
        />
      </div>
    </div>
    <div class="title">{{ option.title }}</div>
    <el-radio-group v-model="model" class="radioGroup">
      <el-radio
        v-for="(item, index) in option.option"
        :key="index"
        :class="getRadioClassName(item.key)"
        :label="item.value"
        :value="item.key"
      />
    </el-radio-group>

    <div class="analysisBox">
      <div class="top">
        <span>正确答案:{{ option.answer ?? option.fillAnswer }}</span>
        <span>你的答案:{{ option.studentAnswer }}</span>
      </div>
      <div>AI解析:{{ option.analysis }}</div>
    </div>
    <CircleProgress
      v-if="option.answer !== option.studentAnswer"
      class="progress"
      :size="44"
      :border-width="6"
      :progress="70"
      >!</CircleProgress
    >
    <CircleProgress
      v-else
      class="progress"
      :size="44"
      :border-width="6"
      :progress="70"
      color="#52c41a"
      ><el-icon><Check /></el-icon
    ></CircleProgress>
  </div>
</template>

<style scoped lang="scss">
.questionItem {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 22px;
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(124, 92, 255, 0.06)),
    rgba(12, 18, 27, 0.72);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.26),
    0 0 24px rgba(64, 158, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  padding: 28px;
  position: relative;
  color: #fff;
  backdrop-filter: blur(16px);
  .info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $padding-xxl;
    .type {
      background: linear-gradient(135deg, #409eff, #7c5cff);
      color: white;
      font-size: $font-size-xl;
      padding: $padding-s;
      border-radius: 9999px;
      box-shadow: 0 10px 24px rgba(64, 158, 255, 0.22);
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
    margin: $padding-xl 0;
    color: #fff;
    font-size: clamp(1.6rem, 2vw, 2.4rem);
    font-weight: 800;
    line-height: 1.45;
    text-shadow: 0 0 22px rgba(64, 158, 255, 0.16);
  }
  .radioGroup {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    width: 100%;
    padding-left: 0;
    pointer-events: none;
    .el-radio {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      flex: 0 0 auto;
      width: 100%;
      min-height: 54px;
      height: auto;
      max-width: 100%;
      margin-right: 0;
      padding: 13px 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      background: rgba(255, 255, 255, 0.055);
      color: rgba(255, 255, 255, 0.78);
      transform: none;
      position: static;
      :deep(.el-radio__input) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        min-width: 18px;
        height: 18px;
        margin-right: 12px;
        flex: 0 0 18px;
        .el-radio__inner::after {
          transform: translate(-50%, -50%) scale(1);
        }
      }
      :deep(.el-radio__inner) {
        box-sizing: border-box;
        width: 18px;
        height: 18px;
      }
      :deep(.el-radio__label) {
        display: block;
        flex: 1 1 auto;
        min-width: 0;
        padding-left: 0;
        color: rgba(255, 255, 255, 0.82);
        font-size: 16px;
        font-weight: 650;
        line-height: 1.6;
        white-space: normal;
        word-break: break-word;
      }
      &.error {
        border-color: rgba(245, 108, 108, 0.5);
        background: rgba(245, 108, 108, 0.14);
        :deep(.el-radio__input) {
          .el-radio__inner {
            background-color: #ff4d4f;
            border-color: #ff4d4f;
          }
        }
      }
      &.right {
        border-color: rgba(82, 196, 26, 0.5);
        background: rgba(82, 196, 26, 0.14);
        :deep(.el-radio__input) {
          .el-radio__inner {
            background-color: #52c41a;
            border-color: #52c41a;
          }
        }
      }
    }
  }
  .progress {
    position: absolute;
    top: 20px;
    right: 100px;
  }
  .analysisBox {
    font-size: $font-size-xl;
    border: 1px solid rgba(118, 183, 255, 0.14);
    border-radius: 18px;
    background: rgba(7, 11, 18, 0.38);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: 30px;
    color: rgba(255, 255, 255, 0.78);
    .top {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      color: #a8d2ff;
      font-weight: 800;
    }
  }
}

:global(.theme-light) .questionItem {
  border-color: var(--theme-border-color);
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(124, 92, 255, 0.05)),
    var(--theme-panel-bg);
  box-shadow: var(--theme-shadow);
  color: var(--theme-text-primary);

  .info {
    .starBox .label {
      color: var(--theme-text-secondary);
    }
  }

  .title {
    color: var(--theme-text-primary);
    text-shadow: none;
  }

  .radioGroup .el-radio {
    border-color: var(--theme-border-color);
    background: var(--theme-card-bg);
    color: var(--theme-text-secondary);

    :deep(.el-radio__label) {
      color: var(--theme-text-secondary);
    }

    &.error {
      border-color: rgba(196, 29, 29, 0.3);
      background: rgba(196, 29, 29, 0.08);
    }

    &.right {
      border-color: rgba(35, 120, 4, 0.28);
      background: rgba(35, 120, 4, 0.08);
    }
  }

  .analysisBox {
    border-color: var(--theme-border-color);
    background: var(--theme-card-bg);
    color: var(--theme-text-secondary);

    .top {
      color: var(--theme-text-accent);
    }
  }
}

@media screen and (max-width: 768px) {
  .questionItem {
    padding: $padding-m;

    .info {
      flex-wrap: wrap;
      gap: $padding-s;

      .type {
        font-size: $font-size-m;
      }

      .starBox {
        .label {
          font-size: $font-size-xl;
        }
      }

      .tagBox {
        flex-wrap: wrap;
      }
    }

    .title {
      font-size: $font-size-xl;
      margin: $padding-m 0;
    }

    .radioGroup {
      padding-left: 0;
    }

    .analysisBox {
      padding: $padding-m;
      font-size: $font-size-xl;
      margin-top: $padding-m;

      .top {
        flex-direction: column;
        gap: $padding-s;
      }
    }

    .progress {
      top: 10px;
      right: 10px;
    }
  }
}
</style>
