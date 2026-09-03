<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  RADIX_FIELDS,
  parseBig,
  formatBig,
  type RadixBase,
} from '../../utils/radix'

const values = reactive<Record<RadixBase, string>>({
  2: '',
  8: '',
  10: '',
  16: '',
})
const error = ref('')

function onInput(base: RadixBase, val: string) {
  values[base] = val
  const trimmed = val.trim()
  if (!trimmed) {
    error.value = ''
    for (const f of RADIX_FIELDS) if (f.base !== base) values[f.base] = ''
    return
  }
  try {
    const big = parseBig(val, base)
    error.value = ''
    for (const f of RADIX_FIELDS) {
      if (f.base !== base) values[f.base] = formatBig(big, f.base)
    }
  } catch (e) {
    error.value = (e as Error).message
  }
}

async function copy(text: string, e: MouseEvent) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    const btn = e.currentTarget as HTMLElement
    const orig = btn.textContent
    btn.textContent = '已复制'
    setTimeout(() => (btn.textContent = orig), 1000)
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div class="h-full flex flex-col p-3 gap-2">
    <div
      class="text-xs text-slate-500 dark:text-slate-400"
    >
      在任意一个框中输入数字，其它进制自动同步（任意精度，支持负数）。
    </div>

    <div
      v-if="error"
      class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {{ error }}
    </div>

    <div class="flex-1 min-h-0 overflow-auto grid grid-cols-1 gap-2">
      <div
        v-for="f in RADIX_FIELDS"
        :key="f.base"
        class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex flex-col"
      >
        <div
          class="flex items-center justify-between px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700/50"
        >
          <span>{{ f.label }}</span>
          <button
            class="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-30 cursor-pointer"
            :disabled="!values[f.base]"
            @click="(e) => copy(values[f.base], e)"
          >
            复制
          </button>
        </div>
        <input
          :value="values[f.base]"
          spellcheck="false"
          :placeholder="`输入 ${f.label}`"
          class="px-3 py-2 text-sm font-mono-code bg-transparent outline-none text-slate-700 dark:text-slate-200"
          @input="onInput(f.base, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
