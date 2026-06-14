import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import cron from 'node-cron';
import fs from 'fs';
import Bin from './models/binModel.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', fileRoutes);

// DB Connect with fallback to in-memory MongoDB
const connectDatabase = async () => {
  let mongoUri = process.env.MONGO_URI;
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("❌ MongoDB Atlas connection failed. Starting in-memory MongoDB fallback...");
    try {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`✅ In-memory MongoDB Connected at: ${mongoUri}`);
    } catch (memErr) {
      console.error("❌ Failed to start in-memory MongoDB fallback:", memErr);
    }
  }
};
connectDatabase();

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
    // Delete the bin document from database
    try {
      await Bin.deleteOne({ _id: bin._id });
      console.log(`🧹 Cleaned up and deleted expired bin: ${bin.binId}`);
    } catch (err) {
      console.error(`❌ Error deleting expired bin ${bin.binId}:`, err);
    }
  }
});
