import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { AppLayout } from './components/layout/AppLayout'
import { Home } from './pages/Home'
import { Calendar } from './pages/Calendar'
import { Plans } from './pages/Plans'
import { Dave } from './pages/Dave'
import { LJ } from './pages/LJ'
import { Notifications } from './pages/Notifications'
import { Activity } from './pages/Activity'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'

function App() {
  const { token, checkAuth } = useAuthStore()

  useEffect(() => {
    if (token) {
      checkAuth()
    }
  }, [token, checkAuth])

  if (!token) {
    return <Login />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/dave" element={<Dave />} />
        <Route path="/lj" element={<LJ />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App