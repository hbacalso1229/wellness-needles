import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DEFAULT_REVIEWS } from './default-reviews'
import {
  averageReviewRating,
  mergePublishedReviewRatings,
  parseReviewRating,
  publishedReviewSummary,
  publicReviewSummary,
  type ReviewRatingRow,
} from './review-rating'

describe('averageReviewRating', () => {
  it('returns 0.0 when there are no ratings', () => {
    assert.deepEqual(averageReviewRating([]), { average: 0, count: 0, label: '0.0' })
  })

  it('keeps a one-decimal label for a perfect five', () => {
    const ratings = Array.from({ length: 11 }, () => 5)
    assert.deepEqual(averageReviewRating(ratings), {
      average: 5,
      count: 11,
      label: '5.0',
    })
  })

  it('averages mixed ratings to one decimal', () => {
    assert.deepEqual(averageReviewRating([5, 5, 5, 5, 3]), {
      average: 4.6,
      count: 5,
      label: '4.6',
    })
  })

  it('recomputes as the list grows', () => {
    const elevenFives = Array.from({ length: 11 }, () => 5)
    assert.equal(averageReviewRating(elevenFives).label, '5.0')
    assert.equal(averageReviewRating(elevenFives).count, 11)
    const withAThree = [...elevenFives, 3]
    assert.deepEqual(averageReviewRating(withAThree), {
      average: 58 / 12,
      count: 12,
      label: '4.8',
    })
    const withAnotherFive = [...withAThree, 5]
    assert.deepEqual(averageReviewRating(withAnotherFive), {
      average: 63 / 13,
      count: 13,
      label: '4.8',
    })
  })
})

describe('parseReviewRating', () => {
  it('reads JSON numbers and numeric strings', () => {
    assert.equal(parseReviewRating(5), 5)
    assert.equal(parseReviewRating(4.5), 4.5)
    assert.equal(parseReviewRating('3'), 3)
    assert.equal(parseReviewRating('4.5'), 4.5)
    assert.equal(parseReviewRating(null), null)
    assert.equal(parseReviewRating(''), null)
  })
})

describe('mergePublishedReviewRatings', () => {
  const baked: ReviewRatingRow[] = [
    { name: 'Luiza Barbi', reviewedAt: '2026-08-10', rating: 5 },
    { name: 'Maria Bray', reviewedAt: '2026-08-04', rating: 5 },
  ]

  it('uses overlay ratings when the overlay list is present', () => {
    const overlay: ReviewRatingRow[] = [{ name: 'Pat', reviewedAt: '2026-09-01', rating: 4 }]
    assert.deepEqual(mergePublishedReviewRatings(overlay, baked, [{ ...baked[0], rating: 3 }]), [4])
  })

  it('appends unique extras onto baked cards', () => {
    const extra: ReviewRatingRow[] = [{ name: 'New Client', reviewedAt: '2026-09-01', rating: 3 }]
    assert.deepEqual(mergePublishedReviewRatings(null, baked, extra), [5, 5, 3])
  })

  it('drops extras that match a baked name and date', () => {
    const extra: ReviewRatingRow[] = [{ name: 'Luiza Barbi', reviewedAt: '2026-08-10', rating: 3 }]
    assert.deepEqual(mergePublishedReviewRatings(null, baked, extra), [5, 5])
  })
})

describe('publishedReviewSummary', () => {
  it('starts from the baked Google cards', () => {
    const summary = publishedReviewSummary(null, DEFAULT_REVIEWS, [])
    assert.equal(summary.count, DEFAULT_REVIEWS.length)
    assert.equal(summary.label, '5.0')
  })

  it('raises the count and lowers the average when a lower extra review is added', () => {
    const extra: ReviewRatingRow[] = [
      { name: 'New Client', reviewedAt: '2026-09-04', rating: 3 },
    ]
    const summary = publishedReviewSummary(null, DEFAULT_REVIEWS, extra)
    assert.equal(summary.count, DEFAULT_REVIEWS.length + 1)
    assert.equal(summary.label, '4.8')
    assert.equal(Number(summary.average.toFixed(1)), 4.8)
  })
})

describe('publicReviewSummary', () => {
  const snapshot: ReviewRatingRow[] = [
    { name: 'Pat', reviewedAt: '2026-09-01', rating: 5 },
    { name: 'Sam', reviewedAt: '2026-09-02', rating: 3 },
  ]

  it('uses baked cards when the public overlay is off', () => {
    const summary = publicReviewSummary(false, snapshot, DEFAULT_REVIEWS)
    assert.equal(summary.count, DEFAULT_REVIEWS.length)
    assert.equal(summary.label, '5.0')
  })

  it('uses portal-published reviews when the overlay is on', () => {
    const summary = publicReviewSummary(true, snapshot, DEFAULT_REVIEWS)
    assert.equal(summary.count, 2)
    assert.equal(summary.label, '4.0')
  })

  it('restores baked cards when overlay is on but the snapshot has no reviews', () => {
    const summary = publicReviewSummary(true, [], DEFAULT_REVIEWS)
    assert.equal(summary.count, DEFAULT_REVIEWS.length)
    assert.equal(summary.label, '5.0')
  })
})
