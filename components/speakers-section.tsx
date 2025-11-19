"use client"

import { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Speaker } from "@/lib/types"

export default function SpeakersSection() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 4 },
      "(min-width: 768px)": { slidesToScroll: 2 },
    },
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    fetchSpeakers()
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    const updateButtons = () => {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }

    emblaApi.on("select", updateButtons)
    emblaApi.on("init", updateButtons)
    emblaApi.on("reInit", updateButtons)

    return () => {
      emblaApi.off("select", updateButtons)
    }
  }, [emblaApi])

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

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

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

  return (
    <section className="py-16 px-4 md:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Speakers</h2>
          <p className="text-muted-foreground mt-2">Learn from industry leaders and experts</p>
        </div>

        {!useCarousel ? (
          /* Grid layout for 4 or fewer speakers */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {speakers.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
        ) : (
          /* Carousel for more than 4 speakers */
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {speakers.map((speaker) => (
                  <div
                    key={speaker.id}
                    className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(25%-18px)]"
                  >
                    <SpeakerCard speaker={speaker} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            {speakers.length > 4 && (
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="rounded-full"
                  aria-label="Previous speakers"
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="rounded-full"
                  aria-label="Next speakers"
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="bg-background rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
      {/* Speaker Photo */}
      <div className="w-full aspect-square bg-muted relative overflow-hidden">
        <img
          src={speaker.photo}
          alt={speaker.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Speaker Info */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-foreground mb-1">{speaker.name}</h3>
        <p className="text-sm text-primary font-semibold mb-3">{speaker.designation}</p>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow mb-4">
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
