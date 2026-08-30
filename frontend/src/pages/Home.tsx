import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, MapPin, Plus, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Countdown } from '../components/countdown/Countdown'
import { useAuthStore } from '../store/authStore'

interface Event {
  id: string
  title: string
  date: string
  location?: string
  venue?: {
    name: string
    location?: string
  }
  status: string
  isImportant: boolean
  emoji?: string
  category: string
  icon: string
}

export function Home() {
  const token = useAuthStore((state) => state.token)

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: async () => {
      const response = await fetch('/api/events?status=CONFIRMED&from=' + new Date().toISOString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch events')
      return response.json() as Promise<Event[]>
    }
  })

  const nextEvent = events?.[0]

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
          Welcome back, Dave & LJ
        </h1>
        <p className="text-indigo-100 text-sm sm:text-base">
          Your shared space for planning moments together
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/plans"
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 mb-2 sm:mb-3" />
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Create Plan</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Start planning something special</p>
        </Link>

        <Link
          to="/calendar"
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 mb-2 sm:mb-3" />
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">View Calendar</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">See your upcoming plans</p>
        </Link>

        <Link
          to="/dave"
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-indigo-100 flex items-center justify-center mb-2 sm:mb-3">
            <span className="text-xs font-bold text-indigo-600">D</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Dave's Space</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">View Dave's suggestions</p>
        </Link>

        <Link
          to="/lj"
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-pink-100 flex items-center justify-center mb-2 sm:mb-3">
            <span className="text-xs font-bold text-pink-600">L</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">LJ's Space</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">View LJ's suggestions</p>
        </Link>
      </div>

      {/* Next Upcoming Event */}
      {nextEvent && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-display font-semibold text-gray-900 mb-4">
            Next Upcoming Event
          </h2>
          
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-gradient-to-br from-indigo-100 to-pink-100 flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {format(new Date(nextEvent.date), 'dd')}
              </span>
              <span className="text-xs font-medium text-gray-600">
                {format(new Date(nextEvent.date), 'MMM')}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {nextEvent.emoji} {nextEvent.title}
              </h3>
              
              <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  {format(new Date(nextEvent.date), 'HH:mm')}
                </div>
                {nextEvent.venue && (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {nextEvent.venue.name}
                    {nextEvent.venue.location && ` - ${nextEvent.venue.location}`}
                  </div>
                )}
              </div>
              
              <div className="mt-3 sm:mt-4 overflow-x-auto">
                <Countdown targetDate={nextEvent.date} />
              </div>
            </div>
            
            <Link
              to={`/calendar?event=${nextEvent.id}`}
              className="flex-shrink-0 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      )}

      {/* All Upcoming Events */}
      {events && events.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-display font-semibold text-gray-900 mb-4">
            Upcoming Plans
          </h2>
          
          <div className="space-y-2 sm:space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/calendar?event=${event.id}`}
                className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-100 flex flex-col items-center justify-center">
                  <span className="text-sm sm:text-lg font-bold text-gray-900">
                    {format(new Date(event.date), 'dd')}
                  </span>
                  <span className="text-xs font-medium text-gray-600">
                    {format(new Date(event.date), 'MMM')}
                  </span>
                </div>
                
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {event.isImportant && <span className="text-pink-500">★ </span>}
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {format(new Date(event.date), 'HH:mm')}
                    {event.venue && ` • ${event.venue.name}`}
                  </p>
                </div>
                
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLoading && (!events || events.length === 0) && (
        <div className="text-center py-8 sm:py-12">
          <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Create your first plan together!</p>
        </div>
      )}
    </div>
  )
}
