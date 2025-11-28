"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { XCircle, AlertCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

// Component that uses useSearchParams
function PaymentFailedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const status = searchParams.get("status")
  const error = searchParams.get("error")

  const getErrorMessage = () => {
    switch (error) {
      case "missing_params":
        return "Payment information is incomplete. Please try again."
      case "hash_mismatch":
        return "Payment verification failed. Please contact support."
      case "payment_not_found":
        return "Payment record not found. Please contact support with your order ID."
      case "registration_not_found":
        return "Registration not found. Please contact support."
      case "processing_error":
        return "An error occurred while processing your payment. Please try again."
      default:
        if (status) {
          return `Payment was not completed. Status: ${status}`
        }
        return "Your payment could not be processed. Please try again or use a different payment method."
    }
  }

  return (
    <div className="grow flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">

          {/* Failed Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 p-4">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>

          {/* Failed Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {getErrorMessage()}
          </p>

          {/* Order Details */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="text-lg font-semibold text-gray-900">{orderId}</p>
              <p className="text-xs text-gray-500 mt-2">
                Please save this order ID for reference
              </p>
            </div>
          )}

          {/* Common Reasons */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Common reasons for payment failure:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Insufficient funds in your account</li>
                  <li>Card expired or incorrect card details</li>
                  <li>Transaction declined by your bank</li>
                  <li>Network or connectivity issues</li>
                  <li>Payment gateway timeout</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 justify-center">
              <HelpCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Need Help?
                </p>
                <p className="text-sm text-gray-600">
                  If you continue to experience issues, please contact our support team with your order ID.
                  {orderId && (
                    <span className="block mt-1 font-mono text-xs">
                      Order ID: {orderId}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6">
            <p className="text-xs text-gray-500">
              Note: If money was deducted from your account, it will be refunded within 5-7 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Page with Suspense wrapper
export default function PaymentFailedPage() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
        <PaymentFailedContent />
      </Suspense>

      <Footer />
    </main>
  )
}


