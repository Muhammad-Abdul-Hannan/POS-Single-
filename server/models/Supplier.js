import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    balanceOwed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Supplier', supplierSchema);
