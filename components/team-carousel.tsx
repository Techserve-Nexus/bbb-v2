"use client"

import { useState, useRef } from "react"
import { Mail, Phone, Building2, User } from "lucide-react"


export type TeamMember = {
  _id?: string;
  id?: string;
  name: string;
  photo: string;
  designation: string;
  firm?: string;
  phone?: string;
  email?: string;
  order?: number;
  isActive?: boolean;
  description?: string;
};

interface TeamCarouselProps {
  members: TeamMember[];
  title: string;
  description?: string;
  bgClass?: string;
}

const TeamCarousel: React.FC<TeamCarouselProps> = ({ members, title, description, bgClass }) => {
  const [index, setIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' })
  }
  const scrollRight = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' })
  }

  const visibleMembers = members.filter((m) => m.isActive)

  return (


<section className={`py-16 px-4 md:px-6 ${bgClass || "bg-muted/30"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>
        <div className="relative group overflow-hidden">
          <div ref={scrollContainerRef} className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
            {visibleMembers.length === 0 ? (
              <div className="text-center text-muted-foreground w-full">No members found.</div>
            ) : (
              visibleMembers.map((member) => (
                <div key={member._id || member.id} className="bg-background rounded-xl border border-border min-w-[280px] sm:min-w-[320px] md:min-w-[340px] max-w-sm shrink-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group/card">
                  <div className="relative w-full aspect-square bg-linear-to-br from-primary/10 to-secondary/10 overflow-hidden">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={64} className="text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground line-clamp-1">{member.name}</h3>
                      {member.designation && <p className="text-sm text-primary font-semibold mt-1 line-clamp-1">{member.designation}</p>}
                    </div>
                    {member.firm && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 size={14} className="shrink-0" />
                        <span className="line-clamp-1">{member.firm}</span>
                      </div>
                    )}
                    {member.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {member.description}
                      </div>
                    )}
                    <div className="pt-2 space-y-1 border-t border-border">
                      {member.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Phone size={12} className="shrink-0" />
                          <a href={`tel:${member.phone}`} className="line-clamp-1">{member.phone}</a>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Mail size={12} className="shrink-0" />
                          <a href={`mailto:${member.email}`} className="line-clamp-1">{member.email}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {visibleMembers.length > 3 && (
            <>
              <button
                onClick={scrollLeft}
                aria-label="Scroll left"
                className="hidden md:flex items-center justify-center absolute left-2 top-1/2 z-10 bg-primary/90 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:scale-110"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button
                onClick={scrollRight}
                aria-label="Scroll right"
                className="hidden md:flex items-center justify-center absolute right-2 top-1/2 z-10 bg-primary/90 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:scale-110"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default TeamCarousel;
