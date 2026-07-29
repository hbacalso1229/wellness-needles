interface LocationMapProps {
  query: string
  title: string
  directionsUrl?: string
  className?: string
}

export default function LocationMap({
  query,
  title,
  directionsUrl,
  className = ''
}: LocationMapProps) {
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`

  return (
    <div className={className}>
      <div className="h-44 sm:h-48 overflow-hidden rounded-lg border border-accent/20 bg-accent/10">
        <iframe
          title={title}
          src={embedSrc}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-accent hover:text-primary transition-colors"
        >
          Get directions
        </a>
      )}
    </div>
  )
}
