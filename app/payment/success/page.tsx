"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, Download, Mail, ArrowRight } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const registrationId = searchParams.get("registration_id")
  const orderId = searchParams.get("order_id")
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    // Auto-redirect to home page after 1 minute
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <div className="grow flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your payment has been processed successfully. Your ticket has been generated and sent to your email.
            </p>

            {/* Order Details */}
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-lg font-semibold text-gray-900">{orderId}</p>
              </div>
            )}

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Check Your Email
                  </p>
                  <p className="text-sm text-blue-700">
                    We've sent your ticket with QR code to your registered email address. Please check your inbox and spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {registrationId && (
                <>
                  <Link
                    href={`/ticket/${registrationId}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    View Ticket
                  </Link>
                  {countdown > 0 && (
                    <p className="text-sm text-gray-500 self-center">
                      Redirecting to home in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}...
                    </p>
                  )}
                </>
              )}
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Home
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If you have any questions or need assistance, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

