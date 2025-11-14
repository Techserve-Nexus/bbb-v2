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
  sponsorCategory: "Tamaram" | "Tamaram+" | "Rajatham" | "Suvarnam" | "Vajram" | "Pradhan_Poshak"
  price: number
  description: string
  socialLinks?: Record<string, string>
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

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

  // Group sponsors by category in descending order by price
  const categoryOrder = ["Pradhan_Poshak", "Vajram", "Suvarnam", "Rajatham", "Tamaram+", "Tamaram"]
  const categoryLabels: Record<string, string> = {
    "Pradhan_Poshak": "Pradhan Poshak",
    "Vajram": "Vajram",
    "Suvarnam": "Suvarnam",
    "Rajatham": "Rajatham",
    "Tamaram+": "Tamaram+",
    "Tamaram": "Tamaram",
  }
  const categoryColors: Record<string, string> = {
    "Pradhan_Poshak": "from-red-500 to-red-600",
    "Vajram": "from-purple-500 to-purple-600",
    "Suvarnam": "from-yellow-500 to-yellow-600",
    "Rajatham": "from-green-500 to-green-600",
    "Tamaram+": "from-blue-500 to-blue-600",
    "Tamaram": "from-gray-500 to-gray-600",
  }

  const groupedSponsors = categoryOrder.map(cat => ({
    category: cat,
    label: categoryLabels[cat],
    color: categoryColors[cat],
    sponsors: sponsors.filter(s => s.sponsorCategory === cat)
  })).filter(group => {
    if (selectedCategory === "all") {
      return group.sponsors.length > 0
    }
    return group.category === selectedCategory && group.sponsors.length > 0
  })

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

      {/* Category Filter Buttons */}
      <section className="py-8 px-4 md:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              All Sponsors
            </button>
            <button
              onClick={() => setSelectedCategory("Pradhan_Poshak")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "Pradhan_Poshak"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              }`}
            >
              Pradhan Poshak
            </button>
            <button
              onClick={() => setSelectedCategory("Vajram")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "Vajram"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
              }`}
            >
              Vajram
            </button>
            <button
              onClick={() => setSelectedCategory("Suvarnam")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "Suvarnam"
                  ? "bg-yellow-600 text-white shadow-md"
                  : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50"
              }`}
            >
              Suvarnam
            </button>
            <button
              onClick={() => setSelectedCategory("Rajatham")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "Rajatham"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
              }`}
            >
              Rajatham
            </button>
            <button
              onClick={() => setSelectedCategory("Tamaram+")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "Tamaram+"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              }`}
            >
              Tamaram+
            </button>
            <button
              onClick={() => setSelectedCategory("Tamaram")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "Tamaram"
                  ? "bg-gray-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 dark:hover:bg-gray-900/50"
              }`}
            >
              Tamaram
            </button>
          </div>
        </div>
      </section>

      {/* Sponsors by Category */}
      <section className="py-20 px-4 md:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading sponsors...</div>
          ) : groupedSponsors.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No sponsors found</div>
          ) : (
            <>
              {groupedSponsors.map((group, idx) => (
                <div key={group.category} className={idx > 0 ? "mt-16" : ""}>
                  {/* Category Header */}
                  <div className={`bg-gradient-to-r ${group.color} text-white rounded-lg p-6 mb-8`}>
                    <h2 className="text-3xl font-bold mb-1">{group.label}</h2>
                    <p className="text-white/90 text-sm">{group.sponsors.length} Sponsor{group.sponsors.length > 1 ? 's' : ''}</p>
                  </div>

                  {/* Sponsors Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {group.sponsors.map((sponsor) => (
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
                </div>
              ))}

              {/* Become Sponsor CTA */}
              <div className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 rounded-lg border border-primary/20 p-8 text-center mt-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Interested in Sponsoring?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Join our prestigious sponsors and be part of the premier chess event. We offer multiple sponsorship tiers
                  with customized benefits.
                </p>
                <a href="/become-sponsor">
                  <Button className="bg-primary hover:bg-secondary text-primary-foreground px-8 py-3">
                    Become a Sponsor
                  </Button>
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
