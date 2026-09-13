import mongoose from 'mongoose';

const grindingLogSchema = new mongoose.Schema(
  {
    customerName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    quantityKg: { type: Number, required: true, min: 0 },
    ratePerKg: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ['cash', 'credit'], default: 'cash' },
    amountPaid: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('GrindingLog', grindingLogSchema);
