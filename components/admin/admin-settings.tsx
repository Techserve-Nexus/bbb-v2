"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Power, PowerOff, RefreshCw } from "lucide-react"

interface Settings {
  registrationEnabled: boolean
  siteName: string
  siteDescription: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch("/api/admin/settings", {
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch settings")
      }

      setSettings(data.settings)
    } catch (err: any) {
      console.error("❌ Error fetching settings:", err)
      setError(err.message || "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRegistration = async () => {
    if (!settings) return

    const newValue = !settings.registrationEnabled

    try {
      setSaving(true)
      setError("")
      setSuccessMessage("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify({
          registrationEnabled: newValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings")
      }

      setSettings(data.settings)
      setSuccessMessage(
        newValue 
          ? "✅ Registration opened successfully!" 
          : "✅ Registration closed successfully!"
      )
      
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      console.error("❌ Error updating settings:", err)
      setError(err.message || "Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error && !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-semibold">{error}</p>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!settings) {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <button
          onClick={fetchSettings}
          className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
          </div>
        )}

        {/* Registration Control */}
        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground mb-2">Registration Control</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enable or disable user registrations for the event. When disabled, users will not be able to submit new registrations.
              </p>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  settings.registrationEnabled 
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                }`}>
                  {settings.registrationEnabled ? (
                    <>
                      <Power className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800 dark:text-green-200">Open</span>
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800 dark:text-red-200">Closed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleToggleRegistration}
              disabled={saving}
              className={`${
                settings.registrationEnabled
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : settings.registrationEnabled ? (
                "Close Registration"
              ) : (
                "Open Registration"
              )}
            </Button>
          </div>
        </Card>

        {/* Info Note */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> When registration is closed, the registration form will display a message to users and prevent new submissions. Existing registrations will not be affected.
          </p>
        </div>
      </div>
    </div>
  )
}
