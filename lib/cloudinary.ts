import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary (serverless-friendly)
export const configureCloudinary = () => {
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
  }
  return cloudinary
}

// Upload base64 image to Cloudinary (serverless-friendly)
export const uploadToCloudinary = async (
  base64Image: string,
  folder: string = "payment-screenshots"
): Promise<{ url: string; publicId: string }> => {
  try {
    const cloudinaryInstance = configureCloudinary()

    // Upload with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Cloudinary upload timeout")), 15000)
    )

    const uploadPromise = cloudinaryInstance.uploader.upload(base64Image, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" }, // Limit size
        { quality: "auto:good" }, // Auto quality
      ],
    })

    const result = (await Promise.race([uploadPromise, timeoutPromise])) as any

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Failed to upload image to Cloudinary")
  }
}

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const cloudinaryInstance = configureCloudinary()
    await cloudinaryInstance.uploader.destroy(publicId)
    console.log("Image deleted from Cloudinary:", publicId)
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw new Error("Failed to delete image from Cloudinary")
  }
}

// Get optimized image URL
export const getOptimizedImageUrl = (publicId: string, width: number = 800): string => {
  const cloudinaryInstance = configureCloudinary()
  return cloudinaryInstance.url(publicId, {
    transformation: [
      { width, crop: "scale" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  })
}
