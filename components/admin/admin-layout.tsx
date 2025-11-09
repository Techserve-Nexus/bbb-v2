"use client"

import type React from "react"

import { LogOut, Menu, X, LayoutDashboard, FileText, CreditCard, Handshake, Settings, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function AdminLayout({ children, activeTab, setActiveTab }: AdminLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      // Clear all admin credentials from localStorage
      localStorage.removeItem("adminEmail")
      localStorage.removeItem("adminPassword")
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminLoginTime")
      
      console.log("🚪 Admin logged out")
      
      // Redirect to login page
      router.push("/admin/login")
    }
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "registrations", label: "Registrations", icon: FileText },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "sponsors", label: "Sponsors", icon: Handshake },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`bg-foreground text-background transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-background/20 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Admin</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-background/10 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-background/10 text-background/80"
                }`}
                title={tab.label}
              >
                <IconComponent className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm font-medium">{tab.label}</span>}
              </button>
            )
          })}

        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-background/20">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-center text-foreground border-background/20 hover:bg-background/10 bg-transparent"
          >
            <LogOut size={18} className={sidebarOpen ? "mr-2" : ""} />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
