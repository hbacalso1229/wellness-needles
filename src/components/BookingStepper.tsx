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
  backLabel?: string
  submitLabel?: string
  isSubmitting?: boolean
  /** Disable Next when the current step is incomplete/invalid. */
  nextDisabled?: boolean
  /** First field/region to focus after Next/Back (element id). */
  stepFocusId?: string
}

const PRIMARY_CTA_CLASS =
  'inline-grid justify-items-center w-auto whitespace-nowrap bg-primary px-6 py-3 text-center text-base rounded-full font-semibold text-white shadow-lg shadow-primary/30 hover:bg-secondary transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.97]'

/** Step 1 has no Back link — centered on mobile, right-aligned from sm. */
const PRIMARY_CTA_STEP1_CLASS = PRIMARY_CTA_CLASS

/** Steps 2–4 sit beside Back — same padding, width follows Request appointment. */
const PRIMARY_CTA_WITH_BACK_CLASS = `${PRIMARY_CTA_CLASS} ml-auto max-w-[calc(100%-4.75rem)]`

function CtaLabel({ label, widthFrom }: { label: string; widthFrom: string }) {
  return (
    <>
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden>
        {widthFrom}
      </span>
      <span className="col-start-1 row-start-1 whitespace-nowrap">{label}</span>
    </>
  )
}

export default function BookingStepper({
  steps,
  currentStep,
  onBack,
  onNext,
  onSubmit,
  children,
  nextLabel = 'Continue',
  backLabel = 'Back',
  submitLabel = 'Request appointment',
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
  const progressStatus = `Step ${currentStep + 1} of ${steps.length}: ${activeStep?.title ?? ''}`

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
    <div ref={sectionRef} className="scroll-mt-24 space-y-3 sm:space-y-5">
      <nav
        aria-label="Booking progress"
        className="rounded-2xl border border-accent/15 bg-white px-4 py-5 shadow-[0_8px_30px_rgba(45,80,22,0.08)] sm:px-6 sm:py-6"
      >
        <p className="sr-only" aria-live="polite">
          {progressStatus}
        </p>

        {/* Progress — desktop / tablet */}
        <div className="relative mx-auto hidden w-full max-w-xl px-2 sm:block">
          <div
            className="pointer-events-none absolute left-[calc(12.5%+0.5rem)] right-[calc(12.5%+0.5rem)] top-6 h-2 -translate-y-1/2"
            aria-hidden
          >
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[rgba(127,176,105,0.28)]" />
            <div
              className="booking-step-connector absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-500 ease-out"
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
                  aria-label={`Step ${index + 1}: ${step.title}${done ? ', completed' : ''}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center">
                    <span
                      className={`booking-step-indicator flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        current
                          ? 'border-2 border-primary bg-primary text-white shadow-[0_0_0_6px_rgba(127,176,105,0.28)] ring-4 ring-accent/35'
                          : done
                            ? 'border-2 border-primary bg-primary text-white'
                            : 'border border-[#c8c8c4] bg-white text-[var(--text-dark)]/40'
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" aria-hidden strokeWidth={3} /> : index + 1}
                    </span>
                  </span>
                  {!done ? (
                    <span className="mt-2 leading-snug">
                      <span
                        className={`block text-[10px] font-semibold uppercase tracking-wider ${
                          current ? 'text-accent' : 'text-[var(--text-dark)]/45'
                        }`}
                      >
                        Step {index + 1}
                      </span>
                      <span
                        className={`block text-sm font-bold ${
                          current ? 'text-primary' : 'text-[var(--text-dark)]'
                        }`}
                      >
                        {step.title}
                      </span>
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </div>

        {/* Progress — mobile (compact nodes + current step label) */}
        <div className="sm:hidden">
          <div className="relative mx-auto w-full max-w-xs px-1">
            <div
              className="pointer-events-none absolute left-4 right-4 top-4 h-2 -translate-y-1/2"
              aria-hidden
            >
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[rgba(127,176,105,0.28)]" />
              <div
                className="booking-step-connector absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-500 ease-out"
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
                    className="flex h-8 w-8 items-center justify-center"
                    aria-current={current ? 'step' : undefined}
                    aria-label={`Step ${index + 1}: ${step.title}`}
                  >
                    <span
                      className={`booking-step-indicator flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        current
                          ? 'border-2 border-primary bg-primary text-white shadow-[0_0_0_4px_rgba(127,176,105,0.28)] ring-2 ring-accent/35'
                          : done
                            ? 'border-2 border-primary bg-primary text-white'
                            : 'border border-[#c8c8c4] bg-white text-[var(--text-dark)]/40'
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" aria-hidden strokeWidth={3} /> : index + 1}
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
          <p className="mt-3 text-center leading-snug">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-accent">
              Step {currentStep + 1}
            </span>
            <span className="block text-sm font-bold text-primary">
              {activeStep?.title}
            </span>
          </p>
        </div>
      </nav>

      <div className="rounded-2xl bg-accent/5 p-4 sm:p-8">
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

        {/* Sticky Continue bar on mobile; in-flow on sm+ — primary thumb-zone CTA */}
        <div className="sticky bottom-2 z-20 -mx-4 mt-4 border-t border-accent/15 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm shadow-[0_-8px_24px_-14px_rgba(45,80,22,0.35)] sm:static sm:bottom-auto sm:mx-0 sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0 sm:shadow-none sm:backdrop-blur-none">
          {isFirst ? (
            <div className="flex justify-center sm:justify-end">
              <button
                type="button"
                onClick={onNext}
                disabled={isSubmitting || nextDisabled}
                className={`${PRIMARY_CTA_STEP1_CLASS} disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 ${
                  continueJustEnabled
                    ? 'motion-safe:animate-[booking-continue-pop_0.55s_cubic-bezier(0.22,1,0.36,1)]'
                    : ''
                }`}
              >
                <CtaLabel label={nextLabel} widthFrom={submitLabel} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="inline-flex min-h-11 shrink-0 items-center gap-1 px-1 text-sm font-bold text-[var(--text-dark)] underline-offset-2 hover:text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2.5} />
                {backLabel}
              </button>
              {isLast ? (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className={`${PRIMARY_CTA_WITH_BACK_CLASS} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <CtaLabel
                    label={isSubmitting ? 'Sending…' : submitLabel}
                    widthFrom={submitLabel}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={isSubmitting || nextDisabled}
                  className={`${PRIMARY_CTA_WITH_BACK_CLASS} disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 ${
                    continueJustEnabled
                      ? 'motion-safe:animate-[booking-continue-pop_0.55s_cubic-bezier(0.22,1,0.36,1)]'
                      : ''
                  }`}
                >
                  <CtaLabel label={nextLabel} widthFrom={submitLabel} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
