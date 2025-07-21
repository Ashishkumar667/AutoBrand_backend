// import Snapshot from '../../models/snapmodel/snapshot.js';


// export const getSnapshotsByBrand = async (req, res) => {
//   try {
//     const snapshots = await Snapshot.find({ brandId: req.params.brandId })
//       .sort({ createdAt: -1 })
//       .limit(100); 
//     res.status(200).json(snapshots);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import Snapshot from "../../models/snapmodel/snapshot.js";

export const getSnapshotsByBrand = async (req, res) => {
  try {
    const brandId = req.params.brandId;

    const snapshots = await Snapshot.find({ brandId })
      .sort({ createdAt: -1 })
      .limit(100);

    if (!snapshots.length) {
      return res.status(200).json({ summary: {}, snapshots: [] });
    }

    const latest = snapshots[0];
    const oldest = snapshots[snapshots.length - 1];

    const summary = {
      totalSnapshots: snapshots.length,
      firstSeenPrice: oldest.price,
      latestPrice: latest.price,
      priceChanged: latest.price !== oldest.price,
      latestStock: latest.inStock ? "✅ In Stock" : "❌ Out of Stock",
      productName: latest.productName,
      productUrl: latest.productUrl,
    };

    res.status(200).json({ summary, snapshots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
