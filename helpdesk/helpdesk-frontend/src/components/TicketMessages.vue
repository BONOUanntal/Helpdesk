<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Send, Paperclip, Trash2 } from 'lucide-vue-next'
import { io } from 'socket.io-client'

const props = defineProps<{ ticketId: number | null }>()

const token = localStorage.getItem('token')

// Décode le payload JWT (sans vérification de signature, la sécurité est gérée côté serveur)
function decodeToken(t: string | null) {
  if (!t) return null
  try { return JSON.parse(atob(t.split('.')[1])) } catch { return null }
}
const currentUser = decodeToken(token) as { userId: number; role: string } | null

const messages = ref<any[]>([])
const newMessage = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
})

const joinedTicket = ref<number | null>(null)

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

const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !props.ticketId) return

  if (file.size > 2 * 1024 * 1024) {
    alert('Le fichier dépasse la limite de 2MB.')
    return
  }

  loading.value = true
  const reader = new FileReader()
  reader.onload = () => {
    socket.emit('sendFile', {
      ticketId: props.ticketId,
      token,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        content: reader.result,
      },
    })
    loading.value = false
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function deleteMessage(messageId: number) {
  if (!confirm('Supprimer ce message ?')) return
  socket.emit('deleteMessage', { messageId, token })
}

// Reçoit l'historique quand on rejoint une room
socket.on('messageHistory', (history: any[]) => {
  console.log('messageHistory reçu:', history.length, 'messages')
  messages.value = history
  scrollToBottom()
})

// Reçoit un nouveau message en temps réel
socket.on('ticket:newMessage', (message: any) => {
  console.log('ticket:newMessage reçu:', message)
  const exists = messages.value.some((m: any) => m.id === message.id)
  if (!exists) {
    messages.value = [...messages.value, message]
    scrollToBottom()
  }
})

// Message supprimé en temps réel
socket.on('ticket:messageDeleted', ({ messageId }: { messageId: number }) => {
  messages.value = messages.value.filter((m: any) => m.id !== messageId)
})

socket.on('error', (err: any) => {
  console.error('Socket error:', err)
  loading.value = false
})

watch(() => props.ticketId, (newId, oldId) => {
  console.log('TICKET ID CHANGE:', oldId, '->', newId)
  if (newId === joinedTicket.value) {
    console.log('MÊME TICKET, skip')
    return
  }
  if (oldId) leaveTicket(oldId)
  if (newId) {
    joinTicket(newId)
    joinedTicket.value = newId
  }
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
        class="flex group"
      >
        <!-- Bouton supprimer (côté gauche pour les messages CLIENT) -->
        <button
          v-if="msg.senderType === 'CLIENT' && currentUser?.role === 'ADMIN'"
          @click="deleteMessage(msg.id)"
          class="opacity-0 group-hover:opacity-100 mr-2 self-start mt-2 text-red-400 hover:text-red-600 transition-opacity"
          title="Supprimer"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>

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

        <!-- Bouton supprimer (côté droit pour les messages support/PM/admin) -->
        <!-- ADMIN : peut tout supprimer ; PM/SUPPORT : seulement leurs propres messages -->
        <button
          v-if="msg.senderType !== 'CLIENT' && (
            currentUser?.role === 'ADMIN' ||
            msg.senderId === currentUser?.userId
          )"
          @click="deleteMessage(msg.id)"
          class="opacity-0 group-hover:opacity-100 ml-2 self-start mt-2 text-red-300 hover:text-red-500 transition-opacity"
          title="Supprimer"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div class="flex gap-2 border-t pt-4">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        class="hidden"
      />
      <button
        @click="triggerFileInput"
        :disabled="loading"
        type="button"
        class="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl transition disabled:opacity-50"
        title="Ajouter un fichier"
      >
        <Paperclip class="w-4 h-4" />
      </button>
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