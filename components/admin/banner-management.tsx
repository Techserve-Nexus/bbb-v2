"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Trash2, Eye, EyeOff, Star, GripVertical, Plus, X } from "lucide-react"

interface Banner {
  id: string
  title: string
  desktopImage: string
  tabletImage: string
  mobileImage: string
  priority: boolean
  isActive: boolean
  order: number
  createdAt?: Date
  updatedAt?: Date
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    desktopImage: "",
    tabletImage: "",
    mobileImage: "",
    priority: false,
    isActive: true,
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const adminEmail = localStorage.getItem("adminEmail") || ""
      const adminPassword = localStorage.getItem("adminPassword") || ""

      const response = await fetch("/api/admin/banners", {
        headers: {
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBanners(data.banners || [])
      } else {
        console.error("Failed to fetch banners")
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, type: "desktop" | "tablet" | "mobile") => {
    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage(`Please upload an image file for ${type}`)
        setTimeout(() => setErrorMessage(""), 5000)
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        setErrorMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} image must be less than 5MB`)
        setTimeout(() => setErrorMessage(""), 5000)
        return
      }

      setUploadingImages(true)
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("folder", `banners/${type}`)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          [`${type}Image`]: data.url
        }))
        return data.url
      } else {
        setErrorMessage(`Failed to upload ${type} image`)
        setTimeout(() => setErrorMessage(""), 5000)
      }
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error)
      setErrorMessage(`Error uploading ${type} image`)
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setUploadingImages(false)
    }
  }

  const handleCreateBanner = async () => {
    if (!formData.title || !formData.desktopImage || !formData.tabletImage || !formData.mobileImage) {
      setErrorMessage("Please fill all fields and upload all images")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }

    try {
      const adminEmail = localStorage.getItem("adminEmail") || ""
      const adminPassword = localStorage.getItem("adminPassword") || ""

      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccessMessage("Banner created successfully!")
        setTimeout(() => setSuccessMessage(""), 5000)
        setShowAddForm(false)
        setFormData({
          title: "",
          desktopImage: "",
          tabletImage: "",
          mobileImage: "",
          priority: false,
          isActive: true,
        })
        fetchBanners()
      } else {
        const data = await response.json()
        setErrorMessage(`Failed to create banner: ${data.error}`)
        setTimeout(() => setErrorMessage(""), 5000)
      }
    } catch (error) {
      console.error("Error creating banner:", error)
      setErrorMessage("Error creating banner")
      setTimeout(() => setErrorMessage(""), 5000)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [`active-${id}`]: true }))
      const adminEmail = localStorage.getItem("adminEmail") || ""
      const adminPassword = localStorage.getItem("adminPassword") || ""

      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        fetchBanners()
        setSuccessMessage("Banner status updated")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setErrorMessage(errorData.error || "Failed to update banner status")
        setTimeout(() => setErrorMessage(""), 5000)
      }
    } catch (error) {
      console.error("Error updating banner:", error)
      setErrorMessage("Network error while updating banner status")
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setActionLoading(prev => ({ ...prev, [`active-${id}`]: false }))
    }
  }

  const handleTogglePriority = async (id: string, currentStatus: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [`priority-${id}`]: true }))
      const adminEmail = localStorage.getItem("adminEmail") || ""
      const adminPassword = localStorage.getItem("adminPassword") || ""

      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ priority: !currentStatus }),
      })

      if (response.ok) {
        fetchBanners()
        setSuccessMessage("Banner priority updated")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setErrorMessage(errorData.error || "Failed to update banner priority")
        setTimeout(() => setErrorMessage(""), 5000)
      }
    } catch (error) {
      console.error("Error updating banner:", error)
      setErrorMessage("Network error while updating banner priority")
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setActionLoading(prev => ({ ...prev, [`priority-${id}`]: false }))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [`delete-${id}`]: true }))
      const adminEmail = localStorage.getItem("adminEmail") || ""
      const adminPassword = localStorage.getItem("adminPassword") || ""

      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
      })

      if (response.ok) {
        setSuccessMessage("Banner deleted successfully")
        setTimeout(() => setSuccessMessage(""), 5000)
        setDeleteConfirm(null)
        fetchBanners()
      } else {
        const errorData = await response.json().catch(() => ({}))
        setErrorMessage(errorData.error || "Failed to delete banner")
        setTimeout(() => setErrorMessage(""), 5000)
      }
    } catch (error) {
      console.error("Error deleting banner:", error)
      setErrorMessage("Network error while deleting banner")
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${id}`]: false }))
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading banners...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Error Message Banner */}
      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-500 text-red-800 p-4 rounded-lg flex justify-between items-center">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage("")}
            className="text-red-800 hover:text-red-900 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Success Message Banner */}
      {successMessage && (
        <div className="bg-green-50 border-2 border-green-500 text-green-800 p-4 rounded-lg flex justify-between items-center">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-green-800 hover:text-green-900 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Banner Management</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <X className="mr-2" /> : <Plus className="mr-2" />}
          {showAddForm ? "Cancel" : "Add New Banner"}
        </Button>
      </div>

      {/* Add Banner Form */}
      {showAddForm && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">Create New Banner</h3>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Banner Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary outline-none"
              placeholder="Enter banner title"
            />
          </div>

          {/* Desktop Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Desktop Image (1920x1080)</label>
            <div className="flex gap-4 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, "desktop")
                }}
                className="flex-1"
              />
              {formData.desktopImage && (
                <div className="relative w-32 h-20">
                  <Image src={formData.desktopImage} alt="Desktop preview" fill className="object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          {/* Tablet Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tablet Image (1024x768)</label>
            <div className="flex gap-4 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, "tablet")
                }}
                className="flex-1"
              />
              {formData.tabletImage && (
                <div className="relative w-32 h-20">
                  <Image src={formData.tabletImage} alt="Tablet preview" fill className="object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Mobile Image (640x960)</label>
            <div className="flex gap-4 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, "mobile")
                }}
                className="flex-1"
              />
              {formData.mobileImage && (
                <div className="relative w-32 h-20">
                  <Image src={formData.mobileImage} alt="Mobile preview" fill className="object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Priority Banner</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Active</span>
            </label>
          </div>

          <Button 
            onClick={handleCreateBanner} 
            disabled={uploadingImages}
            className="w-full"
          >
            {uploadingImages ? "Uploading..." : "Create Banner"}
          </Button>
        </Card>
      )}

      {/* Banners List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Existing Banners ({banners.length})</h3>
        
        {banners.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No banners found. Create your first banner!
          </Card>
        ) : (
          <div className="grid gap-4">
            {banners.map((banner) => (
              <Card key={banner.id} className="p-4">
                <div className="flex gap-4">
                  {/* Drag Handle */}
                  <div className="flex items-center cursor-grab">
                    <GripVertical className="text-muted-foreground" />
                  </div>

                  {/* Banner Previews */}
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Desktop</p>
                      <div className="relative w-full h-24">
                        <Image 
                          src={banner.desktopImage} 
                          alt={banner.title} 
                          fill 
                          className="object-cover rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tablet</p>
                      <div className="relative w-full h-24">
                        <Image 
                          src={banner.tabletImage} 
                          alt={banner.title} 
                          fill 
                          className="object-cover rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Mobile</p>
                      <div className="relative w-full h-24">
                        <Image 
                          src={banner.mobileImage} 
                          alt={banner.title} 
                          fill 
                          className="object-cover rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner Info & Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <h4 className="font-semibold">{banner.title}</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={banner.isActive ? "default" : "outline"}
                        onClick={() => handleToggleActive(banner.id, banner.isActive)}
                        disabled={actionLoading[`active-${banner.id}`]}
                      >
                        {actionLoading[`active-${banner.id}`] ? "..." : banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={banner.priority ? "default" : "outline"}
                        onClick={() => handleTogglePriority(banner.id, banner.priority)}
                        disabled={actionLoading[`priority-${banner.id}`]}
                      >
                        {actionLoading[`priority-${banner.id}`] ? "..." : <Star className="w-4 h-4" fill={banner.priority ? "currentColor" : "none"} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteConfirm(banner.id)}
                        disabled={actionLoading[`delete-${banner.id}`]}
                      >
                        {actionLoading[`delete-${banner.id}`] ? "..." : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Order: {banner.order}</p>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === banner.id && (
                  <div className="mt-4 p-4 bg-destructive/10 rounded-lg border-2 border-destructive">
                    <p className="mb-3 font-semibold">Are you sure you want to delete this banner?</p>
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={() => handleDelete(banner.id)}>
                        Yes, Delete
                      </Button>
                      <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
