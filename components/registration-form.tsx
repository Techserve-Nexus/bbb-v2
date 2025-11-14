"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Step1BasicAndFamily from "./registration-steps/step1-basic-and-family"
import Step2PerPersonTickets from "./registration-steps/step2-per-person-tickets"
import Step3Payment from "./registration-steps/step4-payment"
import { loadRazorpayScript } from "@/lib/razorpay"
import { useRouter } from "next/navigation"

interface PersonTicket {
  personType: "self" | "spouse" | "child"
  name: string
  age?: "<12" | ">12"
  tickets: string[] // ["Business_Conclave", "Chess", or both]
}

interface FormData {
  // Step 1 - Basic Details + Family Info
  name: string
  chapterName: string
  category: string
  contactNo: string
  email: string
  isGuest?: boolean
  spouseName?: string
  children: Array<{ name: string; age: "<12" | ">12" }>

  // Step 2 - Per Person Ticket Selection
  personTickets: PersonTicket[]
  
  // Step 3 - Payment
  paymentMethod: "razorpay" | "manual"
  paymentScreenshot?: string
  paymentScreenshotUrl?: string
}

export default function RegistrationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [registrationEnabled, setRegistrationEnabled] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    chapterName: "",
    category: "",
    contactNo: "",
    email: "",
    isGuest: false,
    spouseName: "",
    children: [
      { name: "", age: "<12" },
      { name: "", age: "<12" },
      { name: "", age: "<12" },
    ],
    personTickets: [],
    paymentMethod: "manual",
    paymentScreenshot: undefined,
    paymentScreenshotUrl: undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [registrationId, setRegistrationId] = useState("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Check registration status on mount
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await fetch("/api/settings/registration-status")
        const data = await response.json()
        setRegistrationEnabled(data.registrationEnabled)
      } catch (error) {
        console.error("Failed to check registration status:", error)
        // Default to enabled on error
        setRegistrationEnabled(true)
      } finally {
        setCheckingStatus(false)
      }
    }
    checkRegistrationStatus()
  }, [])

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
    // chapterName and category are now optional - no validation needed
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
    
    // Check if at least one person has selected at least one ticket
    const hasAnyTicket = formData.personTickets?.some(p => p.tickets && p.tickets.length > 0)
    
    if (!hasAnyTicket) {
      newErrors.personTickets = "Please select at least one ticket for any person"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
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

    if (currentStep < 3) {
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
    // Validate Step 3 (Payment)
    if (!validateStep3()) return

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
        isGuest: formData.isGuest || false,
        spouseName: formData.spouseName || undefined,
        children: formData.children.filter(child => child.name.trim() !== ""),
        personTickets: formData.personTickets,
        paymentMethod: formData.paymentMethod,
        paymentScreenshotUrl: formData.paymentMethod === "manual" ? formData.paymentScreenshotUrl : undefined,
      }

      // alert("Submitting your registration. Please wait...")

      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })
      // alert("Registration submitted. Processing response...")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Save registration ID
      const regId = data.registrationId
      setRegistrationId(regId)
      
      // If Razorpay payment, initiate payment flow
      if (formData.paymentMethod === "razorpay") {
        await handleRazorpayPayment(regId, data.amount || calculateTotalAmount(formData.personTickets))
      } else {
        // Manual payment - show success message
        setSubmitSuccess(true)
        localStorage.removeItem("registrationForm")
        // alert(`Registration successful! Your Registration ID is ${regId}. Please check your email for further instructions.`)
      }
      
      console.log("Registration successful:", data)
    } catch (error) {
      console.error("Registration error:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to submit registration")
      setIsSubmitting(false)
      // alert(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const calculateTotalAmount = (personTickets: any[]) => {
    const prices: Record<string, number> = {
      Business_Conclave: 1000,
      Chess: 500,
    }
    let total = 0
    personTickets?.forEach((person: any) => {
      person.tickets?.forEach((ticket: string) => {
        total += prices[ticket] || 0
      })
    })
    return total
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
        name: "Chaturanga Manthana 2025",
        description: `Event Tickets - ${regId}`,
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
            // console.log("✅ Payment verified successfully:", verifyData)
            setSubmitSuccess(true)
            setIsSubmitting(false)
            setIsProcessingPayment(false)
            localStorage.removeItem("registrationForm")

            // Redirect to ticket page after 2 seconds
            setTimeout(() => {
              router.push(`/ticket/${regId}`)
            }, 2000)
          } catch (verifyError) {
            // console.error("Payment verification error:", verifyError)
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
      {/* Loading State */}
      {checkingStatus ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking registration status...</p>
          </div>
        </div>
      ) : !registrationEnabled ? (
        /* Registration Closed Message */
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3">
            Registration Closed
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-6">
            We're sorry, but registration for this event is currently closed. Please check back later or contact the event organizers for more information.
          </p>
          <Button 
            onClick={() => router.push("/")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Back to Home
          </Button>
        </div>
      ) : submitSuccess ? (
        /* Success Message */
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
                spouseName: "",
                children: [
                  { name: "", age: "<12" },
                  { name: "", age: "<12" },
                  { name: "", age: "<12" },
                ],
                personTickets: [],
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
              {[1, 2, 3].map((step) => (
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
                Registration Details
              </span>
              <span className={currentStep === 2 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Select Tickets
              </span>
              <span className={currentStep === 3 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Payment
              </span>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-500 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-semibold"> Error:</p>
              <p>{submitError}</p>
            </div>
          )}

          {/* Form Steps */}
          <div className="bg-background border border-border rounded-lg p-8 md:p-12 mb-8">
            {currentStep === 1 && <Step1BasicAndFamily formData={formData} setFormData={setFormData} errors={errors} />}
            {currentStep === 2 && <Step2PerPersonTickets formData={formData} setFormData={setFormData} errors={errors} />}
            {currentStep === 3 && <Step3Payment formData={formData} setFormData={setFormData} />}
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

            <div className="text-sm text-muted-foreground self-center">Step {currentStep} of 3</div>

            {currentStep < 3 ? (
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
