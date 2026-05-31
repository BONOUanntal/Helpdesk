<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TicketMessages from '@/components/TicketMessages.vue'
import NotificationBell from '@/components/NotificationBell.vue'


const router = useRouter()
const token = localStorage.getItem('token')
const activeTab = ref('tickets')
const tickets = ref<any[]>([])
const clients = ref<any[]>([])
const supports = ref<any[]>([])
const selectedTicket = ref<any | null>(null)
const selectedTicketId = ref<number | null>(null)
const search = ref('')
const loading = ref(false)
const currentPage = ref(1)
const ticketsPerPage = 15

watch(search, () => {
  currentPage.value = 1
})

async function get(url: string) {
  const res = await fetch(`http://localhost:3000${url}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

async function loadData() {
  try {
    loading.value = true

    tickets.value = await get('/tickets')
    clients.value = await get('/clients')

    const users = await get('/users')
    supports.value = users.filter((u: any) => u.role === 'SUPPORT')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})


function openTicket(ticket: any) {
  selectedTicket.value = ticket
  selectedTicketId.value = ticket.id
  activeTab.value = 'detail'
}

async function assignTicket(ticketId: number, supportId: number) {
  if (!supportId) return
  const res = await fetch(`http://localhost:3000/tickets/${ticketId}/assign`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ supportId }),
  })
  if (res.ok) {
    await loadData()
    if (selectedTicket.value?.id === ticketId) {
      selectedTicket.value = tickets.value.find((t: any) => t.id === ticketId)
    }
  }
}

