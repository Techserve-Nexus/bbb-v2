"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Users, Eye, TrendingUp, Globe } from "lucide-react"

interface VisitorAnalytics {
  totalVisitors: number
  uniqueSessions: number
  todayVisitors: number
  pageBreakdown: Array<{
    page: string
    views: number
    uniqueVisitors: number
  }>
  referrerBreakdown: Array<{
    referrer: string
    count: number
  }>
  recentActivity: Array<{
    _id: string
    ipAddress: string
    userAgent: string
    page: string
    referrer?: string
    country?: string
    city?: string
    createdAt: string
  }>
}

export default function VisitorsAnalytics() {
  const [analytics, setAnalytics] = useState<VisitorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/visitors")
        const result = await response.json()
        if (result.success) {
          setAnalytics(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch visitor analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
    // Refresh every minute
    const interval = setInterval(fetchAnalytics, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Visitors",
      value: analytics.totalVisitors,
      icon: Eye,
      color: "blue",
      description: "All time page views",
    },
    {
      title: "Unique Sessions",
      value: analytics.uniqueSessions,
      icon: Users,
      color: "green",
      description: "Distinct visitors",
    },
    {
      title: "Today's Visitors",
      value: analytics.todayVisitors,
      icon: TrendingUp,
      color: "purple",
      description: "Views today",
    },
    {
      title: "Active Pages",
      value: analytics.pageBreakdown.length,
      icon: Globe,
      color: "orange",
      description: "Pages tracked",
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getBrowserFromUserAgent = (ua: string) => {
    if (!ua) return "Unknown"
    if (ua.includes("Chrome")) return "Chrome"
    if (ua.includes("Firefox")) return "Firefox"
    if (ua.includes("Safari")) return "Safari"
    if (ua.includes("Edge")) return "Edge"
    return "Other"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Visitor Analytics</h2>
        <p className="text-muted-foreground">
          Track and analyze website visitor activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            green: "bg-green-500/10 text-green-600 dark:text-green-400",
            purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
            orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
          }

          return (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    colorClasses[stat.color as keyof typeof colorClasses]
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold mb-1">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </Card>
          )
        })}
      </div>

      {/* Page Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Page Views Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Page</th>
                <th className="text-right py-3 px-4 font-medium">Total Views</th>
                <th className="text-right py-3 px-4 font-medium">
                  Unique Visitors
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.pageBreakdown.map((page, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-mono text-sm">{page.page}</td>
                  <td className="text-right py-3 px-4">{page.views}</td>
                  <td className="text-right py-3 px-4">
                    {page.uniqueVisitors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Referrers */}
      {analytics.referrerBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
          <div className="space-y-3">
            {analytics.referrerBreakdown.map((ref, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded"
              >
                <span className="text-sm font-mono truncate max-w-md">
                  {ref.referrer}
                </span>
                <span className="text-sm font-semibold">{ref.count} visits</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Time</th>
                <th className="text-left py-3 px-2 font-medium">Page</th>
                <th className="text-left py-3 px-2 font-medium">IP Address</th>
                <th className="text-left py-3 px-2 font-medium">Browser</th>
                <th className="text-left py-3 px-2 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentActivity.map((activity) => (
                <tr key={activity._id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2 text-xs">
                    {formatDate(activity.createdAt)}
                  </td>
                  <td className="py-3 px-2 font-mono">{activity.page}</td>
                  <td className="py-3 px-2 font-mono text-xs">
                    {activity.ipAddress}
                  </td>
                  <td className="py-3 px-2">
                    {getBrowserFromUserAgent(activity.userAgent)}
                  </td>
                  <td className="py-3 px-2 text-xs">
                    {activity.city && activity.country
                      ? `${activity.city}, ${activity.country}`
                      : activity.country || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
