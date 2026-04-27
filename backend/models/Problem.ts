import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: String, required: true, enum: ['array', 'string', 'dp', 'graph', 'math', 'stack', 'queue', 'linkedlist', 'recursion'] },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],
  starterCode: {
    javascript: String,
    python: String,
    cpp: String,
    java: String
  }
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
