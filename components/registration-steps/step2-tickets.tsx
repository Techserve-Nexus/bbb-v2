"use client"

import { TICKET_OPTIONS, formatPrice } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step2Props {
  formData: any
  setFormData: (data: any) => void
  errors: Record<string, string>
}

export default function Step2Tickets({ formData, setFormData, errors }: Step2Props) {
  const handleTicketToggle = (ticketTier: string) => {
    const currentTickets = formData.ticketTypes || []
    const isSelected = currentTickets.includes(ticketTier)
    
    let newTickets
    if (isSelected) {
      // Remove ticket if already selected
      newTickets = currentTickets.filter((t: string) => t !== ticketTier)
    } else {
      // Add ticket if not selected
      newTickets = [...currentTickets, ticketTier]
    }
    
    setFormData({ ...formData, ticketTypes: newTickets })
  }

  const calculateTotal = () => {
    const prices: Record<string, number> = {
      Business_Conclave: 1000,
      Chess: 500,
    }
    return (formData.ticketTypes || []).reduce((total: number, type: string) => total + (prices[type] || 0), 0)
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Select Your Tickets</h2>

      {errors.ticketType && <p className="text-red-500 text-sm mb-4">{errors.ticketType}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {TICKET_OPTIONS.filter(t => t.tier !== "Both").map((ticket) => {
          const isSelected = (formData.ticketTypes || []).includes(ticket.tier)
          
          return (
            <div
              key={ticket.tier}
              onClick={() => handleTicketToggle(ticket.tier)}
              className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary"
              }`}
            >
              {/* Checkbox Indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected ? "border-primary bg-primary" : "border-border bg-background"
                  }`}
                >
                  {isSelected && <Check size={16} className="text-primary-foreground" />}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2">
                {ticket.tier.replace(/_/g, " ")}
              </h3>
              <p className="text-primary font-semibold text-2xl mb-6">{formatPrice(ticket.price)}</p>

              <ul className="space-y-3">
                {ticket.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Total Amount Display */}
      {formData.ticketTypes && formData.ticketTypes.length > 0 && (
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border-2 border-primary max-w-3xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-semibold">Selected Tickets:</p>
              <p className="text-lg font-bold text-foreground">
                {formData.ticketTypes.map((t: string) => t.replace(/_/g, " ")).join(" + ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-semibold">Total Amount:</p>
              <p className="text-3xl font-bold text-primary">{formatPrice(calculateTotal())}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-muted rounded-lg border border-border max-w-3xl">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> You can select multiple tickets. After selection, you'll proceed to payment. Receipt shall be shared to the registered email.
        </p>
      </div>
    </div>
  )
}
