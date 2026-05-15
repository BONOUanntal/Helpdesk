<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const roles = ref<string[]>([])
const showRoleSelector = ref(false)

const router = useRouter()

async function login() {
  error.value = ''

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.message || 'Erreur de connexion'
      return
    }

    const payload = JSON.parse(atob(data.access_token.split('.')[1]))

    localStorage.setItem('token', data.access_token)
    localStorage.setItem('userId', String(payload.userId))

    const userRoles: string[] = payload.roles || (payload.role ? [payload.role] : [])
    localStorage.setItem('roles', JSON.stringify(userRoles))
    roles.value = userRoles

    if (userRoles.length === 0) {
      error.value = 'Aucun rôle attribué'
      return
    }

    if (userRoles.length === 1) {
      redirectByRole(userRoles[0])
      return
    }

    showRoleSelector.value = true

  } catch (err) {
    error.value = 'Serveur inaccessible'
  }
}

function redirectByRole(role: string) {
  localStorage.setItem('activeRole', role)
  localStorage.setItem('role', role)  // ← ajoute ça pour compatibilité

  if (role === 'ADMIN') router.push('/admin')
  else if (role === 'SUPPORT') router.push('/support')
  else if (role === 'PROJECT_MANAGER') router.push('/pm')
  else if (role === 'CLIENT') router.push('/client')
  else error.value = 'Rôle non reconnu'
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex">

    <!-- Left side -->
    <div class="hidden lg:flex w-1/2 bg-blue-700 text-white p-16 flex-col justify-between">
      <div>
        <h1 class="text-4xl font-bold mb-4">SupportDesk</h1>
        <p class="text-blue-100 text-lg">Plateforme moderne de gestion des tickets support.</p>
      </div>

      <div class="space-y-6">
        <div class="bg-white/10 backdrop-blur rounded-2xl p-6">
          <h2 class="text-xl font-semibold mb-2">Gestion centralisée</h2>
          <p class="text-blue-100">Visualisez tous vos tickets et suivez leur évolution en temps réel.</p>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-2xl p-6">
          <h2 class="text-xl font-semibold mb-2">Authentification sécurisée</h2>
          <p class="text-blue-100">JWT + rôles utilisateurs + accès protégés.</p>
        </div>
      </div>

      <p class="text-sm text-blue-200">© 2026 SupportDesk</p>
    </div>

    <!-- Right side -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl p-10">

        <div class="mb-8 text-center">
          <h2 class="text-3xl font-bold text-slate-800">Connexion</h2>
          <p class="text-slate-500 mt-2">Connectez-vous à votre espace support</p>
        </div>

        <div v-if="error" class="mb-4 bg-red-100 text-red-700 p-3 rounded-xl">
          {{ error }}
        </div>

        <!-- Formulaire login -->
        <div v-if="!showRoleSelector" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="client@test.com"
              class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            @click="login"
            class="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition"
          >
            Se connecter
          </button>
        </div>

        <!-- Sélecteur de rôle -->
        <div v-if="showRoleSelector" class="space-y-3">
          <p class="font-semibold text-slate-700 mb-4">Choisissez votre espace :</p>
          <button
            v-for="role in roles"
            :key="role"
            @click="redirectByRole(role)"
            class="w-full bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition rounded-xl py-3 font-medium text-slate-700"
          >
            {{
              role === 'ADMIN' ? '⚙️ Admin' :
              role === 'PROJECT_MANAGER' ? '📋 Project Manager' :
              role === 'SUPPORT' ? '🎧 Support' :
              '👤 Client'
            }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>