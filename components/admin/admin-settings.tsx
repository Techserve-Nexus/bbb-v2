"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Power, PowerOff, RefreshCw, BarChart3, Database, Users, Edit2, Check, X } from "lucide-react"

interface Settings {
  registrationEnabled: boolean
  siteName: string
  siteDescription: string
  useRealStats: boolean
  dummyStats: {
    totalRegistrations: number
    approvedRegistrations: number
    totalVisitors: number
  }
  participantsCount: number
}

export default function AdminSettings() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({
    registrationEnabled: true,
    siteName: "BBB Event",
    siteDescription: "Event Registration System",
    useRealStats: true,
    dummyStats: {
      totalRegistrations: 0,
      approvedRegistrations: 0,
      totalVisitors: 0,
    },
    participantsCount: 82,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isEditingParticipants, setIsEditingParticipants] = useState(false)
  const [tempParticipantsCount, setTempParticipantsCount] = useState(82)
  const [migrating, setMigrating] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      if (!adminEmail || !adminPassword) {
        console.error("❌ No admin credentials found in localStorage")
        router.push("/admin/login")
        return
      }

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

      // Ensure dummyStats is always initialized
      const fetchedSettings = data.settings
      if (!fetchedSettings.dummyStats) {
        fetchedSettings.dummyStats = {
          totalRegistrations: 0,
          approvedRegistrations: 0,
          totalVisitors: 0,
        }
      }

      setSettings(fetchedSettings)
    } catch (err: any) {
      console.error("❌ Error fetching settings:", err)
      setError(err.message || "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRegistration = async () => {
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
          participantsCount:82,
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (!confirm("Run database migration to ensure participantsCount field exists?")) return
              
              setMigrating(true)
              setError("")
              try {
                const adminEmail = localStorage.getItem("adminEmail")
                const adminPassword = localStorage.getItem("adminPassword")

                const response = await fetch("/api/admin/migrate-participants", {
                  method: "POST",
                  headers: {
                    "x-admin-email": adminEmail || "",
                    "x-admin-password": adminPassword || "",
                  },
                })

                const data = await response.json()
                if (!response.ok) throw new Error(data.error)

                setSuccessMessage(`✅ Migration: ${data.message} (${data.action})`)
                setTimeout(() => setSuccessMessage(""), 5000)
                
                // Refresh settings after migration
                await fetchSettings()
              } catch (err: any) {
                setError(err.message || "Migration failed")
              } finally {
                setMigrating(false)
              }
            }}
            disabled={migrating}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {migrating ? "Migrating..." : "Run Migration"}
          </button>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
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

        {/* Statistics Display Control */}

        {/* <Card className="p-6 border border-border">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">Statistics Display Control</h2>
              <p className="text-sm text-muted-foreground">
                Choose whether to display real database statistics or custom dummy data on the public homepage.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {settings.useRealStats ? (
                  <>
                    <Database className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">Using Real Statistics</p>
                      <p className="text-xs text-muted-foreground">Showing actual database counts</p>
                    </div>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold">Using Dummy Statistics</p>
                      <p className="text-xs text-muted-foreground">Showing custom values</p>
                    </div>
                  </>
                )}
              </div>
              <Button
                onClick={async () => {
                  try {
                    setSaving(true)
                    setError("")
                    
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
                        useRealStats: !settings.useRealStats,
                      }),
                    })

                    const data = await response.json()
                    if (!response.ok) throw new Error(data.error)

                    setSettings(data.settings)
                    setSuccessMessage("✅ Stats display mode updated!")
                    setTimeout(() => setSuccessMessage(""), 3000)
                  } catch (err: any) {
                    setError(err.message || "Failed to update")
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
                variant="outline"
              >
                {saving ? "Updating..." : "Toggle Mode"}
              </Button>
            </div>

            {!settings.useRealStats && (
              <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
                <h3 className="font-semibold text-sm">Set Dummy Statistics Values</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Registrations</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter total registrations count"
                      value={settings.dummyStats?.totalRegistrations ?? 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        dummyStats: {
                          ...(settings.dummyStats || { totalRegistrations: 0, approvedRegistrations: 0, totalVisitors: 0 }),
                          totalRegistrations: parseInt(e.target.value) || 0,
                        }
                      })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Approved Registrations</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter approved registrations count"
                      value={settings.dummyStats?.approvedRegistrations ?? 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        dummyStats: {
                          ...(settings.dummyStats || { totalRegistrations: 0, approvedRegistrations: 0, totalVisitors: 0 }),
                          approvedRegistrations: parseInt(e.target.value) || 0,
                        }
                      })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Total Visitors</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter total visitors count"
                      value={settings.dummyStats?.totalVisitors ?? 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        dummyStats: {
                          ...(settings.dummyStats || { totalRegistrations: 0, approvedRegistrations: 0, totalVisitors: 0 }),
                          totalVisitors: parseInt(e.target.value) || 0,
                        }
                      })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    try {
                      setSaving(true)
                      setError("")
                      
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
                          dummyStats: settings.dummyStats,
                        }),
                      })

                      const data = await response.json()
                      if (!response.ok) throw new Error(data.error)

                      setSettings(data.settings)
                      setSuccessMessage("✅ Dummy statistics saved!")
                      setTimeout(() => setSuccessMessage(""), 3000)
                    } catch (err: any) {
                      setError(err.message || "Failed to save")
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Dummy Statistics"}
                </Button>
              </div>
            )}

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> Dummy statistics will be displayed on the public homepage only. Admin panel always shows real database statistics.
              </p>
            </div>
          </div>
        </Card> */}

        {/* Participants Counter Control */}
        <Card className="p-6 space-y-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Homepage Participants Counter</h3>
              <p className="text-sm text-muted-foreground">
                Set the participant count displayed on the homepage with animated counter effect
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {!isEditingParticipants ? (
              // Display Mode
              <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-700 rounded-xl shadow-sm">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Current Participant Count</p>
                  <p className="text-5xl font-black text-blue-600 dark:text-blue-400">
                    {(settings.participantsCount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This number appears on the homepage
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setIsEditingParticipants(true)
                    setTempParticipantsCount(settings.participantsCount || 82)
                  }}
                  size="lg"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Update Count
                </Button>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-4 p-6 bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-700 rounded-xl shadow-sm">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">New Participant Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter participant count"
                    value={tempParticipantsCount || 0}
                    onChange={(e) => setTempParticipantsCount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 text-lg font-semibold border-2 border-blue-300 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  />
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-600 font-bold">💡</span>
                    This number will be displayed on the homepage with an animated counter. Visitors will see this count incrementing smoothly.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      setSaving(true)
                      setError("")
                      try {
                        const adminEmail = localStorage.getItem("adminEmail")
                        const adminPassword = localStorage.getItem("adminPassword")

                        console.log("Saving participants count:", tempParticipantsCount)

                        const response = await fetch("/api/admin/settings", {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            "x-admin-email": adminEmail || "",
                            "x-admin-password": adminPassword || "",
                          },
                          body: JSON.stringify({
                            participantsCount: tempParticipantsCount,
                          }),
                        })

                        const data = await response.json()
                        if (!response.ok) throw new Error(data.error)

                        console.log("Saved successfully:", data.settings)
                        setSettings(data.settings)
                        setIsEditingParticipants(false)
                        setSuccessMessage("✅ Participant count updated successfully!")
                        setTimeout(() => setSuccessMessage(""), 3000)
                      } catch (err: any) {
                        console.error("Error saving:", err)
                        setError(err.message || "Failed to save")
                      } finally {
                        setSaving(false)
                      }
                    }}
                    disabled={saving}
                    size="lg"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingParticipants(false)
                      setTempParticipantsCount(settings.participantsCount || 82)
                    }}
                    variant="outline"
                    disabled={saving}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Info Note */}
        {/* <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> When registration is closed, the registration form will display a message to users and prevent new submissions. Existing registrations will not be affected.
          </p>
        </div> */}
      </div>
    </div>
  )
}
