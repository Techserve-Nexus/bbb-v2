"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Step1BasicAndFamily from "./registration-steps/step1-basic-and-family"
import Step2PerPersonTickets from "./registration-steps/step2-per-person-tickets"
import { createPaymentRequest, submitPaymentForm } from "@/lib/payment-gateway-client"
import { useRouter, useSearchParams } from "next/navigation"

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
  referredBy?: string
  spouseName?: string
  children: Array<{ name: string; age: "<12" | ">12" }>

  // Step 2 - Per Person Ticket Selection
  personTickets: PersonTicket[]
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
    referredBy: "",
    spouseName: "",
    children: [
      { name: "", age: "<12" },
      { name: "", age: "<12" },
      { name: "", age: "<12" },
    ],
    personTickets: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [missingTicketSelectionIndices, setMissingTicketSelectionIndices] = useState<number[] | null>(null)
  const [validationAlert, setValidationAlert] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [registrationId, setRegistrationId] = useState("")

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

    // If registering as Guest, Referred By is required
    if (formData.isGuest && !(formData.referredBy || "").trim()) {
      newErrors.referredBy = "Please specify who referred you"
    }

    setErrors(newErrors)
    return { valid: Object.keys(newErrors).length === 0, newErrors }
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    // Build the list of persons that require ticket selection in the same order
    // as the UI: self, spouse (if provided), then children (based on guest/member rules)
    const persons: Array<{ personType: string; name: string; age?: string }> = []
    persons.push({ personType: "self", name: formData.name || "You" })
    if (formData.spouseName && formData.spouseName.trim()) {
      persons.push({ personType: "spouse", name: formData.spouseName })
    }
    formData.children.forEach((child: any) => {
      if (child.name && child.name.trim()) {
        if (formData.isGuest || child.age === ">12") {
          persons.push({ personType: "child", name: child.name, age: child.age })
        }
      }
    })

    // Now ensure each person in the persons list has at least one ticket selected
    const missingIndices: number[] = []
    const missingNames: string[] = []
    for (let i = 0; i < persons.length; i++) {
      const ticketEntry = formData.personTickets?.[i]
      const hasTickets = ticketEntry && ticketEntry.tickets && ticketEntry.tickets.length > 0
      if (!hasTickets) {
        missingIndices.push(i)
        missingNames.push(persons[i].name || `${persons[i].personType}`)
      }
    }

    if (missingNames.length > 0) {
      if (missingNames.length === 1) {
        newErrors.personTickets = `Please select ticket(s) for ${missingNames[0]}`
      } else {
        newErrors.personTickets = `Please select tickets for: ${missingNames.join(", ")}`
      }
    }

    setMissingTicketSelectionIndices(missingIndices.length ? missingIndices : null)

    setErrors(newErrors)
    return { valid: Object.keys(newErrors).length === 0, newErrors }
  }

  // Auto-hide validation alert after a short time
  useEffect(() => {
    if (!validationAlert) return
    const t = setTimeout(() => setValidationAlert(""), 4000)
    return () => clearTimeout(t)
  }, [validationAlert])

  const focusFirstError = (newErrors: Record<string, string>) => {
    const keys = Object.keys(newErrors)
    if (!keys.length) return
    const firstKey = keys[0]

    // If error pertains to step 2 or 3, switch to that step first
    if (firstKey === "personTickets") {
      setCurrentStep(2)
      // If we have indices for missing selections, try to scroll to the first missing person's card
      setTimeout(() => {
        try {
          if (missingTicketSelectionIndices && missingTicketSelectionIndices.length > 0) {
            const idx = missingTicketSelectionIndices[0]
            const el = document.getElementById(`person-ticket-${idx}`)
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" })
              // focus first interactive element inside the card if present
              const focusable = el.querySelector('button, [tabindex], input, select, [role="button"]') as HTMLElement | null
              if (focusable) focusable.focus()
              return
            }
          }
          window.scrollTo({ top: 0, behavior: "smooth" })
        } catch (e) {
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      }, 80)
      return
    }

    // Default: focus input by name on step 1
    setCurrentStep(1)
    setTimeout(() => {
      try {
        const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          ;(el as any).focus?.()
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      } catch (e) {
        // ignore
      }
    }, 80)
  }

  const handleNext = () => {
    if (currentStep === 1) {
      const { valid, newErrors } = validateStep1()
      if (!valid) {
        setValidationAlert("Please fix the highlighted fields to continue")
        focusFirstError(newErrors)
        return
      }
    }

    if (currentStep === 2) {
      const { valid, newErrors } = validateStep2()
      if (!valid) {
        setValidationAlert("Please select at least one ticket to continue")
        focusFirstError(newErrors)
        return
      }
    }

    if (currentStep < 2) {
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
    // Validate Step 2 (Tickets) before submitting
    const { valid, newErrors } = validateStep2()
    if (!valid) {
      setValidationAlert("Please select at least one ticket to continue")
      focusFirstError(newErrors)
      return
    }

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
        referredBy: formData.referredBy || undefined,
        spouseName: formData.spouseName || undefined,
        children: formData.children.filter(child => child.name.trim() !== ""),
        personTickets: formData.personTickets,
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

      console.log("Registration successful:", data)
      console.log("Redirecting to payment gateway with amount:", data.amount)

      // Directly redirect to payment gateway
      await handlePaymentGatewayPayment(regId, data.amount)
    } catch (error) {
      console.error("Registration error:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to submit registration")
      setIsSubmitting(false)
      // alert(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handlePaymentGatewayPayment = async (regId: string, amount: number) => {
    try {
      console.log("🔄 Starting payment gateway flow...")
      console.log("Registration ID:", regId)
      console.log("Amount:", amount)

      // Create payment request
      const paymentData = await createPaymentRequest(amount, regId)

      console.log("✅ Payment request created successfully")
      console.log("Payment URL:", paymentData.paymentUrl)

      if (!paymentData.success) {
        throw new Error(paymentData.error || "Failed to create payment request")
      }

      console.log("🚀 Submitting payment form and redirecting to payment gateway...")

      // Submit payment form to redirect to payment gateway
      submitPaymentForm(paymentData.paymentParams, paymentData.paymentUrl)

      // Note: User will be redirected to payment gateway
      // After payment, they'll be redirected back to /api/payments/return
      // which will then redirect them to the ticket page
    } catch (error) {
      console.error("❌ Payment gateway error:", error)
      setSubmitError(error instanceof Error ? error.message : "Payment initiation failed")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Loading State */}
      {checkingStatus ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isSubmitting ? "Processing your registration and redirecting to payment..." : "Checking registration status..."}
            </p>
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
                referredBy: "",
                spouseName: "",
                children: [
                  { name: "", age: "<12" },
                  { name: "", age: "<12" },
                  { name: "", age: "<12" },
                ],
                personTickets: [],
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
              {[1, 2].map((step) => (
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
            </div>
          </div>

          {/* Error Message */}
          {validationAlert && (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 p-4 rounded-lg mb-4">
              <p className="font-semibold">Please check:</p>
              <p>{validationAlert}</p>
            </div>
          )}
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

            <div className="text-sm text-muted-foreground self-center">Step {currentStep} of 2</div>

            {currentStep < 2 ? (
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
                disabled={isSubmitting}
                className="bg-primary hover:bg-secondary text-primary-foreground"
              >
                {isSubmitting ? "Submitting..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
