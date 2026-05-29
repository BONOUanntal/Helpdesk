<script setup lang="ts">
import TicketMessages from '@/components/TicketMessages.vue'

defineProps<{
  ticket: any
  supports: any[]
}>()

const emit = defineEmits(['back', 'assign-ticket', 'update-status'])
</script>

<template>
  <div class="bg-white p-6 rounded-xl">

    <div class="flex items-center gap-4 mb-6">
      <button @click="$emit('back')" class="text-gray-500 hover:text-gray-800 transition">
        ← Retour
      </button>
      <h2 class="text-xl font-bold">Ticket #{{ ticket.id }}</h2>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
        {{ ticket.status }}
      </span>
    </div>

    <!-- Infos ticket -->
    <div class="grid grid-cols-2 gap-6 mb-6 p-4 bg-slate-50 rounded-xl">
      <div>
        <p class="text-sm text-slate-500">Sujet</p>
        <p class="font-semibold mt-1">{{ ticket.subject }}</p>
      </div>
      <div>
        <p class="text-sm text-slate-500">Type de problème</p>
        <p class="font-semibold mt-1">{{ ticket.issueType?.name ?? '—' }}</p>
      </div>
      <div>
        <p class="text-sm text-slate-500">Priorité</p>
        <p class="font-semibold mt-1">{{ ticket.priority }}</p>
      </div>
      <div>
        <p class="text-sm text-slate-500">Application</p>
        <p class="font-semibold mt-1">{{ ticket.application?.name ?? '—' }}</p>
      </div>
      <div>
        <p class="text-sm text-slate-500">Client</p>
        <p class="font-semibold mt-1">{{ ticket.client?.name ?? ticket.client?.email ?? '—' }}</p>
      </div>
      <div>
        <p class="text-sm text-slate-500">Assigné à</p>
        <p class="font-semibold mt-1">{{ ticket.assignedUser?.name ?? 'Non assigné' }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-4 mb-6">
      <div class="flex-1">
        <p class="text-sm text-slate-500 mb-1">Changer le statut</p>
        <select
          @change="(e) => $emit('update-status', ticket.id, (e.target as HTMLSelectElement).value)"
          class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">— {{ ticket.status }} —</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>
      <div class="flex-1">
        <p class="text-sm text-slate-500 mb-1">Assigner à</p>
        <select
          @change="(e) => $emit('assign-ticket', ticket.id, Number((e.target as HTMLSelectElement).value))"
          class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">— Changer —</option>
          <option v-for="s in supports" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Conversation -->
    <div class="border-t pt-4">
      <h3 class="text-lg font-semibold mb-4">Conversation</h3>
      <TicketMessages :ticket-id="ticket.id" />
    </div>

  </div>
</template>