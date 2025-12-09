"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface ShreeMember {
  id: string
  name: string
  photo: string
  role: string
  bio: string
  youtubeUrl?: string
  order: number
  isActive: boolean
}

export default function ShreeMembersPage() {
  const [members, setMembers] = useState<ShreeMember[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/shree-members")
      const data = await response.json()
      
      if (response.ok) {
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }

  // Extract YouTube video ID from URL (supports regular videos and Shorts)
  const getYouTubeEmbedId = (url: string): string | null => {
    if (!url) return null
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  }

  return (
    <main className="bg-background">
      <Navbar />

      <section className="py-20 px-4 md:px-6 bg-linear-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">Shree Parashurama Members</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the core team driving the Shree Parashurama chapter of BBB-India. Our members bring together
            leadership, service and entrepreneurship to support the community.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No members found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {members.map((member) => {
                const videoId = member.youtubeUrl ? getYouTubeEmbedId(member.youtubeUrl) : null
                const isHovered = hoveredMember === member.id

                return (
                  <div 
                    key={member.id} 
                    className="bg-muted/50 rounded-lg p-6 flex flex-col items-center text-center border border-border hover:shadow-lg transition"
                    onMouseEnter={() => setHoveredMember(member.id)}
                    onMouseLeave={() => setHoveredMember(null)}
                  >
                    <div className="w-full h-56 md:h-64 lg:h-72 bg-primary/10 rounded-md mb-4 overflow-hidden flex items-center justify-center relative group">
                      {/* Show YouTube video on hover if available */}
                      {videoId && isHovered ? (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
                          className="w-full h-full"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          loading="lazy"
                          title={`${member.name} video`}
                          sandbox="allow-scripts allow-same-origin allow-presentation"
                        />
                      ) : member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-3xl font-bold text-primary">
                          {member.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
                        </div>
                      )}
                      
                      {/* YouTube icon indicator */}
                      {videoId && !isHovered && (
                        <div className="absolute bottom-2 right-2 bg-red-600 text-white rounded-full p-2 shadow-lg">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-primary font-medium mt-1">{member.role}</p>
                    <p className="text-sm text-muted-foreground mt-3">{member.bio}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4 md:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">
            Want to know more about any member or the chapter activities? Reach out via the contact details on our
            homepage.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}

