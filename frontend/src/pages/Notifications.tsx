import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Calendar, MapPin, Clock, Star, Users, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  eventId?: string
  event?: {
    id: string
    title: string
    date: string
  }
}

export function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter === 'unread') {
        params.append('read', 'false')
      } else if (filter === 'read') {
        params.append('read', 'true')
      }
      const response = await fetch(`/api/notifications?${params}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      return response.json() as Promise<Notification[]>
    }
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      })
      if (!response.ok) throw new Error('Failed to mark notification as read')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      })
      if (!response.ok) throw new Error('Failed to mark all as read')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_VENUE_SUGGESTION':
      case 'VENUE_AGREED':
      case 'VENUE_REJECTED':
        return MapPin
      case 'NEW_EVENT':
      case 'EVENT_UPDATED':
      case 'EVENT_CANCELLED':
      case 'PLAN_CONFIRMED':
        return Calendar
      case 'REMINDER':
      case 'CUSTOM_REMINDER':
        return Clock
      case 'SUGGESTION_ACCEPTED':
      case 'SUGGESTION_REJECTED':
      case 'COUNTER_PROPOSAL':
        return Users
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    if (type.includes('AGREED') || type.includes('CONFIRMED') || type.includes('ACCEPTED')) {
      return 'text-green-600 bg-green-50'
    }
    if (type.includes('REJECTED') || type.includes('CANCELLED')) {
      return 'text-red-600 bg-red-50'
    }
    if (type.includes('REMINDER')) {
      return 'text-yellow-600 bg-yellow-50'
    }
    return 'text-indigo-600 bg-indigo-50'
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <CheckCheck className="h-5 w-5 mr-2" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'read', label: 'Read' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${filter === tab.key
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1 text-xs bg-pink-500 text-white rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            const iconColor = getNotificationColor(notification.type)
            
            return (
              <div
                key={notification.id}
                className={`
                  flex items-start p-4 rounded-lg transition-colors
                  ${notification.read ? 'bg-white' : 'bg-indigo-50/50 border border-indigo-100'}
                `}
              >
                <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Mark as read"
                      >
                        <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                    <span>{format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}</span>
                    {notification.event && (
                      <>
                        <span>•</span>
                        <span>{notification.event.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-600 mt-1">
            {filter === 'unread' ? 'You have no unread notifications' : 'Your notifications will appear here'}
          </p>
        </div>
      )}
    </div>
  )
}