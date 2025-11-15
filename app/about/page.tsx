"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="bg-background">
      <Navbar />

      {/* About BBB Section (new content) */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">About BBB-India</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            BBB-India stands as a beacon of spiritual wisdom, cultural preservation, and selfless service (seva). With a
            rich history and a widespread network across the country, the organization is dedicated to the holistic
            development of individuals and communities, guided by timeless principles and the vision of its esteemed
            leadership.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4">
            Website:&nbsp;
            <a href="https://bbb-india.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              https://bbb-india.com/
            </a>
          </p>

          <p className="mb-6">A brief about BBB:</p>

          <div className="prose max-w-none text-muted-foreground leading-relaxed">
            <p>
              BBB-India stands as a beacon of spiritual wisdom, cultural preservation, and selfless service (seva).
              With a rich history and a widespread network across the country, the organization is dedicated to the
              holistic development of individuals and communities, guided by timeless principles and the vision of its
              esteemed leadership.
            </p>

            <h3>Key Pillars of BBB-India's Credibility & Mission:</h3>
            <ol>
              <li>
                <strong>Nationwide Presence & Established Network:</strong> BBB-India is not a local initiative but a
                well-established, pan-India movement. This national footprint signifies a robust organizational
                structure, a shared vision, and a proven track record of impact, ensuring that our chapter operates
                within a framework of stability and collective strength.
              </li>
              <li>
                <strong>Focus on Spiritual & Value-Based Living:</strong> At its core, BBB-India is committed to
                disseminating spiritual knowledge and promoting a life rooted in Dharma, righteousness, and ethical
                conduct. This provides a profound philosophical foundation for all our chapter’s activities, ensuring
                they are meaningful and purpose-driven.
              </li>
              <li>
                <strong>Dedication to Selfless Service (Seva):</strong> A cornerstone of BBB-India’s work is its
                commitment to serving society. Through various humanitarian projects, educational initiatives, and
                community welfare programs, the organization translates spiritual ideals into tangible action for the
                betterment of all.
              </li>
              <li>
                <strong>Authentic Guidance & Leadership:</strong> The organization is blessed with the guidance of
                respected spiritual leaders and a dedicated administrative body. This ensures that all activities,
                including those of our Shree Parashurama chapter, are aligned with authentic teachings and managed
                with integrity and wisdom.
              </li>
              <li>
                <strong>A Platform for Collective Growth:</strong> BBB-India provides a unified platform for individuals
                from all walks of life to connect, learn, and grow together in a positive and supportive environment.
                It fosters a sense of unity and shared purpose that transcends individual differences.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Shree Parashurama Chapter Section */}
      <section className="py-16 px-4 md:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">Shree Parashurama Chapter</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Shree Parashurama Chapter is an official part of BBB-India, a nationally recognized organization dedicated
            to spiritual growth and selfless service, guiding all our initiatives and values through networking with like-minded entrepreneurs.
          </p>

          <div className="bg-background rounded-lg border border-border p-6">
            <p className="mb-3"><strong>Brief:</strong> Number of members: 82 · Initiated: Year 2021 · Business produced so far: ₹77.33 cr · Business categories in the chapter: 10 industries.</p>

            <p className="mb-2"><strong>EC Team:</strong> Brief of roles & responsibilities (R & R) — (short 3-4 sentence summary describing leadership and coordination duties).</p>

            <p className="mb-2"><strong>Members (high level):</strong> 1, 2, 3</p>

            <p className="mb-2"><strong>Chaturanga Manthana Co-chair:</strong> Brief of roles & responsibilities (R & R) — (short 3-4 sentence summary).</p>

            <p className="mb-0"><strong>Members (co-chair team):</strong> 1, 2, 3</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
