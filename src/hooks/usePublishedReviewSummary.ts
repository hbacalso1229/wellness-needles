'use client'

import { useMemo } from 'react'
import { DEFAULT_REVIEWS } from '../../shared/default-reviews'
import { publicReviewSummary } from '../../shared/review-rating'
import { useSiteOverlay } from '@/lib/site-overlay'

export function usePublishedReviewSummary() {
  const { overlayEnabled, site } = useSiteOverlay()
  return useMemo(
    () => publicReviewSummary(overlayEnabled, site.reviews, DEFAULT_REVIEWS),
    [overlayEnabled, site.reviews]
  )
}
