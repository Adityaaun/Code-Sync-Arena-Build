import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'finished'], 
    default: 'waiting' 
  },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
