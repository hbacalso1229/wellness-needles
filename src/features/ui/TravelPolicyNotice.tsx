import { CheckCircle, Info, MapPin } from 'lucide-react'

export function TravelPolicyNotice({ className = '' }: { className?: string }) {
  return (
    <aside
      className={`relative overflow-hidden rounded-xl border border-accent/30 bg-gold/10 p-4 sm:p-5 ${className}`}
      aria-label="Home visit travel policy"
    >
      <div
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold to-primary"
        aria-hidden="true"
      />

      <div className="pl-3 sm:pl-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-primary shrink-0" aria-hidden />
          <h4 className="font-semibold text-primary">Home visit travel policy</h4>
        </div>

        <p className="text-sm text-secondary mb-3">
          Travel fees may apply outside the included radius.
        </p>

        <ul className="text-sm text-secondary space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden />
            <span>Within 10 km included</span>
          </li>
          <li className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden />
            <span>Beyond 10 km: +€0.50/km or flat €15 travel fee</span>
          </li>
        </ul>
      </div>
    </aside>
  )
}
