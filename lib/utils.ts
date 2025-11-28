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
      "Executive Lunch", 
      "High Tea & Dinner", 
      // "Food for business conclave "
    ],
  },
  {
    tier: "Chess",
    price: 500,
    features: [
      "Professional platform", 
      "FIDE-rated International Master", 
      "Best of three games", 
      "Special Prizes and Recognition"
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

/**
 * Get the proper base URL for redirects and payment callbacks
 * ALWAYS uses NEXT_PUBLIC_BASE_URL if set, otherwise falls back to other methods
 * 
 * @param req - Optional NextRequest object for extracting headers/URL
 * @returns The base URL (without trailing slash)
 */
export function getBaseUrl(req?: { 
  url?: string
  headers?: {
    get: (name: string) => string | null
  }
}): string {
  // PRIORITY 1: Always use NEXT_PUBLIC_BASE_URL if it's set
  const nextPublicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (nextPublicBaseUrl && nextPublicBaseUrl.trim()) {
    let baseUrl = nextPublicBaseUrl.trim()
    
    // Ensure it has protocol
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      // Determine protocol from request or default to https for production
      const protocol = req?.headers?.get("x-forwarded-proto") || 
                      (req?.url?.startsWith("https") ? "https" : "https") // Default to https
      baseUrl = `${protocol}://${baseUrl.replace(/^https?:\/\//, "")}`
    }
    
    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/$/, "")
    
    console.log("🌐 Using NEXT_PUBLIC_BASE_URL:", baseUrl)
    return baseUrl
  }

  // PRIORITY 2: Try VERCEL_URL (for Vercel deployments)
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl && vercelUrl.trim()) {
    let baseUrl = vercelUrl.trim()
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      const protocol = req?.headers?.get("x-forwarded-proto") || "https"
      baseUrl = `${protocol}://${baseUrl}`
    }
    baseUrl = baseUrl.replace(/\/$/, "")
    console.log("🌐 Using VERCEL_URL:", baseUrl)
    return baseUrl
  }

  // PRIORITY 3: Construct from request headers (for production) - only if req is provided
  if (req) {
    const host = req.headers?.get("host")
    const protocol = req.headers?.get("x-forwarded-proto") || (req.url?.startsWith("https") ? "https" : "http")
    
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      const baseUrl = `${protocol}://${host}`
      console.log("🌐 Using base URL from headers:", baseUrl)
      return baseUrl
    }

    // PRIORITY 4: Extract from req.url
    if (req.url) {
      try {
        const url = new URL(req.url)
        const baseUrl = `${url.protocol}//${url.host}`
        console.log("🌐 Using base URL from req.url:", baseUrl)
        return baseUrl
      } catch {
        // Fall through to fallback
      }
    }
  }

  // Fallback to localhost with HTTP (standard for local development)
  console.log("⚠️  No NEXT_PUBLIC_BASE_URL set, falling back to http://localhost:3000")
  console.log("⚠️  Please set NEXT_PUBLIC_BASE_URL environment variable to your production domain (e.g., your ngrok URL)")
  return "http://localhost:3000"
}