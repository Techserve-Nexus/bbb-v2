"use client"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import TeamCarousel from "../components/team-carousel"
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

        {/* MC Team (landing page) */}
        <section className="py-16 px-4 md:px-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">MC Team</h2>
              <p className="text-muted-foreground mt-2">Core MC team managing chapter operations.</p>
            </div>
            <TeamCarousel
              items={[
                { id: 1, initials: "RD", name: "Rahul Deshmukh", role: "MC - Convenor" },
                { id: 2, initials: "AS", name: "Anita Shah", role: "MC - Coordinator" },
                { id: 3, initials: "VP", name: "Vikram Patil", role: "MC - Logistics" },
                { id: 4, initials: "MK", name: "Meera Kulkarni", role: "MC - Communications" },
              ]}
              cardHeight="h-56 md:h-64 lg:h-72"
            />
          </div>
        </section>

        {/* Chaturanga Manthana Chair Team (landing page) */}
        <section className="py-16 px-4 md:px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Chaturanga Manthana Chair Team</h2>
              <p className="text-muted-foreground mt-2">Chair team overseeing the Chaturanga Manthana event.</p>
            </div>
            <TeamCarousel
              items={[
                { id: 1, initials: "SR", name: "Sandeep Rao", role: "Chair - Chaturanga Manthana" },
                { id: 2, initials: "PM", name: "Priya Menon", role: "Co-Chair" },
                { id: 3, initials: "AN", name: "Ajay Nair", role: "Events Lead" },
                { id: 4, initials: "KJ", name: "Kavita Joshi", role: "Membership Lead" },
              ]}
              cardHeight="h-56 md:h-64 lg:h-72"
            />
          </div>
        </section>

        <Sponsors />
        <TicketPricing />
        <ParticipantsCounter />
        {/* <Testimonials /> */}
        <CallToAction />
        <Footer />
      </main>
    </>
  )
}
