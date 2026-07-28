'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBookingFeatures } from '@/hooks/useBookingFeatures'
import {
  getEnvWeb3FormsAccessKey,
  isBookingEmailConfigured,
  isValidCalendlySchedulingUrl,
  isValidEmailAddress,
} from '@/lib/booking-features'

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
    <div className="flex items-start justify-between gap-4 p-5 border border-accent/20 rounded-lg bg-cream">
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
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-cream shadow transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function AdminPage() {
  const {
    features,
    hydrated,
    setCalendlyEnabled,
    setBookingFormEnabled,
    setCalendlySchedulingUrl,
    setBookingEmailEnabled,
    setBookingEmailAccessKey,
    setBookingEmailTo,
    resetToDefaults,
  } = useBookingFeatures()

  const [urlDraft, setUrlDraft] = useState(features.calendlySchedulingUrl)
  const [urlSaved, setUrlSaved] = useState(false)
  const [accessKeyDraft, setAccessKeyDraft] = useState(features.bookingEmailAccessKey)
  const [emailToDraft, setEmailToDraft] = useState(features.bookingEmailTo)
  const [emailSaved, setEmailSaved] = useState(false)

  useEffect(() => {
    if (hydrated) {
      setUrlDraft(features.calendlySchedulingUrl)
      setAccessKeyDraft(features.bookingEmailAccessKey)
      setEmailToDraft(features.bookingEmailTo)
    }
  }, [
    hydrated,
    features.calendlySchedulingUrl,
    features.bookingEmailAccessKey,
    features.bookingEmailTo,
  ])

  const envAccessKey = getEnvWeb3FormsAccessKey()
  const usingEnvAccessKey = Boolean(envAccessKey)

  const urlIsValid = isValidCalendlySchedulingUrl(urlDraft)
  const urlDirty = urlDraft.trim() !== features.calendlySchedulingUrl
  const emailToValid = isValidEmailAddress(emailToDraft)
  const emailDirty =
    (!usingEnvAccessKey &&
      accessKeyDraft.trim() !== features.bookingEmailAccessKey) ||
    emailToDraft.trim() !== features.bookingEmailTo

  const activeMode = features.bookingFormEnabled
    ? 'Legacy stepper form'
    : features.calendlyEnabled
      ? 'Calendly embed'
      : 'Call / contact only (both off)'

  const saveCalendlyUrl = () => {
    if (!urlIsValid) return
    setCalendlySchedulingUrl(urlDraft)
    setUrlSaved(true)
    window.setTimeout(() => setUrlSaved(false), 2000)
  }

  const saveEmailSettings = () => {
    if (!emailToValid) return
    if (!usingEnvAccessKey && !accessKeyDraft.trim()) {
      return
    }
    if (!usingEnvAccessKey) {
      setBookingEmailAccessKey(accessKeyDraft)
    }
    setBookingEmailTo(emailToDraft)
    setEmailSaved(true)
    window.setTimeout(() => setEmailSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-cream">
      <section className="py-16 bg-accent text-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Admin</h1>
          <p className="text-lg opacity-90">Booking feature settings</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-sm text-secondary">
            <p>
              <span className="font-semibold text-primary">Active on /bookings:</span>{' '}
              {hydrated ? activeMode : 'Loading…'}
            </p>
            <p className="mt-2">
              Settings are saved in this browser only (localStorage). Enabling one booking UI
              turns the other off.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-primary">Booking UI</h2>

            <Toggle
              id="toggle-calendly"
              label="Calendly booking embed"
              description="Show the Calendly scheduler on the bookings page (service, location, and add-ons tagged into the booking)."
              checked={features.calendlyEnabled}
              onChange={setCalendlyEnabled}
            />

            <Toggle
              id="toggle-legacy-form"
              label="Legacy stepper form"
              description="Show the multi-step booking form (Service → Location → Date & Time → Details)."
              checked={features.bookingFormEnabled}
              onChange={setBookingFormEnabled}
            />
          </div>

          {features.calendlyEnabled && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">Calendly setup</h2>

              <div className="border border-accent/20 rounded-lg bg-cream p-5 space-y-4">
                <div>
                  <label
                    htmlFor="calendly-scheduling-url"
                    className="block font-semibold text-primary mb-1"
                  >
                    Scheduling URL
                  </label>
                  <p className="text-sm text-secondary mb-3">
                    Paste the public event link from Calendly → Event type → Share. Example:{' '}
                    <code className="text-xs break-all">
                      https://calendly.com/your-user/scheduled-booking
                    </code>
                  </p>
                  <input
                    id="calendly-scheduling-url"
                    type="url"
                    value={urlDraft}
                    onChange={(e) => {
                      setUrlDraft(e.target.value)
                      setUrlSaved(false)
                    }}
                    placeholder="https://calendly.com/username/event-slug"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                      urlDraft && !urlIsValid
                        ? 'border-red-500 bg-red-50/40'
                        : 'border-accent/30'
                    }`}
                  />
                  {urlDraft && !urlIsValid && (
                    <p className="mt-2 text-sm text-red-700" role="alert">
                      Enter a valid Calendly URL (https://calendly.com/username/event-slug).
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={saveCalendlyUrl}
                      disabled={!urlDirty || !urlIsValid}
                      className="px-5 py-2.5 rounded-full font-semibold bg-primary text-cream hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save URL
                    </button>
                    {urlSaved && (
                      <span className="text-sm text-primary font-medium">Saved</span>
                    )}
                    <a
                      href={urlIsValid ? urlDraft.trim() : features.calendlySchedulingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-accent hover:text-primary transition-colors"
                    >
                      Open link
                    </a>
                  </div>
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
                description="When enabled, Submit Appointment Request emails the booking details via Web3Forms."
                checked={features.bookingEmailEnabled}
                onChange={setBookingEmailEnabled}
                disabled={usingEnvAccessKey}
              />

              {features.bookingEmailEnabled && (
                <div className="border border-accent/20 rounded-lg bg-cream p-5 space-y-4">
                  <div>
                    <label
                      htmlFor="booking-email-to"
                      className="block font-semibold text-primary mb-1"
                    >
                      Recipient email
                    </label>
                    <p className="text-sm text-secondary mb-3">
                      Inbox that should receive new appointment requests.
                    </p>
                    <input
                      id="booking-email-to"
                      type="email"
                      value={emailToDraft}
                      onChange={(e) => {
                        setEmailToDraft(e.target.value)
                        setEmailSaved(false)
                      }}
                      placeholder="info@wellnessneedles.ie"
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
                        Vercel (see README).
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
                        placeholder="Your Web3Forms access key"
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={saveEmailSettings}
                      disabled={
                        !emailDirty ||
                        !emailToValid ||
                        (!usingEnvAccessKey && !accessKeyDraft.trim())
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
                    <span className="text-sm text-secondary">
                      Status:{' '}
                      <span className="font-medium text-primary">
                        {isBookingEmailConfigured({
                          ...features,
                          bookingEmailAccessKey: usingEnvAccessKey
                            ? envAccessKey
                            : accessKeyDraft.trim() || features.bookingEmailAccessKey,
                          bookingEmailTo: emailToDraft.trim() || features.bookingEmailTo,
                          bookingEmailEnabled: true,
                        })
                          ? 'Ready to send'
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
                setEmailSaved(false)
              }}
              className="px-6 py-3 rounded-full font-semibold border-2 border-accent/30 text-primary hover:border-primary transition-colors"
            >
              Reset to defaults
            </button>
            <Link
              href="/bookings"
              className="px-6 py-3 rounded-full font-semibold bg-primary text-cream text-center hover:bg-secondary transition-colors"
            >
              Open bookings page
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
