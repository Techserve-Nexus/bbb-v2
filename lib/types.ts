export interface Registration {
  id: string
  registrationId: string
  name: string
  chapterName?: string
  category?: string
  contactNo: string
  email: string
  isGuest?: boolean
  ticketType?: "Business_Conclave" | "Chess" // Keep for backward compatibility
  ticketTypes?: string[] // New field for multiple selections
  paymentMethod?: "razorpay" | "manual"
  paymentStatus: "pending" | "success" | "failed"
  paymentId?: string
  paymentReference?: string
  paymentScreenshotUrl?: string
  spouseName?: string
  children: ChildInfo[]
  personTickets?: PersonTicket[] // Per-person ticket selections
  participations: string[]
  conclavGroups: string[]
  qrCode?: string
  ticketStatus?: "under_review" | "active" | "expired" | "used"
  createdAt: Date
  updatedAt: Date
}

export interface PersonTicket {
  personType: "self" | "spouse" | "child"
  name: string
  age?: "<12" | ">12"
  tickets: string[]
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
  sponsorCategory: "Tamaram" | "Tamaram+" | "Rajatham" | "Suvarnam" | "Vajram" | "Pradhan_Poshak"
  price: number
  description: string
  socialLinks?: Record<string, string>
}

export interface SponsorRequest {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  website: string
  description: string
  requestedAmount: number
  status: "pending" | "approved" | "rejected"
  approvedCategory?: "Tamaram" | "Tamaram+" | "Rajatham" | "Suvarnam" | "Vajram" | "Pradhan_Poshak"
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface GalleryItem {
  id: string
  type: "image" | "video"
  url: string
  title: string
  tags: string[]
  createdAt: Date
}

export interface Banner {
  id: string
  title: string
  desktopImage: string
  tabletImage: string
  mobileImage: string
  priority: boolean
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface TicketOption {
  tier: "Business_Conclave" | "Chess"
  price: number
  features: string[]
}

export interface Speaker {
  id: string
  name: string
  photo: string
  designation: string
  bio: string
  socialLink: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Settings {
  id?: string
  registrationEnabled: boolean
  siteName: string
  siteDescription: string
  useRealStats: boolean
  dummyStats: {
    totalRegistrations: number
    approvedRegistrations: number
    totalVisitors: number
  }
  participantsCount: number
  createdAt?: Date
  updatedAt?: Date
}
