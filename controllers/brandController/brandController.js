import Brand from "../models/brandModel/brand.js";

export const addBrand = async (req, res) => {
  const { brandName, productUrls } = req.body;
  try {
    const newBrand = new Brand({ userId: req.user._id, brandName, productUrls });
    await newBrand.save();
    res.status(201).json({ message: "Brand added", brand: newBrand });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ userId: req.user._id });
    res.status(200).json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
        }
        res.status(200).json(brand);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateBrand = async (req, res) => {
    const { brandName, productUrls } = req.body;
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(
        req.params.id,
        { brandName, productUrls },
        { new: true }
        );
        if (!updatedBrand) {
        return res.status(404).json({ error: "Brand not found" });
        }
        res.status(200).json({ message: "Brand updated", brand: updatedBrand });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteBrand = async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
