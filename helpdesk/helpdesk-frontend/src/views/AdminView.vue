<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import NotificationBell from '@/components/NotificationBell.vue'
import TicketMessages from '@/components/TicketMessages.vue'

const router = useRouter()
const token = localStorage.getItem('token')
const activeTab = ref('tickets')

const tickets = ref([])
const users = ref([])
const applications = ref([])
const clients = ref([])
const issueTypes = ref([])

const newIssueType = ref({ name: '', description: '' })
const issueTypeError = ref('')
const issueTypeSuccess = ref('')

const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 15

const selectedTicket = ref<any | null>(null)
const supports = ref<any[]>([])

  const loading = ref(false)
  
  function openTicket(ticket: any) {
    selectedTicket.value = ticket
    activeTab.value = 'detail'
  }

  
  async function loadData() {
    try {
      loading.value = true
      tickets.value = await get('/tickets/admin/all')
      clients.value = await get('/clients')
      users.value = await get('/users')
      supports.value = users.value.filter((u: any) => u.role === 'SUPPORT')
    } finally {
      loading.value = false
    }
  }

  const staffUsers = computed(() => {
    return users.value.filter((u: any) => u.role !== 'CLIENT')
  })

  async function assignTicket(
    ticketId: number,
    supportId: number
  ) {
    if (!supportId) return

    console.log(
      'ASSIGN DATA',
      {
        ticketId,
        supportId,
      }
    )


    try {
      const res = await fetch(
        `http://localhost:3000/tickets/${ticketId}/assign`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            supportId,
          }),
        }
      )

      if (!res.ok) {
        const error =
          await res.text()

        console.log(
          'ASSIGN ERROR:',
          error
        )

        throw new Error(error)
      }

      // refresh tickets
      tickets.value =
        await get(
          '/tickets/admin/all'
        )

      // refresh ticket ouvert
      if (
        selectedTicket.value?.id ===
        ticketId
      ) {
        selectedTicket.value =
          tickets.value.find(
            (t: any) =>
              t.id === ticketId
          )
      }
    } catch (error) {
      console.error(error)

      alert(
        "Erreur lors de l'assignation"
      )
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
    tickets.value = await get('/tickets/admin/all')
    if (selectedTicket.value?.id === ticketId) {
      selectedTicket.value.status = status
    }
  }
}

const assignableUsers = computed(() => {
  return users.value.filter((u: any) =>
    u.role === 'SUPPORT' ||
    u.role === 'PROJECT_MANAGER' ||
    u.additionalRoles?.some((r: any) =>
      ['SUPPORT', 'PROJECT_MANAGER'].includes(r.role)
    )
  )
})


async function get(url: string) {
  const res = await fetch(`http://localhost:3000${url}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

async function deleteReq(url: string) {
  const res = await fetch(`http://localhost:3000${url}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.ok
}

async function createIssueType() {
  issueTypeError.value = ''
  issueTypeSuccess.value = ''
  if (!newIssueType.value.name) {
    issueTypeError.value = 'Le nom est requis'
    return
  }
  const res = await fetch('http://localhost:3000/issue-types', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(newIssueType.value),
  })
  if (res.ok) {
    issueTypeSuccess.value = 'Type créé avec succès'
    newIssueType.value = { name: '', description: '' }
    issueTypes.value = await get('/issue-types')
  } else {
    issueTypeError.value = 'Erreur lors de la création'
  }
}

async function removeIssueType(id: number) {
  if (!confirm('Supprimer ce type ?')) return
  await deleteReq(`/issue-types/${id}`)
  issueTypes.value = await get('/issue-types')
}

