import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
  productName: String,
  productUrl: String,
  price: Number,
  discountPercent: Number,
  inStock: Boolean,
  timestamp: { type: Date, default: Date.now },
});

const Snapshot = mongoose.model("Snapshot", snapshotSchema);
export default Snapshot;