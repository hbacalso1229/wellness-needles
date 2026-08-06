'use client'

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** ~72% slide so the next card’s icon + title clearly peek on mobile */
const COMPACT_SLIDE =
  'snap-start grow-0 shrink-0 basis-[72%] w-[72%] max-w-[18rem] sm:basis-[min(62vw,18.5rem)] sm:w-[min(62vw,18.5rem)] md:basis-auto md:max-w-none md:w-auto md:min-w-0 md:shrink'

const SCROLLBAR_HIDE =
  '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'

/** Shared mobile track: inset with parent padding, peek gap, hidden scrollbar */
export const snapTrackClassName =
  `flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 sm:gap-4 ${SCROLLBAR_HIDE}`

/** Carousel → 2/3-col grid from md (Conditions, Why Choose) */
export const snapTrackGridMdClassName =
  `${snapTrackClassName} md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 md:gap-4 lg:gap-5`

/** Carousel → 3-col grid from lg (Real Patient Results) */
export const snapTrackGridLgClassName =
  `${snapTrackClassName} lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:pb-0`

/** Always-horizontal track (What patients say) */
export const snapTrackHorizontalClassName =
  `${snapTrackClassName} md:pb-2`

/**
 * Review slides: near-full width on mobile so the next card only peeks as an edge
 * (avoids truncating "Read full story" mid-label). ~2 tablet, ~4 desktop.
 */
export const reviewSlideClassName =
  'snap-start grow-0 shrink-0 basis-[92%] w-[92%] max-w-[26rem] h-full sm:basis-[min(70vw,28rem)] sm:w-[min(70vw,28rem)] sm:max-w-none md:basis-[calc(50%-0.5rem)] md:w-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)] lg:w-[calc(25%-0.75rem)]'

/** Wider mobile slides for media-heavy cards (before/after, etc.) */
export const snapSlideWideClassName =
  'snap-start grow-0 shrink-0 basis-[88%] w-[88%] max-w-[22rem] sm:basis-[min(70vw,24rem)] sm:w-[min(70vw,24rem)] sm:max-w-none lg:basis-auto lg:w-auto lg:min-w-0'

/** ≤5 slides → dots; 6+ → "1 / N" counter */
const DOT_PAGE_THRESHOLD = 5

type SnapCarouselProps = {
  children: ReactNode
  /** Number of pagination dots / counter total */
  slideCount: number
  /** Classes for the scroll/grid track — prefer shared snapTrack* exports */
  trackClassName?: string
  className?: string
  ariaLabel?: string
  /** Hide pagination from this breakpoint up; `never` keeps it on all sizes */
  hideDotsFrom?: 'md' | 'lg' | 'never'
  /**
   * Desktop side arrows (never shown on mobile — swipe is primary there).
   * Default false; enable for always-horizontal carousels.
   */
  showArrows?: boolean
  /**
   * Where side arrows appear (desktop only):
   * - `md` (default): from md up
   * - `until-lg`: from md, hidden at lg (when a grid takes over)
   */
  showArrowsFrom?: 'md' | 'until-lg'
}

