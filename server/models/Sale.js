import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['kg', 'piece'], required: true },
    rate: { type: Number, required: true, min: 0 },
    costRate: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNo: { type: Number, required: true, unique: true },
    date: { type: Date, default: Date.now },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: { type: [saleItemSchema], required: true, validate: (v) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ['cash', 'credit'], required: true },
    amountPaid: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Sale', saleSchema);
