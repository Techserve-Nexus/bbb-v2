"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, RefreshCw, X, Upload, ExternalLink, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle } from "lucide-react"

interface Sponsor {
  id: string
  name: string
  logo: string
  website: string
  category: "Platinum" | "Gold" | "Silver"
  description: string
  socialLinks?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export default function SponsorsManagement() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    category: "Silver" as "Platinum" | "Gold" | "Silver",
    description: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      whatsapp: "",
    }
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSponsors()
  }, [filterCategory])

  const fetchSponsors = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      if (!adminEmail || !adminPassword) {
        throw new Error("Admin credentials not found. Please login again.")
      }

      const params = new URLSearchParams()
      if (filterCategory !== "all") params.append("category", filterCategory)

      console.log("🔍 Fetching sponsors with params:", params.toString())

      const response = await fetch(`/api/admin/sponsors?${params}`, {
        headers: {
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
      })

      console.log("📡 Response status:", response.status)

      let data
      try {
        data = await response.json()
        console.log("📦 Response data:", data)
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError)
        throw new Error("Invalid response from server")
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Server error: ${response.status}`
        console.error("❌ API Error:", errorMessage)
        throw new Error(errorMessage)
      }

      setSponsors(data.sponsors || [])
      console.log("✅ Sponsors loaded:", data.sponsors?.length || 0)
    } catch (err: any) {
      console.error("❌ Error fetching sponsors:", err)
      setError(err.message || "Failed to load sponsors")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB")
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setFormData({ ...formData, logo: base64 })
      setLogoPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.website || !formData.category || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    if (!editingId && !formData.logo) {
      alert("Please upload a logo")
      return
    }

    try {
      setSaving(true)

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const url = editingId
        ? `/api/admin/sponsors/${editingId}`
        : "/api/admin/sponsors"

      const method = editingId ? "PATCH" : "POST"

      // Filter out empty social links
      const filteredSocialLinks = Object.fromEntries(
        Object.entries(formData.socialLinks).filter(([_, value]) => value.trim() !== "")
      )

      const payload = {
        ...formData,
        socialLinks: filteredSocialLinks
      }

      console.log("📤 Sending sponsor data:", payload)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save sponsor")
      }

      alert(editingId ? "Sponsor updated successfully!" : "Sponsor added successfully!")
      setShowForm(false)
      resetForm()
      fetchSponsors()
    } catch (err: any) {
      console.error("❌ Error saving sponsor:", err)
      alert(err.message || "Failed to save sponsor")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (sponsor: Sponsor) => {
    setEditingId(sponsor.id)
    setFormData({
      name: sponsor.name,
      logo: sponsor.logo,
      website: sponsor.website,
      category: sponsor.category,
      description: sponsor.description,
      socialLinks: {
        facebook: sponsor.socialLinks?.facebook || "",
        instagram: sponsor.socialLinks?.instagram || "",
        twitter: sponsor.socialLinks?.twitter || "",
        linkedin: sponsor.socialLinks?.linkedin || "",
        youtube: sponsor.socialLinks?.youtube || "",
        whatsapp: sponsor.socialLinks?.whatsapp || "",
      }
    })
    setLogoPreview(sponsor.logo)
    setShowForm(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch(`/api/admin/sponsors/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete sponsor")
      }

      alert("Sponsor deleted successfully!")
      fetchSponsors()
    } catch (err: any) {
      console.error("❌ Error deleting sponsor:", err)
      alert(err.message || "Failed to delete sponsor")
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: "",
      logo: "",
      website: "",
      category: "Silver",
      description: "",
      socialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        youtube: "",
        whatsapp: "",
      }
    })
    setLogoPreview(null)
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Platinum: "bg-purple-100 text-purple-800 border-purple-300",
      Gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Silver: "bg-gray-100 text-gray-800 border-gray-300",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-2 font-semibold">Error Loading Sponsors</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={fetchSponsors}>Retry</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem("adminEmail")
                localStorage.removeItem("adminPassword")
                window.location.href = "/admin/login"
              }}
            >
              Re-login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sponsors Management</h1>
          <p className="text-muted-foreground">Total: {sponsors.length} sponsors</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSponsors} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sponsor
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
          </select>
        </div>
      </Card>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingId ? "Edit Sponsor" : "Add New Sponsor"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sponsor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter sponsor name"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as "Platinum" | "Gold" | "Silver",
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                </select>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Website URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter sponsor description"
                  rows={4}
                  required
                />
              </div>

              {/* Social Links */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mb-3">Social Media Links (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Facebook */}
                  <div>
                    <label className="flex text-sm font-medium mb-1 items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.facebook}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="flex text-sm font-medium mb-1 items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>

                  {/* Twitter/X */}
                  <div>
                    <label className="flex text-sm font-medium mb-1 items-center gap-2">
                      <Twitter className="w-4 h-4 text-sky-500" /> Twitter / X
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://twitter.com/yourpage"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="flex text-sm font-medium mb-1 items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="flex text-sm font-medium mb-1 items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-600" /> YouTube
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.youtube}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://youtube.com/@yourchannel"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="flex text-sm font-medium mb-1 items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.whatsapp}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://wa.me/1234567890"
                    />
                  </div>

                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Logo {!editingId && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-16 w-16 object-contain border rounded"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: 2MB. Recommended: Square image (500x500px)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Sponsor" : "Add Sponsor"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Sponsors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sponsors.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No sponsors found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Logo */}
              <div className="mb-4 h-24 flex items-center justify-center bg-muted rounded-lg">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="max-h-20 max-w-full object-contain"
                />
              </div>

              {/* Category Badge */}
              <div className="mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryBadge(
                    sponsor.category
                  )}`}
                >
                  {sponsor.category}
                </span>
              </div>

              {/* Name */}
              <h3 className="text-lg font-bold text-foreground mb-2">{sponsor.name}</h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {sponsor.description}
              </p>

              {/* Website Link */}
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mb-4"
              >
                Visit Website
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(sponsor)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(sponsor.id, sponsor.name)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
