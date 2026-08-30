import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, MapPin, Send, Trash2, Edit, ExternalLink } from 'lucide-react'
import { AddVenueModal } from '../components/venues/AddVenueModal'

interface Venue {
  id: string
  name: string
  location?: string
  website?: string
  category: string
  icon: string
  emoji?: string
  notes?: string
  status: string
  suggestedBy: {
    id: string
    name: string
  }
  event?: {
    id: string
    title: string
    date: string
  }
}

export function LJ() {
  const [showAddVenue, setShowAddVenue] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const queryClient = useQueryClient()

  const { data: venues, isLoading } = useQuery({
    queryKey: ['venues', 'lj'],
    queryFn: async () => {
      const response = await fetch('/api/venues?user=lj')
      if (!response.ok) throw new Error('Failed to fetch venues')
      return response.json() as Promise<Venue[]>
    }
  })

  const sendSuggestionMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const response = await fetch(`/api/venues/${venueId}/send`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to send suggestion')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })

  const deleteVenueMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete venue')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">LJ's Space</h1>
            <p className="text-gray-600 mt-1">Your personal suggestions and ideas</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddVenue(true)}
          className="inline-flex items-center px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Venue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{venues?.length || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Total Suggestions</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-green-600">
            {venues?.filter(v => v.status === 'AGREED').length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Agreed</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-yellow-600">
            {venues?.filter(v => v.status === 'PROPOSED').length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Pending</p>
        </div>
      </div>

      {/* Venues List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
        </div>
      ) : venues && venues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {venue.emoji ? (
                    <span className="text-3xl">{venue.emoji}</span>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-pink-50 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-pink-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{venue.name}</h3>
                    {venue.location && (
                      <p className="text-sm text-gray-600 mt-1">{venue.location}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        venue.status === 'AGREED'
                          ? 'bg-green-100 text-green-700'
                          : venue.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {venue.status}
                      </span>
                      {venue.event && (
                        <span className="text-xs text-gray-500">
                          for {venue.event.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSelectedVenue(venue)}
                    className="p-1 hover:bg-gray-50 rounded transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteVenueMutation.mutate(venue.id)}
                    className="p-1 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-sm text-pink-600 hover:text-pink-700 flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit website
                </a>
              )}

              {venue.notes && (
                <p className="mt-2 text-sm text-gray-600">{venue.notes}</p>
              )}

              {venue.status === 'PROPOSED' && !venue.event && (
                <button
                  onClick={() => sendSuggestionMutation.mutate(venue.id)}
                  className="mt-3 w-full inline-flex items-center justify-center px-3 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Dave
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No suggestions yet</h3>
          <p className="text-gray-600 mt-1">Start adding venue ideas for your future plans</p>
          <button
            onClick={() => setShowAddVenue(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Venue
          </button>
        </div>
      )}

      {/* Add Venue Modal */}
      {showAddVenue && (
        <AddVenueModal
          user="LJ"
          onClose={() => setShowAddVenue(false)}
        />
      )}
    </div>
  )
}