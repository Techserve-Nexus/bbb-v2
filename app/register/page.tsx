"use client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import RegistrationForm from "@/components/registration-form"

export default function RegisterPage() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow py-12 px-4 md:px-6">
        <RegistrationForm />
      </div>
      <Footer />
    </main>
  )
}
