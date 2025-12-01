import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import Bin from '../models/binModel.js';
import path from 'path';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ✅ Create Bin when user logs in
router.get('/create-bin', protect, async (req, res) => {
  try {
    const binId = nanoid(8);

    const bin = new Bin({
      userId: req.user._id,
      binId,
      files: [],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await bin.save();
    res.json({ binId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Upload File to a Bin (owner only)
router.post('/upload/:binId', protect, upload.single('file'), async (req, res) => {
  const binId = req.params.binId.trim();
  let bin = await Bin.findOne({ binId, userId: req.user._id });

  if (!bin) return res.status(404).json({ message: "Bin not found" });

  bin.files.push({
    fileName: req.file.originalname,
    filePath: req.file.path,
    size: req.file.size,
    type: req.file.mimetype,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  await bin.save();
  res.json({ success: true, message: 'File uploaded!' });
});

// ✅ Download File (public - no auth)
router.get('/download/:binId/:fileName', async (req, res) => {
  const binId = req.params.binId.trim();
  const fileName = req.params.fileName;

  const bin = await Bin.findOne({ binId });
  if (!bin) return res.status(404).send('Bin not found');

  const file = bin.files.find(f => f.fileName === fileName);
  if (!file) return res.status(404).send('File not found');

  res.download(path.resolve(file.filePath), file.fileName);
});

// ✅ Get Bin & Files (owner-only)
router.get('/bin/:binId', protect, async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId, userId: req.user._id });
    if (!bin) return res.status(404).json({ message: 'Bin not found' });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Public Bin View (no auth, for sharing)
router.get('/public-bin/:binId', async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });
    if (!bin) return res.status(404).json({ message: 'Bin not found' });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get All Bins for Logged-In User
router.get('/my-bins', protect, async (req, res) => {
  try {
    const bins = await Bin.find({ userId: req.user._id });
    res.json(bins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete file
router.delete('/delete/:binId/:fileName', protect, async (req, res) => {
  const { binId, fileName } = req.params;
  const bin = await Bin.findOne({ binId, userId: req.user._id });
  if (!bin) return res.status(404).json({ message: "Bin not found" });

  bin.files = bin.files.filter(f => f.fileName !== fileName);
  await bin.save();
  res.json({ message: "File deleted" });
});


export default router;
