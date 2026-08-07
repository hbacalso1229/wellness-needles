'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, BadgeCheck } from 'lucide-react'

type ClinicalMetricCardProps = {
  title: string
  beforeValue: number
  afterValue: number
  unit: string
  /** Lower bound of healthy/clinical range in same units as the metric */
  healthyMin: number
  /** Upper visual scale for the progress track */
  scaleMax: number
  increaseLabel: string
  highlight: string
  proofPoints: string[]
  headingId?: string
  className?: string
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function useCountUp(target: number, active: boolean, durationMs = 1100) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      setValue(target * easeOutCubic(progress))
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, durationMs, target])

  return value
}

export function ClinicalMetricCard({
  title,
  beforeValue,
  afterValue,
  unit,
  healthyMin,
  scaleMax,
  increaseLabel,
  highlight,
  proofPoints,
  headingId,
  className = '',
}: ClinicalMetricCardProps) {
  const generatedId = useId()
  const titleId = headingId ?? generatedId
  const panelRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const animatedAfter = useCountUp(afterValue, inView)
  const animatedProgress = useCountUp(afterValue, inView, 1200)

  useEffect(() => {
    const el = panelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const beforePct = Math.min(100, (beforeValue / scaleMax) * 100)
  const afterPct = Math.min(100, (animatedProgress / scaleMax) * 100)
  const healthyPct = Math.min(100, (healthyMin / scaleMax) * 100)
  const afterDisplay =
    afterValue >= 10 ? animatedAfter.toFixed(1) : animatedAfter.toFixed(2)

  return (
    <div className={`patient-card-body w-full ${className}`}>
      <div
        ref={panelRef}
        className="lab-data-container card-media-wrapper relative flex flex-col justify-between border border-[#1B3B2B]/10 bg-[#FAF8F5] p-4 md:p-5"
      >
        <div className="flex items-center justify-between gap-1.5 rounded-full border border-[#1B3B2B]/15 bg-white/90 py-1 pl-2 pr-1 shadow-sm sm:gap-2 sm:pl-2.5 sm:pr-1.5">
          <span className="inline-flex min-w-0 items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-[#1B3B2B] sm:gap-1.5 sm:text-[10px] sm:tracking-[0.06em]">
            <BadgeCheck className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden />
            <span className="truncate sm:hidden">Within healthy range</span>
            <span className="hidden truncate sm:inline">Now within healthy range</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#1B3B2B]">
            <ArrowUpRight className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
            {increaseLabel}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 md:gap-3">
          <div className="rounded-lg border border-[#1B3B2B]/10 bg-white/70 px-2 py-2.5 text-center md:px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1B3B2B]/50">
              Before
            </p>
            <p className="mt-1 result-card-title text-2xl text-[#1B3B2B]/55 md:text-3xl">
              {beforeValue}
            </p>
            <p className="text-[11px] text-[var(--text-dark)]/45">{unit}</p>
          </div>
          <span
            className="pb-5 text-lg font-medium text-[#1B3B2B]/35 md:pb-6 md:text-xl"
            aria-hidden
          >
            →
          </span>
          <div className="rounded-lg border border-gold/45 bg-gold/10 px-2 py-2.5 text-center shadow-sm md:px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1B3B2B]/55">
              After
            </p>
            <p className="mt-1 result-card-title text-2xl text-[#1B3B2B] md:text-3xl">
              {afterDisplay}
            </p>
            <p className="text-[11px] text-[var(--text-dark)]/50">{unit}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.08em] text-[#1B3B2B]/55">
            <span>Progress</span>
            <span>Healthy ≥ {healthyMin} {unit}</span>
          </div>
          <div
            className="relative h-2.5 overflow-hidden rounded-full bg-[#1B3B2B]/10"
            role="img"
            aria-label={`Concentration improved from ${beforeValue} to ${afterValue} ${unit}, healthy range starts at ${healthyMin}`}
          >
            <div
              className="absolute inset-y-0 bg-[#1B3B2B]/08"
              style={{ left: `${healthyPct}%`, right: 0 }}
              aria-hidden
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#1B3B2B]/25"
              style={{ width: `${beforePct}%` }}
              aria-hidden
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#7fb069] to-[#1B3B2B] transition-[width] duration-300 ease-out"
              style={{ width: `${afterPct}%` }}
              aria-hidden
            />
            <div
              className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-gold"
              style={{ left: `${healthyPct}%` }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="result-card-caption px-0.5 text-center">
        <h3
          id={titleId}
          className="result-card-title text-xl leading-tight text-[var(--text-dark)] md:text-2xl"
        >
          {title}
        </h3>
        <p className="mt-1.5 text-base font-medium leading-snug text-[var(--text-dark)]/85 md:mt-2">
          {highlight}
        </p>
        <ul className="mx-auto mt-3 flex w-full max-w-xs flex-col gap-1.5 text-left md:mt-4">
          {proofPoints.map((point) => (
            <li
              key={point}
              className="inline-flex items-start gap-1.5 text-xs leading-snug text-[#1B3B2B]/80 md:text-sm"
            >
              <BadgeCheck
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B3B2B]"
                strokeWidth={2}
                aria-hidden
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
