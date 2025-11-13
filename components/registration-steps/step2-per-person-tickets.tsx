"use client"

import { useEffect } from "react"
import { formatPrice } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step2Props {
  formData: any
  setFormData: (data: any) => void
  errors: Record<string, string>
}

export default function Step2PerPersonTickets({ formData, setFormData, errors }: Step2Props) {
  const TICKET_PRICES = {
    Business_Conclave: 1000,
    Chess: 500,
  }

  // Get all persons who need ticket selection
  const getPersonsList = () => {
    const persons: Array<{ personType: string; name: string; age?: string; index?: number }> = []
    
    // Main person (always included)
    persons.push({ personType: "self", name: formData.name || "You" })
    
    // Spouse (if provided)
    if (formData.spouseName && formData.spouseName.trim()) {
      persons.push({ personType: "spouse", name: formData.spouseName })
    }
    
    // Children above 12 (paid tickets)
    formData.children.forEach((child: any, index: number) => {
      if (child.name && child.name.trim() && child.age === ">12") {
        persons.push({ personType: "child", name: child.name, age: child.age, index })
      }
    })
    
    return persons
  }

  const persons = getPersonsList()

  // Initialize personTickets when component mounts or persons list changes
  useEffect(() => {
    if (!formData.personTickets || formData.personTickets.length === 0) {
      const initialTickets = persons.map(p => ({
        personType: p.personType,
        name: p.name,
        age: p.age,
        tickets: [],
      }))
      setFormData({ ...formData, personTickets: initialTickets })
    }
  }, [persons.length]) // Only run when number of persons changes

  const handleTicketToggle = (personIndex: number, ticketType: string) => {
    const updatedPersonTickets = [...(formData.personTickets || [])]
    
    // Ensure personTickets has all persons
    if (updatedPersonTickets.length !== persons.length) {
      updatedPersonTickets.length = 0
      persons.forEach(p => {
        updatedPersonTickets.push({
          personType: p.personType,
          name: p.name,
          age: p.age,
          tickets: [],
        })
      })
    }
    
    const currentTickets = updatedPersonTickets[personIndex]?.tickets || []
    const hasTicket = currentTickets.includes(ticketType)
    
    if (hasTicket) {
      updatedPersonTickets[personIndex].tickets = currentTickets.filter((t: any) => t !== ticketType)
    } else {
      updatedPersonTickets[personIndex].tickets = [...currentTickets, ticketType]
    }
    
    setFormData({ ...formData, personTickets: updatedPersonTickets })
  }

  const calculateTotalAmount = () => {
    let total = 0
    formData.personTickets?.forEach((person: any) => {
      person.tickets?.forEach((ticket: string) => {
        total += TICKET_PRICES[ticket as keyof typeof TICKET_PRICES] || 0
      })
    })
    return total
  }

  const getPersonTicketCount = () => {
    let count = 0
    formData.personTickets?.forEach((person: any) => {
      count += person.tickets?.length || 0
    })
    return count
  }

  // Children under 12 for display
  const childrenUnder12 = formData.children.filter((c: any) => c.name && c.age === "<12")

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-4">Select Tickets</h2>
      <p className="text-muted-foreground mb-8">
        Choose tickets for each person. You can select Business Conclave, Chess, or both.
      </p>

      {errors.personTickets && <p className="text-red-500 text-sm mb-4">{errors.personTickets}</p>}

      <div className="space-y-6">
        {persons.map((person, personIndex) => {
          const personTickets = formData.personTickets?.[personIndex]?.tickets || []
          
          return (
            <div key={personIndex} className="border-2 border-border rounded-lg p-6 bg-background">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">{person.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {person.personType === "self" ? "Main Registrant" : 
                   person.personType === "spouse" ? "Spouse" : 
                   "Child (Above 12)"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business Conclave */}
                <div
                  onClick={() => handleTicketToggle(personIndex, "Business_Conclave")}
                  className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    personTickets.includes("Business_Conclave")
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <div className="absolute top-3 right-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        personTickets.includes("Business_Conclave")
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {personTickets.includes("Business_Conclave") && (
                        <Check size={14} className="text-primary-foreground" />
                      )}
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-foreground mb-1">Business Conclave</h4>
                  <p className="text-primary font-semibold text-xl mb-2">{formatPrice(TICKET_PRICES.Business_Conclave)}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Master Class from Experts</li>
                    <li>• Exclusive CCT</li>
                    <li>• Business Connects</li>
                  </ul>
                </div>

                {/* Chess */}
                <div
                  onClick={() => handleTicketToggle(personIndex, "Chess")}
                  className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    personTickets.includes("Chess")
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <div className="absolute top-3 right-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        personTickets.includes("Chess") ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
                      {personTickets.includes("Chess") && <Check size={14} className="text-primary-foreground" />}
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-foreground mb-1">Chess Tournament</h4>
                  <p className="text-primary font-semibold text-xl mb-2">{formatPrice(TICKET_PRICES.Chess)}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Best of three games</li>
                    <li>• Play with Grand Master</li>
                    <li>• Special Recognition</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Children Under 12 - Free Entry Notice */}
      {childrenUnder12.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">✅ Free Entry (Children Under 12)</h4>
          <div className="space-y-1">
            {childrenUnder12.map((child: any, idx: number) => (
              <p key={idx} className="text-sm text-green-800">
                • {child.name} - Free admission to all events
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Total Amount Summary */}
      {getPersonTicketCount() > 0 && (
        <div className="mt-6 p-6 bg-primary/10 border-2 border-primary rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-semibold mb-1">Total Tickets Selected:</p>
              <p className="text-lg font-bold text-foreground">{getPersonTicketCount()} ticket(s)</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-semibold mb-1">Total Amount:</p>
              <p className="text-3xl font-bold text-primary">{formatPrice(calculateTotalAmount())}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Select at least one ticket to proceed. You can select multiple tickets for each person.
        </p>
      </div>
    </div>
  )
}
