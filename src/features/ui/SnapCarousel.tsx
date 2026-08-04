'use client'

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

const COMPACT_SLIDE =
  'snap-start shrink-0 w-[min(68vw,16rem)] sm:w-[min(50vw,18rem)] md:w-auto md:min-w-0 md:shrink'

type SnapCarouselProps = {
  children: ReactNode
  /** Number of pagination dots (usually equals slide count) */
  slideCount: number
  /** Classes for the scroll/grid track */
  trackClassName?: string
  className?: string
  ariaLabel?: string
  /** Hide dots from this breakpoint up (default md) */
  hideDotsFrom?: 'md' | 'lg'
}

export function SnapCarousel({
  children,
  slideCount,
  trackClassName = '',
  className = '',
  ariaLabel = 'Carousel pagination',
  hideDotsFrom = 'md',
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
    slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    setActiveIndex(index)
  }

  const dotsHideClass = hideDotsFrom === 'lg' ? 'lg:hidden' : 'md:hidden'
  const count = Math.max(slideCount, Children.count(children))

  return (
    <div className={className}>
      <div ref={trackRef} className={trackClassName}>
        {children}
      </div>

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
