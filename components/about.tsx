"use client"

import { useEffect, useState } from "react"

export default function About() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    })

    const element = document.getElementById("about-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about-section" className="py-20 px-4 md:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <p className="text-primary font-semibold mb-2">About Event</p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Strategic Excellence Meets Community
            </h2>
            <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
              Our chess event brings together passionate players, strategic minds, and enthusiasts from around the
              world. We believe in creating an environment where excellence is celebrated and community thrives.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              With world-class competitions, masterclasses, and networking opportunities, this event is designed for
              players of all levels to grow, compete, and connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Expert Players</h3>
                  <p className="text-sm text-muted-foreground">International grandmasters and champions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Networking</h3>
                  <p className="text-sm text-muted-foreground">Connect with global chess community</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-lg" />
              <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg p-8 border border-primary/20">
                <div className="grid grid-cols-2 gap-4">
                  {["Expert Training", "Live Tournaments", "Community", "Global Stage"].map((item, i) => (
                    <div key={i} className="bg-background p-4 rounded-lg text-center border border-border">
                      <p className="text-sm font-semibold text-primary">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary/10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
