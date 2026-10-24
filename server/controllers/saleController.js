import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { nextSequence } from '../models/Counter.js';
import { dateRangeFilter } from '../utils/dateRange.js';

// Owners get the profit of each sale (billed amount minus what the sold items cost us at the time).
// Everyone else gets the sale without the per-item cost, so staff can't see what stock cost.
function serializeSale(sale, isOwner) {
  const obj = sale.toObject ? sale.toObject() : sale;
  if (isOwner) {
    const cost = obj.items.reduce((sum, i) => sum + i.qty * (i.costRate || 0), 0);
    obj.profit = Number((obj.totalAmount - cost).toFixed(2));
  } else {
    obj.items = obj.items.map(({ costRate, ...rest }) => rest);
  }
  return obj;
}

export async function createSale(req, res) {
  const { items, customerId, paymentType, amountPaid, date } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one item is required' });
  }
  if (!['cash', 'credit'].includes(paymentType)) {
    return res.status(400).json({ message: 'paymentType must be cash or credit' });
  }
  if (paymentType === 'credit' && !customerId) {
    return res.status(400).json({ message: 'customerId is required for credit sales' });
  }

  // Sale date: defaults to now. Only the owner may record a sale for a past date (never a future one).
  let saleDate = new Date();
  if (date) {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can record a sale for a past date' });
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return res.status(400).json({ message: 'Invalid sale date' });
    if (parsed.getTime() > Date.now() + 5 * 60 * 1000) {
      return res.status(400).json({ message: 'Sale date cannot be in the future' });
    }
    saleDate = parsed;
  }

  const resolvedItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ message: `Product not found: ${item.productId}` });
    }
    const qty = Number(item.qty);
    if (!qty || qty <= 0) {
      return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
    }
    if (product.stockQty < qty) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name} (have ${product.stockQty} ${product.unit})` });
    }

    let rate = product.sellingPricePerUnit;
    let subtotal;
    if (item.lineTotal !== undefined && item.lineTotal !== null && item.lineTotal !== '') {
      // Lump-sum pricing (e.g. 12 items for Rs. 900): the exact total is the subtotal,
      // and the per-unit rate is derived from it so reports/revenue stay exact.
      const lineTotal = Number(item.lineTotal);
      if (!lineTotal || lineTotal <= 0) {
        return res.status(400).json({ message: `Invalid total price for ${product.name}` });
      }
      subtotal = Number(lineTotal.toFixed(2));
      rate = Number((subtotal / qty).toFixed(4));
    } else {
      if (item.rate !== undefined && item.rate !== null && item.rate !== '') {
        const customRate = Number(item.rate);
        if (!customRate || customRate <= 0) {
          return res.status(400).json({ message: `Invalid custom price for ${product.name}` });
        }
        rate = customRate;
      }
      subtotal = Number((rate * qty).toFixed(2));
    }
    totalAmount += subtotal;

    resolvedItems.push({
      product: product._id,
      name: product.name,
      qty,
      unit: product.unit,
      rate,
      costRate: product.costPricePerUnit,
      subtotal,
    });
  }
  totalAmount = Number(totalAmount.toFixed(2));

  const paid = paymentType === 'cash' ? totalAmount : Number(amountPaid) || 0;
  if (paid > totalAmount) {
    return res.status(400).json({ message: 'amountPaid cannot exceed totalAmount' });
  }

  let customer = null;
  if (customerId) {
    customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
  }

  // Deduct stock
  for (const item of resolvedItems) {
    await Product.updateOne({ _id: item.product }, { $inc: { stockQty: -item.qty } });
  }

  const invoiceNo = await nextSequence('invoiceNo');

  const sale = await Sale.create({
    invoiceNo,
    date: saleDate,
    cashier: req.user.id,
    customer: customer?._id,
    items: resolvedItems,
    totalAmount,
    paymentType,
    amountPaid: paid,
  });

  if (paymentType === 'credit' && customer) {
    const due = totalAmount - paid;
    customer.creditBalance += due;
    await customer.save();
  }

  await sale.populate('customer', 'name phone');
  res.status(201).json(serializeSale(sale, req.user.role === 'owner'));
}

export async function listSales(req, res) {
  const { from, to, customerId } = req.query;
  const filter = dateRangeFilter(from, to);
  if (customerId) filter.customer = customerId;

  const sales = await Sale.find(filter).populate('customer', 'name phone').populate('cashier', 'name').sort({ date: -1 });
  const isOwner = req.user.role === 'owner';
  res.json(sales.map((sale) => serializeSale(sale, isOwner)));
}

export async function getSale(req, res) {
  const sale = await Sale.findById(req.params.id).populate('customer', 'name phone').populate('cashier', 'name');
  if (!sale) return res.status(404).json({ message: 'Sale not found' });
  res.json(serializeSale(sale, req.user.role === 'owner'));
}