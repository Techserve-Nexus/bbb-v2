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
    tier: "Platinum",
    price: 3000,
    features: ["VIP Seating", "Complimentary Meals", "Exclusive Workshop", "Hotel Accommodation"],
  },
  {
    tier: "Gold",
    price: 2000,
    features: ["Premium Seating", "Lunch & Refreshments", "Workshop Access", "Welcome Kit"],
  },
  {
    tier: "Silver",
    price: 1500,
    features: ["Standard Seating", "Refreshments", "Event Materials", "Digital Resources"],
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
