"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Speaker } from "@/lib/types"

export default function SpeakersSection() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    fetchSpeakers()
  }, [])

  // Update scroll button availability based on container scroll position
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const update = () => {
      setCanScrollPrev(el.scrollLeft > 0)
      setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }

    update()
    el.addEventListener("scroll", update)
    window.addEventListener("resize", update)

    // Also observe size/content changes (images loading) using ResizeObserver
    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(() => update())
      ro.observe(el)
    } catch (e) {
      // ResizeObserver may not be available in some runtimes; ignore
    }

    // Fallback: call update after short delays to catch late image loads
    const t1 = setTimeout(update, 300)
    const t2 = setTimeout(update, 1000)

    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      if (ro) ro.disconnect()
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [speakers])

  const fetchSpeakers = async () => {
    try {
      const response = await fetch("/api/speakers")
      const data = await response.json()
      setSpeakers(data.speakers || [])
    } catch (error) {
      console.error("Failed to fetch speakers:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollPrev = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: -Math.max(el.clientWidth * 0.7, 320), behavior: "smooth" })
  }

  const scrollNext = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: Math.max(el.clientWidth * 0.7, 320), behavior: "smooth" })
  }

  if (loading) {
    return (
      <section className="py-16 px-4 md:px-6 bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">Loading speakers...</p>
        </div>
      </section>
    )
  }

  if (speakers.length === 0) {
    return null // Don't show section if no speakers
  }

  // Show grid if 4 or fewer speakers, carousel if more
  const useCarousel = speakers.length > 4

  // Dynamic grid columns based on speaker count
  const getGridClass = () => {
    if (speakers.length === 1) return "grid-cols-1"
    if (speakers.length === 2) return "grid-cols-1 sm:grid-cols-2"
    if (speakers.length === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <section className="py-16 px-4 md:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Speakers</h2>
          <p className="text-muted-foreground mt-2">Learn from industry leaders and experts</p>
        </div>
        <div className="relative group">
          <div ref={scrollRef} className="flex gap-8 min-w-[1020px] overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
            {speakers.length === 0 ? (
              <div className="text-center text-muted-foreground w-full">No speakers found.</div>
            ) : (
              speakers.map((speaker) => (
                <div key={speaker.id} className="min-w-[340px] max-w-sm w-full">
                  <SpeakerCard speaker={speaker} />
                </div>
              ))
            )}
          </div>
          {/* Left/Right arrows on hover for carousel navigation */}
          {speakers.length > 3 && (
            <>
              <button
                onClick={scrollPrev}
                aria-label="Scroll left"
                className="hidden md:flex items-center justify-center absolute left-2 top-1/2 z-10 bg-primary/90 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:scale-110"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Scroll right"
                className="hidden md:flex items-center justify-center absolute right-2 top-1/2 z-10 bg-primary/90 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:scale-110"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="bg-background rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col flex-wrap">
      {/* Speaker Photo */}
      <div className="w-full aspect-square bg-muted relative overflow-hidden">
        <img
          src={speaker.photo}
          alt={speaker.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Speaker Info */}
      <div className="p-6 flex flex-col grow">
        <h3 className="text-xl font-bold text-foreground mb-1">{speaker.name}</h3>
        <p className="text-sm text-primary font-semibold mb-3">{speaker.designation}</p>
        <p className="text-sm text-muted-foreground line-clamp-3 grow mb-4">
          {speaker.bio}
        </p>

        {/* Social Link */}
        <a
          href={speaker.socialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
          <ExternalLink size={16} />
          Connect
        </a>
      </div>
    </div>
  )
}
