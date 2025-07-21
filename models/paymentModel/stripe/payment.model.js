import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    plan: { type: String, enum: ["Basic", "Premium"], required: true },
    amount: { type: Number, required: true },
    payment_status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    payment_IntentId: { type: String, required: true },
    receipt_url: { type: String }, 
    planExpiry: { type: Date }
  },
  { timestamps: true }
);

const payment =  mongoose.model("Payment", paymentSchema);

export default payment;