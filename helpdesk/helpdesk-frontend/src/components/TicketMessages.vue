<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Send } from 'lucide-vue-next'
import { io } from 'socket.io-client'

const props = defineProps<{ ticketId: number | null }>()

const token = localStorage.getItem('token')
const messages = ref<any[]>([])
const newMessage = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function joinTicket(ticketId: number) {
  socket.emit('joinTicket', ticketId)
}

function leaveTicket(ticketId: number) {
  socket.emit('leaveTicket', ticketId)
}

function sendMessage() {
  if (!newMessage.value.trim() || !props.ticketId) return
  loading.value = true

  socket.emit('sendMessage', {
    ticketId: props.ticketId,
    content: newMessage.value,
    token,
  })

  newMessage.value = ''
  loading.value = false
}

// Reçoit l'historique quand on rejoint une room
socket.on('messageHistory', (history: any[]) => {
  messages.value = history
  scrollToBottom()
})

// Reçoit un nouveau message en temps réel
socket.on('newMessage', (message: any) => {
  const exists = messages.value.some((m: any) => m.id === message.id)
  if (!exists) {
    messages.value.push(message)
    scrollToBottom()
  }
})

socket.on('error', (err: any) => {
  console.error('Socket error:', err)
  loading.value = false
})

watch(() => props.ticketId, (newId, oldId) => {
  if (oldId) leaveTicket(oldId)
  if (newId) joinTicket(newId)
}, { immediate: true })

onUnmounted(() => {
  if (props.ticketId) leaveTicket(props.ticketId)
  socket.off('messageHistory')
  socket.off('newMessage')
  socket.off('error')
})
</script>

<template>
  <div v-if="ticketId" class="flex flex-col h-full">

    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto space-y-3 mb-4 max-h-96 pr-1"
    >
      <div v-if="messages.length === 0" class="text-center text-slate-400 py-8">
        Aucun message pour ce ticket
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="msg.senderType === 'CLIENT' ? 'justify-start' : 'justify-end'"
        class="flex"
      >
        <div
          :class="msg.senderType === 'CLIENT'
            ? 'bg-slate-100 text-slate-800'
            : 'bg-blue-600 text-white'"
          class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl"
        >
          <p class="text-xs font-semibold mb-1 opacity-70">
            {{ msg.senderType }}
          </p>
          <p v-if="msg.content" class="text-sm">
            {{ msg.content }}
          </p>

          <a
            v-if="msg.fileUrl"
            :href="`http://localhost:3000${msg.fileUrl}`"
            target="_blank"
            class="inline-flex items-center gap-2 text-sm underline mt-2"
          >
            📎 {{ msg.fileName }}
          </a>
          <p class="text-xs mt-1 opacity-50">
            {{ new Date(msg.createdAt).toLocaleString('fr-FR') }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex gap-2 border-t pt-4">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        type="text"
        placeholder="Écrire une réponse..."
        class="flex-1 border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <button
        @click="sendMessage"
        :disabled="loading"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
      >
        <Send class="w-4 h-4" />
        Envoyer
      </button>
    </div>

  </div>

  <div v-else class="text-center text-slate-400 py-12">
    Sélectionnez un ticket pour voir les messages
  </div>
</template>