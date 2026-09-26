import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['plastic', 'steel', 'toy', 'jewellery', 'grocery', 'aata', 'other'], required: true },
    unit: { type: String, enum: ['piece', 'kg'], required: true },
    sellingPricePerUnit: { type: Number, required: true, min: 0 },
    costPricePerUnit: { type: Number, required: true, min: 0 },
    stockQty: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
