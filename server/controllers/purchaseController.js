import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import Supplier from '../models/Supplier.js';
import { allocateExtraExpense } from '../utils/landedCost.js';

const PRODUCT_CATEGORIES = ['plastic', 'steel', 'toy', 'jewellery', 'grocery', 'aata', 'other'];
const PRODUCT_UNITS = ['piece', 'kg'];

export async function createPurchase(req, res) {
  const { supplierId, items, amountPaid, date, extraExpense, extraExpenseNote } = req.body;

  if (!supplierId) return res.status(400).json({ message: 'supplierId is required' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one item is required' });
  }

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

  // Purchase date: defaults to now, but can be a past date (not a future one).
  let purchaseDate = new Date();
  if (date) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return res.status(400).json({ message: 'Invalid purchase date' });
    if (parsed.getTime() > Date.now() + 5 * 60 * 1000) {
      return res.status(400).json({ message: 'Purchase date cannot be in the future' });
    }
    purchaseDate = parsed;
  }

  const extra = extraExpense === undefined || extraExpense === null || extraExpense === '' ? 0 : Number(extraExpense);
  if (Number.isNaN(extra) || extra < 0) {
    return res.status(400).json({ message: 'Extra expense must be zero or more' });
  }

  // Pass 1: validate every item and resolve/prepare it, without writing anything to
  // the DB yet. Items can reference an existing product (productId) or describe a
  // brand-new one to create inline (newProduct).
  const prepared = [];
  const newNamesInBatch = new Set();
  let totalCost = 0;

  for (const item of items) {
    const qty = Number(item.qty);
    const costPrice = Number(item.costPrice);
    if (!qty || qty <= 0) return res.status(400).json({ message: 'Enter a valid quantity for every item' });
    if (costPrice == null || Number.isNaN(costPrice) || costPrice < 0) {
      return res.status(400).json({ message: 'Enter a valid cost price for every item' });
    }

    if (item.productId) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
      prepared.push({ kind: 'existing', product, qty, costPrice });
    } else if (item.newProduct) {
      const { name, category, unit, sellingPricePerUnit, lowStockThreshold } = item.newProduct;
      const trimmedName = (name || '').trim();
      if (!trimmedName || !category || !unit || sellingPricePerUnit == null) {
        return res.status(400).json({ message: 'New product needs a name, category, unit, and selling price' });
      }
      if (!PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: `Invalid category: ${category}` });
      }
      if (!PRODUCT_UNITS.includes(unit)) {
        return res.status(400).json({ message: `Invalid unit: ${unit}` });
      }
      const sellingPrice = Number(sellingPricePerUnit);
      if (Number.isNaN(sellingPrice) || sellingPrice < 0) {
        return res.status(400).json({ message: `Invalid selling price for ${trimmedName}` });
      }
      const key = trimmedName.toLowerCase();
      if (newNamesInBatch.has(key)) {
        return res.status(400).json({ message: `"${trimmedName}" is listed more than once as a new product` });
      }
      newNamesInBatch.add(key);
      const existing = await Product.findOne({ name: trimmedName });
      if (existing) {
        return res.status(400).json({ message: `A product named "${trimmedName}" already exists — select it instead of adding it as new` });
      }
      prepared.push({
        kind: 'new',
        newProduct: {
          name: trimmedName,
          category,
          unit,
          sellingPricePerUnit: sellingPrice,
          costPricePerUnit: costPrice,
          stockQty: 0,
          lowStockThreshold: Number(lowStockThreshold) || 0,
        },
        qty,
        costPrice,
      });
    } else {
      return res.status(400).json({ message: 'Each item needs a productId or new product details' });
    }

    totalCost += qty * costPrice;
  }
  totalCost = Number(totalCost.toFixed(2));

  const paid = Number(amountPaid) || 0;
  if (paid > totalCost) return res.status(400).json({ message: 'amountPaid cannot exceed totalCost' });

  // Real cost per unit = supplier cost + this line's share of the extra expense.
  const allocations = allocateExtraExpense(prepared, extra);

  // Pass 2: nothing above touched the DB (besides read-only lookups), so it's now
  // safe to create the new products and proceed exactly as before.
  const resolvedItems = [];
  for (const [index, entry] of prepared.entries()) {
    const product = entry.kind === 'new' ? await Product.create(entry.newProduct) : entry.product;
    resolvedItems.push({
      product: product._id,
      name: product.name,
      qty: entry.qty,
      costPrice: entry.costPrice,
      extraCost: allocations[index].extraCost,
      landedCostPrice: allocations[index].landedCostPrice,
    });
  }

  for (const item of resolvedItems) {
    const update = { $inc: { stockQty: item.qty, totalPurchasedQty: item.qty } };
    // The product's cost (used for profit on future sales) follows the most recent purchase.
    // A back-dated entry must not overwrite the cost from a newer purchase.
    const hasNewerPurchase = await Purchase.exists({ 'items.product': item.product, date: { $gt: purchaseDate } });
    if (!hasNewerPurchase) update.$set = { costPricePerUnit: item.landedCostPrice };
    await Product.updateOne({ _id: item.product }, update);
  }

  const purchase = await Purchase.create({
    supplier: supplier._id,
    date: purchaseDate,
    items: resolvedItems,
    totalCost,
    amountPaid: paid,
    extraExpense: Number(extra.toFixed(2)),
    extraExpenseNote: typeof extraExpenseNote === 'string' ? extraExpenseNote.trim() : undefined,
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