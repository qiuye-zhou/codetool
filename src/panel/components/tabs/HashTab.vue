<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { HASH_ALGOS, hashAll, type HashAlgo } from '../../utils/hash'

const input = ref('')
const debounced = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

watch(input, (v) => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (debounced.value = v), 150)
})

const results = computed<Record<HashAlgo, string>>(() =>
  debounced.value ? hashAll(debounced.value) : ({} as Record<HashAlgo, string>),
)

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
    <!-- 输入 -->
    <div class="flex flex-col gap-1 flex-1 min-h-0">
      <div
        class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
      >
        <span>输入文本（按 UTF-8 编码计算）</span>
        <span class="text-[10px]">{{ input.length }} 字符</span>
      </div>
      <textarea
        v-model="input"
        spellcheck="false"
        placeholder="输入要计算哈希的文本..."
        class="flex-1 min-h-0 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 text-sm font-mono-code outline-none focus:border-blue-500 dark:focus:border-blue-400 transition"
      />
    </div>

    <!-- 结果 -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[45%] overflow-auto"
    >
      <div
        v-for="algo in HASH_ALGOS"
        :key="algo.algo"
        class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex flex-col"
      >
        <div
          class="flex items-center justify-between px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700/50"
        >
          <span
            >{{ algo.label }}
            <span class="text-slate-400">/{{ algo.bitLength }}</span></span
          >
          <button
            class="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-30 cursor-pointer"
            :disabled="!results[algo.algo]"
            @click="(e) => copy(results[algo.algo], e)"
          >
            复制
          </button>
        </div>
        <code
          class="px-3 py-1.5 text-xs font-mono-code text-slate-700 dark:text-slate-200 break-all min-h-10 flex items-center"
        >
          {{ results[algo.algo] || '—' }}
        </code>
      </div>
    </div>
  </div>
</template>
