"use client"

import { useState, useRef } from "react"
import { Mail, Phone, Building2, User } from "lucide-react"

type TeamMember = {
  id: number
  name: string
  role_in_sp: string
  photo: string
  category: string
  company_name: string
  phone: string
  email: string
  Description: string
}

export default function TeamCarousel({
  items,
  cardHeight = "h-56 md:h-64 lg:h-72",
}: {
  items: TeamMember[]
  cardHeight?: string
}) {
  const [index, setIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const next = () => setIndex((p) => (p + 1) % items.length)
  const prev = () => setIndex((p) => (p - 1 + items.length) % items.length)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  return (
    <div>
      {/* Desktop / Tablet Horizontal Scroll */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary/90 hover:bg-primary text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-primary/90 hover:bg-primary text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
            {items.map((member) => (
              <div
                key={member.id}
                className="shrink-0 w-80 bg-background rounded-xl border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group"
              >
                {/* Photo Section */}
                <div className="relative w-full aspect-square bg-linear-to-br from-primary/10 to-secondary/10 overflow-hidden">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={64} className="text-primary/30" />
                    </div>
                  )}
                  {/* Category Badge */}
                  {member.category && (
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      {member.category}
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground line-clamp-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary font-semibold mt-1 line-clamp-1">
                      {member.role_in_sp}
                    </p>
                  </div>

                  {member.company_name && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 size={14} className="shrink-0" />
                      <span className="line-clamp-1">{member.company_name}</span>
                    </div>
                  )}

                  {member.Description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {member.Description}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="pt-2 space-y-1 border-t border-border">
                    {member.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Phone size={12} className="shrink-0" />
                        <a href={`tel:${member.phone}`} className="line-clamp-1">
                          {member.phone}
                        </a>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Mail size={12} className="shrink-0" />
                        <a href={`mailto:${member.email}`} className="line-clamp-1">
                          {member.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden">
        <div className="bg-background rounded-xl border border-border overflow-hidden mb-6 shadow-lg">
          {/* Photo Section */}
          <div className="relative w-full aspect-square bg-linear-to-br from-primary/10 to-secondary/10 overflow-hidden">
            {items[index].photo ? (
              <img
                src={items[index].photo}
                alt={items[index].name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={80} className="text-primary/30" />
              </div>
            )}
            {/* Category Badge */}
            {items[index].category && (
              <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                {items[index].category}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 space-y-3">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {items[index].name}
              </h3>
              <p className="text-sm text-primary font-semibold mt-1">
                {items[index].role_in_sp}
              </p>
            </div>

            {items[index].company_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 size={16} className="shrink-0" />
                <span>{items[index].company_name}</span>
              </div>
            )}

            {items[index].Description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {items[index].Description}
              </p>
            )}

            {/* Contact Info */}
            <div className="pt-3 space-y-2 border-t border-border">
              {items[index].phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone size={14} className="shrink-0" />
                  <a href={`tel:${items[index].phone}`}>
                    {items[index].phone}
                  </a>
                </div>
              )}
              {items[index].email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail size={14} className="shrink-0" />
                  <a href={`mailto:${items[index].email}`} className="break-all">
                    {items[index].email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={prev}
            className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
            aria-label="Previous"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "bg-primary w-8" : "bg-border w-2"
                }`}
              />
            ))}
          </div>
          
          <button
            type="button"
            onClick={next}
            className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
            aria-label="Next"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
