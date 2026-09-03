<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue'

import TabBar from './components/TabBar.vue'

// 各功能标签页（懒加载）
const tabs = [
  {
    id: 'base64',
    label: 'Base64',
    component: defineAsyncComponent(() => import('./components/tabs/Base64Tab.vue')),
  },
  {
    id: 'url',
    label: 'URL',
    component: defineAsyncComponent(() => import('./components/tabs/UrlTab.vue')),
  },
  {
    id: 'unicode',
    label: 'Unicode',
    component: defineAsyncComponent(
      () => import('./components/tabs/UnicodeTab.vue'),
    ),
  },
  {
    id: 'html',
    label: 'HTML 实体',
    component: defineAsyncComponent(
      () => import('./components/tabs/HtmlEntityTab.vue'),
    ),
  },
  {
    id: 'hex',
    label: 'Hex',
    component: defineAsyncComponent(() => import('./components/tabs/HexTab.vue')),
  },
  {
    id: 'jwt',
    label: 'JWT 解析',
    component: defineAsyncComponent(() => import('./components/tabs/JwtTab.vue')),
  },
  {
    id: 'time',
    label: '时间戳',
    component: defineAsyncComponent(() => import('./components/tabs/TimeTab.vue')),
  },
  {
    id: 'hash',
    label: 'Hash 加密',
    component: defineAsyncComponent(() => import('./components/tabs/HashTab.vue')),
  },
  {
    id: 'radix',
    label: '进制转换',
    component: defineAsyncComponent(
      () => import('./components/tabs/RadixTab.vue'),
    ),
  },
]

// 当前激活的标签
const savedTab = localStorage.getItem('codetool:tab') || 'base64'
const activeId = ref(tabs.some((t) => t.id === savedTab) ? savedTab : 'base64')

const current = computed(
  () => tabs.find((t) => t.id === activeId.value) ?? tabs[0],
)

function selectTab(id: string) {
  activeId.value = id
}

watch(activeId, (val) => localStorage.setItem('codetool:tab', val))

// 主题
const isDark = ref(
  localStorage.getItem('codetool:theme') === 'dark' ||
    (localStorage.getItem('codetool:theme') === null &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches),
)

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
}
function toggleTheme() {
  isDark.value = !isDark.value
}
watch(isDark, (val) => {
  localStorage.setItem('codetool:theme', val ? 'dark' : 'light')
  applyTheme()
})

onMounted(() => {
  applyTheme()
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

// 全局快捷键：Alt+1..9 切换标签，Ctrl+Shift+D 切换主题
function onKeydown(e: KeyboardEvent) {
  if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
    const idx = parseInt(e.key, 10)
    if (idx >= 1 && idx <= tabs.length) {
      e.preventDefault()
      selectTab(tabs[idx - 1].id)
      return
    }
  }
  if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
    e.preventDefault()
    toggleTheme()
  }
}
</script>

<template>
  <div
    class="h-full flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100"
  >
    <!-- 顶栏 -->
    <header
      class="flex items-center gap-3 px-4 h-12 shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold font-mono-code shadow"
        >
          &lt;/&gt;
        </div>
        <div class="flex flex-col leading-none">
          <span class="text-sm font-semibold">CodeTool</span>
          <span class="text-[10px] text-slate-400">编码工具面板</span>
        </div>
      </div>
      <div class="flex-1" />
      <span class="text-[11px] text-slate-400 hidden sm:block">
        右键页面 → 打开编码工具面板
      </span>
      <button
        class="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        :title="isDark ? '切换浅色 (Ctrl+Shift+D)' : '切换深色 (Ctrl+Shift+D)'"
        @click="toggleTheme"
      >
        <!-- sun / moon icon -->
        <svg
          v-if="isDark"
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
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
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </header>

    <!-- 标签栏 -->
    <TabBar
      :tabs="tabs.map((t) => ({ id: t.id, label: t.label }))"
      :active-id="activeId"
      @select="selectTab"
    />

    <!-- 内容区 -->
    <main class="flex-1 min-h-0 overflow-hidden">
      <Transition name="fade" mode="out-in">
        <component :is="current.component" :key="current.id" />
      </Transition>
    </main>

    <!-- 底栏快捷键提示 -->
    <footer
      class="shrink-0 px-3 h-7 text-[11px] text-slate-400 flex items-center gap-3 border-t border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60"
    >
      <span><kbd>Alt+1~9</kbd> 切换标签</span>
      <span class="hidden md:inline"
        ><kbd>Ctrl+Enter</kbd> 编码 · <kbd>Ctrl+Shift+Enter</kbd> 解码</span
      >
      <span class="hidden md:inline"
        ><kbd>Ctrl+Shift+S</kbd> 交换 · <kbd>Ctrl+Shift+C</kbd> 复制 ·
        <kbd>Ctrl+Shift+L</kbd> 清空</span
      >
      <span class="flex-1 text-right">{{ current.label }}</span>
    </footer>
  </div>
</template>

<style scoped>
kbd {
  display: inline-block;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(148, 163, 184, 0.2);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  line-height: 16px;
}
.dark kbd {
  background: rgba(51, 65, 85, 0.6);
}
</style>
