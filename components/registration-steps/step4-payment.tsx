"use client"

import { useEffect } from "react"
import { CreditCard } from "lucide-react"

interface Step4PaymentProps {
  formData: {
    paymentMethod: "razorpay" | "manual" | "payment_gateway"
    paymentScreenshot?: string
    paymentScreenshotUrl?: string
  }
  setFormData: (data: any) => void
}

export default function Step4Payment({ formData, setFormData }: Step4PaymentProps) {
  // Ensure payment method is set to payment_gateway on mount
  useEffect(() => {
    if (formData.paymentMethod !== "payment_gateway") {
      setFormData({
        ...formData,
        paymentMethod: "payment_gateway",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-8">
      {/* Payment Gateway Section */}
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
