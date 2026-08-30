import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CountdownProps {
  targetDate: string
  config?: {
    showYears?: boolean
    showMonths?: boolean
    showDays?: boolean
    showHours?: boolean
    showMinutes?: boolean
    showSeconds?: boolean
  }
}

export function Countdown({ targetDate, config = { showYears: true, showMonths: true, showDays: true, showHours: true, showMinutes: false, showSeconds: false } }: CountdownProps) {
  const [timeParts, setTimeParts] = useState<any>(null)
  const [isPast, setIsPast] = useState(false)

  useEffect(() => {
    const calculateTimeParts = () => {
      const now = new Date()
      const target = new Date(targetDate)
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) {
        setIsPast(true)
        setTimeParts({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setIsPast(false)
      let years = 0, months = 0
      const tempDate = new Date(target)
      const currentDate = new Date(now)
      while (addYears(currentDate, years + 1) <= tempDate) years++
      const afterYears = addYears(currentDate, years)
      while (addMonths(afterYears, months + 1) <= tempDate) months++
      const afterYearsAndMonths = addMonths(afterYears, months)
      const remainingMs = tempDate.getTime() - afterYearsAndMonths.getTime()
      const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24))
      const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000)
      setTimeParts({ years, months, days, hours, minutes, seconds })
    }
    calculateTimeParts()
    const interval = setInterval(calculateTimeParts, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (!timeParts) return null
  if (isPast) {
    return (
      <div className="flex items-center text-gray-500">
        <Clock className="h-4 w-4 mr-2" />
        <span className="text-sm">Event has passed</span>
      </div>
    )
  }

  const parts = []
  if (config.showYears && timeParts.years > 0) parts.push({ value: timeParts.years, label: timeParts.years === 1 ? 'Year' : 'Years' })
  if (config.showMonths && timeParts.months > 0) parts.push({ value: timeParts.months, label: timeParts.months === 1 ? 'Month' : 'Months' })
  if (config.showDays && timeParts.days > 0) parts.push({ value: timeParts.days, label: timeParts.days === 1 ? 'Day' : 'Days' })
  if (config.showHours && timeParts.hours > 0) parts.push({ value: timeParts.hours, label: timeParts.hours === 1 ? 'Hour' : 'Hours' })
  if (config.showMinutes && timeParts.minutes > 0) parts.push({ value: timeParts.minutes, label: timeParts.minutes === 1 ? 'Minute' : 'Minutes' })
  if (config.showSeconds && timeParts.seconds > 0) parts.push({ value: timeParts.seconds, label: timeParts.seconds === 1 ? 'Second' : 'Seconds' })

  if (parts.length === 0) {
    return (
      <div className="flex items-center text-pink-500 font-medium">
        <Clock className="h-4 w-4 mr-2" />
        <span className="text-sm">Starting now...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Clock className="h-4 w-4 text-primary-500" />
      <div className="flex gap-4">
        {parts.map((part, index) => (
          <div key={index} className="flex items-center gap-1">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{part.value}</div>
              <div className="text-xs text-gray-600">{part.label}</div>
            </div>
            {index < parts.length - 1 && <span className="text-gray-400 text-lg font-bold">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function addYears(date: Date, years: number): Date {
  const newDate = new Date(date)
  newDate.setFullYear(newDate.getFullYear() + years)
  return newDate
}

function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + months)
  return newDate
}
