<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  search: string
  tickets: any[]
}>()

const emit = defineEmits(['update:search'])

const stats = computed(() => ({
  total: props.tickets.length,
  open: props.tickets.filter(t => t.status === 'OPEN').length,
  inProgress: props.tickets.filter(t => t.status === 'IN_PROGRESS').length,
  resolved: props.tickets.filter(t => t.status === 'RESOLVED').length,
}))
</script>

<template>
  <header class="bg-white border-b px-6 py-3">
    <div class="flex items-center justify-between mb-3">
      <input
        :value="search"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        placeholder="Rechercher un ticket..."
        class="w-96 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div class="flex gap-6 text-sm">
        <span class="text-slate-500">
          Total : <strong class="text-slate-800">{{ stats.total }}</strong>
        </span>
        <span class="text-blue-600">
          Ouverts : <strong>{{ stats.open }}</strong>
        </span>
        <span class="text-yellow-600">
          En cours : <strong>{{ stats.inProgress }}</strong>
        </span>
        <span class="text-green-600">
          Résolus : <strong>{{ stats.resolved }}</strong>
        </span>
      </div>
    </div>
  </header>
</template>