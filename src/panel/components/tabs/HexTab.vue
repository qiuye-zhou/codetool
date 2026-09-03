<script setup lang="ts">
import { ref } from 'vue'
import CodecPanel from '../CodecPanel.vue'
import { hexEncode, hexDecode } from '../../utils/codec'

type Sep = 'none' | 'space' | '0x'
const separator = ref<Sep>('space')

const sepValue = (s: Sep): '' | ' ' | '0x' =>
  s === 'space' ? ' ' : s === '0x' ? '0x' : ''

const encoder = (s: string) => hexEncode(s, sepValue(separator.value))
const decoder = (s: string) => hexDecode(s)
</script>

<template>
  <CodecPanel
    :encode="encoder"
    :decode="decoder"
    encode-label="转 Hex →"
    decode-label="← 转文本"
    input-placeholder="输入文本或十六进制字符串..."
    output-placeholder="十六进制结果（UTF-8）..."
  >
    <template #options>
      <div
        class="px-3 pt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
      >
        <span>字节分隔：</span>
        <label class="flex items-center gap-1 cursor-pointer">
          <input
            v-model="separator"
            type="radio"
            value="space"
            class="accent-blue-500"
          />
          空格 <code class="text-[10px]">e4 bd a0</code>
        </label>
        <label class="flex items-center gap-1 cursor-pointer">
          <input
            v-model="separator"
            type="radio"
            value="0x"
            class="accent-blue-500"
          />
          0x 前缀 <code class="text-[10px]">0xe4 0xbd</code>
        </label>
        <label class="flex items-center gap-1 cursor-pointer">
          <input
            v-model="separator"
            type="radio"
            value="none"
            class="accent-blue-500"
          />
          无分隔 <code class="text-[10px]">e4bda0</code>
        </label>
      </div>
    </template>
  </CodecPanel>
</template>
