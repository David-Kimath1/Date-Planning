import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  quietHoursStart?: string
  quietHoursEnd?: string
  reminderPrefs: any
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  setAuth: (token: string, refreshToken: string, user: User) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user }),
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) set({ user: { ...currentUser, ...userData } })
      },
      logout: () => set({ token: null, refreshToken: null, user: null }),
      checkAuth: async () => {
        const { token } = get()
        if (!token) return
        try {
          const response = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (!response.ok) throw new Error('Token invalid')
          const data = await response.json()
          set({ user: data.user })
        } catch (error) {
          get().logout()
        }
      }
    }),
    {
      name: 'dave-lj-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user
      })
    }
  )
)
