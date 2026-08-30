import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Moon, Clock, Smartphone, User, Save, CheckCircle, Volume2, VolumeX } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { isSoundEnabled, setSoundEnabled, playSound } from '../utils/sounds'

export function Settings() {
  const { user, updateUser } = useAuthStore()
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(!!user?.quietHoursStart)
  const [quietHoursStart, setQuietHoursStart] = useState(user?.quietHoursStart || '23:00')
  const [quietHoursEnd, setQuietHoursEnd] = useState(user?.quietHoursEnd || '07:00')
  const [reminderPrefs, setReminderPrefs] = useState({
    oneMonth: true,
    oneWeek: true,
    oneDay: true,
    oneHour: true,
    fifteenMinutes: false,
    custom: false,
  })
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled())
  const [saved, setSaved] = useState(false)
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      })
      if (!response.ok) throw new Error('Failed to save settings')
      return response.json()
    },
    onSuccess: (data) => {
      updateUser(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const handleSave = () => {
    saveSettingsMutation.mutate({
      quietHoursStart: quietHoursEnabled ? quietHoursStart : null,
      quietHoursEnd: quietHoursEnabled ? quietHoursEnd : null,
      reminderPrefs,
      notificationsEnabled,
    })
  }

  const handleSoundToggle = () => {
    const newState = !soundEnabled
    setSoundEnabledState(newState)
    setSoundEnabled(newState)
    if (newState) {
      playSound('notification')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Personalize your experience</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-gray-500" />
          Profile
        </h2>
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-indigo-400 to-pink-500 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 mr-2 text-gray-500" />
          ) : (
            <VolumeX className="h-5 w-5 mr-2 text-gray-500" />
          )}
          Sound
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Sound Notifications</p>
            <p className="text-sm text-gray-600">Play sounds for plan actions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={handleSoundToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => playSound('create')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm text-gray-700">Test Create Sound</span>
            <Volume2 className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={() => playSound('confirm')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm text-gray-700">Test Confirm Sound</span>
            <Volume2 className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={() => playSound('delete')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm text-gray-700">Test Delete Sound</span>
            <Volume2 className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-gray-500" />
          Notifications
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Push Notifications</p>
            <p className="text-sm text-gray-600">Receive notifications on your device</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Quiet Hours Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Moon className="h-5 w-5 mr-2 text-gray-500" />
          Quiet Hours
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Enable Quiet Hours</p>
            <p className="text-sm text-gray-600">Delay notifications during specific hours</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={quietHoursEnabled}
              onChange={(e) => setQuietHoursEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {quietHoursEnabled && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Reminder Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-gray-500" />
          Default Reminder Preferences
        </h2>
        
        <div className="space-y-3">
          {[
            { key: 'oneMonth', label: '1 month before' },
            { key: 'oneWeek', label: '1 week before' },
            { key: 'oneDay', label: '1 day before' },
            { key: 'oneHour', label: '1 hour before' },
            { key: 'fifteenMinutes', label: '15 minutes before' },
            { key: 'custom', label: 'Custom reminder' },
          ].map((reminder) => (
            <label key={reminder.key} className="flex items-center">
              <input
                type="checkbox"
                checked={reminderPrefs[reminder.key as keyof typeof reminderPrefs]}
                onChange={(e) => setReminderPrefs({
                  ...reminderPrefs,
                  [reminder.key]: e.target.checked
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{reminder.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        {saved && (
          <span className="mr-4 text-sm text-green-600 flex items-center">
            <CheckCircle className="h-5 w-5 mr-1" />
            Settings saved!
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  )
}
