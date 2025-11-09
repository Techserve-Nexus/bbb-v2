import mongoose, { Schema, Model } from "mongoose"
import { Registration, ChildInfo, Sponsor } from "./types"

// Child Info Schema
const ChildInfoSchema = new Schema<ChildInfo>({
  name: { type: String, required: true },
  age: { type: String, enum: ["<12", ">12"], required: true },
}, { _id: false })

// Registration Schema
const RegistrationSchema = new Schema<Registration>(
  {
    registrationId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    chapterName: { type: String, required: true },
    category: { type: String, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    ticketType: { 
      type: String, 
      enum: ["Platinum", "Gold", "Silver"], 
      required: true 
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "manual"],
      default: "manual"
    },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "success", "failed"], 
      default: "pending" 
    },
    paymentId: { type: String }, // References Payment collection _id
    paymentReference: { type: String },
    paymentScreenshotUrl: { type: String },
    spouseName: { type: String },
    children: [ChildInfoSchema],
    participations: [{ type: String }],
    conclavGroups: [{ type: String }],
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
    category: { 
      type: String, 
      enum: ["Platinum", "Gold", "Silver"], 
      required: true 
    },
    description: { type: String, required: true },
    socialLinks: { type: Map, of: String },
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

// Payment Schema
const PaymentSchema = new Schema(
  {
    registrationId: { type: String, required: true },
    paymentMethod: { 
      type: String, 
      enum: ["razorpay", "manual"], 
      required: true,
      default: "manual"
    },
    
    // Razorpay fields
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    
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

// Models
export const RegistrationModel: Model<Registration> =
  mongoose.models.Registration || mongoose.model<Registration>("Registration", RegistrationSchema)

export const SponsorModel: Model<Sponsor> =
  mongoose.models.Sponsor || mongoose.model<Sponsor>("Sponsor", SponsorSchema)

export const GalleryItemModel =
  mongoose.models.GalleryItem || mongoose.model("GalleryItem", GalleryItemSchema)

export const PaymentModel =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema)
