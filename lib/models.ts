import mongoose, { Schema, Model } from "mongoose"
import { Registration, ChildInfo, Sponsor, Banner, Settings } from "./types"

// Child Info Schema
const ChildInfoSchema = new Schema<ChildInfo>({
  name: { type: String, required: true },
  age: { type: String, enum: ["<12", ">12"], required: true },
}, { _id: false })

// Person Ticket Schema
const PersonTicketSchema = new Schema({
  personType: { type: String, enum: ["self", "spouse", "child"], required: true },
  name: { type: String, required: true },
  age: { type: String, enum: ["<12", ">12"] },
  tickets: [{ type: String }], // Array of ticket types selected for this person
}, { _id: false })

// Registration Schema
const RegistrationSchema = new Schema<Registration>(
  {
    registrationId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    chapterName: { type: String, required: false },
    category: { type: String, required: false },
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    isGuest: { type: Boolean, default: false },
    referredBy: { type: String },
    spouseName: { type: String },
    children: [ChildInfoSchema],
    personTickets: [PersonTicketSchema], // New field for per-person ticket selections
    ticketType: { 
      type: String, 
      enum: ["Business_Conclave", "Chess"], 
      required: false // Kept for backward compatibility
    },
    ticketTypes: [{ type: String }], // Kept for backward compatibility
    paymentMethod: {
      type: String,
      enum: ["razorpay", "manual", "ta", "payment_gateway"],
      default: "manual"
    },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "success", "failed"], 
      default: "pending" 
    },
    paymentId: { type: String },
    paymentReference: { type: String },
    paymentScreenshotUrl: { type: String },
    amount: { type: Number, required: true, default: 0 },
    qrCode: { type: String },
    ticketStatus: {
      type: String,
      enum: ["under_review", "active", "expired", "used"],
      default: "under_review"
    },
  },
  {
    timestamps: true,
  }
)

// Sponsor Schema
const SponsorSchema = new Schema<Sponsor>(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    website: { type: String, required: true },
    sponsorCategory: {
      type: String,
      enum: ["Tamaram", "Tamaram+", "Rajatham", "Suvarnam", "Vajram", "Pradhan_Poshak"],
      required: true
    },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    socialLinks: { type: Map, of: String },
  },
  {
    timestamps: true,
  }
)

// Sponsor Request Schema
const SponsorRequestSchema = new Schema(
  {
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String, required: true },
    description: { type: String, required: true },
    requestedAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approvedCategory: {
      type: String,
      enum: ["Tamaram", "Tamaram+", "Rajatham", "Suvarnam", "Vajram", "Pradhan_Poshak"]
    },
    rejectionReason: { type: String },
  },
  {
    timestamps: true,
  }
)

// Gallery Item Schema
const GalleryItemSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
)

// Banner Schema
const BannerSchema = new Schema<Banner>(
  {
    title: { type: String, required: true },
    desktopImage: { type: String, required: true },
    tabletImage: { type: String, required: true },
    mobileImage: { type: String, required: true },
    priority: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
)

// Payment Schema
const PaymentSchema = new Schema(
  {
    registrationId: { type: String, required: true },
    paymentMethod: { 
      type: String, 
      enum: ["razorpay", "manual", "payment_gateway"], 
      required: true,
      default: "manual"
    },
    
    // Razorpay fields
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    
    // Payment Gateway fields (new gateway)
    pgOrderId: { type: String, unique: true, sparse: true }, // order_id
    pgTransactionId: { type: String }, // transaction_id from gateway
    pgPaymentId: { type: String }, // payment_id from gateway
    pgHash: { type: String }, // hash received from gateway
    
    // Manual payment fields
    paymentScreenshotUrl: { type: String },
    upiId: { type: String }, // UPI ID from which payment was made
    transactionId: { type: String }, // UPI transaction ID
    verifiedBy: { type: String }, // Admin email who verified
    verificationNotes: { type: String }, // Admin notes during verification
    
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["pending", "success", "failed"], 
      default: "pending" 
    },
  },
  {
    timestamps: true,
  }
)

// Visitor Schema
const VisitorSchema = new Schema(
  {
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    page: { type: String, required: true },
    sessionId: { type: String, required: true, index: true },
    referrer: { type: String },
    country: { type: String },
    city: { type: String },
  },
  {
    timestamps: true,
  }
)

// Settings Schema
const SettingsSchema = new Schema<Settings>(
  {
    registrationEnabled: { type: Boolean, default: true },
    siteName: { type: String, default: "BBB Event" },
    siteDescription: { type: String, default: "Event Registration System" },
    useRealStats: { type: Boolean, default: true },
    dummyStats: {
      totalRegistrations: { type: Number, default: 0 },
      approvedRegistrations: { type: Number, default: 0 },
      totalVisitors: { type: Number, default: 0 },
    },
    participantsCount: { type: Number, default: 82 },
  },
  {
    timestamps: true,
  }
)

// Speaker Schema
const SpeakerSchema = new Schema(
  {
    name: { type: String, required: true },
    photo: { type: String, required: true },
    designation: { type: String, required: true },
    bio: { type: String, required: true },
    socialLink: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

// Models
export const RegistrationModel: Model<Registration> =
  mongoose.models.Registration || mongoose.model<Registration>("Registration", RegistrationSchema)

export const SponsorModel: Model<Sponsor> =
  mongoose.models.Sponsor || mongoose.model<Sponsor>("Sponsor", SponsorSchema)

export const SponsorRequestModel =
  mongoose.models.SponsorRequest || mongoose.model("SponsorRequest", SponsorRequestSchema)

export const GalleryItemModel =
  mongoose.models.GalleryItem || mongoose.model("GalleryItem", GalleryItemSchema)

export const PaymentModel =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema)

export const BannerModel: Model<Banner> =
  mongoose.models.Banner || mongoose.model<Banner>("Banner", BannerSchema)

// export const SettingsModel =
//   mongoose.models.Settings || mongoose.model("Settings", SettingsSchema)

export const SpeakerModel =
  mongoose.models.Speaker || mongoose.model("Speaker", SpeakerSchema)

export const SettingsModel: Model<Settings> =
  mongoose.models.Settings || mongoose.model<Settings>("Settings", SettingsSchema)

export const VisitorModel =
  mongoose.models.Visitor || mongoose.model("Visitor", VisitorSchema)
