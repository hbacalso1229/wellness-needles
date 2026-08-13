import { test as base, expect } from '@playwright/test'

/** Fresh storage so leftover localStorage cannot enable Web3Forms/captcha. */
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
