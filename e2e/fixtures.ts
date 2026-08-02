import { test as base, expect } from '@playwright/test'

/** Fresh storage so Admin localStorage cannot enable Web3Forms/hCaptcha. */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      try {
        window.localStorage.removeItem('wellness-needles-booking-features')
      } catch {
        // ignore
      }
    })
    await use(context)
  },
})

export { expect }
