import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  fileName: String,
  filePath: String,
  size: Number,
  type: String,
  uploadDate: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

const binSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  binId: { type: String, required: true, unique: true },
  files: [fileSchema],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

// ✅ TTL Index for automatic deletion after expiresAt
binSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Bin', binSchema);
