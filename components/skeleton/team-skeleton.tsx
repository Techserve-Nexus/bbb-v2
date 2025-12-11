"use client"

export default function TeamCarouselSkeleton() {
  return (
    <section className="py-16 px-4 md:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Title Skeleton */}
        <div className="text-center mb-8">
          <div className="h-7 w-64 mx-auto bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-80 mx-auto mt-3 bg-muted/70 rounded-md animate-pulse" />
        </div>

        {/* Carousel Skeleton */}
        <div className="flex gap-4 md:gap-6 lg:gap-8 overflow-hidden pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-background rounded-xl border border-border min-w-[280px] sm:min-w-[320px] md:min-w-[340px] max-w-sm shrink-0 overflow-hidden"
            >
              {/* Image Skeleton */}
              <div className="w-full aspect-square bg-muted/30 animate-pulse" />

              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-muted/60 rounded-md animate-pulse" />
                  <div className="h-3 w-28 bg-muted/40 rounded-md animate-pulse" />
                </div>

                <div className="h-3 w-56 bg-muted/40 rounded-md animate-pulse" />

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="h-3 w-40 bg-muted/40 rounded-md animate-pulse" />
                  <div className="h-3 w-48 bg-muted/40 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
