"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface Sponsor {
  id: string
  name: string
  logo: string
  website: string
  category: "Platinum" | "Gold" | "Silver"
  description: string
  socialLinks?: Record<string, string>
}

export default function SponsorsPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
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

  const filteredSponsors = selectedTier ? sponsors.filter((s) => s.category === selectedTier) : sponsors

  return (
    <main className="bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">Our Sponsors</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet the organizations supporting our mission to bring chess excellence to the world.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 px-4 md:px-6 bg-muted/30 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold text-muted-foreground mb-4">FILTER BY TIER:</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setSelectedTier(null)}
              variant={selectedTier === null ? "default" : "outline"}
              className={selectedTier === null ? "bg-primary hover:bg-secondary text-primary-foreground" : ""}
            >
              All Sponsors
            </Button>
            {["Platinum", "Gold", "Silver"].map((tier) => (
              <Button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                variant={selectedTier === tier ? "default" : "outline"}
                className={selectedTier === tier ? "bg-primary hover:bg-secondary text-primary-foreground" : ""}
              >
                {tier}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Grid */}
      <section className="py-20 px-4 md:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading sponsors...</div>
          ) : filteredSponsors.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No sponsors found</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary"
                >
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 h-32 flex items-center justify-center p-4">
                    {sponsor.logo ? (
                      <img src={sponsor.logo} alt={sponsor.name} className="max-h-20 max-w-full object-contain" />
                    ) : (
                      <div className="text-5xl">🏢</div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-sm font-semibold text-primary mb-2">{sponsor.category.toUpperCase()}</p>
                    <h3 className="text-xl font-bold text-foreground mb-1">{sponsor.name}</h3>
                    <p className="text-sm text-foreground mb-6 leading-relaxed line-clamp-3">{sponsor.description}</p>

                    {sponsor.socialLinks && Object.keys(sponsor.socialLinks).length > 0 && (
                      <div className="flex gap-3 mb-4 flex-wrap items-center">
                        {Object.entries(sponsor.socialLinks).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:text-secondary text-xs font-medium px-2 py-1 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
                            title={`Visit ${platform}`}
                          >
                            <span className="capitalize">{platform}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    <a 
                      href={sponsor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full bg-primary hover:bg-secondary text-primary-foreground">
                        Visit Website
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Become Sponsor CTA */}
          <div className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 rounded-lg border border-primary/20 p-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Interested in Sponsoring?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our prestigious sponsors and be part of the premier chess event. We offer multiple sponsorship tiers
              with customized benefits.
            </p>
            <Button className="bg-primary hover:bg-secondary text-primary-foreground px-8 py-3">
              Contact Us for Sponsorship
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
