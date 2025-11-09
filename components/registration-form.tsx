"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Step1BasicDetails from "./registration-steps/step1-basic-details"
import Step2Tickets from "./registration-steps/step2-tickets"
import Step3AdditionalDetails from "./registration-steps/step3-additional-details"
import Step4Payment from "./registration-steps/step4-payment"
import { loadRazorpayScript } from "@/lib/razorpay"
import { useRouter } from "next/navigation"

interface FormData {
  // Step 1
  name: string
  chapterName: string
  category: string
  contactNo: string
  email: string

  // Step 2
  ticketType: "Platinum" | "Gold" | "Silver" | ""

  // Step 3
  spouseName?: string
  children: Array<{ name: string; age: "<12" | ">12" }>
  participations: string[]
  conclavGroups: string[]
  
  // Step 4
  paymentMethod: "razorpay" | "manual"
  paymentScreenshot?: string
  paymentScreenshotUrl?: string
}

export default function RegistrationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    chapterName: "",
    category: "",
    contactNo: "",
    email: "",
    ticketType: "",
    spouseName: "",
    children: [
      { name: "", age: "<12" },
      { name: "", age: "<12" },
      { name: "", age: "<12" },
    ],
    participations: [],
    conclavGroups: [],
    paymentMethod: "manual", // Default to manual payment
    paymentScreenshot: undefined,
    paymentScreenshotUrl: undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [registrationId, setRegistrationId] = useState("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("registrationForm")
    if (saved) {
      try {
        setFormData(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load saved form data")
      }
    }
  }, [])

  // Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem("registrationForm", JSON.stringify(formData))
  }, [formData])

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.chapterName.trim()) newErrors.chapterName = "Chapter name is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.contactNo.trim()) newErrors.contactNo = "Contact number is required"
    if (!/^\d{10}$/.test(formData.contactNo.replace(/\D/g, ""))) {
      newErrors.contactNo = "Please enter a valid 10-digit phone number"
    }
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.ticketType) {
      newErrors.ticketType = "Please select a ticket type"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {}
    
    // Only validate screenshot for manual payment
    if (formData.paymentMethod === "manual" && !formData.paymentScreenshotUrl) {
      newErrors.paymentScreenshot = "Please upload payment screenshot"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    // Validate Step 4
    if (!validateStep4()) return

    setIsSubmitting(true)
    setSubmitError("")
    
    try {
      // Prepare data for submission
      const submissionData = {
        name: formData.name,
        chapterName: formData.chapterName,
        category: formData.category,
        contactNo: formData.contactNo,
        email: formData.email,
        ticketType: formData.ticketType,
        paymentMethod: formData.paymentMethod,
        spouseName: formData.spouseName || undefined,
        children: formData.children.filter(child => child.name.trim() !== ""),
        participations: formData.participations,
        conclavGroups: formData.conclavGroups,
        paymentScreenshotUrl: formData.paymentMethod === "manual" ? formData.paymentScreenshotUrl : undefined,
      }

      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Save registration ID
      const regId = data.registrationId
      setRegistrationId(regId)
      
      // If Razorpay payment, initiate payment flow
      if (formData.paymentMethod === "razorpay") {
        await handleRazorpayPayment(regId, data.amount || getTicketAmount(formData.ticketType))
      } else {
        // Manual payment - show success message
        setSubmitSuccess(true)
        localStorage.removeItem("registrationForm")
      }
      
      console.log("Registration successful:", data)
    } catch (error) {
      console.error("Registration error:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to submit registration")
      setIsSubmitting(false)
    }
  }

  const getTicketAmount = (ticketType: string) => {
    const prices: Record<string, number> = {
      Platinum: 3999,
      Gold: 2999,
      Silver: 1999,
    }
    return prices[ticketType] || 1999
  }

  const handleRazorpayPayment = async (regId: string, amount: number) => {
    try {
      setIsProcessingPayment(true)

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay. Please check your internet connection.")
      }

      // Create order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, registrationId: regId }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || "Failed to create payment order")
      }

      const orderData = await orderResponse.json()

      // Razorpay checkout options
      const options = {
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: amount * 100,
        currency: "INR",
        name: "Chess Event 2025",
        description: `${formData.ticketType} Ticket - ${regId}`,
        image: "/logo.png", // Add your logo
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.contactNo,
        },
        handler: async (response: any) => {
          // Payment successful, verify on backend
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || "Payment verification failed")
            }

            // Success!
            console.log("✅ Payment verified successfully:", verifyData)
            setSubmitSuccess(true)
            setIsSubmitting(false)
            setIsProcessingPayment(false)
            localStorage.removeItem("registrationForm")

            // Redirect to ticket page after 2 seconds
            setTimeout(() => {
              router.push(`/ticket/${regId}`)
            }, 2000)
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError)
            setSubmitError(verifyError instanceof Error ? verifyError.message : "Payment verification failed")
            setIsSubmitting(false)
            setIsProcessingPayment(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false)
            setIsSubmitting(false)
            setSubmitError("Payment cancelled. You can retry payment from your registration email.")
          },
        },
        theme: {
          color: "#4F46E5", // Primary color
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Razorpay payment error:", error)
      setSubmitError(error instanceof Error ? error.message : "Payment initiation failed")
      setIsSubmitting(false)
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Message */}
      {submitSuccess ? (
        <div className="bg-background border border-green-500 rounded-lg p-8 md:p-12 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold mb-4 text-green-600">Registration Successful!</h2>
          <p className="text-lg mb-4">Your registration has been completed successfully.</p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your Registration ID:</p>
            <p className="text-2xl font-bold text-primary">{registrationId}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Please save this ID for future reference. You will receive a confirmation email shortly.
          </p>
          <Button 
            onClick={() => {
              setSubmitSuccess(false)
              setCurrentStep(1)
              setFormData({
                name: "",
                chapterName: "",
                category: "",
                contactNo: "",
                email: "",
                ticketType: "",
                spouseName: "",
                children: [
                  { name: "", age: "<12" },
                  { name: "", age: "<12" },
                  { name: "", age: "<12" },
                ],
                participations: [],
                conclavGroups: [],
                paymentMethod: "manual",
                paymentScreenshot: undefined,
                paymentScreenshotUrl: undefined,
              })
            }}
            className="bg-primary hover:bg-secondary text-primary-foreground"
          >
            Register Another Person
          </Button>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-1 mx-1 rounded-full transition-all ${
                    step <= currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span className={currentStep === 1 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Basic Details
              </span>
              <span className={currentStep === 2 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Tickets
              </span>
              <span className={currentStep === 3 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Additional
              </span>
              <span className={currentStep === 4 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Payment
              </span>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-500 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-semibold">❌ Error:</p>
              <p>{submitError}</p>
            </div>
          )}

          {/* Form Steps */}
          <div className="bg-background border border-border rounded-lg p-8 md:p-12 mb-8">
            {currentStep === 1 && <Step1BasicDetails formData={formData} setFormData={setFormData} errors={errors} />}
            {currentStep === 2 && <Step2Tickets formData={formData} setFormData={setFormData} errors={errors} />}
            {currentStep === 3 && <Step3AdditionalDetails formData={formData} setFormData={setFormData} />}
            {currentStep === 4 && <Step4Payment formData={formData} setFormData={setFormData} />}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 1 || isSubmitting}
              className={
                currentStep === 1
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-muted text-foreground hover:bg-border"
              }
            >
              <ChevronLeft size={18} className="mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground self-center">Step {currentStep} of 4</div>

            {currentStep < 4 ? (
              <Button 
                onClick={handleNext} 
                disabled={isSubmitting}
                className="bg-primary hover:bg-secondary text-primary-foreground"
              >
                Next
                <ChevronRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={
                  isSubmitting || 
                  isProcessingPayment ||
                  (formData.paymentMethod === "manual" && !formData.paymentScreenshotUrl)
                }
                className="bg-primary hover:bg-secondary text-primary-foreground"
              >
                {isProcessingPayment 
                  ? "Processing Payment..." 
                  : isSubmitting 
                    ? "Submitting..." 
                    : formData.paymentMethod === "razorpay"
                      ? "Proceed to Payment"
                      : "Complete Registration"}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
