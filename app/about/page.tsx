"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">About Our Event</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the story, vision, and mission behind the premier chess event of 2025.
          </p>
        </div>
      </section>

      {/* Founder's Message */}
      <section className="py-20 px-4 md:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="w-full bg-primary/10 rounded-lg aspect-square flex items-center justify-center border-2 border-primary/20">
                <div className="text-6xl">👔</div>
              </div>
            </div>
            <div>
              <p className="text-primary font-semibold mb-2">Message</p>
              <h2 className="text-4xl font-bold text-foreground mb-6">From the Founder</h2>
              <p className="text-foreground text-lg mb-4 leading-relaxed">
                "Chess is more than a game—it's a language of strategy, patience, and excellence. Our event was born
                from a vision to create a platform where chess enthusiasts, from beginners to grandmasters, can
                converge, compete, and grow together."
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We believe in fostering a community where intellectual pursuit is celebrated, where friendships
                transcend borders, and where every player leaves transformed by the experience.
              </p>
              <p className="text-primary font-semibold mt-6">— Event Organizers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Vision & Mission</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-background rounded-lg border border-border p-8 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To establish a world-class chess platform that brings together the global chess community, fostering
                excellence, innovation, and cultural exchange. We envision an event that becomes the pinnacle of chess
                competitions in India.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-background rounded-lg border border-border p-8 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to create an inclusive, vibrant, and inspiring chess community. We are committed to
                promoting chess excellence, enabling skill development, and building lasting connections among players,
                sponsors, and chess enthusiasts worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 md:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🏆", title: "Excellence", desc: "We pursue the highest standards in every aspect." },
              { icon: "🤝", title: "Community", desc: "We celebrate diversity and foster connections." },
              { icon: "⚡", title: "Innovation", desc: "We embrace modern approaches to chess." },
              { icon: "🌍", title: "Global Perspective", desc: "We welcome players from around the world." },
              { icon: "💡", title: "Learning", desc: "We encourage continuous growth and development." },
              { icon: "❤️", title: "Integrity", desc: "We uphold fairness and ethical standards." },
            ].map((value, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-lg p-6 border border-border hover:border-primary transition-colors"
              >
                <div className="text-4xl mb-3">{value.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue & Contact */}
      <section className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Event Venue</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">LOCATION</p>
                  <p className="text-lg text-foreground">The Grand Convention Center, New Delhi</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">ADDRESS</p>
                  <p className="text-lg text-foreground">123 Chess Lane, Connaught Place, New Delhi - 110001</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">CONTACT</p>
                  <p className="text-lg text-foreground">+91 98765 43210</p>
                  <p className="text-lg text-foreground">info@chessevent.com</p>
                </div>
              </div>
              <Link
                href="/register"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-secondary transition-colors"
              >
                Register Now
              </Link>
            </div>

            <div className="bg-primary/10 rounded-lg aspect-square flex items-center justify-center border-2 border-primary/20">
              <div className="text-6xl">📍</div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Brochure */}
      <section className="py-20 px-4 md:px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Get More Information</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Download our comprehensive event brochure for complete details, schedule, and sponsorship opportunities.
          </p>
          <a
            href="#"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-secondary transition-colors"
          >
            📄 Download Event Brochure
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
