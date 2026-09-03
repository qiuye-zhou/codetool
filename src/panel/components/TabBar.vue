<script setup lang="ts">
defineProps<{
  tabs: { id: string; label: string }[]
  activeId: string
}>()

const emit = defineEmits<{ (e: 'select', id: string): void }>()
</script>

<template>
  <nav
    class="shrink-0 flex items-stretch gap-1 px-2 h-10 overflow-x-auto border-b border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60"
  >
    <button
      v-for="t in tabs"
      :key="t.id"
      class="relative px-3 my-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center cursor-pointer"
      :class="
        t.id === activeId
          ? 'bg-blue-500 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
      "
      @click="emit('select', t.id)"
    >
      {{ t.label }}
    </button>
  </nav>
</template>
