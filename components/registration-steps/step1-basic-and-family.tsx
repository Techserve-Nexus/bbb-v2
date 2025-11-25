"use client"

import type React from "react"

interface Step1Props {
  formData: any
  setFormData: (data: any) => void
  errors: Record<string, string>
}

export default function Step1BasicAndFamily({ formData, setFormData, errors }: Step1Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleChildChange = (index: number, field: string, value: string) => {
    const newChildren = [...formData.children]
    newChildren[index] = { ...newChildren[index], [field]: value }
    setFormData({ ...formData, children: newChildren })
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Registration Details</h2>

      <div className="space-y-8">
        {/* Basic Details Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground border-b pb-2">Basic Information</h3>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-background text-foreground placeholder-muted-foreground ${errors.name ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                } outline-none`}
              placeholder=""
            />
            {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
          </div>

          {/* Chapter Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Chapter Name</label>
            <input
              type="text"
              name="chapterName"
              value={formData.chapterName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none bg-background text-foreground placeholder-muted-foreground transition-colors"
              placeholder=""
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-2">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none bg-background text-foreground placeholder-muted-foreground transition-colors"
              placeholder=""
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Contact Number *</label>
            <input
              type="tel"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-background text-foreground placeholder-muted-foreground ${errors.contactNo ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                } outline-none`}
              placeholder=""
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
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-background text-foreground placeholder-muted-foreground ${errors.email ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                } outline-none`}
              placeholder=""
            />
            {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
          </div>

          {/* Guest/Member Registration Radio Buttons */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-semibold text-blue-900 mb-3">Registration Type *</label>
            <div className="space-y-3">
              {/* Register as Member (Default) */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="registrationType"
                  value="member"
                  checked={!formData.isGuest}
                  onChange={() => setFormData({ ...formData, isGuest: false })}
                  className="mt-1 w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-blue-900">I am a member of BBB</span>
                  <p className="text-xs text-blue-700 mt-1">
                    Free admission for children under 12 years
                  </p>
                </div>
              </label>

              {/* Register as Guest */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="registrationType"
                  value="guest"
                  checked={formData.isGuest || false}
                  onChange={() => setFormData({ ...formData, isGuest: true })}
                  className="mt-1 w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-blue-900">I am not a member of BBB</span>
                  <p className="text-xs text-blue-700 mt-1">
                    Ticket charges apply for all attendees including children under 12
                  </p>
                </div>
              </label>
              {/* Show Referred By when guest is selected */}
              {formData.isGuest && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-foreground mb-2">Referred by *</label>
                  <input
                    type="text"
                    name="referredBy"
                    value={formData.referredBy || ""}
                    onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none bg-background text-foreground placeholder-muted-foreground transition-colors"
                    placeholder=""
                  />
                  {errors.referredBy && <p className="text-red-500 text-sm mt-2">{errors.referredBy}</p>}
                  {/* Note: Validation message displayed by parent via errors.referredBy */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Family Details Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground border-b pb-2">Family Members</h3>

          {/* Spouse Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Spouse Name</label>
            <input
              type="text"
              name="spouseName"
              value={formData.spouseName || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none bg-background text-foreground placeholder-muted-foreground transition-colors"
              placeholder="If applicable"
            />
            <p className="text-xs text-muted-foreground mt-1">Add spouse to select tickets for them in next step</p>
          </div>

          {/* Children Details */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Children (Up to 3)</label>
            <div className="space-y-4">
              {formData.children.map((child: any, index: number) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`Child ${index + 1} Name`}
                      value={child.name}
                      onChange={(e) => handleChildChange(index, "name", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none bg-background text-foreground placeholder-muted-foreground transition-colors"
                    />
                  </div>
                  <div className="w-40">
                    <select
                      value={child.age}
                      onChange={(e) => handleChildChange(index, "age", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none bg-background text-foreground transition-colors"
                      disabled={!child.name}
                    >
                      <option value="<12">Under 12</option>
                      <option value=">12">Above 12</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Note:</strong> Children under 12 get free entry. Children above 12 can select paid tickets in next step.
            </p>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="mt-8 p-6 bg-primary/10 rounded-lg border-2 border-primary/20">
        <h3 className="text-lg font-bold text-foreground mb-2">Chaturanga Manthana 2025</h3>
        <div className="space-y-1 text-foreground">
          <p className="text-sm font-semibold">13th and 14th December 2025</p>
          <p className="text-sm font-semibold">At Nandi Link Grounds, Bengaluru.</p>
        </div>
      </div>
    </div>
  )
}
