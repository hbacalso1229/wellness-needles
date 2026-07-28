'use client'

import { useEffect } from 'react'
import { AlertCircle, CheckCircle, X } from 'lucide-react'

interface ToastProps {
  message: string | string[]
  visible: boolean
  onClose: () => void
  durationMs?: number
  variant?: 'success' | 'error'
}

export default function Toast({
  message,
  visible,
  onClose,
  durationMs = 5000,
  variant = 'success',
}: ToastProps) {
  const messages = Array.isArray(message) ? message : [message]
  const messageKey = messages.join('|')

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(timer)
    // Intentionally omit onClose so inline parent callbacks don't reset the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, durationMs, messageKey])

  if (!visible) return null

  const isError = variant === 'error'
  const Icon = isError ? AlertCircle : CheckCircle
  const showList = messages.length > 1

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className="fixed top-6 right-6 z-[100] max-w-md"
    >
      <div
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${
          isError
            ? 'border-red-200 bg-red-50'
            : 'border-accent/30 bg-cream'
        }`}
      >
        <Icon
          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
            isError ? 'text-red-600' : 'text-accent'
          }`}
        />
        <div className={`flex-1 text-sm ${isError ? 'text-red-800' : 'text-primary'}`}>
          {showList ? (
            <ul className="list-disc pl-4 space-y-1">
              {messages.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>{messages[0]}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`transition-colors ${
            isError
              ? 'text-red-500 hover:text-red-800'
              : 'text-secondary hover:text-primary'
          }`}
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
