<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { BellRing } from 'lucide-vue-next'

const emit = defineEmits<{ (e: 'open-ticket', ticketId: number): void }>()

const token = localStorage.getItem('token')
const notifications = ref([])
const unreadCount = ref(0)
const showPanel = ref(false)

async function fetchNotifications() {
  const res = await fetch('http://localhost:3000/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  })
  notifications.value = await res.json()
  unreadCount.value = notifications.value.filter((n: any) => !n.isRead).length
}

async function markAllAsRead() {
  await fetch('http://localhost:3000/notifications/read-all', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  })
  await fetchNotifications()
}

async function handleClick(n: any) {
  // Marque comme lu
  await fetch(`http://localhost:3000/notifications/${n.id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  })
  await fetchNotifications()
  showPanel.value = false

  // Émet l'événement avec le ticketId
  if (n.ticketId) {
    emit('open-ticket', n.ticketId)
  }
}

let interval: any
onMounted(() => {
  fetchNotifications()
  interval = setInterval(fetchNotifications, 15000)
})
onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="relative">
    <button
      @click="showPanel = !showPanel"
      class="relative p-2 rounded-full hover:bg-slate-700 transition"
    >
      <BellRing class="w-6 h-6 text-amber-400" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
      >
        {{ unreadCount }}
      </span>
    </button>

    <div
      v-if="showPanel"
      class="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <h3 class="font-semibold text-slate-800">Notifications</h3>
        <button @click="markAllAsRead" class="text-xs text-blue-600 hover:underline">
          Tout marquer lu
        </button>
      </div>

      <div class="max-h-80 overflow-y-auto">
        <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-slate-400 text-sm">
          Aucune notification
        </div>

        <div
          v-for="n in notifications"
          :key="n.id"
          @click="handleClick(n)"
          :class="n.isRead ? 'bg-white' : 'bg-blue-50'"
          class="px-4 py-3 border-b cursor-pointer hover:bg-slate-50 transition"
        >
          <p class="text-sm font-medium text-slate-800">
            {{ n.type === 'NEW_TICKET' ? '🎫 Nouveau ticket' : '💬 Nouveau message' }}
          </p>
          <p class="text-sm text-slate-600 mt-1">{{ n.ticket?.subject ?? '—' }}</p>
          <p class="text-xs text-slate-400 mt-1">
            {{ new Date(n.createdAt).toLocaleString('fr-FR') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>