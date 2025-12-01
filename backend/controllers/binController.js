import Bin from '../models/binModel.js';
import multer from 'multer';
import path from 'path';

const upload = multer({ dest: 'uploads/' }); // Files saved in /uploads

// ✅ Create Bin with Short ID
export const createBin = async (req, res) => {
  try {
    const newBin = new Bin({ files: [] });
    await newBin.save();
    res.json({ binId: newBin.binId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Bin Details
export const getBin = async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });
    if (!bin || bin.files.length === 0) return res.json({ empty: true });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Upload File to Bin
export const uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { binId } = req.params;
      let bin = await Bin.findOne({ binId });
      if (!bin) return res.status(404).json({ message: 'Bin not found' });

      bin.files.push({
        fileName: req.file.originalname,
        filePath: req.file.path,
        size: req.file.size,
        type: req.file.mimetype,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await bin.save();
      res.json({ success: true, message: 'File uploaded!' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

// ✅ Download File
export const downloadFile = async (req, res) => {
  try {
    const { binId, fileName } = req.params;
    const bin = await Bin.findOne({ binId });
    if (!bin) return res.status(404).send('Bin not found');

    const file = bin.files.find(f => f.fileName === fileName);
    if (!file) return res.status(404).send('File not found');

    res.download(path.resolve(file.filePath), file.fileName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
