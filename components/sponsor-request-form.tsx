"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SponsorRequestForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    requestedAmount: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required"
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required"
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    if (!formData.website.trim()) {
      newErrors.website = "Website is required"
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Please enter a valid website URL (starting with http:// or https://)"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters"
    }

    if (!formData.requestedAmount) {
      newErrors.requestedAmount = "Sponsorship amount is required"
    } else {
      const amount = parseFloat(formData.requestedAmount)
      if (isNaN(amount) || amount < 25000) {
        newErrors.requestedAmount = "Minimum sponsorship amount is ₹25,000"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/sponsor-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          requestedAmount: parseFloat(formData.requestedAmount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request")
      }

      setSubmitSuccess(true)
      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        website: "",
        description: "",
        requestedAmount: "",
      })
    } catch (error: any) {
      console.error("Error submitting sponsor request:", error)
      setSubmitError(error.message || "Failed to submit request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (submitSuccess) {
    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-3xl font-bold mb-4 text-green-600">Request Submitted Successfully!</h2>
        <p className="text-lg mb-6">
          Thank you for your interest in sponsoring our event. We have received your request and will review it shortly. 
          Our team will contact you via email within 2-3 business days.
        </p>
        <Button
          onClick={() => setSubmitSuccess(false)}
          className="bg-primary hover:bg-secondary text-primary-foreground"
        >
          Submit Another Request
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">Become a Sponsor</h2>
      
      {submitError && (
        <div className="bg-red-50 border border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-semibold">Error:</p>
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.companyName ? "border-red-500" : "border-border"
              } bg-background text-foreground outline-none focus:border-primary`}
              placeholder="Your Company Name"
            />
            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.contactPerson ? "border-red-500" : "border-border"
              } bg-background text-foreground outline-none focus:border-primary`}
              placeholder="Full Name"
            />
            {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.email ? "border-red-500" : "border-border"
              } bg-background text-foreground outline-none focus:border-primary`}
              placeholder="company@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.phone ? "border-red-500" : "border-border"
              } bg-background text-foreground outline-none focus:border-primary`}
              placeholder="10-digit number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Website <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.website ? "border-red-500" : "border-border"
              } bg-background text-foreground outline-none focus:border-primary`}
              placeholder="https://www.yourcompany.com"
            />
            {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Sponsorship Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="requestedAmount"
              value={formData.requestedAmount}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.requestedAmount ? "border-red-500" : "border-border"
              } bg-background text-foreground outline-none focus:border-primary`}
              placeholder="Min ₹25,000"
              min="25000"
              step="1000"
            />
            {errors.requestedAmount && <p className="text-red-500 text-sm mt-1">{errors.requestedAmount}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Company Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.description ? "border-red-500" : "border-border"
            } bg-background text-foreground outline-none focus:border-primary resize-none`}
            placeholder="Tell us about your company and why you want to sponsor this event (minimum 50 characters)"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          <p className="text-sm text-muted-foreground mt-1">
            {formData.description.length}/50 characters minimum
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-secondary text-primary-foreground"
        >
          {isSubmitting ? "Submitting..." : "Submit Sponsor Request"}
        </Button>
      </form>
    </Card>
  )
}
