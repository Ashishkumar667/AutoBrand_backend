import Snapshot from '../models/snapModel/snapshot.js';


export const getSnapshotsByBrand = async (req, res) => {
  try {
    const snapshots = await Snapshot.find({ brandId: req.params.brandId })
      .sort({ createdAt: -1 })
      .limit(100); 
    res.status(200).json(snapshots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
