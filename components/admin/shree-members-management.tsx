"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, RefreshCw, X, Upload, Eye, EyeOff } from "lucide-react"

interface ShreeMember {
  id: string
  name: string
  photo: string
  role: string
  bio: string
  youtubeUrl?: string
  order: number
  isActive: boolean
}

export default function ShreeMembersManagement() {
  const [members, setMembers] = useState<ShreeMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    role: "",
    bio: "",
    youtubeUrl: "",
    order: 0,
    isActive: true,
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      if (!adminEmail || !adminPassword) {
        throw new Error("Admin credentials not found. Please login again.")
      }

      const response = await fetch("/api/admin/shree-members", {
        headers: {
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch shree members")
      }

      setMembers(data.members || [])
    } catch (err: any) {
      console.error("❌ Error fetching shree members:", err)
      setError(err.message || "Failed to load shree members")
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
            folder: "shree-members"
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

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.role || !formData.bio) {
      alert("Please fill in all required fields")
      return
    }

    if (!editingId && !formData.photo) {
      alert("Please upload a member photo")
      return
    }

    // Validate YouTube URL if provided
    if (formData.youtubeUrl && !extractYouTubeId(formData.youtubeUrl)) {
      alert("Please enter a valid YouTube URL (supports watch, shorts, youtu.be)")
      return
    }

    try {
      setSaving(true)

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const url = "/api/admin/shree-members"
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
        throw new Error(data.error || "Failed to save member")
      }

      alert(data.message || "Member saved successfully!")
      resetForm()
      fetchMembers()
    } catch (err: any) {
      console.error("❌ Error saving member:", err)
      alert(err.message || "Failed to save member")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (member: ShreeMember) => {
    setEditingId(member.id)
    setFormData({
      name: member.name,
      photo: member.photo,
      role: member.role,
      bio: member.bio,
      youtubeUrl: member.youtubeUrl || "",
      order: member.order,
      isActive: member.isActive,
    })
    setPhotoPreview(member.photo)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return

    try {
      setDeleting(id)

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch(`/api/admin/shree-members?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete member")
      }

      alert("Member deleted successfully!")
      fetchMembers()
    } catch (err: any) {
      console.error("❌ Error deleting member:", err)
      alert(err.message || "Failed to delete member")
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (member: ShreeMember) => {
    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch("/api/admin/shree-members", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify({
          id: member.id,
          isActive: !member.isActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update member")
      }

      fetchMembers()
    } catch (err: any) {
      console.error("❌ Error toggling member:", err)
      alert(err.message || "Failed to update member")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      photo: "",
      role: "",
      bio: "",
      youtubeUrl: "",
      order: 0,
      isActive: true,
    })
    setPhotoPreview(null)
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading shree members...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-red-500">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <Button onClick={fetchMembers} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shree Parashurama Members</h2>
          <p className="text-muted-foreground">
            Manage members with photos and YouTube video previews
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMembers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? "Edit Member" : "Add New Member"}
            </h3>
            <Button onClick={resetForm} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photo Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Photo *
                </label>
                <div className="flex items-start gap-4">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-primary-foreground
                        hover:file:bg-primary/90
                        file:cursor-pointer cursor-pointer"
                      disabled={uploading}
                    />
                    {uploading && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <RefreshCw className="w-4 h-4 inline animate-spin mr-1" />
                        Uploading...
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Max size: 2MB. Formats: JPG, PNG, WebP
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Rahul Deshmukh"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., President"
                  required
                />
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Bio *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Brief description..."
                  required
                />
              </div>

              {/* YouTube URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  YouTube Video URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/shorts/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Video will play on hover (supports regular videos & Shorts)
                </p>
                {formData.youtubeUrl && extractYouTubeId(formData.youtubeUrl) && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-300">
                      ✓ Valid YouTube URL detected
                    </p>
                  </div>
                )}
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-md"
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active (visible on website)
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save Member</>
                )}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Members List */}
      <div className="grid gap-4">
        {members.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No members found. Add your first member!</p>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="relative shrink-0">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  {member.youtubeUrl && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-primary font-medium">{member.role}</p>
                      <p className="text-sm text-muted-foreground mt-1">{member.bio}</p>
                      {member.youtubeUrl && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
                          🎥 {member.youtubeUrl}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        onClick={() => toggleActive(member)}
                        variant="ghost"
                        size="sm"
                        title={member.isActive ? "Hide" : "Show"}
                      >
                        {member.isActive ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleEdit(member)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(member.id)}
                        variant="ghost"
                        size="sm"
                        disabled={deleting === member.id}
                      >
                        {deleting === member.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Order: {member.order}</span>
                    <span className={member.isActive ? "text-green-600" : "text-gray-400"}>
                      {member.isActive ? "● Active" : "○ Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
