import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Heart, Utensils, Film, Plane, ShoppingBag, Star, User } from 'lucide-react'

const categories = [
  { id: 'FOOD', label: 'Food', icon: Utensils },
  { id: 'DATE', label: 'Date', icon: Heart },
  { id: 'MOVIE', label: 'Movie', icon: Film },
  { id: 'TRIP', label: 'Trip', icon: Plane },
  { id: 'SHOPPING', label: 'Shopping', icon: ShoppingBag },
  { id: 'IMPORTANT', label: 'Important', icon: Star },
  { id: 'CUSTOM', label: 'Custom', icon: User },
]

export function AddVenueModal({ user, onClose }: { user: 'Dave' | 'LJ'; onClose: () => void }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [category, setCategory] = useState('FOOD')
  const [emoji, setEmoji] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const addVenueMutation = useMutation({
    mutationFn: async (venueData: any) => {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venueData),
      })
      if (!response.ok) throw new Error('Failed to add venue')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter a venue name')
      return
    }
    addVenueMutation.mutate({
      name: name.trim(),
      location: location.trim() || undefined,
      website: website.trim() || undefined,
      category,
      emoji: emoji.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-display font-semibold text-gray-900">Add Venue for {user}</h2>
            <p className="text-sm text-gray-600 mt-1">Suggest a place for future plans</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-4 bg-red-50 rounded-lg"><p className="text-sm text-red-800">{error}</p></div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={`flex flex-col items-center p-3 rounded-lg border-2 ${category === cat.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                  <cat.icon className={`h-6 w-6 ${category === cat.id ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="text-xs mt-1">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emoji (Optional)</label>
            <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Cancel</button>
            <button type="submit" disabled={addVenueMutation.isPending} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {addVenueMutation.isPending ? 'Adding...' : 'Add Venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
