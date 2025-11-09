"use client"

import { TICKET_OPTIONS, formatPrice } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step2Props {
  formData: any
  setFormData: (data: any) => void
  errors: Record<string, string>
}

export default function Step2Tickets({ formData, setFormData, errors }: Step2Props) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Select Your Ticket</h2>

      {errors.ticketType && <p className="text-red-500 text-sm mb-4">{errors.ticketType}</p>}

      <div className="grid md:grid-cols-3 gap-6">
        {TICKET_OPTIONS.map((ticket) => (
          <div
            key={ticket.tier}
            onClick={() => setFormData({ ...formData, ticketType: ticket.tier })}
            className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
              formData.ticketType === ticket.tier
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:border-primary"
            }`}
          >
            {/* Selection Indicator */}
            <div className="absolute top-4 right-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.ticketType === ticket.tier ? "border-primary bg-primary" : "border-border bg-background"
                }`}
              >
                {formData.ticketType === ticket.tier && <Check size={16} className="text-primary-foreground" />}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-2">{ticket.tier}</h3>
            <p className="text-primary font-semibold text-2xl mb-6">{formatPrice(ticket.price)}</p>

            <ul className="space-y-3">
              {ticket.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> After selection, you'll proceed to payment through Razorpay. A secure payment gateway
          will handle all transactions.
        </p>
      </div>
    </div>
  )
}
