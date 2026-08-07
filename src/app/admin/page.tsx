'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingFeatures } from '@/hooks/useBookingFeatures'
import {
  getEnvWeb3FormsAccessKey,
  isBookingEmailConfigured,
  isValidCalendlySchedulingUrl,
  isValidEmailAddress,
  isValidFreshaBookingUrl,
  isValidWeb3FormsAccessKey,
  normalizeWeb3FormsAccessKey,
} from '@/lib/booking-features'
import { contactConfig } from '@/lib/contact-config'
import { HeroSection } from '@/features'

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 border border-accent/20 rounded-lg bg-white">
      <div className="min-w-0">
        <label
          htmlFor={id}
          className={`font-semibold text-primary ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {label}
        </label>
        <p className="text-sm text-secondary mt-1">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onChange(!checked)
        }}
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 transition-colors ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${
          checked
            ? 'bg-primary border-primary'
            : 'bg-accent/20 border-accent/30'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const {
    features,
    hydrated,
    setFreshaEnabled,
    setCalendlyEnabled,
    setBookingFormEnabled,
    setCalendlyInitialUrl,
    setCalendlyFollowUpUrl,
    setFreshaBookingUrl,
    setTreatmentPackagesEnabled,
    setBookingEmailEnabled,
    setBookingEmailAccessKey,
    setBookingEmailTo,
    resetToDefaults,
  } = useBookingFeatures()

  const [initialUrlDraft, setInitialUrlDraft] = useState(features.calendlyInitialUrl)
  const [followUpUrlDraft, setFollowUpUrlDraft] = useState(features.calendlyFollowUpUrl)
  const [freshaUrlDraft, setFreshaUrlDraft] = useState(features.freshaBookingUrl)
  const [urlSaved, setUrlSaved] = useState(false)
  const [freshaUrlSaved, setFreshaUrlSaved] = useState(false)
  const [accessKeyDraft, setAccessKeyDraft] = useState(features.bookingEmailAccessKey)
  const [emailToDraft, setEmailToDraft] = useState(
    features.bookingEmailTo || contactConfig.email.address
  )
  const [emailSaved, setEmailSaved] = useState(false)

  useEffect(() => {
    if (hydrated) {
      setInitialUrlDraft(features.calendlyInitialUrl)
      setFollowUpUrlDraft(features.calendlyFollowUpUrl)
      setFreshaUrlDraft(features.freshaBookingUrl)
      setAccessKeyDraft(features.bookingEmailAccessKey)
      setEmailToDraft(features.bookingEmailTo || contactConfig.email.address)
    }
  }, [
    hydrated,
    features.calendlyInitialUrl,
    features.calendlyFollowUpUrl,
    features.freshaBookingUrl,
    features.bookingEmailAccessKey,
    features.bookingEmailTo,
  ])

  const envAccessKey = getEnvWeb3FormsAccessKey()
  const usingEnvAccessKey = Boolean(envAccessKey)

  const initialUrlValid = isValidCalendlySchedulingUrl(initialUrlDraft)
  const followUpUrlValid = isValidCalendlySchedulingUrl(followUpUrlDraft)
  const urlsValid = initialUrlValid && followUpUrlValid
  const urlDirty =
    initialUrlDraft.trim() !== features.calendlyInitialUrl ||
    followUpUrlDraft.trim() !== features.calendlyFollowUpUrl
  const freshaUrlValid = isValidFreshaBookingUrl(freshaUrlDraft)
  const freshaUrlDirty = freshaUrlDraft.trim() !== features.freshaBookingUrl
  const emailToValid = isValidEmailAddress(emailToDraft)
  const accessKeyValid =
    usingEnvAccessKey || isValidWeb3FormsAccessKey(accessKeyDraft)
  const emailDirty =
    (!usingEnvAccessKey &&
      accessKeyDraft.trim() !== features.bookingEmailAccessKey) ||
    emailToDraft.trim() !== features.bookingEmailTo

  const activeMode = features.freshaEnabled
    ? 'Fresha booking'
    : features.bookingFormEnabled
      ? 'Legacy stepper form'
      : features.calendlyEnabled
        ? 'Calendly embed'
        : 'Call / contact only (all off)'

  const saveCalendlyUrls = () => {
    if (!urlsValid) return
    setCalendlyInitialUrl(initialUrlDraft)
    setCalendlyFollowUpUrl(followUpUrlDraft)
    setUrlSaved(true)
    window.setTimeout(() => setUrlSaved(false), 2000)
  }

  const saveFreshaUrl = () => {
    if (!freshaUrlDraft.trim() || !isValidFreshaBookingUrl(freshaUrlDraft)) return false
    setFreshaBookingUrl(freshaUrlDraft)
    setFreshaUrlSaved(true)
    window.setTimeout(() => setFreshaUrlSaved(false), 2000)
    return true
  }

  const openBookingsPage = () => {
    if (features.freshaEnabled && freshaUrlDirty) {
      if (!freshaUrlValid || !saveFreshaUrl()) return
    }
    if (features.calendlyEnabled && urlDirty) {
      if (!urlsValid) return
      saveCalendlyUrls()
    }
    router.push('/bookings')
  }

  const saveEmailSettings = () => {
    if (!emailToValid) return
    if (!usingEnvAccessKey && !accessKeyDraft.trim()) {
      return
    }
    if (!usingEnvAccessKey && !isValidWeb3FormsAccessKey(accessKeyDraft)) {
      return
    }
    if (!usingEnvAccessKey) {
      setBookingEmailAccessKey(normalizeWeb3FormsAccessKey(accessKeyDraft))
    }
    setBookingEmailTo(emailToDraft.trim() || contactConfig.email.address)
    setEmailSaved(true)
    window.setTimeout(() => setEmailSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        title="Booking feature settings"
        backgroundClass="bg-jungle-gradient"
        textColor="text-cream"
        showFloatingLeaves={true}
      />

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-sm text-secondary">
            <p>
              <span className="font-semibold text-primary">Active on /bookings:</span>{' '}
              {hydrated ? activeMode : 'Loading…'}
            </p>
            <p className="mt-2">
              Settings are saved in this browser only (localStorage). Enabling one booking UI
              turns the others off.
            </p>
            <p className="mt-2">
              <span className="font-semibold text-primary">Live site:</span> enable only{' '}
              <span className="font-medium text-primary">Fresha or Calendly</span> — not both —
              so Celbridge and Carlow share one schedule for the same practitioner.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-primary">Booking UI</h2>

            <Toggle
              id="toggle-fresha"
              label="Fresha booking"
              description="Confirmed bookings on Fresha. Book now opens Fresha; the bookings page shows pricing plus a Fresha button. Use instead of Calendly, not both."
              checked={features.freshaEnabled}
              onChange={setFreshaEnabled}
            />

            <Toggle
              id="toggle-calendly"
              label="Calendly booking embed"
              description="Confirmed bookings via Calendly on the bookings page (primary mode). Service, location, and add-ons are tagged into the event. See BOOKING_PROCESS.md for setup."
              checked={features.calendlyEnabled}
              onChange={setCalendlyEnabled}
            />

            <Toggle
              id="toggle-legacy-form"
              label="Legacy stepper form (appointment request)"
              description="Show a multi-step request form (not a confirmed calendar booking). Prefer Fresha or Calendly for live scheduling."
              checked={features.bookingFormEnabled}
              onChange={setBookingFormEnabled}
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-primary">Booking options</h2>
            <Toggle
              id="toggle-treatment-packages"
              label="Treatment packages"
              description="Show 5-session and 10-session package options on the bookings page (off by default)."
              checked={features.treatmentPackagesEnabled}
              onChange={setTreatmentPackagesEnabled}
            />
          </div>

          {features.freshaEnabled && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">Fresha setup</h2>
              <div className="border border-accent/20 rounded-lg bg-white p-5 space-y-4">
                <div>
                  <label
                    htmlFor="fresha-booking-url"
                    className="block font-semibold text-primary mb-1"
                  >
                    Fresha booking URL
                  </label>
                  <p className="text-sm text-secondary mb-3">
                    Paste your public Fresha booking link. In Fresha, set up both clinic locations under
                    one staff member so a booking at Celbridge blocks that time at Carlow (and vice
                    versa).
                  </p>
                  <input
                    id="fresha-booking-url"
                    type="url"
                    value={freshaUrlDraft}
                    onChange={(e) => {
                      setFreshaUrlDraft(e.target.value)
                      setFreshaUrlSaved(false)
                    }}
                    placeholder="https://www.fresha.com/a/your-business"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                      freshaUrlDraft && !freshaUrlValid
                        ? 'border-red-500 bg-red-50/40'
                        : 'border-accent/30'
                    }`}
                  />
                  {freshaUrlDraft && !freshaUrlValid && (
                    <p className="mt-2 text-sm text-red-700" role="alert">
                      Enter a valid Fresha URL (https://www.fresha.com/…).
                    </p>
                  )}
                  <p className="mt-2 text-xs text-secondary">
                    On phones with the Fresha app installed, the device may open the app
                    automatically; otherwise Fresha opens in the browser.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      saveFreshaUrl()
                    }}
                    disabled={!freshaUrlDirty || !freshaUrlValid}
                    className="px-5 py-2.5 rounded-full font-semibold bg-primary text-cream hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save Fresha settings
                  </button>
                  {freshaUrlSaved && (
                    <span className="text-sm text-primary font-medium">Saved</span>
                  )}
                  {freshaUrlDirty && freshaUrlValid && !freshaUrlSaved && (
                    <span className="text-sm text-amber-800">
                      Unsaved — click Save, or use Open bookings page to save and continue.
                    </span>
                  )}
                  {freshaUrlValid && (
                    <a
                      href={freshaUrlDraft.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-accent hover:text-primary transition-colors"
                    >
                      Open link
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {features.calendlyEnabled && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">Calendly setup</h2>

              <div className="border border-accent/20 rounded-lg bg-white p-5 space-y-5">
                <p className="text-sm text-secondary">
                  Use two event types so Initial blocks{' '}
                  <span className="font-medium text-primary">
                    {contactConfig.calendly.durations.initialLabel}
                  </span>{' '}
                  and Follow-up blocks{' '}
                  <span className="font-medium text-primary">
                    {contactConfig.calendly.durations.followUpLabel}
                  </span>{' '}
                  ({contactConfig.calendly.durations.slotIncrementMinutes}-minute start times). See
                  README for the full checklist.
                </p>
                <p className="text-sm text-secondary">
                  Celbridge and Carlow share one schedule: use a single Calendly user and connect both
                  event types to the <span className="font-medium text-primary">same</span> Google/Outlook
                  calendar. Clinic choice on the bookings page is a location note on the invite, not a
                  second calendar. Add buffers in Calendly if you need travel time between clinics.
                </p>

                <div>
                  <label
                    htmlFor="calendly-initial-url"
                    className="block font-semibold text-primary mb-1"
                  >
                    Initial Consultation URL
                  </label>
                  <input
                    id="calendly-initial-url"
                    type="url"
                    value={initialUrlDraft}
                    onChange={(e) => {
                      setInitialUrlDraft(e.target.value)
                      setUrlSaved(false)
                    }}
                    placeholder="https://calendly.com/username/initial-consultation"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                      initialUrlDraft && !initialUrlValid
                        ? 'border-red-500 bg-red-50/40'
                        : 'border-accent/30'
                    }`}
                  />
                  {initialUrlDraft && !initialUrlValid && (
                    <p className="mt-2 text-sm text-red-700" role="alert">
                      Enter a valid Calendly URL (https://calendly.com/username/event-slug).
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="calendly-follow-up-url"
                    className="block font-semibold text-primary mb-1"
                  >
                    Follow-up URL
                  </label>
                  <input
                    id="calendly-follow-up-url"
                    type="url"
                    value={followUpUrlDraft}
                    onChange={(e) => {
                      setFollowUpUrlDraft(e.target.value)
                      setUrlSaved(false)
                    }}
                    placeholder="https://calendly.com/username/follow-up"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                      followUpUrlDraft && !followUpUrlValid
                        ? 'border-red-500 bg-red-50/40'
                        : 'border-accent/30'
                    }`}
                  />
                  {followUpUrlDraft && !followUpUrlValid && (
                    <p className="mt-2 text-sm text-red-700" role="alert">
                      Enter a valid Calendly URL (https://calendly.com/username/event-slug).
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveCalendlyUrls}
                    disabled={!urlDirty || !urlsValid}
                    className="px-5 py-2.5 rounded-full font-semibold bg-primary text-cream hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save URLs
                  </button>
                  {urlSaved && (
                    <span className="text-sm text-primary font-medium">Saved</span>
                  )}
                  <a
                    href={
                      initialUrlValid
                        ? initialUrlDraft.trim()
                        : features.calendlyInitialUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:text-primary transition-colors"
                  >
                    Open Initial
                  </a>
                  <a
                    href={
                      followUpUrlValid
                        ? followUpUrlDraft.trim()
                        : features.calendlyFollowUpUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:text-primary transition-colors"
                  >
                    Open Follow-up
                  </a>
                </div>
              </div>
            </div>
          )}

          {features.bookingFormEnabled && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">Booking email setup</h2>

              <Toggle
                id="toggle-booking-email"
                label="Email appointment requests"
                description="When enabled, Submit appointment request emails the booking details via Web3Forms."
                checked={features.bookingEmailEnabled}
                onChange={setBookingEmailEnabled}
                disabled={usingEnvAccessKey}
              />

              {features.bookingEmailEnabled && (
                <div className="border border-accent/20 rounded-lg bg-white p-5 space-y-4">
                  <div className="rounded-lg border border-accent/20 bg-white/70 px-4 py-3 text-sm text-secondary space-y-2">
                    <p className="font-semibold text-primary">
                      Patient thank-you email (Web3Forms Autoresponder)
                    </p>
                    <p>
                      The clinic inbox always receives the booking request. To also email
                      the patient a confirmation, enable{' '}
                      <span className="font-medium text-primary">Autoresponder</span> on
                      this form in the{' '}
                      <a
                        href="https://docs.web3forms.com/getting-started/pro-features/autoresponder"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Web3Forms dashboard
                      </a>{' '}
                      (Pro feature).
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Subject: We received your appointment request — Wellness Needles
                      </li>
                      <li>
                        Intro: thank-you + we&apos;ll confirm within 24 hours (preferred
                        time not locked)
                      </li>
                      <li>Show copy of their submission: Yes</li>
                      <li>
                        Logo (optional): full https URL to{' '}
                        <code className="text-xs">/logo_wellness.jpeg</code>
                      </li>
                      <li>
                        Typically works on production sites — not localhost / some
                        previews
                      </li>
                    </ul>
                  </div>

                  <div>
                    <label
                      htmlFor="booking-email-to"
                      className="block font-semibold text-primary mb-1"
                    >
                      Recipient email
                    </label>
                    <p className="text-sm text-secondary mb-3">
                      Inbox that should receive new appointment requests. Defaults to{' '}
                      {contactConfig.email.address}.
                    </p>
                    <input
                      id="booking-email-to"
                      type="email"
                      value={emailToDraft}
                      onChange={(e) => {
                        setEmailToDraft(e.target.value)
                        setEmailSaved(false)
                      }}
                      placeholder={contactConfig.email.address}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                        emailToDraft && !emailToValid
                          ? 'border-red-500 bg-red-50/40'
                          : 'border-accent/30'
                      }`}
                    />
                    {emailToDraft && !emailToValid && (
                      <p className="mt-2 text-sm text-red-700" role="alert">
                        Enter a valid email address.
                      </p>
                    )}
                  </div>

                  {!usingEnvAccessKey && (
                    <div>
                      <label
                        htmlFor="web3forms-access-key"
                        className="block font-semibold text-primary mb-1"
                      >
                        Web3Forms access key
                      </label>
                      <p className="text-sm text-secondary mb-3">
                        Local fallback only. For shared deploys, set{' '}
                        <code className="text-xs">NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY</code> in
                        Vercel (see README). Create the key at{' '}
                        <a
                          href="https://web3forms.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          web3forms.com
                        </a>{' '}
                        using <span className="font-medium">{contactConfig.email.address}</span>.
                      </p>
                      <input
                        id="web3forms-access-key"
                        type="password"
                        autoComplete="off"
                        value={accessKeyDraft}
                        onChange={(e) => {
                          setAccessKeyDraft(e.target.value)
                          setEmailSaved(false)
                        }}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                          accessKeyDraft && !accessKeyValid
                            ? 'border-red-500 bg-red-50/40'
                            : 'border-accent/30'
                        }`}
                      />
                      {accessKeyDraft && !accessKeyValid && (
                        <p className="mt-2 text-sm text-red-700" role="alert">
                          Access key must be a valid UUID from the Web3Forms dashboard.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={saveEmailSettings}
                      disabled={
                        !emailDirty ||
                        !emailToValid ||
                        (!usingEnvAccessKey && !accessKeyValid)
                      }
                      className="px-5 py-2.5 rounded-full font-semibold bg-primary text-cream hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save email settings
                    </button>
                    {emailSaved && (
                      <span className="text-sm text-primary font-medium">Saved</span>
                    )}
                    {!usingEnvAccessKey && !accessKeyDraft.trim() && (
                      <span className="text-sm text-red-700">
                        Paste your Web3Forms access key before saving.
                      </span>
                    )}
                    {!usingEnvAccessKey &&
                      Boolean(accessKeyDraft.trim()) &&
                      !accessKeyValid && (
                      <span className="text-sm text-red-700">
                        Key must look like a UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
                      </span>
                    )}
                    <span className="text-sm text-secondary">
                      Status:{' '}
                      <span className="font-medium text-primary">
                        {isBookingEmailConfigured({
                          ...features,
                          bookingEmailAccessKey: usingEnvAccessKey
                            ? envAccessKey
                            : accessKeyDraft.trim() || features.bookingEmailAccessKey,
                          bookingEmailTo:
                            emailToDraft.trim() || contactConfig.email.address,
                          bookingEmailEnabled: true,
                        })
                          ? `Ready to send → ${
                              emailToDraft.trim() || contactConfig.email.address
                            }`
                          : 'Needs access key + valid recipient'}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetToDefaults()
                setUrlSaved(false)
                setFreshaUrlSaved(false)
                setEmailSaved(false)
              }}
              className="px-6 py-3 rounded-full font-semibold border-2 border-accent/30 text-primary hover:border-primary transition-colors"
            >
              Reset to defaults
            </button>
            <button
              type="button"
              onClick={openBookingsPage}
              disabled={
                (features.freshaEnabled && freshaUrlDirty && !freshaUrlValid) ||
                (features.calendlyEnabled && urlDirty && !urlsValid)
              }
              className="px-6 py-3 rounded-full font-semibold bg-primary text-cream text-center hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Open bookings page
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