export function SnapCarousel({
  children,
  slideCount,
  trackClassName = snapTrackClassName,
  className = '',
  ariaLabel = 'Carousel pagination',
  hideDotsFrom = 'md',
  showArrows = false,
  showArrowsFrom = 'md',
}: SnapCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const updateActiveFromScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const slides = Array.from(track.children) as HTMLElement[]
    if (slides.length === 0) return

    const trackRect = track.getBoundingClientRect()
    const trackCenter = trackRect.left + trackRect.width / 2

    let closest = 0
    let closestDist = Infinity
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect()
      const slideCenter = rect.left + rect.width / 2
      const dist = Math.abs(slideCenter - trackCenter)
      if (dist < closestDist) {
        closestDist = dist
        closest = index
      }
    })
    setActiveIndex(closest)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    updateActiveFromScroll()
    track.addEventListener('scroll', updateActiveFromScroll, { passive: true })
    window.addEventListener('resize', updateActiveFromScroll)
    return () => {
      track.removeEventListener('scroll', updateActiveFromScroll)
      window.removeEventListener('resize', updateActiveFromScroll)
    }
  }, [updateActiveFromScroll, slideCount])

  const scrollToSlide = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const slide = track.children[index] as HTMLElement | undefined
    if (!slide) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    slide.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      inline: 'start',
      block: 'nearest',
    })
    setActiveIndex(index)
  }

  const count = Math.max(slideCount, Children.count(children))
  const canGoPrev = activeIndex > 0
  const canGoNext = activeIndex < count - 1
  const useSideArrows = showArrows

  const dotsHideClass =
    hideDotsFrom === 'never' ? '' : hideDotsFrom === 'lg' ? 'lg:hidden' : 'md:hidden'

  const sideArrowVisibility =
    showArrowsFrom === 'until-lg'
      ? 'hidden md:inline-flex lg:hidden'
      : 'hidden md:inline-flex'

  const arrowBaseClass =
    'h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color,opacity,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream'

  const arrowEnabledClass =
    'border-accent/30 bg-white text-primary shadow-sm hover:border-primary/40 hover:bg-cream'
  const arrowDisabledClass =
    'cursor-not-allowed border-transparent bg-black/[0.06] text-[var(--text-dark)]/25 shadow-none opacity-40'

  const track = (
    <div
      ref={trackRef}
      className={`${useSideArrows ? 'min-w-0 flex-1 ' : ''}${trackClassName}`}
    >
      {children}
    </div>
  )

  const arrowButton = (direction: 'prev' | 'next') => {
    const isPrev = direction === 'prev'
    const enabled = isPrev ? canGoPrev : canGoNext
    return (
      <button
        type="button"
        onClick={() => {
          if (!enabled) return
          scrollToSlide(isPrev ? activeIndex - 1 : activeIndex + 1)
        }}
        disabled={!enabled}
        aria-disabled={!enabled}
        aria-label={isPrev ? 'Previous slide' : 'Next slide'}
        className={`${sideArrowVisibility} ${arrowBaseClass} ${
          enabled ? arrowEnabledClass : arrowDisabledClass
        } self-center`}
      >
        {isPrev ? (
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.75} aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.75} aria-hidden />
        )}
      </button>
    )
  }

  const pagination =
    count > 1 ? (
      <nav
        className={`mt-4 flex w-full items-center justify-center gap-2 ${dotsHideClass}`}
        aria-label={ariaLabel}
      >
        {count > DOT_PAGE_THRESHOLD ? (
          <p
            className="text-sm tabular-nums tracking-wide text-[var(--text-dark)]/55"
            aria-live="polite"
          >
            <span className="font-semibold text-[var(--text-dark)]">{activeIndex + 1}</span>
            <span className="mx-1" aria-hidden>
              /
            </span>
            <span className="sr-only">of </span>
            {count}
          </p>
        ) : (
          Array.from({ length: count }, (_, index) => {
            const active = index === activeIndex
            return (
              <button
                key={index}
                type="button"
                onClick={() => scrollToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={active ? 'true' : undefined}
                className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                  active
                    ? 'h-2 w-6 bg-primary'
                    : 'h-2 w-2 bg-accent/40 hover:bg-accent/60'
                }`}
              />
            )
          })
        )}
      </nav>
    ) : null

  return (
    <div className={className}>
      {useSideArrows ? (
        <div className="flex items-stretch gap-3 md:gap-4">
          {arrowButton('prev')}
          {track}
          {arrowButton('next')}
        </div>
      ) : (
        track
      )}

      {pagination}
    </div>
  )
}

/** Shared mobile slide width utility for snap carousel children */
export const snapSlideClassName = COMPACT_SLIDE
