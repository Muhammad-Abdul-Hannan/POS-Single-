import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import Supplier from '../models/Supplier.js';

export async function createPurchase(req, res) {
  const { supplierId, items, amountPaid } = req.body;

  if (!supplierId) return res.status(400).json({ message: 'supplierId is required' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one item is required' });
  }

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

  const resolvedItems = [];
  let totalCost = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
    const qty = Number(item.qty);
    const costPrice = Number(item.costPrice);
    if (!qty || qty <= 0) return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
    if (costPrice == null || costPrice < 0) return res.status(400).json({ message: `Invalid cost price for ${product.name}` });

    resolvedItems.push({ product: product._id, name: product.name, qty, costPrice });
    totalCost += qty * costPrice;
  }
  totalCost = Number(totalCost.toFixed(2));

  const paid = Number(amountPaid) || 0;
  if (paid > totalCost) return res.status(400).json({ message: 'amountPaid cannot exceed totalCost' });

  for (const item of resolvedItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stockQty: item.qty }, $set: { costPricePerUnit: item.costPrice } }
    );
  }

  const purchase = await Purchase.create({
    supplier: supplier._id,
    items: resolvedItems,
    totalCost,
    amountPaid: paid,
    recordedBy: req.user.id,
  });

  const due = totalCost - paid;
  if (due > 0) {
    supplier.balanceOwed += due;
    await supplier.save();
  }

  res.status(201).json(purchase);
}

export async function listPurchases(req, res) {
  const purchases = await Purchase.find().populate('supplier', 'name phone').sort({ date: -1 });
  res.json(purchases);
}
