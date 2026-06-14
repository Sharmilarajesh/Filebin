import Bin from '../models/binModel.js';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs';

// @desc    Create a new bin
// @route   GET /api/create-bin
// @access  Private
export const createBin = async (req, res) => {
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
};

// @desc    Upload file to a bin
// @route   POST /api/upload/:binId
// @access  Private (Owner only)
export const uploadFile = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Download file from a bin
// @route   GET /api/download/:binId/:fileName
// @access  Public
export const downloadFile = async (req, res) => {
  try {
    const binId = req.params.binId.trim();
    const fileName = req.params.fileName;

    const bin = await Bin.findOne({ binId });
    if (!bin) return res.status(404).send('Bin not found');

    const file = bin.files.find(f => f.fileName === fileName);
    if (!file) return res.status(404).send('File not found');

    res.download(path.resolve(file.filePath), file.fileName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get owner's bin and files
// @route   GET /api/bin/:binId
// @access  Private (Owner only)
export const getBinDetails = async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId, userId: req.user._id });
    if (!bin) return res.status(404).json({ message: 'Bin not found' });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get public view of a bin
// @route   GET /api/public-bin/:binId
// @access  Public
export const getPublicBin = async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });
    if (!bin) return res.status(404).json({ message: 'Bin not found' });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all bins for a user
// @route   GET /api/my-bins
// @access  Private
export const getMyBins = async (req, res) => {
  try {
    const bins = await Bin.find({ userId: req.user._id });
    res.json(bins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete file from a bin
// @route   DELETE /api/delete/:binId/:fileName
// @access  Private (Owner only)
export const deleteFile = async (req, res) => {
  try {
    const { binId, fileName } = req.params;
    const bin = await Bin.findOne({ binId, userId: req.user._id });
    if (!bin) return res.status(404).json({ message: "Bin not found" });

    const fileIndex = bin.files.findIndex(f => f.fileName === fileName);
    if (fileIndex === -1) return res.status(404).json({ message: "File not found" });

    const file = bin.files[fileIndex];

    // Delete physically from server disk
    try {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    } catch (err) {
      console.error('Failed to delete physical file from disk:', err);
    }

    bin.files.splice(fileIndex, 1);
    await bin.save();

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
