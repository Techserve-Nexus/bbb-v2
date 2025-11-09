"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    razorpayKeyId: "***hidden***",
    smtpEmail: "admin@chessevent.com",
    eventVenue: "The Grand Convention Center, New Delhi",
    eventDate: "2025-03-15",
  })

  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

      <div className="space-y-8 max-w-2xl">
        {/* Payment Configuration */}
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Payment Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Razorpay Key ID</label>
              <input
                type="password"
                value={settings.razorpayKeyId}
                disabled
                className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-foreground outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Set via environment variables</p>
            </div>
          </div>
        </Card>

        {/* Email Configuration */}
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Email Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">From Email</label>
              <input
                type="email"
                value={settings.smtpEmail}
                onChange={(e) => setSettings({ ...settings, smtpEmail: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </Card>

        {/* Event Configuration */}
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Event Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Event Venue</label>
              <input
                type="text"
                value={settings.eventVenue}
                onChange={(e) => setSettings({ ...settings, eventVenue: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Event Date</label>
              <input
                type="date"
                value={settings.eventDate}
                onChange={(e) => setSettings({ ...settings, eventDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button onClick={handleSave} className="bg-primary hover:bg-secondary text-primary-foreground">
            Save Settings
          </Button>
          {isSaved && <p className="text-green-600 font-semibold self-center">Settings saved!</p>}
        </div>
      </div>
    </div>
  )
}
