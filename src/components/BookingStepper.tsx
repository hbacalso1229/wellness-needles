'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Check } from 'lucide-react'

export type BookingStepperStep = {
  id: string
  title: string
}

/** Keep serif headings, but use a plain sans ampersand (serif & is ornate). */
function StepTitle({ title }: { title: string }) {
  const ampIndex = title.indexOf('&')
  if (ampIndex === -1) return <>{title}</>
  return (
    <>
      {title.slice(0, ampIndex)}
      <span className="font-sans font-bold">&</span>
      {title.slice(ampIndex + 1)}
    </>
  )
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
  /** Disable Next when the current step is incomplete/invalid. */
  nextDisabled?: boolean
  /** First field/region to focus after Next/Back (element id). */
  stepFocusId?: string
}

export default function BookingStepper({
  steps,
  currentStep,
  onBack,
  onNext,
  onSubmit,
  children,
  nextLabel = 'Continue',
  submitLabel = 'Request appointment',
  isSubmitting = false,
  nextDisabled = false,
  stepFocusId,
}: BookingStepperProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const prevStepRef = useRef(currentStep)
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const activeStep = steps[currentStep]

  useEffect(() => {
    if (prevStepRef.current === currentStep) return
    prevStepRef.current = currentStep

    let raf2 = 0
    const raf1 = window.requestAnimationFrame(() => {
      // Wait one more frame so the keyed step panel has mounted.
      raf2 = window.requestAnimationFrame(() => {
        // Scroll the visible stepper root (progress + panel), not the sr-only heading.
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

        const target =
          (stepFocusId ? document.getElementById(stepFocusId) : null) ??
          headingRef.current
        if (target instanceof HTMLElement) {
          target.focus({ preventScroll: true })
        }
      })
    })

    return () => {
      window.cancelAnimationFrame(raf1)
      window.cancelAnimationFrame(raf2)
    }
  }, [currentStep, stepFocusId])

  return (
    <div ref={sectionRef} className="scroll-mt-24 space-y-6">
      {/* Progress — desktop / tablet */}
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
                <div className="flex flex-col items-center text-center min-w-[5rem]">
                  <span
                    className={`booking-step-indicator flex items-center justify-center rounded-full font-bold border-2 transition-transform ${
                      current
                        ? 'h-11 w-11 text-base border-primary bg-primary text-white scale-110 shadow-md shadow-primary/25'
                        : done
                          ? 'h-9 w-9 text-sm border-primary bg-primary text-white'
                          : 'h-9 w-9 text-sm border-accent/30 text-[var(--text-dark)]/45'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden strokeWidth={3} /> : index + 1}
                  </span>
                  <span
                    className={`booking-step-indicator mt-2 text-xs leading-snug ${
                      current
                        ? 'font-bold text-primary'
                        : done
                          ? 'font-semibold text-[var(--text-dark)]'
                          : 'font-medium text-[var(--text-dark)]/45'
                    }`}
                  >
                    <span className="block text-[10px] uppercase tracking-wide opacity-70">
                      Step {index + 1}
                    </span>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`booking-step-connector mx-2 h-0.5 flex-1 ${
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

      {/* Progress — mobile */}
      <div className="sm:hidden space-y-3" aria-label="Booking progress">
        <p className="text-sm font-semibold text-primary text-center">
          Step {currentStep + 1}: {activeStep?.title}
        </p>
        <div className="flex justify-center gap-2">
          {steps.map((step, index) => {
            const done = index < currentStep
            const current = index === currentStep
            return (
              <span
                key={step.id}
                className={`booking-step-indicator rounded-full transition-transform ${
                  current
                    ? 'h-3 w-3 bg-primary scale-125'
                    : done
                      ? 'h-2.5 w-2.5 bg-primary'
                      : 'h-2.5 w-2.5 bg-accent/30'
                }`}
                aria-current={current ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.title}`}
              />
            )
          })}
        </div>
      </div>

      <div className="bg-accent/5 rounded-lg p-5 sm:p-8">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="sr-only outline-none"
        >
          {activeStep ? <StepTitle title={activeStep.title} /> : null}
        </h2>

        <div key={currentStep} className="booking-step-panel min-h-[12rem]">
          {children}
        </div>

        {/* Sticky Continue bar on mobile; in-flow on sm+ */}
        <div className="sticky bottom-2 z-20 -mx-5 mt-8 border-t border-accent/15 bg-white/95 px-5 py-3 backdrop-blur-sm shadow-[0_-8px_24px_-14px_rgba(45,80,22,0.35)] sm:static sm:bottom-auto sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isFirst || isSubmitting}
              className="px-5 py-2.5 text-sm rounded-full font-semibold border-2 border-accent/30 text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 motion-safe:active:scale-[0.97]"
            >
              Back
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="bg-primary text-white px-5 sm:px-6 py-2.5 text-sm rounded-full font-semibold shadow-md shadow-primary/20 hover:bg-secondary transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.97]"
              >
                {isSubmitting ? 'Sending…' : submitLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                disabled={isSubmitting || nextDisabled}
                className="bg-primary text-white px-5 sm:px-6 py-2.5 text-sm rounded-full font-semibold shadow-md shadow-primary/20 hover:bg-secondary transition-all duration-200 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.97]"
              >
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
