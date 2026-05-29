<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const roles = ref<string[]>([])
const showRoleSelector = ref(false)
const showPassword = ref(false)

const router = useRouter()

async function login() {
  error.value = ''

  try {
    const response = await fetch(
      'http://localhost:3000/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      error.value =
        data.message || 'Erreur de connexion'
      return
    }

    const payload = JSON.parse(
      atob(data.access_token.split('.')[1])
    )

    localStorage.setItem(
      'token',
      data.access_token
    )

    localStorage.setItem(
      'userId',
      String(payload.userId)
    )

    const userRoles: string[] =
      payload.roles ||
      (payload.role
        ? [payload.role]
        : [])

    localStorage.setItem(
      'roles',
      JSON.stringify(userRoles)
    )

    roles.value = userRoles

    if (userRoles.length === 0) {
      error.value =
        'Aucun rôle attribué'
      return
    }

    if (userRoles.length === 1) {
      redirectByRole(userRoles[0])
      return
    }

    showRoleSelector.value = true
  } catch {
    error.value =
      'Serveur inaccessible'
  }
}

function redirectByRole(role: string) {
  localStorage.setItem(
    'activeRole',
    role
  )

  localStorage.setItem(
    'role',
    role
  )

  if (role === 'ADMIN')
    router.push('/admin')
  else if (role === 'SUPPORT')
    router.push('/support')
  else if (
    role === 'PROJECT_MANAGER'
  )
    router.push('/pm')
  else if (role === 'CLIENT')
    router.push('/client')
  else
    error.value =
      'Rôle non reconnu'
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-6 bg-[#f8f9ff] relative overflow-hidden login-canvas"
  >
    <!-- Background blur -->
    <div
      class="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"
    ></div>

    <div
      class="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-200/20 rounded-full blur-[100px]"
    ></div>

    <main class="w-full max-w-[440px] relative z-10">
      <!-- Brand -->
      <div class="mb-6 flex flex-col items-center">
        <div class="mb-1 text-center">
          <h1
            class="text-[30px] font-semibold text-blue-700"
          >
            HelpDesk
          </h1>
        </div>

        <p
          class="text-xs tracking-[0.2em] uppercase text-slate-500 font-bold"
        >
          IT MANAGEMENT PLATFORM
        </p>
      </div>

      <!-- Card -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm"
      >
        <div class="mb-6">
          <h2
            class="text-2xl font-semibold text-slate-900 mb-2"
          >
            Connexion
          </h2>

          <p class="text-slate-500 text-sm">
            Connectez-vous à votre
            dashboard HelpDesk.
          </p>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <!-- LOGIN FORM -->
        <div
          v-if="!showRoleSelector"
          class="space-y-5"
        >
          <!-- Email -->
          <div>
            <label
              class="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2"
            >
              Adresse Email
            </label>

            <input
              v-model="email"
              type="email"
              placeholder="name@company.com"
              class="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
            />
          </div>

          <!-- Password -->
          <div>
            <label
              class="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2"
            >
              Mot de passe
            </label>

            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full px-4 pr-12 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
                @keydown.enter="login"
              />

              <!-- Toggle password -->
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                @click="showPassword = !showPassword"
              >
                <span class="text-lg">
                  {{
                    showPassword
                      ? '🙈'
                      : '👁️'
                  }}
                </span>
              </button>
            </div>
          </div>

          <!-- Button -->
          <button
            @click="login"
            class="w-full bg-blue-700 text-white font-semibold py-3 rounded-md hover:bg-blue-800 active:scale-[0.98] transition mt-6"
          >
            Se connecter
          </button>
        </div>

        <!-- ROLE SELECTOR -->
        <div
          v-if="showRoleSelector"
          class="space-y-3"
        >
          <p
            class="font-semibold text-slate-700 mb-4"
          >
            Choisissez votre espace :
          </p>

          <button
            v-for="role in roles"
            :key="role"
            @click="redirectByRole(role)"
            class="w-full border border-slate-300 rounded-lg py-3 hover:border-blue-500 hover:bg-blue-50 transition font-medium"
          >
            {{
              role === 'ADMIN'
                ? '⚙️ Admin'
                : role === 'PROJECT_MANAGER'
                ? '📋 Project Manager'
                : role === 'SUPPORT'
                ? '🎧 Support'
                : '👤 Client'
            }}
          </button>
        </div>
      </div>

      <!-- Footer -->
      <footer
        class="mt-8 text-center text-sm text-slate-500"
      >
        © 2026 HelpDesk
      </footer>
    </main>
  </div>
</template>

<style scoped>
.login-canvas {
  background-image:
    radial-gradient(
      circle at 2px 2px,
      #d3e4fe 1px,
      transparent 0
    );

  background-size: 40px 40px;
}
</style>