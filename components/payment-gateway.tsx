"use client"

import { useState } from "react"
import { createPaymentOrder, verifyPayment, loadRazorpayScript } from "@/lib/razorpay"
import { getRazorpayKeyAction } from "@/app/actions/payment-actions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PaymentGatewayProps {
  registrationId: string
  amount: number
  ticketType: string
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
}

export default function PaymentGateway({
  registrationId,
  amount,
  ticketType,
  onSuccess,
  onError,
}: PaymentGatewayProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    try {
      setIsProcessing(true)

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay script")
      }

      const razorpayKey = await getRazorpayKeyAction()
      if (!razorpayKey) {
        throw new Error("Razorpay configuration is missing")
      }

      // Create payment order
      const orderData = await createPaymentOrder(amount, registrationId)

      // Open Razorpay checkout
      const options = {
        key: razorpayKey,
        order_id: orderData.orderId,
        amount: amount * 100,
        currency: "INR",
        name: "Chess Event 2025",
        description: `${ticketType} Ticket Registration`,
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        handler: async (response: any) => {
          try {
            const verificationResult = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            )

            onSuccess(verificationResult)
          } catch (error) {
            onError("Payment verification failed")
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
          },
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment error:", error)
      onError(error instanceof Error ? error.message : "Payment failed")
      setIsProcessing(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full bg-primary hover:bg-secondary text-primary-foreground py-3"
    >
      {isProcessing ? (
        <>
          <Loader2 size={18} className="mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        "Proceed to Payment"
      )}
    </Button>
  )
}
