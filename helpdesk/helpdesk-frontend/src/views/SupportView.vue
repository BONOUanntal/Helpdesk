<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TicketMessages from '@/components/TicketMessages.vue'
import NotificationBell from '@/components/NotificationBell.vue'

const router = useRouter()
const token = localStorage.getItem('token')
const activeTab = ref('tickets')
const tickets = ref([])
const selectedTicket = ref<any>(null)
const selectedTicketId = ref<number | null>(null)

async function get(url: string) {
  const res = await fetch(`http://localhost:3000${url}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

async function updateStatus(ticketId: number, status: string) {
  const res = await fetch(`http://localhost:3000/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  if (res.ok) {
    tickets.value = await get('/tickets')
    if (selectedTicket.value?.id === ticketId) {
      selectedTicket.value.status = status
    }
  }
}

function openTicket(ticket: any) {
  selectedTicket.value = ticket
  selectedTicketId.value = ticket.id
  activeTab.value = 'detail'
}

async function openTicketById(ticketId: number) {
  if (tickets.value.length === 0) {
    tickets.value = await get('/tickets')
  }
  const ticket = tickets.value.find((t: any) => t.id === ticketId)
  if (ticket) {
    openTicket(ticket)
  }
}

onMounted(async () => {
  tickets.value = await get('/tickets')
})

const sortedTickets = computed(() => {
  return [...tickets.value].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

function logout() {
  localStorage.clear()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex">

    <aside class="w-64 bg-slate-900 text-white flex flex-col p-6 gap-2">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold">🎧 Support</h1>
        <NotificationBell @open-ticket="openTicketById" />
      </div>

      <button
        v-for="tab in ['tickets', 'messages']"
        :key="tab"
        @click="activeTab = tab"
        :class="activeTab === tab || (tab === 'tickets' && activeTab === 'detail') ? 'bg-blue-600' : 'hover:bg-slate-700'"
        class="text-left px-4 py-2 rounded-lg capitalize transition"
      >
        {{ tab === 'tickets' ? '🎫 Tickets' : '💬 Messages' }}
      </button>

      <button
        @click="logout"
        class="mt-auto text-left px-4 py-2 rounded-lg hover:bg-red-700 transition"
      >
        Déconnexion
      </button>
    </aside>

    <main class="flex-1 p-8">

      <!-- Liste tickets -->
      <div v-if="activeTab === 'tickets'">
        <h2 class="text-2xl font-bold mb-4">Mes tickets assignés</h2>
        <div class="bg-white rounded-2xl shadow overflow-hidden">
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
                <td class="px-6 py-4 text-slate-500">{{ t.issueType?.name ?? '—' }}</td>
                <td class="px-6 py-4">{{ t.priority }}</td>
                <td class="px-6 py-4">
                  <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {{ t.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button
                    @click="openTicket(t)"
                    class="text-blue-600 hover:underline text-sm font-medium"
                  >
                  <option v-for="t in sortedTickets" :key="t.id" :value="t.id"></option>
                    Voir →
                  </button>
                </td>
              </tr>
              <tr v-if="tickets.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                  Aucun ticket assigné
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Détail ticket -->
      <div v-if="activeTab === 'detail' && selectedTicket">
        <div class="flex items-center gap-4 mb-6">
          <button
            @click="activeTab = 'tickets'"
            class="text-slate-500 hover:text-slate-800 transition"
          >
            ← Retour
          </button>
          <h2 class="text-2xl font-bold">Ticket #{{ selectedTicket.id }}</h2>
          <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {{ selectedTicket.status }}
          </span>
        </div>

        <!-- Infos ticket -->
        <div class="bg-white rounded-2xl shadow p-6 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-slate-500">Sujet</p>
              <p class="font-semibold">{{ selectedTicket.subject }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Type de problème</p>
              <p class="font-semibold">{{ selectedTicket.issueType?.name ?? '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Priorité</p>
              <p class="font-semibold">{{ selectedTicket.priority }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Application</p>
              <p class="font-semibold">{{ selectedTicket.application?.name ?? '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Client</p>
              <p class="font-semibold">{{ selectedTicket.client?.name ?? selectedTicket.client?.email ?? '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Changer le statut</p>
              <select
                @change="(e) => updateStatus(selectedTicket.id, (e.target as HTMLSelectElement).value)"
                class="border border-slate-300 rounded-lg px-2 py-1 text-sm mt-1"
              >
                <option value="">— Changer —</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div class="bg-white rounded-2xl shadow p-6">
          <h3 class="text-lg font-semibold mb-4">Conversation</h3>
          <TicketMessages :ticket-id="selectedTicket.id" />
        </div>
      </div>

      <!-- Messages directs -->
      <div v-if="activeTab === 'messages'">
        <h2 class="text-2xl font-bold mb-4">Messages</h2>
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