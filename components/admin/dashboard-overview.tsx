"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, Users, CreditCard, TrendingUp, DollarSign, RefreshCw, Eye } from "lucide-react"

interface DashboardStats {
  totalParticipants: number // Total people count
  totalRegistrations: number // Total registration count
  totalRevenue: number
  ticketsSold: {
    businessConclave: number
    chess: number
  }
  pendingPayments: number
  successfulPayments: number
  failedPayments: number
  guestStats: {
    guest: number
    member: number
  }
  familyBreakdown: {
    self: number
    spouse: number
    children: number
  }
  recentRegistrations: Array<{
    id: string
    registrationId: string
    name: string
    email: string
    ticketType: string
    paymentStatus: string
    createdAt: string
  }>
  trends: {
    daily: Array<{
      date: string
      registrations: number
      revenue: number
    }>
    growthPercentage: number
  }
  visitors?: {
    total: number
    unique: number
    today: number
  }
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch("/api/admin/dashboard/stats", {
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats")
      }

      setStats(data.stats)
    } catch (err: any) {
      console.error("❌ Error fetching dashboard stats:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <Card className="p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground font-semibold">{label}</p>
        <Icon size={20} className={color || "text-primary"} />
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      {change !== undefined && (
        <p className={`text-xs flex items-center gap-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
          <ArrowUpRight size={14} /> {change >= 0 ? "+" : ""}{change}% this week
        </p>
      )}
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-semibold">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Participants"
          value={stats.totalParticipants.toLocaleString()}
          change={stats.trends.growthPercentage}
          color="text-blue-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
          color="text-green-600"
        />
        <StatCard
          icon={CreditCard}
          label="Successful Payments"
          value={stats.successfulPayments}
          color="text-emerald-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Registrations"
          value={stats.totalRegistrations}
          color="text-purple-600"
        />
      </div>

      {/* Visitor Stats */}
      {stats.visitors && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Eye}
            label="Total Page Views"
            value={stats.visitors.total.toLocaleString()}
            color="text-indigo-600"
          />
          <StatCard
            icon={Users}
            label="Unique Visitors"
            value={stats.visitors.unique.toLocaleString()}
            color="text-cyan-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Today's Visitors"
            value={stats.visitors.today.toLocaleString()}
            color="text-orange-600"
          />
        </div>
      )}

      {/* Guest vs Member Stats */}
      <Card className="p-6 border border-border mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Registration Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.guestStats.member}</p>
            <p className="text-sm text-muted-foreground mt-1">Members</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalRegistrations > 0 
                ? `${((stats.guestStats.member / stats.totalRegistrations) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </div>
          <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600">{stats.guestStats.guest}</p>
            <p className="text-sm text-muted-foreground mt-1">Guests</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalRegistrations > 0 
                ? `${((stats.guestStats.guest / stats.totalRegistrations) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </div>
        </div>
      </Card>

      {/* Family Breakdown */}
      <Card className="p-6 border border-border mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Family Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.familyBreakdown.self}</p>
            <p className="text-sm text-muted-foreground mt-1">Self</p>
          </div>
          <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <p className="text-2xl font-bold text-pink-600">{stats.familyBreakdown.spouse}</p>
            <p className="text-sm text-muted-foreground mt-1">Spouse</p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{stats.familyBreakdown.children}</p>
            <p className="text-sm text-muted-foreground mt-1">Children</p>
          </div>
        </div>
      </Card>

      {/* Ticket Distribution */}
      <Card className="p-6 border border-border mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Ticket Distribution</h2>
        <div className="space-y-4">
          {[
            { tier: "Business Conclave", count: stats.ticketsSold.businessConclave, color: "bg-blue-600" },
            { tier: "Chess", count: stats.ticketsSold.chess, color: "bg-purple-600" },
          ].map((ticket) => {
            const totalTickets = stats.ticketsSold.businessConclave + stats.ticketsSold.chess
            return (
              <div key={ticket.tier} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{ticket.tier}</span>
                  <span className="text-muted-foreground">
                    {ticket.count} ({totalTickets > 0 ? ((ticket.count / totalTickets) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`${ticket.color} h-2 rounded-full transition-all`}
                    style={{
                      width: totalTickets > 0 ? `${(ticket.count / totalTickets) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recent Registrations */}
      <Card className="p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Registrations</h2>
        <div className="space-y-3">
          {stats.recentRegistrations.length > 0 ? (
            stats.recentRegistrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{reg.name}</p>
                  <p className="text-sm text-muted-foreground">{reg.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{reg.ticketType}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reg.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No registrations yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
