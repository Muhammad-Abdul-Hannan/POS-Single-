import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    creditBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Customer', customerSchema);
