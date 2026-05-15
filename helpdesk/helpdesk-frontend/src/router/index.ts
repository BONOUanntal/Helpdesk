import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminView from '@/views/AdminView.vue'
import SupportView from '@/views/SupportView.vue'
import ProjectManagerView from '@/views/ProjectManagerView.vue'
import ClientView from '@/views/ClientView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    { path: '/admin', component: AdminView, meta: { role: 'ADMIN' } },
    { path: '/support', component: SupportView, meta: { role: 'SUPPORT' } },
    { path: '/pm', component: ProjectManagerView, meta: { role: 'PROJECT_MANAGER' } },
    { path: '/client', component: ClientView, meta: { role: 'CLIENT' } },
  ],
})

// Guard : redirige si le rôle ne correspond pas
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const activeRole = localStorage.getItem('activeRole')
  const role = activeRole || localStorage.getItem('role')

  if (to.path !== '/login' && !token) return '/login'
  if (to.meta.role && to.meta.role !== role) return '/login'
})

export default router
