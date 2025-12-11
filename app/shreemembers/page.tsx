import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ShreeMembersClient from "./shree-members-client"
import ShreeMembersSkeleton from "@/components/skeleton/shree-members-skeleton"
import { Suspense } from "react"

async function getMembers() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/shree-members`, {
    cache: "no-store",
  })

  const data = await res.json()
  return data.members || []
}

export default async function ShreeMembersPage() {
  const membersPromise = getMembers()

  return (
    <main className="bg-background">
      <Navbar />

      <section className="py-20 px-4 md:px-6 bg-linear-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Shree Parashurama Members
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the core team driving the chapter.
          </p>
        </div>
      </section>

      {/* STREAM MEMBERS USING SUSPENSE */}
      <Suspense fallback={<ShreeMembersSkeleton />}>
        <ShreeMembersClient members={await membersPromise} />
      </Suspense>

      <section className="py-12 px-4 md:px-6 bg-muted/30 text-center">
        <div className="max-w-4xl mx-auto text-muted-foreground">
          Want to know more? Visit our homepage contact section.
        </div>
      </section>

      <Footer />
    </main>
  )
}
