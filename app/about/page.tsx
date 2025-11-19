"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Target, Heart, Users, Globe, Sparkles, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  const pillars = [
    {
      icon: Globe,
      title: "Nationwide Presence & Established Network",
      description: "BBB-India is not a local initiative but a well-established, pan-India movement. This national footprint signifies a robust organizational structure, a shared vision, and a proven track record of impact.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Sparkles,
      title: "Focus on Spiritual & Value-Based Living",
      description: "At its core, BBB-India is committed to disseminating spiritual knowledge and promoting a life rooted in Dharma, righteousness, and ethical conduct.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: Heart,
      title: "Dedication to Selfless Service (Seva)",
      description: "A cornerstone of BBB-India's work is its commitment to serving society through various humanitarian projects, educational initiatives, and community welfare programs.",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      icon: Target,
      title: "Authentic Guidance & Leadership",
      description: "The organization is blessed with the guidance of respected spiritual leaders and a dedicated administrative body, ensuring integrity and wisdom in all activities.",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: Users,
      title: "A Platform for Collective Growth",
      description: "BBB-India provides a unified platform for individuals from all walks of life to connect, learn, and grow together in a positive and supportive environment.",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ]

  const chapterStats = [
    { label: "Members", value: "82" },
    { label: "Founded", value: "2021" },
    { label: "Business Generated", value: "₹77.33 Cr" },
    { label: "Industries", value: "10+" },
  ]

  return (
    <main className="bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 px-4 md:px-6 bg-linear-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-6 animate-fade-in">
            About BBB-India
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            A beacon of spiritual wisdom, cultural preservation, and selfless service dedicated to holistic development of individuals and communities.
          </p>
          <a
            href="https://bbb-india.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            <ExternalLink size={20} />
            Visit BBB-India Website
          </a>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4 md:px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="bg-linear-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 border-2 border-primary/20 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              BBB-India stands as a beacon of spiritual wisdom, cultural preservation, and selfless service (seva). 
              With a rich history and a widespread network across the country, the organization is dedicated to the 
              holistic development of individuals and communities, guided by timeless principles and the vision of 
              its esteemed leadership.
            </p>
          </div>
        </div>
      </section>

      {/* Key Pillars */}
      <section className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Foundation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five key pillars that define BBB-India's credibility and mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className={`${pillar.bgColor} rounded-xl p-6 border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 ${pillar.bgColor} rounded-lg`}>
                    <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground flex-1 leading-tight">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shree Parashurama Chapter */}
      <section className="py-20 px-4 md:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Shree Parashurama Chapter
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              An official chapter of BBB-India, dedicated to spiritual growth and selfless service, 
              guiding all our initiatives through networking with like-minded entrepreneurs.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {chapterStats.map((stat, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-primary/10 to-secondary/10 rounded-xl p-6 text-center border border-primary/20 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-black text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Chapter Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* EC Team */}
            <div className="bg-muted/50 rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">EC Team</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Executive Committee (EC) Team provides strategic leadership and coordination, 
                ensuring seamless execution of chapter activities, member engagement, and alignment 
                with BBB-India's core values and objectives.
              </p>
            </div>

            {/* Co-chair Team */}
            <div className="bg-muted/50 rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Chaturanga Manthana Co-chair</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Co-chair team oversees the planning and execution of Chaturanga Manthana events, 
                fostering collaboration among members, managing logistics, and ensuring the event 
                reflects the chapter's vision of excellence and strategic growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 bg-linear-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of a growing network of entrepreneurs and leaders committed to spiritual growth and business excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                Register Now
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
