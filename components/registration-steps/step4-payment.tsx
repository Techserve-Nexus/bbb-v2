"use client"

import { useState } from "react"
import { Upload, CheckCircle2, XCircle, CreditCard, QrCode } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Step4PaymentProps {
  formData: {
    paymentMethod: "razorpay" | "manual" | "payment_gateway"
    paymentScreenshot?: string
    paymentScreenshotUrl?: string
  }
  setFormData: (data: any) => void
}

export default function Step4Payment({ formData, setFormData }: Step4PaymentProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handlePaymentMethodChange = (method: "razorpay" | "manual" | "payment_gateway") => {
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
      reader.onload = (event) => {
        ;(async () => {
          try {
            const base64 = event.target?.result as string

            // Upload to Cloudinary via our API
            const response = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: base64 }),
            })

            // Try to parse JSON safely
            let data: any = null
            try {
              data = await response.json()
            } catch (e) {
              // ignore json parse errors
            }

            if (!response.ok) {
              const serverMessage = data?.error || response.statusText || "Upload failed"
              setError(`Upload failed: ${serverMessage}`)
              setUploading(false)
              return
            }

            setFormData({
              ...formData,
              paymentScreenshot: base64,
              paymentScreenshotUrl: data?.url,
            })
          } catch (err) {
            console.error("Upload error:", err)
            setError("Failed to upload image. Please try again.")
          } finally {
            setUploading(false)
          }
        })()
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
      {/* ...existing code... (all other payment sections remain) */}

      {/* Manual Payment Section - COMMENTED OUT */}
      {/* {formData.paymentMethod === "manual" && (
        <>
          <div className="bg-muted p-8 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Scan to Pay</h3>
            <div className="bg-white p-4 inline-block rounded-lg shadow-md">
              <div className="w-64 h-64 bg-white rounded flex items-center justify-center overflow-hidden">
                <Image
                  src="/qr_bbb.jpg"
                  alt="Payment QR Code"
                  width={600}
                  height={600}
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
      )} */}

      {/* Payment Gateway Section */}
      {formData.paymentMethod === "payment_gateway" && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-3">Online Payment</h3>
          <p className="text-muted-foreground mb-6">
            Complete your payment instantly. You'll be redirected to the payment gateway after clicking "Complete Registration" below.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm inline-block">
              <p className="text-sm text-muted-foreground mb-1">Accepted Payment Methods</p>
              <p className="font-semibold">Credit Card • Debit Card • UPI • QR</p>
            </div>

            {/* Favourite Payment Option - Netbanking Coming Soon */}
            <div
              className="w-full max-w-sm flex flex-col items-center gap-2 p-6 rounded-lg border-2 border-orange-400 bg-gradient-to-r from-orange-100 via-yellow-100 to-pink-100 animate-gradient"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradientMove 3s ease-in-out infinite',
              }}
            >
              <style>{`
                @keyframes gradientMove {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                .animate-flash {
                  animation: flashText 1.2s infinite alternate;
                }
                @keyframes flashText {
                  0% { color: #f97316; }
                  25% { color: #eab308; }
                  50% { color: #22d3ee; }
                  75% { color: #e11d48; }
                  100% { color: #f97316; }
                }
              `}</style>
              <div className="w-12 h-8 rounded-md border-2 border-orange-500 flex items-center justify-center bg-white">
                {/* simple card icon */}
                <svg width="22" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="22" height="10" rx="2" stroke="#f97316" strokeWidth="1.6" fill="white" />
                  <rect x="3" y="4" width="6" height="2" rx="1" fill="#f97316" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg animate-flash">Your favourite payment option</h4>
              <p className="text-lg font-bold animate-flash">Netbanking: <span className="font-semibold animate-flash">coming soon</span></p>
            </div>
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✅ Instant confirmation • 🔒 Secure payment • 📧 Automatic ticket generation
            </p>
          </div>
        </div>
      )}

      {/* Razorpay Payment Section - COMMENTED OUT FOR DEPLOYMENT */}
      {/* {formData.paymentMethod === "razorpay" && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-3">Online Payment</h3>
          <p className="text-muted-foreground mb-6">
            Complete your payment instantly with Razorpay. You'll be redirected to the payment gateway after clicking "Complete Registration" below.
          </p>
          <div className="bg-white p-4 rounded-lg shadow-sm inline-block">
            <p className="text-sm text-muted-foreground mb-1">Accepted Payment Methods</p>
            <p className="font-semibold">Credit Card • Debit Card • UPI • QR</p>
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✅ Instant confirmation • 🔒 Secure payment • 📧 Automatic ticket generation
            </p>
          </div>
        </div>
      )} */}

      {/* Event Details */}
      <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary/20 text-center">
        <h3 className="text-lg font-bold text-foreground mb-2">Chaturanga Manthana 2025</h3>
        <div className="space-y-1 text-foreground">
          <p className="text-sm font-semibold">13th and 14th December 2025</p>
          <p className="text-sm font-semibold">At Nandi Link Grounds, Bengaluru.</p>
        </div>
      </div>
    </div>
  )
}
