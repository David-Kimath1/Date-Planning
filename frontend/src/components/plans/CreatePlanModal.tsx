import { playSound } from '../../utils/sounds'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Heart, Utensils, Film, Plane, Gift, ShoppingBag, Star, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const categories = [
  { id: 'DATE', label: 'Date', icon: Heart },
  { id: 'FOOD', label: 'Food', icon: Utensils },
  { id: 'MOVIE', label: 'Movie', icon: Film },
  { id: 'TRIP', label: 'Trip', icon: Plane },
  { id: 'BIRTHDAY', label: 'Birthday', icon: Gift },
  { id: 'ANNIVERSARY', label: 'Anniversary', icon: Heart },
  { id: 'SHOPPING', label: 'Shopping', icon: ShoppingBag },
  { id: 'IMPORTANT', label: 'Important', icon: Star },
  { id: 'CUSTOM', label: 'Custom', icon: User },
]

interface CreatePlanModalProps {
  onClose: () => void
  prefillDate?: string
}

export function CreatePlanModal({ onClose, prefillDate }: CreatePlanModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(prefillDate || '')
  const [time, setTime] = useState('')
  const [category, setCategory] = useState('DATE')
  const [icon, setIcon] = useState('heart')
  const [emoji, setEmoji] = useState('')
  const [isImportant, setIsImportant] = useState(false)
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      console.log('Creating plan with data:', planData)
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Server error:', data)
        throw new Error(data.message || 'Failed to create plan')
      }
      
      console.log('Plan created successfully:', data)
      return data
    },
   onSuccess: () => {
    playSound('create')
    queryClient.invalidateQueries({ queryKey: ['plans'] })
    queryClient.invalidateQueries({ queryKey: ['events'] })
    onClose()
   },
    onError: (error: any) => {
      console.error('Mutation error:', error)
      setError(error.message || 'Failed to create plan')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!title.trim()) {
      setError('Please enter a title')
      return
    }
    
    if (!date) {
      setError('Please select a date')
      return
    }
    
    const dateTime = new Date(`${date}T${time || '12:00'}:00`)
    
    const planData = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: dateTime.toISOString(),
      location: location.trim() || undefined,
      category,
      icon,
      emoji: emoji.trim() || undefined,
      isImportant,
      notes: notes.trim() || undefined,
      status: 'IDEA',
    }
    
    console.log('Submitting plan:', planData)
    createPlanMutation.mutate(planData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-display font-semibold text-gray-900">Create New Plan</h2>
            <p className="text-sm text-gray-600 mt-1">Start planning something special</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Lunch Date, Movie Night, Weekend Trip"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your plan..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id)
                    setIcon(cat.icon)
                  }}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                    category === cat.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <cat.icon className={`h-6 w-6 ${category === cat.id ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className={`text-xs mt-1 ${category === cat.id ? 'text-primary-700 font-medium' : 'text-gray-600'}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emoji (Optional)</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="Add an emoji..."
              maxLength={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Nairobi, Kilimani, Karen"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="important"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="important" className="ml-2 text-sm text-gray-700">
              Mark as important event
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPlanMutation.isPending}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
