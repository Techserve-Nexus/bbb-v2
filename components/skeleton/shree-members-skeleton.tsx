export default function ShreeMembersSkeleton() {
  return (
    <section className="py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-muted/50 p-6 rounded-lg border animate-pulse">
            <div className="w-full h-56 md:h-64 lg:h-72 bg-muted rounded-md mb-4" />
            <div className="h-4 w-40 bg-muted/70 mx-auto rounded mb-2" />
            <div className="h-3 w-28 bg-muted/50 mx-auto rounded" />
          </div>
        ))}
      </div>
    </section>
  )
}
