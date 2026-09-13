import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { nextSequence } from '../models/Counter.js';
import { dateRangeFilter } from '../utils/dateRange.js';

export async function createSale(req, res) {
  const { items, customerId, paymentType, amountPaid } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one item is required' });
  }
  if (!['cash', 'credit'].includes(paymentType)) {
    return res.status(400).json({ message: 'paymentType must be cash or credit' });
  }
  if (paymentType === 'credit' && !customerId) {
    return res.status(400).json({ message: 'customerId is required for credit sales' });
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
    if (item.rate !== undefined && item.rate !== null && item.rate !== '') {
      const customRate = Number(item.rate);
      if (!customRate || customRate <= 0) {
        return res.status(400).json({ message: `Invalid custom price for ${product.name}` });
      }
      rate = customRate;
    }
    const subtotal = Number((rate * qty).toFixed(2));
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
  res.status(201).json(sale);
}

export async function listSales(req, res) {
  const { from, to, customerId } = req.query;
  const filter = dateRangeFilter(from, to);
  if (customerId) filter.customer = customerId;

  const sales = await Sale.find(filter).populate('customer', 'name phone').populate('cashier', 'name').sort({ date: -1 });
  res.json(sales);
}

export async function getSale(req, res) {
  const sale = await Sale.findById(req.params.id).populate('customer', 'name phone').populate('cashier', 'name');
  if (!sale) return res.status(404).json({ message: 'Sale not found' });
  res.json(sale);
}
