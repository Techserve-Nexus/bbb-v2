"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: "Rajesh Kumar",
      quote: "An extraordinary experience! The competition level and organization were exceptional.",
      rating: 5,
    },
    {
      name: "Priya Singh",
      quote: "Met amazing chess enthusiasts and learned so much from the masterclasses.",
      rating: 5,
    },
    {
      name: "Arun Patel",
      quote: "Best chess event I have attended. Highly recommended!",
      rating: 5,
    },
    {
      name: "Neha Sharma",
      quote: "The venue, hospitality, and chess excellence made this unforgettable.",
      rating: 5,
    },
  ]

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold mb-2">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">What Our Players Say</h2>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 mb-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-background border border-border rounded-lg p-8 hover:shadow-lg transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} size={18} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground text-lg mb-6 italic">"{testimonial.quote}"</p>
              <p className="font-semibold text-foreground">{testimonial.name}</p>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="bg-background border border-border rounded-lg p-8 mb-8">
            <div className="flex gap-1 mb-4">
              {[...Array(testimonials[currentIndex].rating)].map((_, j) => (
                <Star key={j} size={18} className="fill-primary text-primary" />
              ))}
            </div>
            <p className="text-foreground text-lg mb-6 italic">"{testimonials[currentIndex].quote}"</p>
            <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={prev} className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors">
              <ChevronLeft className="text-primary" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? "bg-primary w-6" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors">
              <ChevronRight className="text-primary" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
