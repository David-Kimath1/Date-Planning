import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, MapPin, Clock, Users, CheckCircle, MessageCircle, ChevronRight, Star, Heart } from 'lucide-react'
import { format } from 'date-fns'
import { CreatePlanModal } from '../components/plans/CreatePlanModal'
import { VenueAgreementModal } from '../components/plans/VenueAgreementModal'
import { EventDetailsModal } from '../components/events/EventDetailsModal'
import { useAuthStore } from '../store/authStore'

interface Plan {
  id: string
  title: string
  description?: string
  date: string
  status: string
  isImportant: boolean
  category: string
  icon: string
  emoji?: string
  venue?: {
    id: string
    name: string
    location?: string
    status: string
    suggestedBy?: {
      id: string
      name: string
    }
  }
  agreements: Array<{
    id: string
    venue: {
      id: string
      name: string
      location?: string
    }
    agreedByDave: boolean
    agreedByLJ: boolean
    agreedAt?: string
  }>
  createdBy: {
    id: string
    name: string
  }
}

export function Plans() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showAgreementModal, setShowAgreementModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'idea' | 'proposed' | 'confirmed'>('all')
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['plans', filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter.toUpperCase())
      }
      const response = await fetch(`/api/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch plans')
      }
      const data = await response.json()
      console.log('Fetched plans:', data)
      return data as Plan[]
    }
  })

  const confirmPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch(`/api/events/${planId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to confirm plan')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      IDEA: { color: 'bg-gray-100 text-gray-700', label: 'Idea' },
      PROPOSED: { color: 'bg-blue-100 text-blue-700', label: 'Proposed' },
      AWAITING_AGREEMENT: { color: 'bg-yellow-100 text-yellow-700', label: 'Awaiting Agreement' },
      CONFIRMED: { color: 'bg-green-100 text-green-700', label: 'Confirmed' },
      COMPLETED: { color: 'bg-purple-100 text-purple-700', label: 'Completed' },
      CANCELLED: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
    }
    return statusConfig[status] || statusConfig.IDEA
  }

  const hasAgreement = (plan: Plan) => {
    return plan.agreements?.some(a => a.agreedByDave && a.agreedByLJ)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading plans: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Plans</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">From ideas to confirmed plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-all shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Plan
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Plans' },
          { key: 'idea', label: 'Ideas' },
          { key: 'proposed', label: 'Proposed' },
          { key: 'confirmed', label: 'Confirmed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`
              px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors
              ${filter === tab.key
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plans List */}
      {plans && plans.length > 0 ? (
        <div className="space-y-4">
          {plans.map((plan) => {
            const statusBadge = getStatusBadge(plan.status)
            const agreementReached = hasAgreement(plan)
            
            return (
              <div
                key={plan.id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-indigo-50 to-pink-50 flex flex-col items-center justify-center">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        {format(new Date(plan.date), 'dd')}
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        {format(new Date(plan.date), 'MMM')}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {plan.isImportant && <Star className="h-4 w-4 sm:h-5 sm:w-5 inline text-pink-500 mr-1" />}
                          {plan.emoji && <span className="mr-1">{plan.emoji}</span>}
                          {plan.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {format(new Date(plan.date), 'HH:mm')}
                        </span>
                        
                        {plan.venue && (
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {plan.venue.name}
                            {plan.venue.location && ` - ${plan.venue.location}`}
                          </span>
                        )}
                        
                        <span className="flex items-center">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {plan.createdBy?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="flex-shrink-0 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Agreement Status */}
                {plan.status !== 'CONFIRMED' && plan.venue && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Venue Agreement</h4>
                    
                    {agreementReached ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="text-sm font-medium">
                          Agreed on {plan.venue.name}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Venue: <span className="font-medium">{plan.venue.name}</span>
                        </p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className={plan.agreements?.[0]?.agreedByDave ? 'text-green-600' : 'text-gray-400'}>
                            Dave: {plan.agreements?.[0]?.agreedByDave ? '✓' : '○'}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className={plan.agreements?.[0]?.agreedByLJ ? 'text-green-600' : 'text-gray-400'}>
                            LJ: {plan.agreements?.[0]?.agreedByLJ ? '✓' : '○'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedPlan(plan)
                            setShowAgreementModal(true)
                          }}
                          className="mt-2 inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Review Agreement
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                  
                  {plan.status === 'AWAITING_AGREEMENT' && agreementReached && (
                    <button
                      onClick={() => confirmPlanMutation.mutate(plan.id)}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Add to Calendar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No plans yet</h3>
          <p className="text-gray-600 mt-1">Start planning your next special moment together</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePlanModal onClose={() => setShowCreateModal(false)} />
      )}
      
      {showAgreementModal && selectedPlan && (
        <VenueAgreementModal
          plan={selectedPlan}
          onClose={() => {
            setShowAgreementModal(false)
            setSelectedPlan(null)
          }}
        />
      )}
      
      {selectedPlan && !showAgreementModal && (
        <EventDetailsModal
          event={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  )
}