async function updateStatus(ticketId: number, status: string) {
  if (!status) return
  const res = await fetch(`http://localhost:3000/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (res.ok) {
    await loadData()
    if (selectedTicket.value?.id === ticketId) {
      selectedTicket.value.status = status
    }
  }
}

async function openTicketById(ticketId: number) {
  if (tickets.value.length === 0) {
    await loadData()
  }
  const ticket = tickets.value.find((x: any) => x.id === ticketId)
  if (ticket) openTicket(ticket)
}

function logout() {
  localStorage.clear()
  router.push('/login')
}

const filteredTickets = computed(() => {
  let list = [...tickets.value].sort((a: any, b: any) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
)

if (search.value) {
  list = list.filter((t: any) =>
  t.subject?.toLowerCase().includes(search.value.toLowerCase())
  )
}

return list
})

const totalPages = computed(() =>
  Math.ceil(filteredTickets.value.length / ticketsPerPage)
)

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * ticketsPerPage
  const end = start + ticketsPerPage

  return filteredTickets.value.slice(start, end)
})

function statusClass(status: string) {
  if (status === 'OPEN') return 'bg-blue-100 text-blue-800'
  if (status === 'IN_PROGRESS') return 'bg-amber-100 text-amber-800'
  if (status === 'RESOLVED') return 'bg-green-100 text-green-800'
  return 'bg-slate-100 text-slate-700'
}

function priorityDot(priority: string) {
  if (priority === 'HIGH') return 'bg-red-500'
  if (priority === 'MEDIUM') return 'bg-amber-500'
  return 'bg-green-500'
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f8f9ff]" style="font-family: 'Inter', sans-serif;">

    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-[260px] bg-[#111827] text-white flex flex-col py-6 px-4 z-50">
      <div class="flex items-center gap-3 px-2 mb-8">
        <div class="bg-blue-600 p-2 rounded-lg">
          <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold leading-tight">HelpDesk</h2>
          <p class="text-[10px] text-gray-400 uppercase tracking-widest">Project Manager</p>
        </div>
      </div>

      <nav class="flex-1 space-y-1">
        <button
          @click="activeTab = 'tickets'"
          :class="activeTab === 'tickets' || activeTab === 'detail' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
          </svg>
          Tickets
        </button>

        <button
          @click="activeTab = 'clients'"
          :class="activeTab === 'clients' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Clients
        </button>

        <button
          @click="activeTab = 'messages'"
          :class="activeTab === 'messages' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Messages
        </button>
      </nav>

      <div class="pt-4 mt-4 border-t border-gray-800">
        <button
          @click="logout"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors rounded-md"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">

      <!-- Header -->
      <header class="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
        <div class="flex flex-1 items-center gap-4">
          <div class="w-full max-w-lg relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              v-model="search"
              class="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              placeholder="Rechercher un ticket..."
              type="search"
            />
          </div>
        </div>
        <div class="flex items-center gap-4 pr-2">
          <NotificationBell @open-ticket="openTicketById" />
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-8">
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="text-slate-500 text-sm">
            Chargement...
          </div>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-8">
          <!-- tout ton contenu -->
        </div>

        <!-- Tickets -->
        <div v-if="activeTab === 'tickets'">
          <div class="mb-8 flex items-end justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Tickets de mes applications</h1>
              <p class="mt-1 text-sm text-slate-500">Gérez et suivez l'avancement des demandes de support.</p>
            </div>
            <div class="flex gap-3 text-sm">
              <span class="bg-white border border-slate-200 rounded px-3 py-1 text-slate-600">
                Total : <strong>{{ tickets.length }}</strong>
              </span>
              <span class="bg-blue-50 border border-blue-200 rounded px-3 py-1 text-blue-700">
                Ouverts : <strong>{{ tickets.filter((t: any) => t.status === 'OPEN').length }}</strong>
              </span>
              <span class="bg-amber-50 border border-amber-200 rounded px-3 py-1 text-amber-700">
                En cours : <strong>{{ tickets.filter((t: any) => t.status === 'IN_PROGRESS').length }}</strong>
              </span>
              <span class="bg-green-50 border border-green-200 rounded px-3 py-1 text-green-700">
                Résolus : <strong>{{ tickets.filter((t: any) => t.status === 'RESOLVED').length }}</strong>
              </span>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Application</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sujet</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priorité</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigné à</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="t in paginatedTickets" :key="t.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-4 text-sm font-semibold text-blue-600 whitespace-nowrap">#{{ t.id }}</td>
                  <td class="px-4 py-4">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                      {{ t.application?.name ?? '—' }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-900 max-w-[180px] truncate">{{ t.subject }}</td>
                  <td class="px-4 py-4 text-sm text-slate-500 max-w-[120px] truncate">{{ t.issueType?.name ?? '—' }}</td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-1">
                      <span :class="['h-2 w-2 rounded-full flex-shrink-0', priorityDot(t.priority)]"></span>
                      <span class="text-xs font-medium text-gray-700">{{ t.priority }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight', statusClass(t.status)]">
                      {{ t.status }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                    {{ t.assignedUser?.name ?? '— Non assigné —' }}
                  </td>
                  <td class="px-4 py-4 text-center">
                    <button @click="openTicket(t)" class="text-gray-400 hover:text-blue-600 transition-colors inline-flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredTickets.length === 0">
                  <td colspan="8" class="px-6 py-12 text-center text-slate-400 text-sm">Aucun ticket</td>
                </tr>
              </tbody>
            </table>
            <div
              class="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white"
            >
              <p class="text-sm text-slate-500">
                Page {{ currentPage }} sur {{ totalPages }}
              </p>

              <div class="flex items-center gap-2">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-4 py-2 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Précédent
                </button>

                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-4 py-2 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Détail ticket -->
        <div v-if="activeTab === 'detail' && selectedTicket">
          <div class="flex items-center gap-4 mb-6">
            <button @click="activeTab = 'tickets'" class="text-slate-500 hover:text-slate-800 transition text-sm flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <h2 class="text-2xl font-bold text-gray-900">Ticket #{{ selectedTicket.id }}</h2>
            <span :class="['px-3 py-1 rounded-full text-sm font-bold uppercase', statusClass(selectedTicket.status)]">
              {{ selectedTicket.status }}
            </span>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sujet</p>
                <p class="font-semibold text-gray-900">{{ selectedTicket.subject }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Type de problème</p>
                <p class="font-semibold text-gray-900">{{ selectedTicket.issueType?.name ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Priorité</p>
                <div class="flex items-center gap-2">
                  <span :class="['h-2 w-2 rounded-full', priorityDot(selectedTicket.priority)]"></span>
                  <p class="font-semibold text-gray-900">{{ selectedTicket.priority }}</p>
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Application</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {{ selectedTicket.application?.name ?? '—' }}
                </span>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Client</p>
                <p class="font-semibold text-gray-900">{{ selectedTicket.client?.name ?? selectedTicket.client?.email ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigné à</p>
                <p class="font-semibold text-gray-900">{{ selectedTicket.assignedUser?.name ?? 'Non assigné' }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Changer le statut</p>
                <select
                  @change="(e) => updateStatus(selectedTicket.id, (e.target as HTMLSelectElement).value)"
                  class="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                >
                  <option value="">— {{ selectedTicket.status }} —</option>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigner à</p>
                <select
                  @change="(e) => assignTicket(selectedTicket.id, Number((e.target as HTMLSelectElement).value))"
                  class="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                >
                  <option value="">— Changer —</option>
                  <option v-for="s in supports" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Conversation
            </h3>
            <TicketMessages :ticket-id="selectedTicket.id" />
          </div>
        </div>

        <!-- Clients -->
        <div v-if="activeTab === 'clients'">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
            <p class="mt-1 text-sm text-slate-500">Liste des clients liés à vos applications.</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Application</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="c in clients" :key="c.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">#{{ c.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ c.name ?? '—' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ c.email ?? '—' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {{ c.application?.name ?? '—' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="clients.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-400 text-sm">Aucun client</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Messages -->
        <div v-if="activeTab === 'messages'">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Messages</h1>
            <p class="mt-1 text-sm text-slate-500">Consultez et répondez aux messages par ticket.</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div class="mb-4">
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Choisir un ticket
              </label>
              <select
                v-model="selectedTicketId"
                class="block w-full max-w-md rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <option :value="null">— Sélectionner un ticket —</option>
                <option v-for="t in filteredTickets" :key="t.id" :value="t.id">
                  #{{ t.id }} — {{ t.subject }}
                </option>
              </select>
            </div>
            <div class="border-t border-slate-100 pt-4">
              <TicketMessages :ticket-id="selectedTicketId" />
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>