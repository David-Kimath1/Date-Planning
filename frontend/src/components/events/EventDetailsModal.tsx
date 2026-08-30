import { playSound } from '../../utils/sounds'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Calendar, Clock, MapPin, User, Star, Heart, Utensils, Film, Plane, Gift, ShoppingBag, CheckCircle, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Countdown } from '../countdown/Countdown'
import { useAuthStore } from '../../store/authStore'

interface EventDetailsModalProps {
  event: any
  onClose: () => void
}

export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  const getCategoryIcon = (category: string) => {
    const icons: any = { DATE: Heart, FOOD: Utensils, MOVIE: Film, TRIP: Plane, BIRTHDAY: Gift, ANNIVERSARY: Heart, SHOPPING: ShoppingBag, IMPORTANT: Star, CUSTOM: Calendar }
    return icons[category] || Calendar
  }
  const CategoryIcon = getCategoryIcon(event.category)

  const confirmEventMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${event.id}/confirm`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to confirm event')
      return response.json()
    },
   onSuccess: () => {
    playSound('confirm')
    queryClient.invalidateQueries({ queryKey: ['events'] })
    queryClient.invalidateQueries({ queryKey: ['plans'] })
    onClose()
   },
  })

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      console.log('Deleting event:', event.id)
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete event')
      }
      return response.json()
    },
    onSuccess: () => {
      playSound('delete')
      console.log('Event deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setShowConfirmDelete(false)
      onClose()
    },
    onError: (error: any) => {
      console.error('Delete error:', error)
      setDeleteError(error.message || 'Failed to delete event')
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg">
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-6">
            <div className="flex items-center space-x-2">
              <CategoryIcon className="h-6 w-6 text-white" />
              <h2 className="text-2xl font-display font-bold text-white">
                {event.emoji && <span className="mr-2">{event.emoji}</span>}
                {event.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              event.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
              event.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              event.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {event.status}
            </span>
            {event.isImportant && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-pink-700">
                <Star className="h-3 w-3 mr-1" /> Important
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">{format(new Date(event.date), 'dddd, MMMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900">{format(new Date(event.date), 'HH:mm')}</p>
              </div>
            </div>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{event.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Created by</p>
                <p className="font-medium text-gray-900">{event.createdBy?.name || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          {event.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700">{event.notes}</p>
            </div>
          )}

          {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Countdown</h3>
              <Countdown targetDate={event.date} />
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            {event.status === 'AWAITING_AGREEMENT' && (
              <button
                onClick={() => confirmEventMutation.mutate()}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Add to Calendar
              </button>
            )}
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowConfirmDelete(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Delete Event?</h3>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. Are you sure you want to delete "{event.title}"?
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 mt-2">{deleteError}</p>
            )}
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteEventMutation.mutate()}
                disabled={deleteEventMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
