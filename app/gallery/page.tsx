"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useState } from "react"
import { X } from "lucide-react"

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const galleryItems = [
    { id: 1, type: "image", title: "Opening Ceremony", tags: ["2025", "Event"] },
    { id: 2, type: "image", title: "Grand Masters Tournament", tags: ["2025", "Competition"] },
    { id: 3, type: "image", title: "Networking Session", tags: ["2025", "Event"] },
    { id: 4, type: "image", title: "Trophy Presentation", tags: ["2025", "Awards"] },
    { id: 5, type: "image", title: "Young Players Category", tags: ["2025", "Youth"] },
    { id: 6, type: "image", title: "Venue Overview", tags: ["2025", "Event"] },
    { id: 7, type: "image", title: "Expert Panel Discussion", tags: ["2025", "Conclave"] },
    { id: 8, type: "image", title: "Closing Ceremony", tags: ["2025", "Event"] },
  ]

  const allTags = ["2025", "Event", "Competition", "Awards", "Youth", "Conclave"]

  const filteredItems = selectedTag ? galleryItems.filter((item) => item.tags.includes(selectedTag)) : galleryItems

  return (
    <main className="bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">Event Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Relive the best moments from our premium chess events
          </p>
        </div>
      </section>

      {/* Filter Tags */}
      <section className="py-12 px-4 md:px-6 bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-semibold text-muted-foreground mb-4">FILTER BY:</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedTag === null ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-border"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="py-20 px-4 md:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg overflow-hidden border border-border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  index % 3 === 0 ? "lg:row-span-2 aspect-square" : "aspect-video"
                }`}
                onClick={() => setSelectedImage(`gallery-${item.id}`)}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative group">
                  <div className="text-5xl mb-4">📸</div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      View
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative bg-background rounded-lg p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={24} className="text-foreground" />
            </button>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg aspect-video flex items-center justify-center border border-border mb-6">
              <div className="text-7xl">📸</div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Event Gallery Image</h2>
            <p className="text-muted-foreground mb-4">
              This is a gallery item showcasing memorable moments from our chess events. Full media content will be
              populated with actual event photos and videos.
            </p>

            <div className="flex gap-2">
              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">2025</span>
              <span className="text-xs bg-secondary/20 text-secondary px-3 py-1 rounded-full">Event</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
