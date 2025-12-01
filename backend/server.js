import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import cron from 'node-cron';
import fs from 'fs';
import Bin from './models/binModel.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', fileRoutes);

// DB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));

app.use((err, req, res, next) => {
  console.error('❌ SERVER ERROR:', err.stack);
  res.status(500).json({ message: err.message });
});


// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  const expiredBins = await Bin.find({ expiresAt: { $lte: now } });

  for (const bin of expiredBins) {
    for (const file of bin.files) {
      try {
        fs.unlinkSync(file.filePath);
      } catch (err) {
        console.log('File already deleted:', file.fileName);
      }
    }
  }
});
