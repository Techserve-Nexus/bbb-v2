"use client"

import { useState } from "react"
import { Upload, CheckCircle2, XCircle, CreditCard, QrCode } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Step4PaymentProps {
  formData: {
    paymentMethod: "razorpay" | "manual"
    paymentScreenshot?: string
    paymentScreenshotUrl?: string
  }
  setFormData: (data: any) => void
}

export default function Step4Payment({ formData, setFormData }: Step4PaymentProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handlePaymentMethodChange = (method: "razorpay" | "manual") => {
    setFormData({
      ...formData,
      paymentMethod: method,
      paymentScreenshot: undefined,
      paymentScreenshotUrl: undefined,
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setError("")
    setUploading(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string

        // Upload to Cloudinary via our API
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        
        setFormData({
          ...formData,
          paymentScreenshot: base64,
          paymentScreenshotUrl: data.url,
        })
        setUploading(false)
      }

      reader.onerror = () => {
        setError("Failed to read file")
        setUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Upload error:", error)
      setError("Failed to upload image. Please try again.")
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFormData({
      ...formData,
      paymentScreenshot: undefined,
      paymentScreenshotUrl: undefined,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-3">Payment</h2>
        <p className="text-muted-foreground">Select your payment method and complete the payment</p>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Select Payment Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manual Payment Option */}
          <button
            type="button"
            onClick={() => handlePaymentMethodChange("manual")}
            className={`p-6 rounded-lg border-2 transition-all ${
              formData.paymentMethod === "manual"
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50"
            }`}
          >
            <QrCode className={`w-12 h-12 mx-auto mb-3 ${
              formData.paymentMethod === "manual" ? "text-primary" : "text-muted-foreground"
            }`} />
            <h4 className="font-semibold text-lg mb-2">QR Code / UPI</h4>
            <p className="text-sm text-muted-foreground">
              Pay via UPI and upload screenshot
            </p>
          </button>

          {/* Razorpay Option */}
          <button
            type="button"
            onClick={() => handlePaymentMethodChange("razorpay")}
            className={`p-6 rounded-lg border-2 transition-all ${
              formData.paymentMethod === "razorpay"
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50"
            }`}
          >
            <CreditCard className={`w-12 h-12 mx-auto mb-3 ${
              formData.paymentMethod === "razorpay" ? "text-primary" : "text-muted-foreground"
            }`} />
            <h4 className="font-semibold text-lg mb-2">Razorpay</h4>
            <p className="text-sm text-muted-foreground">
              Pay online instantly with card/UPI
            </p>
          </button>
        </div>
      </div>

      {/* Manual Payment Section */}
      {formData.paymentMethod === "manual" && (
        <>
          {/* QR Code Section */}
          <div className="bg-muted p-8 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Scan to Pay</h3>
            <div className="bg-white p-4 inline-block rounded-lg shadow-md">
              <div className="w-64 h-64 bg-white rounded flex items-center justify-center overflow-hidden">
                <Image
                  src="/paymentQR.jpg"
                  alt="Payment QR Code"
                  width={300}
                  height={300}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="font-semibold text-lg">UPI Payment QR Code</p>
              <p className="text-muted-foreground text-sm">Scan with any UPI app to pay</p>
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Upload Payment Screenshot</h3>
            <p className="text-sm text-muted-foreground mb-4">
              After completing the payment, please upload a screenshot of the payment confirmation
            </p>

            {!formData.paymentScreenshotUrl ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="paymentScreenshot"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="paymentScreenshot"
                  className={`cursor-pointer ${uploading ? "opacity-50" : ""}`}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {uploading ? "Uploading..." : "Click to upload"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, JPEG up to 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="border-2 border-green-500 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-700 mb-2">Screenshot uploaded successfully!</p>
                    <div className="relative w-full h-48 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={formData.paymentScreenshotUrl}
                        alt="Payment Screenshot"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <button
                      onClick={removeImage}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove and upload different image
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Important Note */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Important</p>
            <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
              <li>Make sure the screenshot is clear and readable</li>
              <li>Include transaction ID and amount in the screenshot</li>
              <li>Your registration will be confirmed after payment verification</li>
              <li>You will receive an email once verified</li>
            </ul>
          </div>
        </>
      )}

      {/* Razorpay Payment Section */}
      {formData.paymentMethod === "razorpay" && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-3">Online Payment</h3>
          <p className="text-muted-foreground mb-6">
            Complete your payment instantly with Razorpay. You'll be redirected to the payment gateway after clicking "Complete Registration" below.
          </p>
          <div className="bg-white p-4 rounded-lg shadow-sm inline-block">
            <p className="text-sm text-muted-foreground mb-1">Accepted Payment Methods</p>
            <p className="font-semibold">Credit Card • Debit Card • UPI • Net Banking • Wallets</p>
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✅ Instant confirmation • 🔒 Secure payment • 📧 Automatic ticket generation
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
