"use client"

import { useState, useEffect } from "react"

interface Sponsor {
  id: string
  name: string
  logo: string
  website: string
  category: "Platinum" | "Gold" | "Silver"
  description: string
}

export default function Sponsors() {
  const [isHovered, setIsHovered] = useState<number | null>(null)
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    try {
      const response = await fetch("/api/sponsors")
      const data = await response.json()
      if (data.success) {
        setSponsors(data.sponsors)
      }
    } catch (error) {
      console.error("Error fetching sponsors:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-2">Our Partners</p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">Sponsors & Partners</h2>
          </div>
          <div className="text-center text-muted-foreground">Loading sponsors...</div>
        </div>
      </section>
    )
  }

  if (sponsors.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold mb-2">Our Partners</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">Sponsors & Partners</h2>
        </div>

        {/* Marquee Sponsors */}
        <div className="relative overflow-hidden bg-background rounded-lg border border-border p-8">
          <div className="flex gap-6 animate-scroll whitespace-nowrap">
            {[...sponsors, ...sponsors].map((sponsor, index) => (
              <div
                key={index}
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
                className="flex-shrink-0 w-48 h-32 bg-muted rounded-lg border border-border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-105"
              >
                {sponsor.logo ? (
                  <img src={sponsor.logo} alt={sponsor.name} className="w-16 h-16 object-contain mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-primary mb-2">🏢</div>
                )}
                <h3 className="font-semibold text-foreground text-center px-2 truncate w-full">{sponsor.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{sponsor.category}</p>
                {isHovered === index && sponsor.description && (
                  <p className="text-xs text-primary mt-2 font-semibold truncate w-full px-2">{sponsor.description}</p>
                )}
              </div>
            ))}
          </div>
          <style jsx>{`
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
          `}</style>
        </div>
      </div>
    </section>
  )
}
