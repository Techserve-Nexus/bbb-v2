"use client"
import { useEffect } from "react"
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
import SpeakersSection from "@/components/speakers-section"
import LiveStats from "@/components/live-stats"
import JoinUsSection from "@/components/join-us-section"
import { generateEventJsonLd, generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/json-ld"
import { Mail, Phone, Building2, User } from "lucide-react"
import { useState } from "react"

type ChairTeamMember = {
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
};

type MCTeamMember = {
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
};

export default function Home() {
  const eventJsonLd = generateEventJsonLd()
  const orgJsonLd = generateOrganizationJsonLd()
  const websiteJsonLd = generateWebsiteJsonLd()

  const [chairTeam, setChairTeam] = useState<ChairTeamMember[]>([])
  const [mcTeam, setMcTeam] = useState<MCTeamMember[]>([])

  useEffect(() => {
    // Fetch Chair Team
    fetch("/api/admin/chair-team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setChairTeam(data)
        } else if (Array.isArray(data?.members)) {
          setChairTeam(data.members)
        } else {
          setChairTeam([])
        }
      })
      .catch(() => setChairTeam([]))
    // Fetch MC Team
    fetch("/api/admin/mc-team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMcTeam(data)
        } else if (Array.isArray(data?.members)) {
          setMcTeam(data.members)
        } else {
          setMcTeam([])
        }
      })
      .catch(() => setMcTeam([]))
  }, [])

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
      <main className="overflow-x-hidden">
        <Navbar />
        <Hero />
        <About />
        <TeamCarousel
          members={chairTeam}
          title="Chaturanga Manthana Chair Team"
          description="Chair team overseeing the Chaturanga Manthana event."
          bgClass="bg-muted/30"
        />
        <TeamCarousel
          members={mcTeam}
          title="MC Team"
          description="Core MC team managing chapter operations."
          bgClass="bg-background"
        />
        {/* Speakers Section */}
        <SpeakersSection />
        {/* Join Us Section */}
        <JoinUsSection />
        <Sponsors />
        <TicketPricing />
        <ParticipantsCounter />
        {/* <LiveStats /> */}
        {/* <Testimonials /> */}
        <CallToAction />
        {/* Location Map Section */}
        <section className="px-4 md:px-6 bg-orange-500/30">
          <div className="max-w-7xl mx-auto">
            {/* <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Event Location</h2>
              <p className="text-muted-foreground mt-2">Nandi Link Grounds, Bangalore</p>
            </div> */}
            <div className="w-full aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-primary/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2507.6870409552694!2d77.52985749220866!3d12.941118163650012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3f371f9b0587%3A0x42504ebf37946eb2!2sNandi%20Link%20Grounds!5e0!3m2!1sen!2sin!4v1763577784421!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Event Location - Nandi Link Grounds"
              />
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  )
}