async function addUserRole(userId: number, role: string) {
  if (!role) return
  await fetch(`http://localhost:3000/users/${userId}/roles`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  users.value = await get('/users')
}

async function removeUserRole(userId: number, role: string) {
  await fetch(`http://localhost:3000/users/${userId}/roles/${role}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  users.value = await get('/users')
}

const filteredTickets = computed(() => {
  let list = [...tickets.value]

  // Tri DESC conservé
  list.sort((a: any, b: any) =>
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime()
  )

  // Recherche uniquement sur le sujet
  if (!search.value.trim()) return list

  return list.filter((ticket: any) =>
    ticket.subject
      ?.toLowerCase()
      .includes(search.value.toLowerCase())
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredTickets.value.length / itemsPerPage)
)

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTickets.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5

  let start = Math.max(
    1,
    currentPage.value - Math.floor(maxVisible / 2)
  )

  let end = Math.min(
    totalPages.value,
    start + maxVisible - 1
  )

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

watch(search, () => {
  currentPage.value = 1
})

function statusClass(status: string) {
  if (status === 'OPEN') return 'bg-blue-100 text-blue-800'
  if (status === 'IN_PROGRESS') return 'bg-amber-100 text-amber-800'
  if (status === 'RESOLVED') return 'bg-green-100 text-green-800'
  if (status === 'CLOSED') return 'bg-slate-100 text-slate-700'
  return 'bg-slate-100 text-slate-700'
}

function priorityDot(priority: string) {
  if (priority === 'HIGH') return 'bg-red-500'
  if (priority === 'MEDIUM') return 'bg-amber-500'
  return 'bg-green-500'
}

onMounted(async () => {
  tickets.value = await get('/tickets/admin/all')
  users.value = await get('/users')
  applications.value = await get('/applications')
  clients.value = await get('/clients')
  issueTypes.value = await get('/issue-types')
})



async function updateTicketStatus(
  ticketId: number,
  status: string
) {
  const res = await fetch(
    `http://localhost:3000/tickets/${ticketId}/status`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }
  )

  if (res.ok) {
    tickets.value = await get('/tickets/admin/all')
  } else {
    alert('Erreur lors du changement de statut')
  }
}


async function updateTicketPriority(
  ticketId: number,
  priority: string
) {
  const res = await fetch(
    `http://localhost:3000/tickets/${ticketId}/priority`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priority }),
    }
  )

  if (res.ok) {
    tickets.value = await get('/tickets/admin/all')
  } else {
    alert('Erreur lors du changement de priorité')
  }
}



