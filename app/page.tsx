"use client"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import Sponsors from "@/components/sponsors"
import TicketPricing from "@/components/ticket-pricing"
import ParticipantsCounter from "@/components/participants-counter"
import Testimonials from "@/components/testimonials"
import CallToAction from "@/components/call-to-action"
import Footer from "@/components/footer"
import { generateEventJsonLd, generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/json-ld"

export default function Home() {
  const eventJsonLd = generateEventJsonLd()
  const orgJsonLd = generateOrganizationJsonLd()
  const websiteJsonLd = generateWebsiteJsonLd()

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
        <Testimonials />
        <CallToAction />
        <Footer />
      </main>
    </>
  )
}
