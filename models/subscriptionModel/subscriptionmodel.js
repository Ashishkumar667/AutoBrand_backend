import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  plan: { type: String, enum: ["free", "basic", "premium"], default: "free" },
  snapshotLimit: { type: Number, default: 15 },
  aiUsageLimit: { type: Number, default: 50 }, 
  emailAlerts: { type: Boolean, default: false }, 
  expiresAt: { type: Date }, 
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);
