import Customer from '../models/Customer.js';
import GrindingLog from '../models/GrindingLog.js';
import { dateRangeFilter } from '../utils/dateRange.js';

export async function createGrindingLog(req, res) {
  const { customerName, phone, address, customerId, quantityKg, ratePerKg, paymentType, amountPaid } = req.body;
  const qty = Number(quantityKg);
  const rate = Number(ratePerKg);

  if (!qty || qty <= 0 || !rate || rate <= 0) {
    return res.status(400).json({ message: 'quantityKg and ratePerKg must be positive numbers' });
  }

  const type = paymentType === 'credit' ? 'credit' : 'cash';
  if (type === 'credit' && !customerId) {
    return res.status(400).json({ message: 'customerId is required for credit grinding entries' });
  }

  let customer = null;
  if (customerId) {
    customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
  }

  const amount = Number((qty * rate).toFixed(2));
  const paid = type === 'cash' ? amount : Number(amountPaid) || 0;
  if (paid > amount) {
    return res.status(400).json({ message: 'amountPaid cannot exceed amount' });
  }

  const log = await GrindingLog.create({
    customerName,
    phone,
    address,
    customer: customer?._id,
    quantityKg: qty,
    ratePerKg: rate,
    amount,
    paymentType: type,
    amountPaid: paid,
    cashier: req.user.id,
  });

  if (type === 'credit' && customer) {
    customer.creditBalance += amount - paid;
    await customer.save();
  }

  res.status(201).json(log);
}

export async function listGrindingLogs(req, res) {
  const { from, to, customerId } = req.query;
  const filter = dateRangeFilter(from, to);
  if (customerId) filter.customer = customerId;
  const logs = await GrindingLog.find(filter).populate('cashier', 'name').populate('customer', 'name phone').sort({ date: -1 });
  res.json(logs);
}
