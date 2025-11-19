"use client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, CheckCircle, Eye } from "lucide-react"

interface StatsData {
  totalRegistrations: number
  approvedRegistrations: number
  totalVisitors: number
}

export default function LiveStats() {
  const [stats, setStats] = useState<StatsData>({
    totalRegistrations: 0,
    approvedRegistrations: 0,
    totalVisitors: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: "Total Registrations",
      value: stats.totalRegistrations,
      icon: Users,
      color: "blue",
      description: "All registrations received",
    },
    {
      title: "Approved Registrations",
      value: stats.approvedRegistrations,
      icon: CheckCircle,
      color: "green",
      description: "Successfully verified",
    },
    {
      title: "Total Visitors",
      value: stats.totalVisitors,
      icon: Eye,
      color: "purple",
      description: "Unique visitors",
    },
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Live Event Statistics</h2>
          <p className="text-muted-foreground text-lg">
            Real-time updates from our event registration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            const colorClasses = {
              blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              green: "bg-green-500/10 text-green-600 dark:text-green-400",
              purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
            }

            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      colorClasses[stat.color as keyof typeof colorClasses]
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-muted-foreground">
                    {stat.title}
                  </h3>
                  {loading ? (
                    <div className="h-12 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-4xl font-bold">
                      {stat.value.toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
