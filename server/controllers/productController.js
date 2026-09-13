import Product from '../models/Product.js';

function serialize(product, isOwner) {
  const obj = product.toObject ? product.toObject() : product;
  if (!isOwner) {
    delete obj.costPricePerUnit;
  }
  return obj;
}

export async function listProducts(req, res) {
  const products = await Product.find().sort({ name: 1 });
  const isOwner = req.user.role === 'owner';
  res.json(products.map((p) => serialize(p, isOwner)));
}

export async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(serialize(product, req.user.role === 'owner'));
}

export async function createProduct(req, res) {
  const { name, category, unit, sellingPricePerUnit, costPricePerUnit, stockQty, lowStockThreshold } = req.body;
  if (!name || !category || !unit || sellingPricePerUnit == null || costPricePerUnit == null) {
    return res.status(400).json({ message: 'name, category, unit, sellingPricePerUnit, and costPricePerUnit are required' });
  }

  const product = await Product.create({
    name,
    category,
    unit,
    sellingPricePerUnit,
    costPricePerUnit,
    stockQty: stockQty || 0,
    lowStockThreshold: lowStockThreshold || 0,
  });

  res.status(201).json(product);
}

export async function updateProduct(req, res) {
  const { name, category, unit, sellingPricePerUnit, costPricePerUnit, lowStockThreshold } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (unit !== undefined) product.unit = unit;
  if (sellingPricePerUnit !== undefined) product.sellingPricePerUnit = sellingPricePerUnit;
  if (costPricePerUnit !== undefined) product.costPricePerUnit = costPricePerUnit;
  if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;

  await product.save();
  res.json(product);
}

export async function adjustStock(req, res) {
  const { delta, reason } = req.body;
  if (typeof delta !== 'number' || delta === 0) {
    return res.status(400).json({ message: 'delta (non-zero number) is required' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const newQty = product.stockQty + delta;
  if (newQty < 0) {
    return res.status(400).json({ message: 'Adjustment would result in negative stock' });
  }

  product.stockQty = newQty;
  await product.save();
  res.json({ product, reason: reason || null });
}

export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.status(204).send();
}
