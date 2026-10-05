import Purchase from '../models/Purchase.js';
import Supplier from '../models/Supplier.js';
import SupplierPayment from '../models/SupplierPayment.js';

export async function listSuppliers(req, res) {
  const suppliers = await Supplier.find().sort({ name: 1 });
  res.json(suppliers);
}

export async function createSupplier(req, res) {
  const { name, phone, address } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const supplier = await Supplier.create({ name, phone, address });
  res.status(201).json(supplier);
}

export async function updateSupplier(req, res) {
  const { name, phone, address } = req.body;
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  if (name !== undefined) supplier.name = name;
  if (phone !== undefined) supplier.phone = phone;
  if (address !== undefined) supplier.address = address;
  await supplier.save();
  res.json(supplier);
}

// Record a payment we made to the supplier, reducing what we owe them.
export async function recordPayment(req, res) {
  const { amount, note } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number' });
  }

  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

  supplier.balanceOwed = Math.max(0, supplier.balanceOwed - amount);
  await supplier.save();

  const payment = await SupplierPayment.create({
    supplier: supplier._id,
    amount,
    note,
    recordedBy: req.user.id,
  });

  res.status(201).json({ supplier, payment });
}

export async function listPayments(req, res) {
  const payments = await SupplierPayment.find({ supplier: req.params.id }).sort({ date: -1 });
  res.json(payments);
}

export async function getLedger(req, res) {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

  const purchases = await Purchase.find({ supplier: supplier._id }).sort({ date: -1 });

  res.json({ supplier, purchases });
}