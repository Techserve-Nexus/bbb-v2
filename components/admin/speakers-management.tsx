"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, RefreshCw, X, Upload, ExternalLink, Eye, EyeOff } from "lucide-react"
import type { Speaker } from "@/lib/types"

export default function SpeakersManagement() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    designation: "",
    bio: "",
    socialLink: "",
    order: 0,
    isActive: true,
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchSpeakers()
  }, [])

  const fetchSpeakers = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      if (!adminEmail || !adminPassword) {
        throw new Error("Admin credentials not found. Please login again.")
      }

      const response = await fetch("/api/admin/speakers", {
        headers: {
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch speakers")
      }

      setSpeakers(data.speakers || [])
    } catch (err: any) {
      console.error("❌ Error fetching speakers:", err)
      setError(err.message || "Failed to load speakers")
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true)

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      
      // Upload to Cloudinary
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            image: base64,
            folder: "speakers"
          }),
        })

        const data = await response.json()

        if (response.ok && data.url) {
          setFormData({ ...formData, photo: data.url })
          setPhotoPreview(data.url)
        } else {
          alert("Failed to upload photo")
        }
      } catch (error) {
        console.error("Upload error:", error)
        alert("Failed to upload photo")
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.designation || !formData.bio || !formData.socialLink) {
      alert("Please fill in all required fields")
      return
    }

    if (!editingId && !formData.photo) {
      alert("Please upload a speaker photo")
      return
    }

    try {
      setSaving(true)

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const url = "/api/admin/speakers"
      const method = editingId ? "PATCH" : "POST"

      const payload = editingId 
        ? { ...formData, id: editingId }
        : formData

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
        throw new Error(data.error || "Failed to save speaker")
      }

      alert(data.message || "Speaker saved successfully!")
      resetForm()
      fetchSpeakers()
    } catch (err: any) {
      console.error("❌ Error saving speaker:", err)
      alert(err.message || "Failed to save speaker")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (speaker: Speaker) => {
    setEditingId(speaker.id)
    setFormData({
      name: speaker.name,
      photo: speaker.photo,
      designation: speaker.designation,
      bio: speaker.bio,
      socialLink: speaker.socialLink,
      order: speaker.order,
      isActive: speaker.isActive,
    })
    setPhotoPreview(speaker.photo)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this speaker?")) return

    try {
      setDeleting(id)

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch(`/api/admin/speakers?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete speaker")
      }

      alert("Speaker deleted successfully!")
      fetchSpeakers()
    } catch (err: any) {
      console.error("❌ Error deleting speaker:", err)
      alert(err.message || "Failed to delete speaker")
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (speaker: Speaker) => {
    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch("/api/admin/speakers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify({
          id: speaker.id,
          isActive: !speaker.isActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update speaker")
      }

      fetchSpeakers()
    } catch (err: any) {
      console.error("❌ Error toggling speaker:", err)
      alert(err.message || "Failed to update speaker")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      photo: "",
      designation: "",
      bio: "",
      socialLink: "",
      order: 0,
      isActive: true,
    })
    setPhotoPreview(null)
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Speakers Management</h1>
          <p className="text-muted-foreground mt-1">Manage event speakers and their information</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchSpeakers}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Add Speaker
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </Card>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-background p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {editingId ? "Edit Speaker" : "Add New Speaker"}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Speaker Photo *
                </label>
                <div className="space-y-3">
                  {photoPreview && !uploading && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-border">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {uploading && (
                    <div className="w-32 h-32 rounded-lg border border-border bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Uploading...</p>
                      </div>
                    </div>
                  )}
                  <label className={`inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted"}`}>
                    <Upload size={16} />
                    <span className="text-sm">
                      {uploading ? "Uploading..." : photoPreview ? "Change Photo" : "Upload Photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Designation (What they do) *
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="CEO at Tech Corp"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Brief Introduction *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                  placeholder="Brief introduction about the speaker..."
                  required
                />
              </div>

              {/* Social Link */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Social Link (LinkedIn/Instagram/Website) *
                </label>
                <input
                  type="url"
                  value={formData.socialLink}
                  onChange={(e) => setFormData({ ...formData, socialLink: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://linkedin.com/in/johndoe"
                  required
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                  Active (visible on website)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : editingId ? "Update Speaker" : "Add Speaker"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Speakers List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading speakers...</p>
        </div>
      ) : speakers.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No speakers found</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Add First Speaker
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {speakers.map((speaker) => (
            <Card key={speaker.id} className="p-6">
              <div className="flex gap-6">
                {/* Speaker Photo */}
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-border shrink-0">
                  <img
                    src={speaker.photo}
                    alt={speaker.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Speaker Info */}
                <div className="grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{speaker.name}</h3>
                      <p className="text-sm text-primary font-semibold">{speaker.designation}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(speaker)}
                        title={speaker.isActive ? "Deactivate" : "Activate"}
                      >
                        {speaker.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(speaker)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(speaker.id)}
                        disabled={deleting === speaker.id}
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {speaker.bio}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <a
                      href={speaker.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink size={14} />
                      Social Link
                    </a>
                    <span>Order: {speaker.order}</span>
                    <span className={speaker.isActive ? "text-green-600" : "text-red-600"}>
                      {speaker.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
