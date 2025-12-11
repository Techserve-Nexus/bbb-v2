export default function SponsorsSkeleton() {
  return (
    <section className="py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-6 animate-pulse">
            <div className="h-10 w-64 bg-muted rounded"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
