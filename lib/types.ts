export interface Registration {
  id: string
  registrationId: string
  name: string
  chapterName: string
  category: string
  contactNo: string
  email: string
  ticketType: "Platinum" | "Gold" | "Silver"
  paymentMethod?: "razorpay" | "manual"
  paymentStatus: "pending" | "success" | "failed"
  paymentId?: string
  paymentReference?: string
  paymentScreenshotUrl?: string
  spouseName?: string
  children: ChildInfo[]
  participations: string[]
  conclavGroups: string[]
  qrCode?: string
  ticketStatus?: "under_review" | "active" | "expired" | "used"
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  registrationId: string
  paymentMethod: "razorpay" | "manual"
  
  // Razorpay fields
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  
  // Manual payment fields
  paymentScreenshotUrl?: string
  upiId?: string
  transactionId?: string
  verifiedBy?: string
  verificationNotes?: string
  
  amount: number
  status: "pending" | "success" | "failed"
  createdAt: Date
  updatedAt: Date
}

export interface ChildInfo {
  name: string
  age: "<12" | ">12"
}

export interface Sponsor {
  id: string
  name: string
  logo: string
  website: string
  category: "Platinum" | "Gold" | "Silver"
  description: string
  socialLinks?: Record<string, string>
}

export interface GalleryItem {
  id: string
  type: "image" | "video"
  url: string
  title: string
  tags: string[]
  createdAt: Date
}

export interface TicketOption {
  tier: "Platinum" | "Gold" | "Silver"
  price: number
  features: string[]
}
