<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Send } from 'lucide-vue-next'
import { io } from 'socket.io-client'

const props = defineProps<{ ticketId: number | null }>()
const socket = io('http://localhost:3000')


const token = localStorage.getItem('token')
const messages = ref([])
const newMessage = ref('')
const loading = ref(false)

async function fetchMessages() {
  if (!props.ticketId) return
  const res = await fetch(`http://localhost:3000/tickets/${props.ticketId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()

  console.log(data)

  messages.value = data
}

async function sendMessage() {
  if (!newMessage.value.trim() || !props.ticketId) return
  loading.value = true

  await fetch(`http://localhost:3000/tickets/${props.ticketId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: newMessage.value }),
  })

  newMessage.value = ''
  await fetchMessages()
  loading.value = false
}

onMounted(() => {
  socket.on('newMessage', (payload) => {
    if (payload.ticketId === props.ticketId) {
      messages.value.push(payload.message)
    }
  })
})
watch(() => props.ticketId, fetchMessages)
</script>

<template>
  <div v-if="ticketId" class="flex flex-col h-full">

    <!-- Liste des messages -->
    <div class="flex-1 overflow-y-auto space-y-3 mb-4 max-h-96 pr-1">
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
          <div class="space-y-2">

            <p
              v-if="msg.content"
              class="text-sm"
            >
              {{ msg.content }}
            </p>

            <a
              v-if="msg.fileUrl"
              :href="`http://localhost:3000${msg.fileUrl}`"
              target="_blank"
              class="inline-flex items-center gap-2 text-sm underline"
            >
              📎 {{ msg.fileName }}
            </a>

          </div>
          <p class="text-xs mt-1 opacity-50">
            {{ new Date(msg.createdAt).toLocaleString('fr-FR') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Zone de réponse -->
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