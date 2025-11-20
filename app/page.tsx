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

        {/* Chaturanga Manthana Chair Team (landing page) */}
        <section className="py-16 px-4 md:px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Chaturanga Manthana Chair Team</h2>
              <p className="text-muted-foreground mt-2">Chair team overseeing the Chaturanga Manthana event.</p>
            </div>
            <TeamCarousel
              items={
                [
                  {
                    id: 1,
                    name: "Sudarshan B R",
                    role_in_sp: "",
                    photo: "/mc-team/suradsan.jpg",
                    category: "Electrical & Electronic Products",
                    company_name: "Sudarshan Enterprises",
                    phone: "9886766132",
                    email: "sudarshanbr7@gmail.com",
                    Description: "Sudarshan Enterprises is a trusted electrical products distributor in Bangalore, dealing in wires, LT & HT power and control cables, glands, lugs, insulated plugs & sockets, capacitors, APFC relays, thyristor systems, reactors, LED light fittings, switches, sockets, accessories, fans, and home automation systems."
                  },
                  {
                    id: 2,
                    name: "Pavana Kumar B R",
                    role_in_sp: "",
                    photo: "/mc-team/pawan.jpg",
                    category: "Project Management Consultancy",
                    company_name: "TDE Build Tech",
                    phone: "9880280484",
                    email: "hello@tdebuildtech.com ",
                    Description: "As a Project Management and Construction Solutions partner, they provide vendor coordination, supervision, quality checks, and smooth execution for construction projects. Their mission is to simplify construction with effective vendor management, strict quality control, and cost optimization while delivering excellence."
                  },
                  {
                    id: 3,
                    name: "Satyaram Bhat",
                    role_in_sp: "",
                    photo: "/mc-team/satyam-bhatt.jpg",
                    category: "Academic Tutorials",
                    company_name: "Bhat and Bhat Tutorials Pvt. Ltd.",
                    phone: "8050383969",
                    email: "md.bhatandbhat@gmail.com",
                    Description: "Bhat and Bhat Tutorials is a leading Bengaluru-based education institute with four branches offering offline and online coaching for school, PU, degree, and competitive exams. Known for consistent results and expert faculty, the institute provides structured programs, personalized mentoring, and modern learning resources."
                  }
                ]
              }
              cardHeight="h-56 md:h-64 lg:h-72"
            />
          </div>
        </section>

        {/* MC Team (landing page) */}
        <section className="py-16 px-4 md:px-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">MC Team</h2>
              <p className="text-muted-foreground mt-2">Core MC team managing chapter operations.</p>
            </div>
            <TeamCarousel
              items={
                [
                  {
                    id: 1,
                    name: "B V Krishna",
                    role_in_sp: "President",
                    photo: "/mc-team/BV.jpg",
                    category: "Advocate",
                    company_name: "Law & Options",
                    phone: "944803064",
                    email: "aniphal@gmail.com",
                    Description: "Law Firm, Advocates"
                  },
                  {
                    id: 2,
                    name: "Guruprasad U",
                    role_in_sp: "Treasurer",
                    photo: "/mc-team/GURU.jpg",
                    category: "Air Conditioning",
                    company_name: "Waftonn Solutions",
                    phone: "9741477555",
                    email: "guruprasad@waftonn.in",
                    Description: "Waftonn MEP Solutions is an HVAC turnkey solutions provider offering design, supply, installation, testing, commissioning, and maintenance services. Authorized Channel Partner of Toshiba Carrier and Hitachi."
                  },
                  {
                    id: 3,
                    name: "Mohan K",
                    role_in_sp: "General Secretary",
                    photo: "/mc-team/mohan.jpg",
                    category: "Electricals & Electronic Products",
                    company_name: "Sri Nidhi Industrial Suppliers",
                    phone: "9845373148",
                    email: "snis2003@gmail.com",
                    Description: "SNIS provides industrial automation solutions, offering cable entry systems and programming ports. Serves industries including Iron & Steel, Cement, Power, Water Treatment, Paper, Rubber, and more."
                  },
                ]
              }
              cardHeight="h-56 md:h-64 lg:h-72"
            />
          </div>
        </section>

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
        <section className="md:px-6 bg-orange-500/30">
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
