'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Check } from 'lucide-react'

export type BookingStepperStep = {
  id: string
  title: string
}

type BookingStepperProps = {
  steps: BookingStepperStep[]
  currentStep: number
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  children: ReactNode
  nextLabel?: string
  submitLabel?: string
  isSubmitting?: boolean
}

export default function BookingStepper({
  steps,
  currentStep,
  onBack,
  onNext,
  onSubmit,
  children,
  nextLabel = 'Next',
  submitLabel = 'Submit appointment request',
  isSubmitting = false,
}: BookingStepperProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const activeStep = steps[currentStep]

  useEffect(() => {
    headingRef.current?.focus()
  }, [currentStep])

  return (
    <div className="space-y-6">
      {/* Progress — desktop */}
      <nav aria-label="Booking progress" className="hidden sm:block">
        <ol className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const done = index < currentStep
            const current = index === currentStep
            return (
              <li
                key={step.id}
                className="flex flex-1 items-center last:flex-none"
                aria-current={current ? 'step' : undefined}
              >
                <div className="flex flex-col items-center text-center min-w-[4.5rem]">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold border-2 transition-colors ${
                      current
                        ? 'border-primary bg-primary text-cream'
                        : done
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-accent/30 text-secondary'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
                  </span>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      current ? 'text-primary' : 'text-secondary'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      done ? 'bg-primary' : 'bg-accent/20'
                    }`}
                    aria-hidden
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Progress — mobile (step count + dots; title lives in the card h2) */}
      <div className="sm:hidden space-y-3" aria-label="Booking progress">
        <p className="text-sm text-secondary text-center">
          Step {currentStep + 1} of {steps.length}
        </p>
        <div className="flex justify-center gap-2">
          {steps.map((step, index) => {
            const done = index < currentStep
            const current = index === currentStep
            return (
              <span
                key={step.id}
                className={`h-2.5 w-2.5 rounded-full ${
                  current
                    ? 'bg-primary scale-125'
                    : done
                      ? 'bg-primary/60'
                      : 'bg-accent/30'
                }`}
                aria-current={current ? 'step' : undefined}
                aria-label={step.title}
              />
            )
          })}
        </div>
      </div>

      <div className="bg-accent/5 rounded-lg p-5 sm:p-8">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-serif text-2xl font-bold text-primary mb-6 outline-none"
        >
          {activeStep?.title}
        </h2>

        <div className="min-h-[12rem]">{children}</div>

        {/* Step nav — in-flow on all breakpoints so buttons stay visible with the form */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst || isSubmitting}
            className="px-5 py-2.5 text-sm rounded-full font-semibold border-2 border-accent/30 text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-primary text-cream px-5 sm:px-6 py-2.5 text-sm rounded-full font-semibold hover:bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending…' : (
                <>
                  <span className="sm:hidden">Submit</span>
                  <span className="hidden sm:inline">{submitLabel}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={isSubmitting}
              className="bg-primary text-cream px-5 sm:px-6 py-2.5 text-sm rounded-full font-semibold hover:bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
