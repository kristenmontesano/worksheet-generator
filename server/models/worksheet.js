import mongoose from 'mongoose';

const worksheetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: Object,
    required: true,
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: String,
  grade: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

const Worksheet = mongoose.model('Worksheet', worksheetSchema);
export default Worksheet;
