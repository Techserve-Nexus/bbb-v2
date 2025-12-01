"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, RefreshCw, X, Upload, ExternalLink, Eye, EyeOff } from "lucide-react"
type MCTeamMember = {
  name: string; photo: string; designation: string; firm?: string; phone?: string; email?: string; order: number; isActive: boolean; id?: string; }

export default function MCTeamManagement() {
  const [members, setMembers] = useState<MCTeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    designation: "",
    firm: "",
    description: "",
    phone: "",
    email: "",
    order: 0,
    isActive: true,
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formErrors, setFormErrors] = useState<{ phone?: string; email?: string }>({})

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
      const response = await fetch("/api/admin/mc-team", {
        headers: {
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch MC team members")
      }
      setMembers(data.members || [])
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Handler functions and logic must be defined before return
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB")
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, folder: "mc-team" }),
        })
        const data = await response.json()
        if (response.ok && data.url) {
          setFormData({ ...formData, photo: data.url })
          setPhotoPreview(data.url)
        } else {
          const errorMsg = data?.error || data?.message || "Failed to upload photo"
          alert(`Failed to upload photo: ${errorMsg}`)
        }
      } catch (error) {
        alert(`Failed to upload photo: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let errors: { phone?: string; email?: string } = {}
    // Phone validation: must be 10 digits
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone number must be 10 digits"
    }
    // Email validation: must end with @gmail.com
    if (formData.email && !/^\S+@gmail\.com$/.test(formData.email)) {
      errors.email = "Email must end with @gmail.com"
    }
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    if (!formData.name || !formData.designation || (!editingId && !formData.photo) || formData.order === undefined || formData.order === null || formData.order === "") {
      alert("Please fill in all required fields")
      return
    }
    if (!editingId && !formData.photo) {
      alert("Please upload a photo")
      return
    }
    try {
      setSaving(true)
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")
      const url = "/api/admin/mc-team"
      const method = editingId ? "PATCH" : "POST"
      // Only send allowed fields
      const payload: any = {
        name: formData.name,
        photo: formData.photo,
        designation: formData.designation,
        firm: formData.firm,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        order: formData.order,
        isActive: formData.isActive,
      }
      if (editingId) payload.id = editingId
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
      alert(err.message || "Failed to save member")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (member: MCTeamMember) => {
    setEditingId(member.id)
    setFormData({
      name: member.name,
      photo: member.photo,
      designation: member.designation,
      firm: member.firm || "",
      description: member.description || "",
      phone: member.phone || "",
      email: member.email || "",
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
      const response = await fetch("/api/admin/mc-team", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify({ id }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete member")
      }
      alert("Member deleted successfully!")
      fetchMembers()
    } catch (err: any) {
      alert(err.message || "Failed to delete member")
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (member: MCTeamMember) => {
    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")
      const response = await fetch("/api/admin/mc-team", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify({ id: member.id, isActive: !member.isActive }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update member")
      }
      fetchMembers()
    } catch (err: any) {
      alert(err.message || "Failed to update member")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      photo: "",
      designation: "",
      firm: "",
      description: "",
      phone: "",
      email: "",
      order: 0,
      isActive: true,
    })
    setPhotoPreview(null)
    setEditingId(null)
    setShowForm(false)
  }

  // Add the UI for Add Member button, member list, and modal
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MC Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage MC Team members and their information</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchMembers}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Add MC Team Member
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </Card>
      )}

      {/* Add/Edit Form Modal (placeholder, add full logic as needed) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-background p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {editingId ? "Edit MC Team Member" : "Add New MC Team Member"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Photo *</label>
                <div className="space-y-3">
                  {photoPreview && !uploading && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-border">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
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
                    <span className="text-sm">{uploading ? "Uploading..." : photoPreview ? "Change Photo" : "Upload Photo"}</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Name" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Designation *</label>
                <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="President" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Firm/Organization</label>
                <input type="text" value={formData.firm} onChange={(e) => setFormData({ ...formData, firm: e.target.value })} className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Law & Options" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Description about member" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.phone ? 'border-red-500' : ''}`} placeholder="9448030064" />
                {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.email ? 'border-red-500' : ''}`} placeholder="aniphal@gmail.com" />
                {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Order</label>
                <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded border-border" />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">Active (visible on website)</label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">{saving ? "Saving..." : editingId ? "Update Member" : "Add Member"}</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Members List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading MC Team members...</p>
        </div>
      ) : members.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No MC Team members found</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Add First MC Team Member
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {members.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-border shrink-0">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                      <p className="text-sm text-primary font-semibold">{member.designation}</p>
                      {member.firm && <p className="text-sm text-muted-foreground">{member.firm}</p>}
                    </div>
                    <div className="flex gap-4 items-center">
                      <Button variant="ghost" size="icon" title="View">
                        <Eye size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(member)}>
                        <Edit2 size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(member.id!)} disabled={deleting === member.id}>
                        <Trash2 size={20} className="text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-2">
                    {member.phone && <span>📞 {member.phone}</span>}
                    {member.email && <span>✉️ {member.email}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Order: {member.order}</span>
                    <span className={member.isActive ? "text-green-600" : "text-red-600"}>
                      {member.isActive ? "Active" : "Inactive"}
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
