<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { parseTimeInput, nowSnapshot, type TimeInfo } from '../../utils/time'

const input = ref('')

const info = computed<TimeInfo>(() => parseTimeInput(input.value))

// 实时当前时间
const now = ref<TimeInfo>(nowSnapshot())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => (now.value = nowSnapshot()), 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const DETECT_LABEL: Record<string, string> = {
  'unix-seconds': 'Unix 秒',
  'unix-ms': 'Unix 毫秒',
  date: '日期字符串',
  unknown: '未识别',
}

const ROWS = computed(() => {
  const i = info.value
  if (!i.date) return []
  return [
    { label: 'Unix 秒', value: String(i.unixSeconds) },
    { label: 'Unix 毫秒', value: String(i.unixMs) },
    { label: 'ISO 8601', value: i.iso ?? '' },
    { label: '本地时间', value: i.local ?? '' },
    { label: 'UTC', value: i.utc ?? '' },
    { label: '相对', value: i.relative ?? '' },
  ]
})

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

function useNow() {
  input.value = String(Math.floor(Date.now() / 1000))
}
</script>

<template>
  <div class="h-full flex flex-col p-3 gap-2">
    <!-- 输入 -->
    <div class="flex flex-col gap-1">
      <div
        class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
      >
        <span>输入时间戳或日期</span>
        <button
          class="text-blue-600 dark:text-blue-400 hover:underline"
          @click="useNow"
        >
          使用当前 Unix 秒
        </button>
      </div>
      <div class="flex gap-2">
        <input
          v-model="input"
          spellcheck="false"
          placeholder="如 1717200000、1717200000000 或 2026-01-01T12:00:00Z"
          class="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono-code outline-none focus:border-blue-500 dark:focus:border-blue-400 transition"
        />
      </div>
    </div>

    <!-- 当前时间参考 + 识别结果 -->
    <div
      class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400"
    >
      <span>当前：{{ now.unixSeconds }}（秒） / {{ now.unixMs }}（毫秒）</span>
      <span class="text-slate-400 dark:text-slate-500">{{ now.local }}</span>
      <span
        v-if="info.detected !== 'unknown'"
        class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      >
        识别为 {{ DETECT_LABEL[info.detected] }}
      </span>
    </div>

    <div
      v-if="info.error"
      class="text-xs text-red-500 dark:text-red-400"
    >
      {{ info.error }}
    </div>

    <!-- 结果卡片 -->
    <div class="flex-1 min-h-0 overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div
        v-for="row in ROWS"
        :key="row.label"
        class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex flex-col"
      >
        <div
          class="flex items-center justify-between px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700/50"
        >
          <span>{{ row.label }}</span>
          <button
            class="text-blue-600 dark:text-blue-400 hover:underline"
            @click="(e) => copy(row.value, e)"
          >
            复制
          </button>
        </div>
        <code
          class="px-3 py-2 text-sm font-mono-code text-slate-700 dark:text-slate-200 break-all"
          >{{ row.value }}</code
        >
      </div>
    </div>
  </div>
</template>
