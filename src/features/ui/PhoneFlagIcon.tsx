/** ISO flags from flagcdn — emoji regional indicators do not render as flags on Windows. */
export function PhoneFlagIcon({ countryId, className }: { countryId: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${countryId.toLowerCase()}.png`}
      alt=""
      width={24}
      height={16}
      className={`h-4 w-6 shrink-0 rounded-[1px] object-cover shadow-sm ring-1 ring-black/10 ${className ?? ''}`}
      aria-hidden
    />
  )
}
