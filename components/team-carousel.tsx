"use client"

import { useState } from "react"

type TeamMember = {
  id: number
  initials: string
  name: string
  role: string
  bio?: string
}

export default function TeamCarousel({
  items,
  cardHeight = "h-56 md:h-64 lg:h-72",
}: {
  items: TeamMember[]
  cardHeight?: string
}) {
  const [index, setIndex] = useState(0)

  const next = () => setIndex((p) => (p + 1) % items.length)
  const prev = () => setIndex((p) => (p - 1 + items.length) % items.length)

  // compute mobile height (take first class, e.g. 'h-56')
  const mobileHeight = cardHeight.split(" ")[0]

  return (
    <div>
      {/* Desktop / Tablet Grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((m) => (
          <div key={m.id} className="bg-muted/50 rounded-lg p-6 flex flex-col items-center text-center border border-border hover:shadow-lg transition">
            <div className={`w-full ${cardHeight} bg-primary/10 rounded-md mb-4 overflow-hidden flex items-center justify-center`}>
              <div className="text-3xl font-bold text-primary">{m.initials}</div>
            </div>
            <h3 className="text-lg font-semibold text-foreground">{m.name}</h3>
            <p className="text-sm text-primary font-medium mt-1">{m.role}</p>
            {m.bio && <p className="text-sm text-muted-foreground mt-3">{m.bio}</p>}
          </div>
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden">
        <div className="bg-muted/50 rounded-lg p-6 mb-6 border border-border">
          <div className={`w-full ${mobileHeight} bg-primary/10 rounded-md mb-4 overflow-hidden flex items-center justify-center`}>
            <div className="text-3xl font-bold text-primary">{items[index].initials}</div>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{items[index].name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{items[index].role}</p>
          {items[index].bio && <p className="text-sm text-muted-foreground mt-3">{items[index].bio}</p>}
        </div>

        <div className="flex justify-between items-center">
          <button type="button" onClick={prev} className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors" aria-label="Previous">‹</button>
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === index ? "bg-primary w-6" : "bg-border"}`}
              />
            ))}
          </div>
          <button type="button" onClick={next} className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors" aria-label="Next">›</button>
        </div>
      </div>
    </div>
  )
}
