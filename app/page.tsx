import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import TeamSection from "@/components/team-section"
import SpeakersSection from "@/components/speakers-section"
import JoinUsSection from "@/components/join-us-section"
import Sponsors from "@/components/sponsors"
import TicketPricing from "@/components/ticket-pricing"
import ParticipantsCounter from "@/components/participants-counter"
import CallToAction from "@/components/call-to-action"
import Footer from "@/components/footer"
import { Suspense } from "react"
import { MapComponent } from "@/components/map"
import TeamCarouselSkeleton from "@/components/skeleton/team-skeleton"

export default async function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />

      {/* SERVER-FETCHED TEAM DATA */}
      <Suspense fallback={<TeamCarouselSkeleton />}>
        <TeamSection />
      </Suspense>

      <SpeakersSection />
      <JoinUsSection />
      <Sponsors />
      <TicketPricing />
      <ParticipantsCounter />
      <CallToAction />
        <MapComponent />
      <Footer />
    </main>
  )
}
