<script setup lang="ts">
import { ref, computed } from 'vue'
import { decodeJwt, getJwtExpiry, type JwtDecoded } from '../../utils/jwt'

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const token = ref('')

const decoded = computed<{ data: JwtDecoded | null; error: string }>(() => {
  const t = token.value.trim()
  if (!t) return { data: null, error: '' }
  try {
    return { data: decodeJwt(t), error: '' }
  } catch (e) {
    return { data: null, error: (e as Error).message }
  }
})

const expiry = computed(() =>
  decoded.value.data ? getJwtExpiry(decoded.value.data.payload.parsed) : null,
)

async function copy(text: string, e?: MouseEvent) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    const btn = e?.currentTarget as HTMLElement | undefined
    if (btn) {
      const orig = btn.dataset.label || btn.textContent || ''
      btn.dataset.label = orig
      btn.textContent = '已复制'
      setTimeout(() => (btn.textContent = orig), 1000)
    }
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div class="h-full flex flex-col p-3 gap-2">
    <!-- 输入区 -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>JWT Token</span>
        <button
          class="text-blue-600 dark:text-blue-400 hover:underline"
          @click="token = SAMPLE"
        >
          填入示例
        </button>
      </div>
      <textarea
        v-model="token"
        spellcheck="false"
        placeholder="粘贴 JWT（形如 xxxxx.yyyyy.zzzzz）..."
        class="w-full h-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 text-sm font-mono-code outline-none focus:border-blue-500 dark:focus:border-blue-400 transition"
      />
    </div>

    <div
      v-if="decoded.error"
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
      {{ decoded.error }}
    </div>

    <!-- 结果区 -->
    <div
      v-if="decoded.data"
      class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-2 overflow-auto"
    >
      <!-- Header -->
      <section
        class="flex flex-col min-h-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700/50"
        >
          <span>Header</span>
          <button class="text-blue-600 dark:text-blue-400 hover:underline" @click="(e) => copy(decoded.data!.header.json, e)">
            复制
          </button>
        </div>
        <pre
          class="flex-1 overflow-auto p-3 text-xs font-mono-code text-slate-700 dark:text-slate-200"
          >{{ decoded.data.header.json || decoded.data.header.error }}</pre
        >
      </section>

      <!-- Payload -->
      <section
        class="flex flex-col min-h-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700/50"
        >
          <span>Payload</span>
          <button class="text-blue-600 dark:text-blue-400 hover:underline" @click="(e) => copy(decoded.data!.payload.json, e)">
            复制
          </button>
        </div>
        <pre
          class="flex-1 overflow-auto p-3 text-xs font-mono-code text-slate-700 dark:text-slate-200"
          >{{ decoded.data.payload.json || decoded.data.payload.error }}</pre
        >
      </section>

      <!-- Signature + 状态 -->
      <section
        class="lg:col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700/50"
        >
          <span>Signature（Hex）</span>
          <button class="text-blue-600 dark:text-blue-400 hover:underline" @click="(e) => copy(decoded.data!.signature, e)">
            复制
          </button>
        </div>
        <div class="px-3 py-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
          <code class="font-mono-code text-slate-700 dark:text-slate-200 break-all">
            {{ decoded.data.signature || '（无签名段）' }}
          </code>
          <span
            v-if="expiry"
            class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
            :class="
              expiry.status.startsWith('已过期')
                ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            "
          >
            {{ expiry.status }}
          </span>
        </div>
      </section>
    </div>

    <div
      v-else-if="!decoded.error"
      class="flex-1 flex items-center justify-center text-xs text-slate-400"
    >
      粘贴 JWT 后自动解析 Header / Payload / Signature
    </div>
  </div>
</template>
