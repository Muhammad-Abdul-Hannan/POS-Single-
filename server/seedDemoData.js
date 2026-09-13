// One-off script to populate the database with realistic demo data for a
// Pakistani Karyana + Aata Chakki shop: products, customers, suppliers,
// sales, grinding logs, purchases, and expenses.
//
// Safe to re-run: if products already exist, it skips bulk-seeding (so you
// don't end up with duplicates) but still ensures the owner account exists
// with the configured credentials.
//
// Usage: npm run seed:demo   (from the server/ directory)

import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { nextSequence } from './models/Counter.js';
import Customer from './models/Customer.js';
import CustomerPayment from './models/CustomerPayment.js';
import Expense from './models/Expense.js';
import GrindingLog from './models/GrindingLog.js';
import Product from './models/Product.js';
import Purchase from './models/Purchase.js';
import Sale from './models/Sale.js';
import Supplier from './models/Supplier.js';
import User from './models/User.js';

const OWNER = {
  name: 'Muhammad Abdul Hannan',
  username: 'hannanryk2@gmail.com',
  password: 'mahannan121',
};

function daysAgo(n, hour = 12) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

async function ensureOwner() {
  const passwordHash = await bcrypt.hash(OWNER.password, 10);
  const owner = await User.findOneAndUpdate(
    { username: OWNER.username.toLowerCase() },
    { name: OWNER.name, username: OWNER.username.toLowerCase(), passwordHash, role: 'owner', active: true },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  console.log(`Owner account ready: ${owner.username} / ${OWNER.password}`);
  return owner;
}

async function seedProducts() {
  const products = [
    // Aata Chakki
    { name: 'Aata (Loose)', category: 'aata', unit: 'kg', sellingPricePerUnit: 170, costPricePerUnit: 150, stockQty: 300, lowStockThreshold: 30 },
    { name: 'Fine Chakki Atta (Bagged)', category: 'aata', unit: 'kg', sellingPricePerUnit: 185, costPricePerUnit: 165, stockQty: 150, lowStockThreshold: 15 },

    // Karyana - staples
    { name: 'Basmati Rice Super', category: 'grocery', unit: 'kg', sellingPricePerUnit: 320, costPricePerUnit: 280, stockQty: 120, lowStockThreshold: 15 },
    { name: 'Sella Rice', category: 'grocery', unit: 'kg', sellingPricePerUnit: 260, costPricePerUnit: 230, stockQty: 100, lowStockThreshold: 15 },
    { name: 'Sugar (Cheeni)', category: 'grocery', unit: 'kg', sellingPricePerUnit: 155, costPricePerUnit: 140, stockQty: 150, lowStockThreshold: 20 },
    { name: 'Maida', category: 'grocery', unit: 'kg', sellingPricePerUnit: 160, costPricePerUnit: 145, stockQty: 60, lowStockThreshold: 10 },
    { name: 'Besan (Gram Flour)', category: 'grocery', unit: 'kg', sellingPricePerUnit: 260, costPricePerUnit: 235, stockQty: 45, lowStockThreshold: 8 },
    { name: 'Sooji (Semolina)', category: 'grocery', unit: 'kg', sellingPricePerUnit: 190, costPricePerUnit: 170, stockQty: 40, lowStockThreshold: 8 },

    // Daals
    { name: 'Masoor Daal', category: 'grocery', unit: 'kg', sellingPricePerUnit: 280, costPricePerUnit: 250, stockQty: 60, lowStockThreshold: 10 },
    { name: 'Chana Daal', category: 'grocery', unit: 'kg', sellingPricePerUnit: 260, costPricePerUnit: 230, stockQty: 55, lowStockThreshold: 10 },
    { name: 'Moong Daal', category: 'grocery', unit: 'kg', sellingPricePerUnit: 300, costPricePerUnit: 270, stockQty: 45, lowStockThreshold: 8 },
    { name: 'Mash Daal', category: 'grocery', unit: 'kg', sellingPricePerUnit: 340, costPricePerUnit: 305, stockQty: 30, lowStockThreshold: 6 },

    // Cooking essentials
    { name: 'Cooking Oil - Dalda (1L)', category: 'grocery', unit: 'piece', sellingPricePerUnit: 650, costPricePerUnit: 600, stockQty: 48, lowStockThreshold: 6 },
    { name: 'Banaspati Ghee - Habib (1kg)', category: 'grocery', unit: 'piece', sellingPricePerUnit: 700, costPricePerUnit: 650, stockQty: 30, lowStockThreshold: 5 },
    { name: 'Namak (Salt)', category: 'grocery', unit: 'kg', sellingPricePerUnit: 40, costPricePerUnit: 30, stockQty: 100, lowStockThreshold: 15 },
    { name: 'Haldi Powder (Turmeric)', category: 'grocery', unit: 'kg', sellingPricePerUnit: 520, costPricePerUnit: 470, stockQty: 20, lowStockThreshold: 4 },
    { name: 'Lal Mirch Powder (Red Chili)', category: 'grocery', unit: 'kg', sellingPricePerUnit: 620, costPricePerUnit: 560, stockQty: 20, lowStockThreshold: 4 },

    // Packaged goods
    { name: 'Lipton Yellow Label Tea (475g)', category: 'grocery', unit: 'piece', sellingPricePerUnit: 950, costPricePerUnit: 880, stockQty: 25, lowStockThreshold: 5 },
    { name: 'Tapal Danedar Tea (190g)', category: 'grocery', unit: 'piece', sellingPricePerUnit: 420, costPricePerUnit: 385, stockQty: 30, lowStockThreshold: 5 },
    { name: 'Nido Milk Powder (900g)', category: 'grocery', unit: 'piece', sellingPricePerUnit: 1450, costPricePerUnit: 1380, stockQty: 15, lowStockThreshold: 3 },
    { name: 'Surf Excel Detergent (1kg)', category: 'grocery', unit: 'piece', sellingPricePerUnit: 480, costPricePerUnit: 440, stockQty: 30, lowStockThreshold: 5 },
    { name: 'Lifebuoy Soap', category: 'grocery', unit: 'piece', sellingPricePerUnit: 75, costPricePerUnit: 65, stockQty: 100, lowStockThreshold: 20 },
    { name: 'Sooper Biscuits', category: 'grocery', unit: 'piece', sellingPricePerUnit: 60, costPricePerUnit: 50, stockQty: 80, lowStockThreshold: 15 },
    { name: 'Matchbox', category: 'grocery', unit: 'piece', sellingPricePerUnit: 10, costPricePerUnit: 7, stockQty: 200, lowStockThreshold: 30 },
  ];

  return Product.insertMany(products);
}

async function seedCustomers() {
  const customers = [
    { name: 'Ali Raza', phone: '03001234567', address: 'Street 5, Model Town, Lahore' },
    { name: 'Bilal Ahmed', phone: '03007654321', address: 'Chah Miran Shah, Faisalabad' },
    { name: 'Sana Tariq', phone: '03211112233', address: 'Gulshan-e-Iqbal, Karachi' },
    { name: 'Usman Malik', phone: '03334445566', address: 'Satellite Town, Rawalpindi' },
    { name: 'Farah Naz', phone: '03451234567', address: 'Township, Lahore' },
  ];
  return Customer.insertMany(customers);
}

async function seedSuppliers() {
  const suppliers = [
    { name: 'Al-Fateh Distributors', phone: '04212345678', address: 'Wholesale Market, Lahore' },
    { name: 'Punjab Grain Traders', phone: '04298765432', address: 'Grain Market, Faisalabad' },
    { name: 'National Foods Distributor', phone: '02133445566', address: 'Karachi' },
  ];
  return Supplier.insertMany(suppliers);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedSales({ products, customers, ownerId }) {
  const customerCreditDelta = new Map();

  for (let i = 0; i < 18; i++) {
    const numItems = randInt(1, 3);
    const chosen = new Set();
    while (chosen.size < numItems) chosen.add(pick(products));

    const items = [];
    let totalAmount = 0;
    for (const product of chosen) {
      const qty = Number(randInt(1, product.unit === 'kg' ? 5 : 3).toFixed(2));
      const rate = product.sellingPricePerUnit;
      const subtotal = Number((qty * rate).toFixed(2));
      totalAmount += subtotal;
      items.push({
        product: product._id,
        name: product.name,
        qty,
        unit: product.unit,
        rate,
        costRate: product.costPricePerUnit,
        subtotal,
      });
      await Product.updateOne({ _id: product._id }, { $inc: { stockQty: -qty } });
    }
    totalAmount = Number(totalAmount.toFixed(2));

    const isCredit = Math.random() < 0.35;
    const customer = isCredit ? pick(customers) : null;
    const amountPaid = isCredit ? Number((totalAmount * randInt(0, 70) / 100).toFixed(2)) : totalAmount;

    const invoiceNo = await nextSequence('invoiceNo');
    await Sale.create({
      invoiceNo,
      date: daysAgo(randInt(0, 13), randInt(9, 20)),
      cashier: ownerId,
      customer: customer?._id,
      items,
      totalAmount,
      paymentType: isCredit ? 'credit' : 'cash',
      amountPaid,
    });

    if (isCredit && customer) {
      const due = totalAmount - amountPaid;
      customerCreditDelta.set(String(customer._id), (customerCreditDelta.get(String(customer._id)) || 0) + due);
    }
  }

  for (const [customerId, delta] of customerCreditDelta) {
    await Customer.updateOne({ _id: customerId }, { $inc: { creditBalance: delta } });
  }
}

async function seedGrindingLogs({ customers, ownerId }) {
  const walkInNames = ['Farmer Yousuf', 'Chaudhry Riaz', 'Nazia Bibi', 'Iqbal Hussain'];

  for (let i = 0; i < 8; i++) {
    const quantityKg = randInt(5, 40);
    const ratePerKg = 8;
    const amount = Number((quantityKg * ratePerKg).toFixed(2));
    const isCredit = Math.random() < 0.3;
    const customer = isCredit ? pick(customers) : null;
    const amountPaid = isCredit ? Number((amount * randInt(0, 50) / 100).toFixed(2)) : amount;

    await GrindingLog.create({
      customerName: customer?.name || pick(walkInNames),
      phone: customer?.phone,
      address: customer?.address,
      customer: customer?._id,
      quantityKg,
      ratePerKg,
      amount,
      paymentType: isCredit ? 'credit' : 'cash',
      amountPaid,
      date: daysAgo(randInt(0, 13), randInt(9, 20)),
      cashier: ownerId,
    });

    if (isCredit && customer) {
      await Customer.updateOne({ _id: customer._id }, { $inc: { creditBalance: amount - amountPaid } });
    }
  }
}

async function seedPayment(customers) {
  const customer = customers[0];
  const fresh = await Customer.findById(customer._id);
  if (fresh.creditBalance <= 0) return;

  const paymentAmount = Number((fresh.creditBalance * 0.4).toFixed(2));
  await Customer.updateOne({ _id: customer._id }, { $inc: { creditBalance: -paymentAmount } });
  await CustomerPayment.create({
    customer: customer._id,
    amount: paymentAmount,
    date: daysAgo(2),
    note: 'Partial payment received',
  });
}

async function seedPurchases({ products, suppliers, ownerId }) {
  for (let i = 0; i < 5; i++) {
    const supplier = pick(suppliers);
    const numItems = randInt(1, 3);
    const chosen = new Set();
    while (chosen.size < numItems) chosen.add(pick(products));

    const items = [];
    let totalCost = 0;
    for (const product of chosen) {
      const qty = randInt(10, 50);
      const costPrice = product.costPricePerUnit;
      totalCost += qty * costPrice;
      items.push({ product: product._id, name: product.name, qty, costPrice });
      await Product.updateOne({ _id: product._id }, { $inc: { stockQty: qty } });
    }
    totalCost = Number(totalCost.toFixed(2));
    const amountPaid = Number((totalCost * randInt(40, 100) / 100).toFixed(2));

    await Purchase.create({
      supplier: supplier._id,
      date: daysAgo(randInt(3, 20)),
      items,
      totalCost,
      amountPaid,
      recordedBy: ownerId,
    });

    const due = totalCost - amountPaid;
    if (due > 0) {
      await Supplier.updateOne({ _id: supplier._id }, { $inc: { balanceOwed: due } });
    }
  }
}

async function seedExpenses(ownerId) {
  const expenses = [
    { category: 'electricity', amount: 8500, note: 'Monthly electricity bill', date: daysAgo(10) },
    { category: 'rent', amount: 25000, note: 'Shop rent', date: daysAgo(15) },
    { category: 'wages', amount: 18000, note: 'Staff salary', date: daysAgo(5) },
    { category: 'maintenance', amount: 3200, note: 'Chakki motor repair', date: daysAgo(7) },
    { category: 'misc', amount: 1500, note: 'Cleaning supplies', date: daysAgo(2) },
  ];
  await Expense.insertMany(expenses.map((e) => ({ ...e, recordedBy: ownerId })));
}

async function run() {
  await connectDB();

  const owner = await ensureOwner();

  const existingProducts = await Product.countDocuments();
  if (existingProducts > 0) {
    console.log(`Database already has ${existingProducts} products — skipping bulk demo-data seed.`);
    console.log('(Delete existing data first if you want a fresh demo dataset.)');
    process.exit(0);
  }

  console.log('Seeding products...');
  const products = await seedProducts();

  console.log('Seeding customers...');
  const customers = await seedCustomers();

  console.log('Seeding suppliers...');
  const suppliers = await seedSuppliers();

  console.log('Seeding sales...');
  await seedSales({ products, customers, ownerId: owner._id });

  console.log('Seeding grinding logs...');
  await seedGrindingLogs({ customers, ownerId: owner._id });

  console.log('Seeding a customer payment...');
  await seedPayment(customers);

  console.log('Seeding purchases...');
  await seedPurchases({ products, suppliers, ownerId: owner._id });

  console.log('Seeding expenses...');
  await seedExpenses(owner._id);

  console.log('\nDone. Log in with:');
  console.log(`  username: ${OWNER.username}`);
  console.log(`  password: ${OWNER.password}`);

  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
