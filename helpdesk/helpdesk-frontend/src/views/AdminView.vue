<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NotificationBell from '@/components/NotificationBell.vue'


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

async function get(url: string) {
  const res = await fetch(`http://localhost:3000${url}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

async function patch(url: string, body: any) {
  const res = await fetch(`http://localhost:3000${url}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

const sortedTickets = computed(() => {
  return [...tickets.value].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

onMounted(async () => {
  tickets.value = await get('/tickets/admin/all')
  users.value = await get('/users')
  applications.value = await get('/applications')
  clients.value = await get('/clients')
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
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold">⚙️ Admin</h1>
        <NotificationBell />
      </div>

      <button
        v-for="tab in ['tickets','users','applications','clients','issuetypes','stats']"
        :key="tab"
        @click="activeTab = tab"
        :class="activeTab === tab ? 'bg-blue-600' : 'hover:bg-slate-700'"
        class="text-left px-4 py-2 rounded-lg capitalize transition"
      >
        {{
          tab === 'tickets' ? '🎫 Tickets' :
          tab === 'users' ? '👥 Utilisateurs' :
          tab === 'applications' ? '📱 Applications' :
          tab === 'clients' ? '🧑 Clients' :
          tab === 'issuetypes' ? '🏷️ Types de problème' :
          '📊 Statistiques'
        }}
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
        <h2 class="text-2xl font-bold mb-4">Tous les tickets</h2>
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
              </tr>
              <tr v-if="tickets.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-slate-400">Aucun ticket</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Users -->
      <div v-if="activeTab === 'users'">
        <h2 class="text-2xl font-bold mb-4">Utilisateurs</h2>
        <div class="bg-white rounded-2xl shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-100">
              <tr>
                <th class="text-left px-6 py-4">ID</th>
                <th class="text-left px-6 py-4">Nom</th>
                <th class="text-left px-6 py-4">Email</th>
                <th class="text-left px-6 py-4">Rôle principal</th>
                <th class="text-left px-6 py-4">Rôles supplémentaires</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id" class="border-t hover:bg-slate-50">
                <td class="px-6 py-4">#{{ u.id }}</td>
                <td class="px-6 py-4">{{ u.name }}</td>
                <td class="px-6 py-4">{{ u.email }}</td>
                <td class="px-6 py-4">
                  <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {{ u.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1 mb-2">
                    <span
                      v-for="ar in u.additionalRoles"
                      :key="ar.role"
                      class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                    >
                      {{ ar.role }}
                      <button
                        @click="removeUserRole(u.id, ar.role)"
                        class="text-blue-400 hover:text-red-500 font-bold ml-1"
                      >
                        ✕
                      </button>
                    </span>
                    <span v-if="!u.additionalRoles?.length" class="text-slate-400 text-xs">
                      Aucun rôle supplémentaire
                    </span>
                  </div>
                  <select
                    @change="(e) => { addUserRole(u.id, (e.target as HTMLSelectElement).value); (e.target as HTMLSelectElement).value = '' }"
                    class="border border-slate-300 rounded-lg px-2 py-1 text-sm"
                  >
                    <option value="">— Ajouter rôle —</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                    <option value="SUPPORT">SUPPORT</option>
                    <option value="CLIENT">CLIENT</option>
                  </select>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-slate-400">Aucun utilisateur</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Applications -->
      <div v-if="activeTab === 'applications'">
        <h2 class="text-2xl font-bold mb-4">Applications</h2>
        <div class="bg-white rounded-2xl shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-100">
              <tr>
                <th class="text-left px-6 py-4">ID</th>
                <th class="text-left px-6 py-4">Nom</th>
                <th class="text-left px-6 py-4">Project Manager</th>
                <th class="text-left px-6 py-4">API Key</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in applications" :key="a.id" class="border-t hover:bg-slate-50">
                <td class="px-6 py-4">#{{ a.id }}</td>
                <td class="px-6 py-4">{{ a.name }}</td>
                <td class="px-6 py-4">{{ a.projectManager?.name ?? '—' }}</td>
                <td class="px-6 py-4 font-mono text-xs text-slate-500">{{ a.apiKey }}</td>
              </tr>
              <tr v-if="applications.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-slate-400">Aucune application</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Clients -->
      <div v-if="activeTab === 'clients'">
        <h2 class="text-2xl font-bold mb-4">Clients</h2>
        <div class="bg-white rounded-2xl shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-100">
              <tr>
                <th class="text-left px-6 py-4">ID</th>
                <th class="text-left px-6 py-4">Nom</th>
                <th class="text-left px-6 py-4">Email</th>
                <th class="text-left px-6 py-4">Application</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in clients" :key="c.id" class="border-t hover:bg-slate-50">
                <td class="px-6 py-4">#{{ c.id }}</td>
                <td class="px-6 py-4">{{ c.name ?? '—' }}</td>
                <td class="px-6 py-4">{{ c.email ?? '—' }}</td>
                <td class="px-6 py-4">{{ c.application?.name ?? '—' }}</td>
              </tr>
              <tr v-if="clients.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-slate-400">Aucun client</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- IssueTypes -->
      <div v-if="activeTab === 'issuetypes'">
        <h2 class="text-2xl font-bold mb-4">Types de problème</h2>

        <!-- Formulaire création -->
        <div class="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">Ajouter un type</h3>
          <div v-if="issueTypeError" class="mb-4 bg-red-100 text-red-700 p-3 rounded-xl text-sm">{{ issueTypeError }}</div>
          <div v-if="issueTypeSuccess" class="mb-4 bg-green-100 text-green-700 p-3 rounded-xl text-sm">{{ issueTypeSuccess }}</div>
          <div class="flex gap-4">
            <input
              v-model="newIssueType.name"
              type="text"
              placeholder="Nom du type (ex: Bug)"
              class="flex-1 border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              v-model="newIssueType.description"
              type="text"
              placeholder="Description (optionnel)"
              class="flex-1 border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="createIssueType"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition"
            >
              Ajouter
            </button>
          </div>
        </div>

        <!-- Liste -->
        <div class="bg-white rounded-2xl shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-100">
              <tr>
                <th class="text-left px-6 py-4">ID</th>
                <th class="text-left px-6 py-4">Nom</th>
                <th class="text-left px-6 py-4">Description</th>
                <th class="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in issueTypes" :key="it.id" class="border-t hover:bg-slate-50">
                <td class="px-6 py-4">#{{ it.id }}</td>
                <td class="px-6 py-4 font-semibold">{{ it.name }}</td>
                <td class="px-6 py-4 text-slate-500">{{ it.description ?? '—' }}</td>
                <td class="px-6 py-4">
                  <button
                    @click="removeIssueType(it.id)"
                    class="text-red-600 hover:underline text-sm"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
              <tr v-if="issueTypes.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-slate-400">Aucun type</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="activeTab === 'stats'">
        <h2 class="text-2xl font-bold mb-4">Statistiques</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-2xl shadow p-6 text-center">
            <p class="text-4xl font-bold text-blue-600">{{ tickets.length }}</p>
            <p class="text-slate-500 mt-2">Tickets total</p>
          </div>
          <div class="bg-white rounded-2xl shadow p-6 text-center">
            <p class="text-4xl font-bold text-purple-600">{{ users.length }}</p>
            <p class="text-slate-500 mt-2">Utilisateurs</p>
          </div>
          <div class="bg-white rounded-2xl shadow p-6 text-center">
            <p class="text-4xl font-bold text-green-600">{{ applications.length }}</p>
            <p class="text-slate-500 mt-2">Applications</p>
          </div>
          <div class="bg-white rounded-2xl shadow p-6 text-center">
            <p class="text-4xl font-bold text-orange-600">{{ clients.length }}</p>
            <p class="text-slate-500 mt-2">Clients</p>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>