import Supplier from '../models/Supplier.js';

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
