import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'finished'], 
    default: 'waiting' 
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  codes: {
    type: Map,
    of: String,
    default: {}
  },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  problemData: { type: Object },
  startTime: { type: Date }
}, { timestamps: true });

// Delete rooms after 2 hours (7200 seconds)
roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

export default mongoose.model('Room', roomSchema);
