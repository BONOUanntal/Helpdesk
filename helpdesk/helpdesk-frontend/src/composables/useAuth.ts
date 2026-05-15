export function useAuth() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const name = localStorage.getItem('name')
  const email = localStorage.getItem('email')

  return {
    token,
    role,
    name,
    email,
    isAdmin: role === 'ADMIN',
    isSupport: role === 'SUPPORT',
    isProjectManager: role === 'PROJECT_MANAGER',
  }
}