"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setIsLoading(false)
      setIsAuthenticated(true)
      return
    }

    // Check authentication
    const checkAuth = async () => {
      try {
        const adminEmail = localStorage.getItem("adminEmail")
        const adminPassword = localStorage.getItem("adminPassword")

        // No credentials stored
        if (!adminEmail || !adminPassword) {
          console.log("📍 No credentials found, redirecting to login...")
          router.push("/admin/login")
          return
        }

        // Verify credentials with API
        const response = await fetch("/api/admin/auth/verify", {
          headers: {
            "x-admin-email": adminEmail,
            "x-admin-password": adminPassword,
          },
        })

        const data = await response.json()

        if (!data.authenticated) {
          console.log("🚫 Invalid credentials, redirecting to login...")
          localStorage.removeItem("adminEmail")
          localStorage.removeItem("adminPassword")
          localStorage.removeItem("adminToken")
          router.push("/admin/login")
          return
        }

        // Authenticated successfully
        console.log("✅ Admin authenticated")
        setIsAuthenticated(true)
      } catch (error) {
        console.error("❌ Auth check failed:", error)
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Show content only if authenticated or on login page
  if (!isAuthenticated && pathname !== "/admin/login") {
    return null
  }

  return <>{children}</>
}
