import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRegistrationId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CHESS-2025-${timestamp}${random}`
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price)
}

export const TICKET_OPTIONS = [
  {
    tier: "Business Conclave",
    price: 1000,
    features: [
      "Elite Industry Insights",
      "High-Value Networking",
      "Strategic Collaboration Opportunities",
      "Executive Lunch",
      "High Tea & Dinner"
    ],
  },
  {
    tier: "Chess",
    price: 500,
    features: [
      "Timed Rapid Games",
      "Adopted Swiss Tournament Format",
      "Armageddon Knockouts",
      "1-vs-20 Simul Exhibition",
      "Expert-Level Officiating"
    ],
  },
]

export const CONCLAVE_GROUPS = [
  "Infrastructure",
  "IT & Corporate Services",
  "Industrial & Manufacturing",
  "Finance",
  "Food Travel and Events",
  "Health & Wellness",
]

export const PARTICIPATION_OPTIONS = [
  { value: "chess-self", label: "Chess (Self)" },
  { value: "conclave-self", label: "Conclave (Self)" },
  { value: "cct-self", label: "CCT (Self)" },
  { value: "stall-self", label: "Stall (Self)" },
  { value: "chess-spouse", label: "Chess (Spouse)" },
  { value: "chess-child1", label: "Chess (Child 1)" },
  { value: "chess-child2", label: "Chess (Child 2)" },
  { value: "chess-child3", label: "Chess (Child 3)" },
]
