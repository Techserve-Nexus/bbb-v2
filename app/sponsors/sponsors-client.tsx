"use client"

import { useState, useMemo } from "react"
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

const categoryOrder = [
  "Pradhan_Poshak",
  "Vajram",
  "Suvarnam",
  "Rajatham",
  "Tamaram+",
  "Tamaram",
]

const categoryLabels: Record<string, string> = {
  Pradhan_Poshak: "Pradhan Poshak",
  Vajram: "Vajram",
  Suvarnam: "Suvarnam",
  Rajatham: "Rajatham",
  "Tamaram+": "Tamaram+",
  Tamaram: "Tamaram",
}

const categoryColors: Record<string, string> = {
  Pradhan_Poshak: "from-red-500 to-red-600",
  Vajram: "from-purple-500 to-purple-600",
  Suvarnam: "from-yellow-500 to-yellow-600",
  Rajatham: "from-green-500 to-green-600",
  "Tamaram+": "from-blue-500 to-blue-600",
  Tamaram: "from-gray-500 to-gray-600",
}

export default function SponsorsClient({ sponsors }: { sponsors: Sponsor[] }) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const groupedSponsors = useMemo(() => {
    return categoryOrder
      .map((cat) => ({
        category: cat,
        label: categoryLabels[cat],
        color: categoryColors[cat],
        sponsors: sponsors.filter((s) => s.sponsorCategory === cat),
      }))
      .filter((group) =>
        selectedCategory === "all"
          ? group.sponsors.length > 0
          : group.category === selectedCategory && group.sponsors.length > 0
      )
  }, [sponsors, selectedCategory])

  const noSponsorsAtAll = sponsors.length === 0
  const noSponsorsInFilter = groupedSponsors.length === 0 && !noSponsorsAtAll

  return (
    <>
      {/* Filter Buttons */}
      <section className="py-8 px-4 md:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {["all", ...categoryOrder].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {cat === "all" ? "All Sponsors" : categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 md:px-6 bg-background">
        <div className="max-w-6xl mx-auto">

          {/* 🔴 No Sponsors at All */}
          {noSponsorsAtAll && (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold text-orange-600 mb-2">No Sponsors Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                There are currently no sponsors added. Please check again later.
              </p>
            </div>
          )}

          {/* 🟠 No Sponsors for Selected Filter */}
          {noSponsorsInFilter && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No Sponsors Found in This Category</h2>
              <p className="text-muted-foreground mb-4">Try selecting a different category.</p>

              <button
                onClick={() => setSelectedCategory("all")}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition"
              >
                Show All Sponsors
              </button>
            </div>
          )}

          {/* 🟢 Show Sponsors */}
          {!noSponsorsAtAll &&
            groupedSponsors.map((group, idx) => (
              <div key={group.category} className={idx > 0 ? "mt-16" : ""}>
                {/* Category Header */}
                <div className={`bg-linear-to-r ${group.color} text-white rounded-lg p-6 mb-8`}>
                  <h2 className="text-3xl font-bold mb-1">{group.label}</h2>
                  <p className="text-white/90 text-sm">
                    {group.sponsors.length} Sponsor{group.sponsors.length > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Sponsor Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {group.sponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="bg-white h-32 flex items-center justify-center p-4 border-b border-orange-500">
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="max-h-20 max-w-full object-contain"
                        />
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold">{sponsor.name}</h3>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                          {sponsor.description}
                        </p>

                        <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
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
        </div>
      </section>
    </>
  )
}
