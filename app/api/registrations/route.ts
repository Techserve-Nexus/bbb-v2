import connectDB from "@/lib/db"
import { RegistrationModel, SettingsModel } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"
import { generateRegistrationId } from "@/lib/utils"

export const runtime = "nodejs"
export const maxDuration = 30 // Max 30 seconds

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Check if registration is enabled
    const settings = await SettingsModel.findOne({})
    if (settings && settings.registrationEnabled === false) {
      return NextResponse.json(
        { error: "Registration is currently closed. Please try again later." },
        { status: 403 }
      )
    }
    
    const body = await req.json()
    let { 
      name, 
      chapterName, 
      category, 
      contactNo, 
      email,
      referredBy,
      isGuest = false,
      spouseName,
      children = [],
      personTickets = [],
      ticketTypes = [], // Keep for backward compatibility
      ticketType, // Keep for backward compatibility
      paymentMethod = "payment_gateway", // Default to payment gateway
      paymentScreenshotUrl,
    } = body

    // Handle backward compatibility
    if (ticketType && (!ticketTypes || ticketTypes.length === 0)) {
      ticketType = ticketType.replace(/\s+/g, "_")
      ticketTypes = [ticketType]
    }
    
    console.log("Person Tickets:", personTickets)

    // Validate required fields
    if (!name || !contactNo || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate at least one ticket is selected
    const hasTickets = personTickets.some((p: any) => p.tickets && p.tickets.length > 0)
    if (!hasTickets && (!ticketTypes || ticketTypes.length === 0)) {
      return NextResponse.json({ error: "Please select at least one ticket" }, { status: 400 })
    }

    // Calculate total amount from tickets with Guest/Member logic
    const TICKET_PRICES: Record<string, number> = {
      Business_Conclave: 1000,
      Chess: 500,
    }
    
    console.log("🔍 Calculating amount for registration...")
    console.log("  - isGuest:", isGuest)
    console.log("  - personTickets:", JSON.stringify(personTickets, null, 2))
    
    let totalAmount = 0
    if (personTickets.length > 0) {
      personTickets.forEach((person: any, index: number) => {
        const { personType, age, tickets } = person
        console.log(`  - Person ${index + 1}: ${person.name} (${personType}, age: ${age})`)
        
        tickets?.forEach((ticket: string) => {
          // For Members: Children under 12 don't pay
          // For Guests: Everyone pays (including children under 12)
          const isFreeChild = !isGuest && personType === "child" && age === "<12"
          const ticketPrice = TICKET_PRICES[ticket] || 0
          
          console.log(`    - Ticket: ${ticket}, Price: ₹${ticketPrice}, Free: ${isFreeChild}`)
          
          if (!isFreeChild) {
            totalAmount += ticketPrice
          }
        })
      })
    }
    
    console.log("💰 Total amount calculated:", totalAmount)

    const registrationId = generateRegistrationId()
    console.log("Generated Registration ID:", registrationId)

    const registration = await RegistrationModel.create({
      registrationId,
      name,
      chapterName,
      category,
      contactNo,
      email,
      isGuest,
      referredBy,
      spouseName,
      children,
      personTickets,
      ticketTypes: personTickets.length > 0 
        ? personTickets.flatMap((p: any) => p.tickets || [])
        : ticketTypes,
      ticketType: personTickets.length > 0 && personTickets[0].tickets?.length > 0
        ? personTickets[0].tickets[0]
        : ticketTypes[0],
      amount: totalAmount,
      paymentMethod,
      paymentStatus: "pending",
      ticketStatus: "under_review",
      paymentScreenshotUrl: undefined,
    })
    console.log("Created registration:", registration)

    // Note: No email sent here - ticket email will be sent only after payment is successful
    // See: /api/payments/return (payment success handler)

    return NextResponse.json({
      success: true,
      registrationId: registration.registrationId,
      amount: totalAmount,
      paymentMethod,
      message: "Registration created. Please complete payment.",
    })
  } catch (error: any) {
    console.error("Error creating registration:", error?.message || error )
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = req.nextUrl.searchParams
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const registration = await RegistrationModel
      .findOne({ email })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(registration || null)
  } catch (error) {
    console.error("Error fetching registration:", error)
    return NextResponse.json({ error: "Failed to fetch registration" }, { status: 500 })
  }
}