function logout() {
  localStorage.clear()
  router.push('/login')
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold leading-tight">SupportDesk</h2>
          <p class="text-[10px] text-gray-400 uppercase tracking-widest">Administration</p>
        </div>
      </div>

      <nav class="flex-1 space-y-1">
        <button
          v-for="tab in ['stats', 'tickets','users','applications','clients','issuetypes']"
          :key="tab"
          @click="activeTab = tab"
          :class="activeTab === tab || (tab === 'tickets' && activeTab === 'detail') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors"
        >
          <!-- Tickets -->
          <svg v-if="tab === 'tickets'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
          </svg>
          <!-- Users -->
          <svg v-else-if="tab === 'users'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <!-- Applications -->
          <svg v-else-if="tab === 'applications'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <!-- Clients -->
          <svg v-else-if="tab === 'clients'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <!-- IssueTypes -->
          <svg v-else-if="tab === 'issuetypes'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <!-- Stats -->
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>

          {{
            tab === 'tickets' ? 'Tickets' :
            tab === 'users' ? 'Utilisateurs' :
            tab === 'applications' ? 'Applications' :
            tab === 'clients' ? 'Clients' :
            tab === 'issuetypes' ? 'Types de problème' :
            'Statistiques'
          }}
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
        <div>
          <h1 class="text-lg font-bold text-gray-900">
            {{
              activeTab === 'tickets' ? 'Tous les tickets' :
              activeTab === 'users' ? 'Utilisateurs' :
              activeTab === 'applications' ? 'Applications' :
              activeTab === 'clients' ? 'Clients' :
              activeTab === 'issuetypes' ? 'Types de problème' :
              'Statistiques'
            }}
          </h1>
        </div>
        <div class="flex items-center gap-4 pr-2">
          <NotificationBell />
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-8">

        <!-- Tickets -->
        <div v-if="activeTab === 'tickets'">
          <div class="mb-8 flex items-end justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
                Tous les tickets
              </h1>
              <p class="mt-1 text-sm text-slate-500">
                Vue globale de tous les tickets de la plateforme.
              </p>
            </div>

            <div class="flex gap-3 text-sm">
              <span class="bg-white border border-slate-200 rounded px-3 py-1 text-slate-600">
                Total : <strong>{{ tickets.length }}</strong>
              </span>

              <span class="bg-blue-50 border border-blue-200 rounded px-3 py-1 text-blue-700">
                Ouverts :
                <strong>
                  {{ tickets.filter((t: any) => t.status === 'OPEN').length }}
                </strong>
              </span>

              <span class="bg-amber-50 border border-amber-200 rounded px-3 py-1 text-amber-700">
                En cours :
                <strong>
                  {{ tickets.filter((t: any) => t.status === 'IN_PROGRESS').length }}
                </strong>
              </span>

              <span class="bg-green-50 border border-green-200 rounded px-3 py-1 text-green-700">
                Résolus :
                <strong>
                  {{ tickets.filter((t: any) => t.status === 'RESOLVED').length }}
                </strong>
              </span>
            </div>
          </div>

          <!-- Search -->
          <div class="mb-6 max-w-md">
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>

              <input
                v-model="search"
                type="search"
                placeholder="Rechercher un ticket..."
                class="block w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              />
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    ID
                  </th>

                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Application
                  </th>

                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Sujet
                  </th>

                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>

                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Priorité
                  </th>

                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Statut
                  </th>

                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Assigné à
                  </th>

                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-200 bg-white">
                <tr
                  v-for="t in paginatedTickets"
                  :key="t.id"
                  class="hover:bg-slate-50 transition-colors"
                >
                  <!-- ID -->
                  <td class="px-6 py-5 whitespace-nowrap text-sm font-semibold text-blue-600">
                    #{{ t.id }}
                  </td>

                  <!-- App -->
                  <td class="px-6 py-5 whitespace-nowrap">
                    <span
                      class="inline-flex items-center rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {{ t.application?.name ?? '—' }}
                    </span>
                  </td>

                  <!-- Sujet -->
                  <td class="px-6 py-5 text-sm text-slate-900">
                    {{ t.subject }}
                  </td>

                  <!-- Type -->
                  <td class="px-6 py-5 text-sm text-slate-500">
                    {{ t.issueType?.name ?? '—' }}
                  </td>

                  <!-- Priorité -->
                  <td class="px-6 py-5 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <span
                        :class="[
                          'h-2.5 w-2.5 rounded-full',
                          priorityDot(t.priority)
                        ]"
                      />

                      <span class="text-sm text-slate-700">
                        {{ t.priority }}
                      </span>
                    </div>
                  </td>

                  <!-- Statut -->
                  <td class="px-6 py-5 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase',
                        statusClass(t.status)
                      ]"
                    >
                      {{ t.status }}
                    </span>
                  </td>

                  <!-- Assignation (readonly) -->
                  <td class="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                    {{
                      t.assignedTo?.name
                        ?? '— Non assigné —'
                    }}
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-5 whitespace-nowrap text-center">
                    <button
                      @click="openTicket(t)"
                      class="text-slate-400 hover:text-blue-600 transition"
                    >
                      <svg
                        class="h-5 w-5 inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5
                          c4.478 0 8.268 2.943 9.542 7
                          -1.274 4.057-5.064 7-9.542 7
                          -4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>

                <tr v-if="filteredTickets.length === 0">
                  <td
                    colspan="8"
                    class="px-6 py-12 text-center text-slate-400 text-sm"
                  >
                    Aucun résultat trouvé
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
          >
            <p class="text-sm text-slate-500">
              Affichage
              <span class="font-medium">
                {{ (currentPage - 1) * itemsPerPage + 1 }}
              </span>
              à
              <span class="font-medium">
                {{
                  Math.min(
                    currentPage * itemsPerPage,
                    filteredTickets.length
                  )
                }}
              </span>
              sur
              <span class="font-medium">
                {{ filteredTickets.length }}
              </span>
              tickets
            </p>

            <div class="flex items-center gap-2 flex-wrap justify-center">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Précédent
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-2 text-sm rounded-md border transition',
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                ]"
              >
                {{ page }}
              </button>

              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

        <!-- Détail ticket Admin -->
        <div v-if="activeTab === 'detail' && selectedTicket">
          <div class="flex items-center gap-4 mb-6">
            <button
              @click="activeTab = 'tickets'"
              class="text-slate-500 hover:text-slate-800 transition text-sm flex items-center gap-1"
            >
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
                  <option v-for="u in assignableUsers" :key="u.id" :value="u.id">{{ u.name }}</option>
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

        <!-- Users -->
        <div v-if="activeTab === 'users'">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Utilisateurs</h1>
            <p class="mt-1 text-sm text-slate-500">Gérez les comptes et les rôles des utilisateurs.</p>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle principal</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôles supplémentaires</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="u in staffUsers" :key="u.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">#{{ u.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ u.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ u.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 uppercase">
                      {{ u.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1 mb-2">
                      <span
                        v-for="ar in u.additionalRoles"
                        :key="ar.role"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                      >
                        {{ ar.role }}
                        <button @click="removeUserRole(u.id, ar.role)" class="text-blue-400 hover:text-red-500 font-bold">✕</button>
                      </span>
                      <span v-if="!u.additionalRoles?.length" class="text-slate-400 text-xs italic">Aucun</span>
                    </div>
                    <select
                      @change="(e) => { addUserRole(u.id, (e.target as HTMLSelectElement).value); (e.target as HTMLSelectElement).value = '' }"
                      class="block rounded-md border-0 py-1 px-2 text-gray-900 ring-1 ring-gray-300 text-xs focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">— Ajouter rôle —</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                      <option value="SUPPORT">SUPPORT</option>
                    </select>
                  </td>
                </tr>
                <tr v-if="staffUsers.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-slate-400 text-sm">Aucun utilisateur</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Applications -->
        <div v-if="activeTab === 'applications'">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Applications</h1>
            <p class="mt-1 text-sm text-slate-500">Liste des applications connectées à la plateforme.</p>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Manager</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">API Key</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="a in applications" :key="a.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">#{{ a.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ a.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {{ a.projectManager?.name ?? '—' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-xs font-mono text-slate-500">{{ a.apiKey }}</td>
                </tr>
                <tr v-if="applications.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-400 text-sm">Aucune application</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Clients -->
        <div v-if="activeTab === 'clients'">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
            <p class="mt-1 text-sm text-slate-500">Liste de tous les clients enregistrés.</p>
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

        <!-- IssueTypes -->
        <div v-if="activeTab === 'issuetypes'">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Types de problème</h1>
            <p class="mt-1 text-sm text-slate-500">Gérez les catégories de tickets disponibles pour les clients.</p>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
            <h3 class="text-base font-bold text-gray-900 mb-4">Ajouter un type</h3>
            <div v-if="issueTypeError" class="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{{ issueTypeError }}</div>
            <div v-if="issueTypeSuccess" class="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">{{ issueTypeSuccess }}</div>
            <div class="flex gap-4">
              <input
                v-model="newIssueType.name"
                type="text"
                placeholder="Nom du type (ex: Bug)"
                class="flex-1 rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              />
              <input
                v-model="newIssueType.description"
                type="text"
                placeholder="Description (optionnel)"
                class="flex-1 rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              />
              <button
                @click="createIssueType"
                class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Ajouter
              </button>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="it in issueTypes" :key="it.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">#{{ it.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{{ it.name }}</td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ it.description ?? '—' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button @click="removeIssueType(it.id)" class="text-red-500 hover:text-red-700 font-medium transition">
                      Supprimer
                    </button>
                  </td>
                </tr>
                <tr v-if="issueTypes.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-400 text-sm">Aucun type</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stats -->
        <div v-if="activeTab === 'stats'">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Statistiques</h1>
            <p class="mt-1 text-sm text-slate-500">Vue d'ensemble de la plateforme.</p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-center">
              <p class="text-4xl font-bold text-blue-600">{{ tickets.length }}</p>
              <p class="text-slate-500 mt-2 text-sm">Tickets total</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-center">
              <p class="text-4xl font-bold text-purple-600">{{ users.length }}</p>
              <p class="text-slate-500 mt-2 text-sm">Utilisateurs</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-center">
              <p class="text-4xl font-bold text-green-600">{{ applications.length }}</p>
              <p class="text-slate-500 mt-2 text-sm">Applications</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-center">
              <p class="text-4xl font-bold text-orange-600">{{ clients.length }}</p>
              <p class="text-slate-500 mt-2 text-sm">Clients</p>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-6 text-center">
              <p class="text-3xl font-bold text-blue-700">{{ tickets.filter((t: any) => t.status === 'OPEN').length }}</p>
              <p class="text-blue-600 mt-2 text-sm font-medium">Ouverts</p>
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded-lg shadow-sm p-6 text-center">
              <p class="text-3xl font-bold text-amber-700">{{ tickets.filter((t: any) => t.status === 'IN_PROGRESS').length }}</p>
              <p class="text-amber-600 mt-2 text-sm font-medium">En cours</p>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-lg shadow-sm p-6 text-center">
              <p class="text-3xl font-bold text-green-700">{{ tickets.filter((t: any) => t.status === 'RESOLVED').length }}</p>
              <p class="text-green-600 mt-2 text-sm font-medium">Résolus</p>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg shadow-sm p-6 text-center">
              <p class="text-3xl font-bold text-slate-700">{{ tickets.filter((t: any) => t.status === 'CLOSED').length }}</p>
              <p class="text-slate-600 mt-2 text-sm font-medium">Fermés</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>