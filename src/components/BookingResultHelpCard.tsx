'use client'

import { Mail, Phone } from 'lucide-react'
import { CTAButton } from '@/features'
import { contactConfig } from '@/lib/contact-config'

const messageCtaClass =
  '!rounded-full !px-4 !py-2.5 !text-sm !font-medium gap-1.5 bg-white/80 !shadow-none transition-transform duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]'

/** Bookings-style help card for full-screen result pages. */
export function BookingResultHelpCard({
  intro = 'Prefer to call or email — we can help you book.',
  callLabel = 'Call Now',
  className = '',
}: {
  intro?: string
  callLabel?: string
  className?: string
}) {
  return (
    <aside
      className={`mx-auto mt-4 h-fit w-full rounded-xl border border-accent/15 bg-accent/10 p-4 sm:mt-5 sm:p-5 lg:mt-8 ${className || 'max-w-xs'}`}
    >
      <h3 className="mb-1 text-lg font-bold leading-snug text-[#1B3B2B]">Need help?</h3>
      <p className="mb-4 text-base leading-relaxed text-[var(--text-dark)]/70">{intro}</p>
      <div className="flex w-full flex-col gap-2.5">
        <div className="w-full">
          <CTAButton
            href={contactConfig.phone.href}
            variant="gold"
            size="medium"
            showArrow={false}
            fullWidth
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            {callLabel}
          </CTAButton>
          <p className="mt-1.5 text-center text-base font-semibold text-[var(--text-dark)] md:mt-2">
            {contactConfig.phone.displayText}
          </p>
        </div>

        <div className="flex items-center gap-2.5 md:gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-accent/25" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-secondary md:text-xs">
            Or
          </span>
          <div className="h-px flex-1 bg-accent/25" />
        </div>

        <div className="w-full">
          <CTAButton
            href={contactConfig.email.href}
            variant="outline"
            size="medium"
            showArrow={false}
            fullWidth
            className={messageCtaClass}
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            Send a message
          </CTAButton>
          <p className="mt-1.5 text-center text-base text-[var(--text-dark)]/70 md:mt-2">
            We reply within 24 hours
          </p>
        </div>
      </div>
    </aside>
  )
}
