import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Calendar, ClipboardList, User, Bell, History, Settings, LogOut, Heart } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Plans', href: '/plans', icon: ClipboardList },
  { name: 'Dave', href: '/dave', icon: User },
  { name: 'LJ', href: '/lj', icon: User },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Activity', href: '/activity', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-display font-semibold">Dave & LJ</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-semibold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-gray-700 flex items-center mt-0.5">
                <LogOut className="h-3 w-3 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <span className="text-lg font-display font-semibold">Dave & LJ</span>
          </div>
          <button onClick={handleLogout} className="p-2">
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around">
          {navigation.slice(0, 5).map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 text-xs font-medium ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`
              }
            >
              <item.icon className="h-6 w-6" />
              <span className="mt-1">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
