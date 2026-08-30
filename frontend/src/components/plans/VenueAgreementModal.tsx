import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, MapPin, CheckCircle, XCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'

interface VenueAgreementModalProps {
  plan: any
  onClose: () => void
}

export function VenueAgreementModal({ plan, onClose }: VenueAgreementModalProps) {
  const [showAddVenue, setShowAddVenue] = useState(false)
  const [newVenue, setNewVenue] = useState({ name: '', location: '', website: '', category: 'FOOD', emoji: '', notes: '' })
  const queryClient = useQueryClient()

  const agreeVenueMutation = useMutation({
    mutationFn: async ({ venueId, action }: { venueId: string; action: 'agree' | 'reject' }) => {
      const response = await fetch(`/api/venues/${venueId}/${action}`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to update venue')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const addVenueMutation = useMutation({
    mutationFn: async (venueData: any) => {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...venueData, eventId: plan.id }),
      })
      if (!response.ok) throw new Error('Failed to add venue')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setShowAddVenue(false)
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-display font-semibold text-gray-900">Venue Agreement</h2>
            <p className="text-sm text-gray-600 mt-1">{plan.title} - {format(new Date(plan.date), 'dd MMM yyyy')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Agreement Status</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${plan.agreements?.[0]?.agreedByDave ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <span className="text-sm font-bold text-gray-700">D</span>
                </div>
                <span className="ml-2 text-sm text-gray-600">{plan.agreements?.[0]?.agreedByDave ? 'Agreed' : 'Pending'}</span>
              </div>
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${plan.agreements?.[0]?.agreedByLJ ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <span className="text-sm font-bold text-gray-700">L</span>
                </div>
                <span className="ml-2 text-sm text-gray-600">{plan.agreements?.[0]?.agreedByLJ ? 'Agreed' : 'Pending'}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Proposed Venues</h3>
            {plan.venue && (
              <div className="p-4 rounded-lg border-2 border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {plan.venue.emoji ? <span className="text-2xl">{plan.venue.emoji}</span> : <MapPin className="h-6 w-6 text-gray-500" />}
                    <div>
                      <h4 className="font-medium text-gray-900">{plan.venue.name}</h4>
                      {plan.venue.location && <p className="text-sm text-gray-600 mt-1">{plan.venue.location}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => agreeVenueMutation.mutate({ venueId: plan.venue.id, action: 'agree' })} className="p-2 hover:bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </button>
                    <button onClick={() => agreeVenueMutation.mutate({ venueId: plan.venue.id, action: 'reject' })} className="p-2 hover:bg-red-50 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showAddVenue ? (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Venue</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Venue name" value={newVenue.name} onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  <input type="text" placeholder="Location" value={newVenue.location} onChange={(e) => setNewVenue({ ...newVenue, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  <div className="flex space-x-2">
                    <button onClick={() => addVenueMutation.mutate(newVenue)} disabled={!newVenue.name} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">Add Venue</button>
                    <button onClick={() => setShowAddVenue(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddVenue(true)} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 flex items-center justify-center">
                <Plus className="h-5 w-5 mr-2" />
                Propose Another Venue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
