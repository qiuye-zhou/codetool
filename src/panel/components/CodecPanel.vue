<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  encode: (input: string) => string
  decode: (input: string) => string
  encodeLabel?: string
  decodeLabel?: string
  inputPlaceholder?: string
  outputPlaceholder?: string
}>()

type Mode = 'encode' | 'decode'
const mode = ref<Mode>('encode')
const input = ref('')
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

const result = computed(() => {
  const src = input.value
  if (!src) return { out: '', err: '' }
  try {
    const out = mode.value === 'encode' ? props.encode(src) : props.decode(src)
    return { out, err: '' }
  } catch (e) {
    return { out: '', err: (e as Error).message }
  }
})

function setMode(m: Mode) {
  mode.value = m
}

function swap() {
  const out = result.value.out
  if (!out) return
  // 把输出填回输入并翻转方向，形成可往返的交换
  input.value = out
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}

async function copyOutput() {
  if (!result.value.out) return
  try {
    await navigator.clipboard.writeText(result.value.out)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => (copied.value = false), 1200)
  } catch {
    // 忽略剪贴板错误
  }
}

function clearAll() {
  input.value = ''
}

// 快捷键：仅在面板内生效
function onKeydown(e: KeyboardEvent) {
  const ctrl = e.ctrlKey || e.metaKey
  if (!ctrl || e.altKey) return
  if (e.shiftKey && (e.key === 'S' || e.key === 's')) {
    e.preventDefault()
    swap()
  } else if (e.shiftKey && (e.key === 'C' || e.key === 'c')) {
    e.preventDefault()
    copyOutput()
  } else if (e.shiftKey && (e.key === 'L' || e.key === 'l')) {
    e.preventDefault()
    clearAll()
  } else if (e.shiftKey && e.key === 'Enter') {
    e.preventDefault()
    setMode('decode')
  } else if (!e.shiftKey && e.key === 'Enter') {
    e.preventDefault()
    setMode('encode')
  }
}
</script>

<template>
  <div class="h-full flex flex-col" @keydown="onKeydown">
    <slot name="options" />

    <div
      class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 p-3"
    >
      <!-- 输入区 -->
      <div class="flex flex-col min-h-0">
        <div
          class="flex items-center justify-between mb-1 text-xs text-slate-500 dark:text-slate-400"
        >
          <span>输入 Input</span>
          <span class="text-[10px]">{{ input.length }} 字符</span>
        </div>
        <textarea
          v-model="input"
          :placeholder="inputPlaceholder"
          spellcheck="false"
          class="flex-1 min-h-0 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 text-sm font-mono-code outline-none focus:border-blue-500 dark:focus:border-blue-400 transition"
        />
      </div>

      <!-- 中间控制列 -->
      <div
        class="flex md:flex-col items-center justify-center gap-2 md:py-6 md:px-1"
      >
        <div
          class="flex md:flex-col items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-700/60"
        >
          <button
            class="px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
            :class="
              mode === 'encode'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            "
            :title="encodeLabel || '编码 (Ctrl+Enter)'"
            @click="setMode('encode')"
          >
            {{ encodeLabel || '编码' }}
          </button>
          <button
            class="px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
            :class="
              mode === 'decode'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            "
            :title="decodeLabel || '解码 (Ctrl+Shift+Enter)'"
            @click="setMode('decode')"
          >
            {{ decodeLabel || '解码' }}
          </button>
        </div>

        <button
          class="p-2 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          title="交换输入输出 (Ctrl+Shift+S)"
          @click="swap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 md:rotate-90"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </button>

        <button
          class="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          :class="
            copied ? 'text-green-500' : 'text-slate-500 dark:text-slate-300'
          "
          title="复制输出 (Ctrl+Shift+C)"
          @click="copyOutput"
        >
          <svg
            v-if="!copied"
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </button>

        <button
          class="p-2 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          title="清空 (Ctrl+Shift+L)"
          @click="clearAll"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 6h18" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
        </button>
      </div>

      <!-- 输出区 -->
      <div class="flex flex-col min-h-0">
        <div
          class="flex items-center justify-between mb-1 text-xs text-slate-500 dark:text-slate-400"
        >
          <span>输出 Output</span>
          <span class="text-[10px]">{{ result.out.length }} 字符</span>
        </div>
        <textarea
          :value="result.out"
          :placeholder="outputPlaceholder"
          readonly
          spellcheck="false"
          class="flex-1 min-h-0 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 p-3 text-sm font-mono-code outline-none focus:border-blue-500 dark:focus:border-blue-400 transition"
          :class="result.err ? 'border-red-400 dark:border-red-500' : ''"
        />
        <div
          v-if="result.err"
          class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 h-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span class="truncate">{{ result.err }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
