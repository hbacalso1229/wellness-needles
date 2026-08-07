import { contactConfig } from '../lib/contact-config'
import { Clock } from 'lucide-react'

interface BusinessHoursProps {
  variant?: 'default' | 'compact' | 'card'
  className?: string
  showIcon?: boolean
  showEmergencyNote?: boolean
}

export default function BusinessHours({ 
  variant = 'default',
  className = '',
  showIcon = true,
  showEmergencyNote = true
}: BusinessHoursProps) {
  if (variant === 'card') {
    return (
      <div className={`bg-accent/5 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          {showIcon && <Clock className="w-6 h-6 text-primary" />}
          <h3 className="font-semibold text-lg text-primary">Business Hours</h3>
        </div>
        <div className="space-y-2">
          {contactConfig.businessInfo.hoursDisplay.map((hours, index) => (
            <p key={index} className="text-secondary">{hours}</p>
          ))}
        </div>
        {showEmergencyNote && (
          <p className="text-secondary text-base mt-4 italic leading-relaxed">
            {contactConfig.businessInfo.emergencyNote}
          </p>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        <div className="flex items-center space-x-2 mb-2">
          {showIcon && <Clock className="w-4 h-4" />}
          <span className="font-medium">Hours:</span>
        </div>
        <div className="text-base space-y-1">
          {contactConfig.businessInfo.hoursDisplay.map((hours, index) => (
            <div key={index}>{hours}</div>
          ))}
        </div>
        {showEmergencyNote && (
          <p className="text-sm mt-2 opacity-80 leading-relaxed">
            {contactConfig.businessInfo.emergencyNote}
          </p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={className}>
      <div className="flex items-center space-x-3 mb-3">
        {showIcon && <Clock className="w-5 h-5" />}
        <h4 className="font-semibold">Business Hours</h4>
      </div>
      <div className="space-y-1">
        {contactConfig.businessInfo.hoursDisplay.map((hours, index) => (
          <p key={index}>{hours}</p>
        ))}
      </div>
      {showEmergencyNote && (
        <p className="text-base mt-3 opacity-80 leading-relaxed">
          {contactConfig.businessInfo.emergencyNote}
        </p>
      )}
    </div>
  )
}
