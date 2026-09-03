<script setup lang="ts">
import { ref } from 'vue'
import CodecPanel from '../CodecPanel.vue'
import { htmlEncode, htmlDecode, type HtmlEncodeMode } from '../../utils/codec'

const mode = ref<HtmlEncodeMode>('named')
const encoder = (s: string) => htmlEncode(s, mode.value)
const decoder = (s: string) => htmlDecode(s)
</script>

<template>
  <CodecPanel
    :encode="encoder"
    :decode="decoder"
    encode-label="编码 →"
    decode-label="← 解码"
    input-placeholder="输入文本或 HTML 实体字符串..."
    output-placeholder="HTML 实体结果..."
  >
    <template #options>
      <div
        class="px-3 pt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
      >
        <span>编码方式：</span>
        <label class="flex items-center gap-1 cursor-pointer">
          <input
            v-model="mode"
            type="radio"
            value="named"
            class="accent-blue-500"
          />
          命名实体 <code class="text-[10px]">&amp;lt;</code>
        </label>
        <label class="flex items-center gap-1 cursor-pointer">
          <input
            v-model="mode"
            type="radio"
            value="numeric"
            class="accent-blue-500"
          />
          数字实体 <code class="text-[10px]">&amp;#123;</code>
        </label>
      </div>
    </template>
  </CodecPanel>
</template>
