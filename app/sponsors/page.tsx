import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SponsorsClient from "./sponsors-client"
import SponsorsSkeleton from "@/components/skeleton/sponsors-skeleton"
import { Suspense } from "react"

async function getSponsors() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/sponsors`, {
      cache: "no-store",
    })

    if (!res.ok) {
      console.error('Failed to fetch sponsors:', res.status)
      return []
    }

    const data = await res.json()
    return data?.sponsors || []
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return []
  }
}

export default async function SponsorsPage() {
  const sponsors = await getSponsors()

  return (
    <main className="bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 bg-linear-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Our Sponsors</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet the organizations supporting our mission.
          </p>
        </div>
      </section>

      <Suspense fallback={<SponsorsSkeleton />}>
        <SponsorsClient sponsors={sponsors} />
      </Suspense>

      <Footer />
    </main>
  )
}
