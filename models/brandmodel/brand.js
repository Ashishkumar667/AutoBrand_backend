import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  brandName: String,
  domain: String,
  productUrls: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;