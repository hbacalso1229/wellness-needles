'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronLeft } from 'lucide-react'

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
  submitLabel = 'Book my appointment',
  isSubmitting = false,
  nextDisabled = false,
  stepFocusId,
}: BookingStepperProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const prevStepRef = useRef(currentStep)
  const prevNextDisabledRef = useRef(nextDisabled)
  const [continueJustEnabled, setContinueJustEnabled] = useState(false)
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const activeStep = steps[currentStep]
  const progressFillPercent =
    steps.length <= 1 ? 100 : (currentStep / (steps.length - 1)) * 100
  const progressReassurance = isLast
    ? 'Final step — confirm your appointment'
    : currentStep >= 2
      ? 'Almost done — just your details left'
      : `Step ${currentStep + 1} of ${steps.length} – takes ~2 minutes`

  useEffect(() => {
    const wasDisabled = prevNextDisabledRef.current
    prevNextDisabledRef.current = nextDisabled
    if (wasDisabled && !nextDisabled && !isLast) {
      setContinueJustEnabled(true)
      const t = window.setTimeout(() => setContinueJustEnabled(false), 600)
      return () => window.clearTimeout(t)
    }
  }, [nextDisabled, isLast])

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
    <div ref={sectionRef} className="scroll-mt-24 space-y-5">
      {/* Progress — desktop / tablet */}
      <nav aria-label="Booking progress" className="hidden sm:block space-y-2.5">
        <div className="relative mx-auto w-full max-w-xl px-2">
          {/* Continuous journey track */}
          <div
            className="pointer-events-none absolute left-[calc(12.5%+0.5rem)] right-[calc(12.5%+0.5rem)] top-4 h-1.5 -translate-y-1/2 rounded-full bg-accent/25"
            aria-hidden
          >
            <div
              className="booking-step-connector h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${progressFillPercent}%` }}
            />
          </div>
          <ol className="relative z-[1] grid grid-cols-4 gap-0">
            {steps.map((step, index) => {
              const done = index < currentStep
              const current = index === currentStep
              return (
                <li
                  key={step.id}
                  className="flex flex-col items-center text-center"
                  aria-current={current ? 'step' : undefined}
                >
                  <span
                    className={`booking-step-indicator flex items-center justify-center rounded-full font-bold border-2 transition-transform ${
                      current
                        ? 'h-10 w-10 text-sm border-primary bg-primary text-white scale-110 shadow-md shadow-primary/25'
                        : done
                          ? 'h-8 w-8 text-sm border-primary bg-primary text-white'
                          : 'h-8 w-8 text-sm border-accent/40 bg-white text-[var(--text-dark)]/70'
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" aria-hidden strokeWidth={3} /> : index + 1}
                  </span>
                  <span
                    className={`booking-step-indicator mt-1.5 text-sm leading-snug ${
                      current
                        ? 'font-bold text-primary'
                        : done
                          ? 'font-semibold text-[var(--text-dark)]'
                          : 'font-semibold text-[var(--text-dark)]/65'
                    }`}
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-80">
                      Step {index + 1}
                    </span>
                    {step.title}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
        <p className="text-center text-sm font-medium text-secondary">
          {progressReassurance}
        </p>
      </nav>

      {/* Progress — mobile */}
      <div className="sm:hidden space-y-2.5" aria-label="Booking progress">
        <div className="text-center">
          <p className="text-sm font-semibold text-primary">
            {progressReassurance}
          </p>
          {activeStep && !isLast ? (
            <p className="mt-0.5 text-sm font-semibold text-secondary">{activeStep.title}</p>
          ) : null}
        </div>
        <div className="relative mx-auto w-full max-w-xs px-3">
          <div
            className="pointer-events-none absolute left-3 right-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent/25"
            aria-hidden
          >
            <div
              className="booking-step-connector h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${progressFillPercent}%` }}
            />
          </div>
          <div className="relative z-[1] flex items-center justify-between">
            {steps.map((step, index) => {
              const done = index < currentStep
              const current = index === currentStep
              return (
                <span
                  key={step.id}
                  className={`booking-step-indicator rounded-full border-2 transition-transform ${
                    current
                      ? 'h-3.5 w-3.5 scale-125 border-primary bg-primary'
                      : done
                        ? 'h-3 w-3 border-primary bg-primary'
                        : 'h-3 w-3 border-accent/40 bg-white'
                  }`}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                />
              )
            })}
          </div>
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
        <div className="sticky bottom-2 z-20 -mx-5 mt-6 border-t border-accent/15 bg-white/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm shadow-[0_-8px_24px_-14px_rgba(45,80,22,0.35)] sm:static sm:bottom-auto sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0 sm:shadow-none sm:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            {isFirst ? (
              <span className="inline-flex min-h-11 w-[4.5rem]" aria-hidden />
            ) : (
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center gap-1 px-1 text-sm font-bold text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 transition-opacity duration-200"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2.5} />
                Back
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="bg-primary text-white px-6 py-3 text-base rounded-full font-semibold shadow-lg shadow-primary/30 hover:bg-secondary transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.97]"
              >
                {isSubmitting ? 'Sending…' : submitLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                disabled={isSubmitting || nextDisabled}
                className={`bg-primary text-white px-6 py-3 text-base rounded-full font-semibold shadow-lg shadow-primary/30 hover:bg-secondary transition-all duration-200 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.97] ${
                  continueJustEnabled
                    ? 'motion-safe:animate-[booking-continue-pop_0.55s_cubic-bezier(0.22,1,0.36,1)]'
                    : ''
                }`}
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
