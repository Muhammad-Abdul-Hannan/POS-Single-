import Customer from '../models/Customer.js';
import CustomerPayment from '../models/CustomerPayment.js';
import GrindingLog from '../models/GrindingLog.js';
import Sale from '../models/Sale.js';

export async function listCustomers(req, res) {
  const customers = await Customer.find().sort({ name: 1 });
  res.json(customers);
}

export async function createCustomer(req, res) {
  const { name, phone, address } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const customer = await Customer.create({ name, phone, address });
  res.status(201).json(customer);
}

export async function updateCustomer(req, res) {
  const { name, phone, address } = req.body;
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  if (name !== undefined) customer.name = name;
  if (phone !== undefined) customer.phone = phone;
  if (address !== undefined) customer.address = address;
  await customer.save();
  res.json(customer);
}

export async function recordPayment(req, res) {
  const { amount, note } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number' });
  }

  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  customer.creditBalance = Math.max(0, customer.creditBalance - amount);
  await customer.save();

  const payment = await CustomerPayment.create({
    customer: customer._id,
    amount,
    note,
    recordedBy: req.user.id,
  });

  res.status(201).json({ customer, payment });
}

export async function listPayments(req, res) {
  const payments = await CustomerPayment.find({ customer: req.params.id }).sort({ date: -1 });
  res.json(payments);
}

export async function getLedger(req, res) {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  const [sales, grindingLogs] = await Promise.all([
    Sale.find({ customer: customer._id }).sort({ date: -1 }),
    GrindingLog.find({ customer: customer._id }).sort({ date: -1 }),
  ]);

  const transactions = [
    ...sales.map((s) => ({
      type: 'sale',
      id: s._id,
      date: s.date,
      invoiceNo: s.invoiceNo,
      items: s.items,
      totalAmount: s.totalAmount,
      amountPaid: s.amountPaid,
      paymentType: s.paymentType,
    })),
    ...grindingLogs.map((g) => ({
      type: 'grinding',
      id: g._id,
      date: g.date,
      quantityKg: g.quantityKg,
      ratePerKg: g.ratePerKg,
      address: g.address,
      totalAmount: g.amount,
      amountPaid: g.amountPaid,
      paymentType: g.paymentType,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ customer, transactions });
}
