"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CallToAction() {
  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-r from-primary via-secondary to-primary">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 text-balance">
          Ready to Join the Elite?
        </h2>
        <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Secure your spot at the premier chess event of 2025. Limited tickets available.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-primary-foreground hover:bg-muted text-primary text-lg px-8 py-6">
            Get Started Now
          </Button>
        </Link>
      </div>
    </section>
  )
}
