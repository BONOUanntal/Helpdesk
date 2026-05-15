<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TicketMessages from '@/components/TicketMessages.vue'
import NotificationBell from '@/components/NotificationBell.vue'

const router = useRouter()
const token = localStorage.getItem('token')

const issueTypes = ref([])
const tickets = ref([])
const selectedTicketId = ref<number | null>(null)
const activeTab = ref('tickets')

// Formulaire nouveau ticket
const newTicket = ref({
  subject: '',
  issueTypeId: '',
  priority: 'MEDIUM',
})
const ticketError = ref('')
const ticketSuccess = ref('')

async function get(url: string) {
  const res = await fetch(`http://localhost:3000${url}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

async function createTicket() {
  ticketError.value = ''
  ticketSuccess.value = ''

  if (!newTicket.value.subject || !newTicket.value.issueTypeId) {
    ticketError.value = 'Veuillez remplir tous les champs'
    return
  }

  const res = await fetch('http://localhost:3000/tickets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: newTicket.value.subject,
      issueTypeId: Number(newTicket.value.issueTypeId),
      priority: newTicket.value.priority,
      status: 'OPEN',
    }),
  })

  if (res.ok) {
    ticketSuccess.value = 'Ticket créé avec succès !'
    newTicket.value = { subject: '', issueTypeId: '', priority: 'MEDIUM' }
    tickets.value = await get('/tickets')
  } else {
    const data = await res.json()
    ticketError.value = data.message || 'Erreur lors de la création'
  }
}

function openTicketMessages(ticketId: number) {
  selectedTicketId.value = ticketId
  activeTab.value = 'messages'
}

const sortedTickets = computed(() => {
  return [...tickets.value].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

onMounted(async () => {
  tickets.value = await get('/tickets')
  issueTypes.value = await get('/issue-types')
})

function logout() {
  localStorage.clear()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex">

    <aside class="w-64 bg-slate-900 text-white flex flex-col p-6 gap-2">
      <h1 class="text-xl font-bold mb-6">👤 Client</h1>
      <NotificationBell @open-ticket="openTicketMessages" />

      <button
        v-for="tab in ['tickets', 'messages']"
        :key="tab"
        @click="activeTab = tab"
        :class="activeTab === tab ? 'bg-blue-600' : 'hover:bg-slate-700'"
        class="text-left px-4 py-2 rounded-lg capitalize transition"
      >
        {{ tab === 'tickets' ? '🎫 Mes tickets' : '💬 Messages' }}
      </button>

      <button
        @click="logout"
        class="mt-auto text-left px-4 py-2 rounded-lg hover:bg-red-700 transition"
      >
        Déconnexion
      </button>
    </aside>

    <main class="flex-1 p-8">

      <!-- Tickets -->
      <div v-if="activeTab === 'tickets'">

        <!-- Formulaire création -->
        <div class="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">Créer un ticket</h3>

          <div v-if="ticketError" class="mb-4 bg-red-100 text-red-700 p-3 rounded-xl text-sm">
            {{ ticketError }}
          </div>
          <div v-if="ticketSuccess" class="mb-4 bg-green-100 text-green-700 p-3 rounded-xl text-sm">
            {{ ticketSuccess }}
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Sujet</label>
              <input
                v-model="newTicket.subject"
                type="text"
                placeholder="Décrivez brièvement le problème"
                class="w-full border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Type de problème</label>
              <select
                v-model="newTicket.issueTypeId"
                class="w-full border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Choisir un type —</option>
                <option v-for="type in issueTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
                <option v-for="t in sortedTickets" :key="t.id" :value="t.id"></option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
              <select
                v-model="newTicket.priority"
                class="w-full border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Faible</option>
                <option value="MEDIUM">Normale</option>
                <option value="HIGH">Urgente</option>
              </select>
            </div>

            <button
              @click="createTicket"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition"
            >
              Envoyer
            </button>
          </div>
        </div>

        <!-- Liste tickets -->
        <div class="bg-white rounded-2xl shadow overflow-hidden">
          <div class="px-6 py-4 border-b">
            <h2 class="text-xl font-bold">Mes tickets</h2>
          </div>
          <table class="w-full">
            <thead class="bg-slate-100">
              <tr>
                <th class="text-left px-6 py-4">ID</th>
                <th class="text-left px-6 py-4">Application</th>
                <th class="text-left px-6 py-4">Sujet</th>
                <th class="text-left px-6 py-4">Type</th>
                <th class="text-left px-6 py-4">Priorité</th>
                <th class="text-left px-6 py-4">Statut</th>
                <th class="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in sortedTickets" :key="t.id" class="border-t hover:bg-slate-50">
                <td class="px-6 py-4 text-blue-600 font-semibold">#{{ t.id }}</td>
                <td class="px-6 py-4 text-slate-500">{{ t.application?.name ?? '—' }}</td>
                <td class="px-6 py-4">{{ t.subject }}</td>
                <td class="px-6 py-4">{{ t.issueType?.name ?? '—' }}</td>
                <td class="px-6 py-4">{{ t.priority }}</td>
                <td class="px-6 py-4">
                  <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {{ t.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button
                    @click="selectedTicketId = t.id; activeTab = 'messages'"
                    class="text-blue-600 hover:underline text-sm"
                  >
                    Messages
                  </button>
                </td>
              </tr>
              <tr v-if="tickets.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-slate-400">Aucun ticket</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="activeTab === 'messages'">
        <div class="flex items-center gap-4 mb-4">
          <h2 class="text-2xl font-bold">Messages</h2>
        </div>

        <div class="mb-4">
          <select
            v-model="selectedTicketId"
            class="border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">— Choisir un ticket —</option>
            <option v-for="t in sortedTickets" :key="t.id" :value="t.id">

              #{{ t.id }} — {{ t.subject }}
            </option>
          </select>
        </div>

        <div class="bg-white rounded-2xl shadow p-6">
          <TicketMessages :ticket-id="selectedTicketId" />
        </div>
      </div>

    </main>
  </div>
</template>