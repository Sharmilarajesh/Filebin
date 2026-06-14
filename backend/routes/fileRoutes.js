import express from 'express';
import multer from 'multer';
import protect from '../middleware/authMiddleware.js';
import {
  createBin,
  uploadFile,
  downloadFile,
  getBinDetails,
  getPublicBin,
  getMyBins,
  deleteFile
} from '../controllers/binController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ✅ Create Bin when user logs in
router.get('/create-bin', protect, createBin);

// ✅ Upload File to a Bin (owner only)
router.post('/upload/:binId', protect, upload.single('file'), uploadFile);

// ✅ Download File (public - no auth)
router.get('/download/:binId/:fileName', downloadFile);

// ✅ Get Bin & Files (owner-only)
router.get('/bin/:binId', protect, getBinDetails);

// ✅ Public Bin View (no auth, for sharing)
router.get('/public-bin/:binId', getPublicBin);

// ✅ Get All Bins for Logged-In User
router.get('/my-bins', protect, getMyBins);

// ✅ Delete file
router.delete('/delete/:binId/:fileName', protect, deleteFile);

export default router;
