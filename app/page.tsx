"use client"
import { useEffect } from "react"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import Sponsors from "@/components/sponsors"
import TicketPricing from "@/components/ticket-pricing"
import ParticipantsCounter from "@/components/participants-counter"
import Testimonials from "@/components/testimonials"
import CallToAction from "@/components/call-to-action"
import Footer from "@/components/footer"
import LiveStats from "@/components/live-stats"
import { generateEventJsonLd, generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/json-ld"

export default function Home() {
  const eventJsonLd = generateEventJsonLd()
  const orgJsonLd = generateOrganizationJsonLd()
  const websiteJsonLd = generateWebsiteJsonLd()

  // Track visitor on page load
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Generate or retrieve session ID
        let sessionId = sessionStorage.getItem("sessionId")
        if (!sessionId) {
          sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          sessionStorage.setItem("sessionId", sessionId)
        }

        await fetch("/api/track-visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: "/",
            sessionId,
            referrer: document.referrer || null,
          }),
        })
      } catch (error) {
        console.error("Failed to track visitor:", error)
      }
    }

    trackVisitor()
  }, [])

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      
      <main className="bg-background">
        <Navbar />
        <Hero />
        <About />
        <Sponsors />
        <TicketPricing />
        <ParticipantsCounter />
        {/* <LiveStats /> */}
        {/* <Testimonials /> */}
        <CallToAction />
        <Footer />
      </main>
    </>
  )
}
