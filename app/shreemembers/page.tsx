"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const members = [
  { id: 1, name: "Rahul Deshmukh", role: "President", bio: "Entrepreneur & spiritual seeker." },
  { id: 2, name: "Anita Shah", role: "Vice President", bio: "Community builder and mentor." },
  { id: 3, name: "Vikram Patil", role: "Secretary", bio: "Operations lead and coordinator." },
  { id: 4, name: "Meera Kulkarni", role: "Treasurer", bio: "Finance specialist and trustee." },
  { id: 5, name: "Sandeep Rao", role: "EC Member", bio: "Business growth & partnerships." },
  { id: 6, name: "Priya Menon", role: "EC Member", bio: "Programs & outreach." },
  { id: 7, name: "Ajay Nair", role: "Co-Chair - Events", bio: "Events strategist and logistics." },
  { id: 8, name: "Kavita Joshi", role: "Co-Chair - Membership", bio: "Member engagement & growth." },
]

export default function ShreeMembersPage() {
  return (
    <main className="bg-background">
      <Navbar />

      <section className="py-20 px-4 md:px-6 bg-linear-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">Shree Parashurama Members</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the core team driving the Shree Parashurama chapter of BBB-India. Our members bring together
            leadership, service and entrepreneurship to support the community.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {members.map((m) => (
              <div key={m.id} className="bg-muted/50 rounded-lg p-6 flex flex-col items-center text-center border border-border hover:shadow-lg transition">
                <div className="w-full h-56 md:h-64 lg:h-72 bg-primary/10 rounded-md mb-4 overflow-hidden flex items-center justify-center">
                  <div className="text-3xl font-bold text-primary">
                    {m.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{m.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">{m.role}</p>
                <p className="text-sm text-muted-foreground mt-3">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 md:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">
            Want to know more about any member or the chapter activities? Reach out via the contact details on our
            homepage.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
