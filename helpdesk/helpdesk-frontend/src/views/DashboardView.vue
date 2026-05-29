<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

import {
  Ticket,
  Plus,
  Clock3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-vue-next'

const auth = useAuth()

const tickets = ref([])


async function fetchTickets() {
  try {
    const token = localStorage.getItem('token')

    const response = await fetch('http://localhost:3000/tickets', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Erreur récupération tickets')
    }

    const data = await response.json()

    console.log(data)

    tickets.value = data

  } catch (error) {
    console.error(error)
  }
}

const sortedTickets = computed(() => {
  return [...tickets.value].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

onMounted(() => {
  fetchTickets()
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-8">

    <div class="flex justify-between items-center mb-8">
      <div>
        <div class="flex items-center gap-3">
          <Ticket class="w-9 h-9 text-blue-600" />

          <h1 class="text-4xl font-bold text-slate-800">
            Tableau de bord
          </h1>
        </div>

        <p class="text-slate-500 mt-2">
          Gestion des tickets support
        </p>
      </div>

      <button
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition shadow"
      >
        <Plus class="w-5 h-5" />
        Nouveau ticket
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

      <div class="bg-white rounded-2xl p-5 shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">
              Tickets totaux
            </p>

            <h2 class="text-3xl font-bold text-slate-800 mt-1">
              {{ tickets.length }}
            </h2>
          </div>

          <Ticket class="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">
              Tickets ouverts
            </p>

            <h2 class="text-3xl font-bold text-orange-500 mt-1">
              {{
                tickets.filter(
                  t => t.status === 'OPEN'
                ).length
              }}
            </h2>
          </div>

          <Clock3 class="w-8 h-8 text-orange-500" />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">
              Résolus
            </p>

            <h2 class="text-3xl font-bold text-green-600 mt-1">
              {{
                tickets.filter(
                  t => t.status === 'RESOLVED'
                ).length
              }}
            </h2>
          </div>

          <CheckCircle2 class="w-8 h-8 text-green-600" />
        </div>
      </div>

    </div>

    <div class="bg-white rounded-2xl shadow overflow-hidden">

      <div class="px-6 py-4 border-b border-slate-200">
        <h2 class="text-xl font-bold text-slate-800">
          Liste des tickets
        </h2>
      </div>

      <div v-if="auth.isAdmin">
        <h1>Dashboard Admin</h1>
      </div>

      <div v-if="auth.isSupport">
        <h1>Dashboard Support</h1>
      </div>

      <div v-if="auth.isProjectManager">
        <h1>Dashboard Project Manager</h1>
      </div>

      <table class="w-full">

        <thead class="bg-slate-100">
          <tr>
            <th class="text-left px-6 py-4">ID</th>
            <th class="text-left px-6 py-4">Titre</th>
            <th class="text-left px-6 py-4">Description</th>
            <th class="text-left px-6 py-4">Status</th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="ticket in sortedTickets"
            :key="ticket.id"
            class="border-t border-slate-100 hover:bg-slate-50"
          >
            <td class="px-6 py-4 font-semibold text-blue-600">
              #{{ ticket.id }}
            </td>

            <td class="px-6 py-4">
              {{ ticket.subject }}
            </td>

            <td class="px-6 py-4">
              {{ ticket.priority }}
            </td>

            <td class="px-6 py-4">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  ticket.status === 'OPEN'
                    ? 'bg-orange-100 text-orange-700'
                    : ticket.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                ]"
              >
                {{ ticket.status }}
              </span>
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</template>
```
