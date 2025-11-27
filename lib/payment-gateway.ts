// Payment Gateway utilities based on the integration guide
import { createHash, createHmac } from "crypto"

// Environment variables
export const PG_API_URL = process.env.PG_API_URL || ""
export const PG_API_KEY = process.env.PG_API_KEY || ""
export const PG_SALT = process.env.PG_SALT || ""
export const PG_ENCRYPTION_KEY = process.env.PG_ENCRYPTION_KEY || ""
export const PG_DECRYPTION_KEY = process.env.PG_DECRYPTION_KEY || ""

/**
 * Calculate hash for payment request
 * According to the payment gateway documentation (Appendix 2):
 * 1. Create a | (pipe) delimited string with first value as the salt
 * 2. Sort the post fields based on their keys (alphabetically)
 * 3. Create a | delimited string for fields with values (length > 0)
 * 4. Hash using SHA512 and convert to UPPERCASE
 */
export function calculatePaymentHash(params: {
  salt: string
  amount: string
  api_key: string
  city: string
  country: string
  currency: string
  description: string
  email: string
  name: string
  order_id: string
  phone: string
  return_url: string
  return_url_failure: string
  return_url_cancel: string
  zip_code: string
}): string {
  const {
    salt,
    amount,
    api_key,
    city,
    country,
    currency,
    description,
    email,
    name,
    order_id,
    phone,
    return_url,
    return_url_failure,
    return_url_cancel,
    zip_code,
  } = params
  
  // Build parameters object (excluding salt, as it goes first)
  const parameters: Record<string, string> = {
    amount: String(amount).trim(),
    api_key: String(api_key).trim(),
    city: String(city).trim(),
    country: String(country).trim(),
    currency: String(currency).trim(),
    description: String(description).trim(),
    email: String(email).trim(),
    name: String(name).trim(),
    order_id: String(order_id).trim(),
    phone: String(phone).trim(),
    return_url: String(return_url).trim(),
    return_url_failure: String(return_url_failure).trim(),
    return_url_cancel: String(return_url_cancel).trim(),
    zip_code: String(zip_code).trim(),
  }
  
  // Sort parameters by key (alphabetically)
  const sortedKeys = Object.keys(parameters).sort()
  
  // Start with salt
  let hashData = String(salt).trim()
  
  // Append sorted parameter values (only if value length > 0)
  for (const key of sortedKeys) {
    const value = parameters[key]
    if (value && value.length > 0) {
      hashData += '|' + value
    }
  }
  
  // Debug: Log the hash string (mask salt for security)
  if (process.env.NODE_ENV === "development") {
    const maskedHashString = hashData.replace(/^[^|]+/, "YOUR_SALT")
    console.log("🔍 Generated Hash String (sorted by key):", maskedHashString)
    console.log("🔍 Sorted parameter keys:", sortedKeys.join(", "))
  }
  
  // Calculate SHA512 hash and convert to UPPERCASE (as per documentation)
  const hash = createHash("sha512").update(hashData, "utf8").digest("hex").toUpperCase()
  
  return hash
}

/**
 * Verify hash from payment response
 * According to documentation section 15.2.1:
 * 1. Remove hash field from response
 * 2. Sort all remaining fields alphabetically by key
 * 3. Create | delimited string: salt|field1|field2|... (only include fields with length > 0)
 * 4. Hash using SHA512 and convert to UPPERCASE
 */
export function verifyResponseHash(responseData: Record<string, any>, salt: string, receivedHash: string): boolean {
  // If hash field is null, no need to check hash (as per documentation)
  if (!receivedHash || receivedHash === "null" || receivedHash === "") {
    return true
  }

  // Create a copy of response data without the hash field
  const dataToHash: Record<string, string> = {}
  for (const [key, value] of Object.entries(responseData)) {
    if (key.toLowerCase() !== "hash" && value != null && value !== "") {
      dataToHash[key] = String(value).trim()
    }
  }

  // Sort keys alphabetically
  const sortedKeys = Object.keys(dataToHash).sort()

  // Build hash string: salt|value1|value2|...
  let hashData = String(salt).trim()
  for (const key of sortedKeys) {
    const value = dataToHash[key]
    if (value && value.length > 0) {
      hashData += "|" + value
    }
  }

  // Calculate hash and compare (received hash should already be uppercase)
  const calculatedHash = createHash("sha512").update(hashData, "utf8").digest("hex").toUpperCase()
  const receivedHashUpper = String(receivedHash).toUpperCase().trim()

  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Hash verification:")
    console.log("  - Calculated:", calculatedHash.substring(0, 20) + "...")
    console.log("  - Received:", receivedHashUpper.substring(0, 20) + "...")
    console.log("  - Match:", calculatedHash === receivedHashUpper)
  }

  return calculatedHash === receivedHashUpper
}

/**
 * Generate hash for any parameter set (for other APIs)
 * Generic hash function following the pattern: SHA512(param1|param2|...|salt)
 */
export function generateHash(params: string[], salt: string): string {
  const hashString = [...params, salt].join("|")
  return createHash("sha512").update(hashString).digest("hex")
}

/**
 * Verify hash for any parameter set
 */
export function verifyHash(params: string[], salt: string, receivedHash: string): boolean {
  const calculatedHash = generateHash(params, salt)
  return calculatedHash === receivedHash
}

/**
 * Get base URL for payment gateway API
 */
export function getPaymentGatewayUrl(endpoint: string = ""): string {
  let baseUrl = PG_API_URL.replace(/\/$/, "") // Remove trailing slash
  
  // If the base URL already contains the endpoint, don't add it again
  if (endpoint && baseUrl.includes(endpoint)) {
    return baseUrl
  }
  
  // If endpoint starts with /, ensure baseUrl doesn't end with the same path
  if (endpoint && endpoint.startsWith("/")) {
    // Remove the endpoint from baseUrl if it's already there
    const endpointPath = endpoint.replace(/^\//, "")
    if (baseUrl.endsWith(endpointPath)) {
      return baseUrl
    }
  }
  
  return endpoint ? `${baseUrl}${endpoint}` : baseUrl
}

/**
 * Validate payment gateway configuration
 */
export function validatePaymentGatewayConfig(): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []
  
  if (!PG_API_URL) missing.push("PG_API_URL")
  if (!PG_API_KEY) missing.push("PG_API_KEY")
  if (!PG_SALT) missing.push("PG_SALT")
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

