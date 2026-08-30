import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDate } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, MapPin, Clock, Star, Heart, Utensils, Film, Plane, Gift, ShoppingBag } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EventDetailsModal } from '../components/events/EventDetailsModal'
import { CreatePlanModal } from '../components/plans/CreatePlanModal'
import { useAuthStore } from '../store/authStore'

interface Event {
  id: string
  title: string
  date: string
  endTime?: string
  location?: string
  venue?: {
    id: string
    name: string
    location?: string
  }
  status: string
  isImportant: boolean
  emoji?: string
  category: string
  icon: string
  description?: string
  notes?: string
  createdBy: {
    id: string
    name: string
  }
}

const categoryIcons: any = {
  DATE: Heart,
  FOOD: Utensils,
  MOVIE: Film,
  TRIP: Plane,
  BIRTHDAY: Gift,
  ANNIVERSARY: Heart,
  SHOPPING: ShoppingBag,
  IMPORTANT: Star,
  CUSTOM: CalendarIcon,
}

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [prefillDate, setPrefillDate] = useState<string>('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useAuthStore((state) => state.token)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  
  const { data: events, isLoading } = useQuery({
    queryKey: ['events', 'calendar', format(monthStart, 'yyyy-MM'), format(monthEnd, 'yyyy-MM')],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: monthStart.toISOString(),
        to: monthEnd.toISOString(),
      })
      const response = await fetch(`/api/events?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch events')
      return response.json() as Promise<Event[]>
    }
  })

  useEffect(() => {
    const eventId = searchParams.get('event')
    if (eventId && events) {
      const event = events.find(e => e.id === eventId)
      if (event) {
        setSelectedEvent(event)
        setSelectedDate(new Date(event.date))
      }
    }
  }, [searchParams, events])

  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 1 })
  })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  
  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  const eventsOnDay = (day: Date) => {
    return events?.filter(event => isSameDay(new Date(event.date), day)) || []
  }

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    const dayEvents = eventsOnDay(day)
    
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0])
    } else if (dayEvents.length > 1) {
      setSelectedEvent(dayEvents[0])
    } else {
      const confirmCreate = window.confirm(`Create a new plan for ${format(day, 'dddd, MMMM d, yyyy')}?`)
      if (confirmCreate) {
        setPrefillDate(format(day, 'yyyy-MM-dd'))
        setShowCreateModal(true)
      }
    }
  }

  const getEventIcon = (event: Event) => {
    if (event.emoji) return <span className="text-xs">{event.emoji}</span>
    const Icon = categoryIcons[event.category] || CalendarIcon
    return <Icon className="h-3 w-3" />
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Your shared calendar of plans</p>
        </div>
        <button
          onClick={() => {
            setPrefillDate('')
            setShowCreateModal(true)
          }}
          className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-all shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Plan
        </button>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <h2 className="text-lg sm:text-xl font-display font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={goToToday} className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium">
              Today
            </button>
          </div>
          
          <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-3 sm:p-6">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px mb-2 sm:mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-600 py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
            {days.map((day, dayIdx) => {
              const dayEvents = eventsOnDay(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isToday = isSameDay(day, new Date())
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const hasEvents = dayEvents.length > 0
              const confirmedEvents = dayEvents.filter(e => e.status === 'CONFIRMED')
              const hasConfirmed = confirmedEvents.length > 0
              const hasImportant = dayEvents.some(e => e.isImportant)

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  className={`
                    relative min-h-[70px] sm:min-h-[100px] p-1 sm:p-2 bg-white transition-colors text-left
                    ${!isCurrentMonth ? 'bg-gray-50' : ''}
                    ${isSelected ? 'ring-2 ring-primary-500 ring-inset' : ''}
                    hover:bg-indigo-50/50 cursor-pointer
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`
                      text-xs sm:text-sm font-medium h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center
                      ${isToday ? 'bg-primary-600 text-white rounded-full' : 'text-gray-900'}
                    `}>
                      {getDate(day)}
                    </span>
                    
                    {/* Event indicators */}
                    {hasEvents && (
                      <div className="flex items-center space-x-0.5">
                        {hasImportant && (
                          <Star className="h-3 w-3 text-pink-500 fill-pink-500" />
                        )}
                        {hasConfirmed && (
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Event icons/emojis */}
                  {hasEvents && (
                    <div className="mt-1 sm:mt-2 flex flex-wrap gap-0.5 sm:gap-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-md text-xs
                            ${event.status === 'CONFIRMED' 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-yellow-100 text-yellow-700'}
                            ${event.isImportant ? 'ring-1 ring-pink-400' : ''}
                          `}
                          title={event.title}
                        >
                          {getEventIcon(event)}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium flex items-center">
                          +{dayEvents.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Event titles on larger screens */}
                  {hasEvents && (
                    <div className="hidden sm:block mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${
                            event.status === 'CONFIRMED' 
                              ? 'bg-indigo-50 text-indigo-700' 
                              : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {event.isImportant && <Star className="h-3 w-3 inline mr-0.5 text-pink-500 fill-pink-500" />}
                          {event.title}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Event count dot for mobile */}
                  {hasEvents && (
                    <div className="sm:hidden absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 w-1 rounded-full ${
                            dayEvents[i]?.status === 'CONFIRMED' ? 'bg-indigo-500' : 'bg-yellow-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Day Events */}
        {selectedDate && eventsOnDay(selectedDate).length > 0 && (
          <div className="border-t border-gray-100 px-4 sm:px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {format(selectedDate, 'dddd, MMMM d, yyyy')}
            </h3>
            
            <div className="space-y-2">
              {eventsOnDay(selectedDate).map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    {getEventIcon(event)}
                  </div>
                  
                  <div className="ml-2 sm:ml-3 flex-1 text-left min-w-0">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {event.isImportant && <Star className="h-3 w-3 sm:h-4 sm:w-4 inline text-pink-500 mr-1 fill-pink-500" />}
                        {event.title}
                      </h4>
                      {event.status !== 'CONFIRMED' && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded hidden sm:inline">
                          {event.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(event.date), 'HH:mm')}
                      </span>
                      {event.location && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <CreatePlanModal 
          onClose={() => setShowCreateModal(false)}
          prefillDate={prefillDate}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}
