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

const COMPACT_SLIDE =
  'snap-start shrink-0 w-[min(68vw,16rem)] sm:w-[min(50vw,18rem)] md:w-auto md:min-w-0 md:shrink'

/** Always-horizontal review slides: 1+peek mobile, ~2 tablet, ~4 desktop */
export const reviewSlideClassName =
  'snap-start shrink-0 h-full w-[min(88vw,26rem)] sm:w-[min(70vw,28rem)] md:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]'

type SnapCarouselProps = {
  children: ReactNode
  /** Number of pagination dots (usually equals slide count) */
  slideCount: number
  /** Classes for the scroll/grid track */
  trackClassName?: string
  className?: string
  ariaLabel?: string
  /** Hide dots from this breakpoint up; `never` keeps dots on all sizes */
  hideDotsFrom?: 'md' | 'lg' | 'never'
  /** Show prev/next chevrons (desktop-friendly; always available for keyboard users) */
  showArrows?: boolean
}

export function SnapCarousel({
  children,
  slideCount,
  trackClassName = '',
  className = '',
  ariaLabel = 'Carousel pagination',
  hideDotsFrom = 'md',
  showArrows = false,
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

  const dotsHideClass =
    hideDotsFrom === 'never' ? '' : hideDotsFrom === 'lg' ? 'lg:hidden' : 'md:hidden'

  const arrowBtnClass =
    'hidden md:inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-white text-primary shadow-sm transition-[transform,background-color,border-color,opacity] duration-200 hover:border-primary/40 hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-35'

  const track = (
    <div ref={trackRef} className={`${showArrows ? 'min-w-0 flex-1 ' : ''}${trackClassName}`}>
      {children}
    </div>
  )

  return (
    <div className={className}>
      {showArrows ? (
        <div className="flex items-stretch gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => scrollToSlide(activeIndex - 1)}
            disabled={!canGoPrev}
            aria-label="Previous review"
            className={`${arrowBtnClass} self-center`}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
          {track}
          <button
            type="button"
            onClick={() => scrollToSlide(activeIndex + 1)}
            disabled={!canGoNext}
            aria-label="Next review"
            className={`${arrowBtnClass} self-center`}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      ) : (
        track
      )}

      {count > 1 ? (
        <nav
          className={`mt-3 flex items-center justify-center gap-2 ${dotsHideClass}`}
          aria-label={ariaLabel}
        >
          {Array.from({ length: count }, (_, index) => {
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
          })}
        </nav>
      ) : null}
    </div>
  )
}

/** Shared mobile slide width utility for snap carousel children */
export const snapSlideClassName = COMPACT_SLIDE
