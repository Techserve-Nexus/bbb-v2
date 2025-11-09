"use client"

import type React from "react"

interface Step1Props {
  formData: any
  setFormData: (data: any) => void
  errors: Record<string, string>
}

export default function Step1BasicDetails({ formData, setFormData, errors }: Step1Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const categories = ["Individual Player", "Corporate Team", "Chess Club", "Educational Institution", "Other"]

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Basic Details</h2>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-background text-foreground placeholder-muted-foreground ${
              errors.name ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
            } outline-none`}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
        </div>

        {/* Chapter Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Chapter Name *</label>
          <input
            type="text"
            name="chapterName"
            value={formData.chapterName}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-background text-foreground placeholder-muted-foreground ${
              errors.chapterName ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
            } outline-none`}
            placeholder="Your Chapter/Organization Name"
          />
          {errors.chapterName && <p className="text-red-500 text-sm mt-2">{errors.chapterName}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-background text-foreground ${
              errors.category ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
            } outline-none`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-2">{errors.category}</p>}
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Contact Number *</label>
          <input
            type="tel"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-background text-foreground placeholder-muted-foreground ${
              errors.contactNo ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
            } outline-none`}
            placeholder="+91 98765 43210"
          />
          {errors.contactNo && <p className="text-red-500 text-sm mt-2">{errors.contactNo}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-background text-foreground placeholder-muted-foreground ${
              errors.email ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
            } outline-none`}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
        </div>
      </div>
    </div>
  )
}
