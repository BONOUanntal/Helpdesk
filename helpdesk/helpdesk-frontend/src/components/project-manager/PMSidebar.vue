<script setup lang="ts">
import { Ticket, Users, MessageSquare, LayoutDashboard, LogOut } from 'lucide-vue-next'
import NotificationBell from '@/components/NotificationBell.vue'

defineProps<{ activeTab: string }>()

const emit = defineEmits(['change-tab', 'logout', 'open-ticket'])
</script>

<template>
  <aside class="w-64 bg-[#161616] text-white flex flex-col p-6">

    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-2">
        <LayoutDashboard class="w-5 h-5 text-blue-500" />
        <h1 class="font-bold">Project Manager</h1>
      </div>
      <NotificationBell @open-ticket="$emit('open-ticket', $event)" />
    </div>

    <nav class="flex flex-col gap-2">
      <button
        @click="$emit('change-tab', 'tickets')"
        :class="activeTab === 'tickets' || activeTab === 'detail' ? 'bg-blue-600' : 'hover:bg-white/10'"
        class="flex items-center gap-2 px-3 py-2 rounded"
      >
        <Ticket class="w-4 h-4" />
        Tickets
      </button>

      <button
        @click="$emit('change-tab', 'clients')"
        :class="activeTab === 'clients' ? 'bg-blue-600' : 'hover:bg-white/10'"
        class="flex items-center gap-2 px-3 py-2 rounded"
      >
        <Users class="w-4 h-4" />
        Clients
      </button>

      <button
        @click="$emit('change-tab', 'messages')"
        :class="activeTab === 'messages' ? 'bg-blue-600' : 'hover:bg-white/10'"
        class="flex items-center gap-2 px-3 py-2 rounded"
      >
        <MessageSquare class="w-4 h-4" />
        Messages
      </button>
    </nav>

    <button
      @click="$emit('logout')"
      class="mt-auto flex items-center gap-2 text-red-400 hover:text-red-300"
    >
      <LogOut class="w-4 h-4" />
      Déconnexion
    </button>
  </aside>
</template>