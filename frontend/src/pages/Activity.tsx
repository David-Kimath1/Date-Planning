import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { History, User, Calendar, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'

interface ActivityItem {
  id: string
  action: string
  details?: any
  createdAt: string
  user?: {
    id: string
    name: string
  }
  event?: {
    id: string
    title: string
  }
}

export function Activity() {
  const token = useAuthStore((state) => state.token)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const queryClient = useQueryClient()

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const response = await fetch('/api/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch activity')
      return response.json() as Promise<ActivityItem[]>
    }
  })

  const { data: events } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch events')
      return response.json()
    }
  })

  const clearActivityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/activity/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to clear activity')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      setShowClearConfirm(false)
    },
  })

  const getActionIcon = (action: string) => {
    if (action.includes('CREATED')) return Plus
    if (action.includes('DELETED')) return Trash2
    if (action.includes('CONFIRMED')) return CheckCircle
    return History
  }

  const getActionColor = (action: string) => {
    if (action.includes('DELETED')) return 'text-red-600 bg-red-50'
    if (action.includes('CONFIRMED')) return 'text-green-600 bg-green-50'
    return 'text-indigo-600 bg-indigo-50'
  }

  const getActionLabel = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const allHistory = [
    ...(activities || []).map(a => ({
      id: a.id,
      type: 'activity',
      action: a.action,
      user: a.user?.name || 'Unknown',
      title: a.event?.title || (a.details?.title as string) || '',
      date: a.createdAt,
      details: a.details
    })),
    ...(events || []).map((e: any) => ({
      id: e.id,
      type: 'event',
      action: 'CREATED_EVENT',
      user: e.createdBy?.name || 'Unknown',
      title: e.title,
      date: e.createdAt,
      details: { status: e.status, eventDate: e.date, category: e.category }
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const groupedHistory = allHistory.reduce((groups: any, item) => {
    const date = format(new Date(item.date), 'yyyy-MM-dd')
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
    return groups
  }, {})

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Activity History</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Track all changes and actions</p>
        </div>
        
        {((activities?.length ?? 0) > 0 || (events?.length ?? 0) > 0) && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : groupedHistory && Object.keys(groupedHistory).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([date, items]: [string, any]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-gray-500 mb-4">
                {format(new Date(date), 'dddd, MMMM d, yyyy')}
              </h2>
              
              <div className="space-y-2">
                {items.map((item: any) => {
                  const Icon = getActionIcon(item.action)
                  const iconColor = getActionColor(item.action)
                  
                  return (
                    <div key={item.id} className="flex items-start p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
                      <div className={`flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center ${iconColor}`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{item.user}</span>{' '}
                          {getActionLabel(item.action)}
                          {item.title && (
                            <span className="text-gray-600"> "{item.title}"</span>
                          )}
                        </p>
                        
                        {item.details?.eventDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Event date: {format(new Date(item.details.eventDate), 'MMM d, yyyy')}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(item.date), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No activity yet</h3>
          <p className="text-gray-600 mt-1">Your activity history will appear here</p>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowClearConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Clear All Activity?</h3>
            <p className="text-sm text-gray-600 mt-2">
              This will permanently delete all activity history. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => clearActivityMutation.mutate()}
                disabled={clearActivityMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {clearActivityMutation.isPending ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
