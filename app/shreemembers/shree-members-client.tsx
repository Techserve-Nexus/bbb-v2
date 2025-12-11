"use client"

import { useState } from "react"

interface ShreeMember {
  id: string
  name: string
  photo: string
  role: string
  bio: string
  youtubeUrl?: string
}

export default function ShreeMembersClient({ members }: { members: ShreeMember[] }) {
  const [hovered, setHovered] = useState<string | null>(null)

  // Extract YouTube embed ID
  const getEmbedId = (url?: string) => {
    if (!url) return null

    const patterns = [
      /watch\?v=([\w-]{11})/,
      /youtu\.be\/([\w-]{11})/,
      /embed\/([\w-]{11})/,
      /shorts\/([\w-]{11})/,
    ]

    for (const p of patterns) {
      const match = url.match(p)
      if (match) return match[1]
    }

    return null
  }

  // 🔴 Empty state
  if (!members || members.length === 0) {
    return (
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-semibold text-orange-600 mb-2">No Members Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Currently, there are no active members listed. Please check back later.
        </p>
      </section>
    )
  }

  return (
    <section className="py-12 px-4 md:px-6 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

        {members.map((m) => {
          const videoId = getEmbedId(m.youtubeUrl)
          const isHovered = hovered === m.id
          const initials = m.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")

          return (
            <div
              key={m.id}
              className="bg-muted/50 p-6 rounded-lg text-center border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Image / Video Container */}
              <div className="w-full h-56 md:h-64 lg:h-72 bg-primary/10 rounded-md mb-4 overflow-hidden relative flex items-center justify-center">

                {/* ▶ On Hover: Show Video */}
                {videoId && isHovered ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    loading="lazy"
                    title={`${m.name} video`}
                  />
                ) : m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-4xl font-bold text-primary">{initials}</div>
                )}

                {/* YouTube badge when not hovered */}
                {videoId && !isHovered && (
                  <div className="absolute bottom-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg text-xs">
                    ▶
                  </div>
                )}
              </div>

              {/* Member Info */}
              <h3 className="text-lg font-semibold text-foreground">{m.name}</h3>
              <p className="text-primary text-sm font-medium mt-1">{m.role}</p>
              <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{m.bio}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
