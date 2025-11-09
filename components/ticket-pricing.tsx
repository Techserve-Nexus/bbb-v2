"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { TICKET_OPTIONS, formatPrice } from "@/lib/utils"
import Link from "next/link"

export default function TicketPricing() {
  return (
    <section className="py-20 px-4 md:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold mb-2">Ticket Options</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Choose Your Experience</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the perfect ticket tier for your chess event experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TICKET_OPTIONS.map((ticket, index) => (
            <div
              key={ticket.tier}
              className={`relative rounded-lg border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
                index === 0 ? "border-primary bg-primary/5 md:scale-105 z-10" : "border-border bg-background"
              }`}
            >
              {index === 0 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{ticket.tier}</h3>
                <p className="text-primary font-semibold mb-6">{formatPrice(ticket.price)}</p>

                <ul className="space-y-3 mb-8">
                  {ticket.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check size={18} className="text-primary flex-shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="block">
                  <Button
                    className={`w-full ${
                      index === 0
                        ? "bg-primary hover:bg-secondary"
                        : "bg-muted hover:bg-muted text-foreground border border-border"
                    }`}
                  >
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
