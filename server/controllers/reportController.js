import Customer from '../models/Customer.js';
import Expense from '../models/Expense.js';
import GrindingLog from '../models/GrindingLog.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { dateRangeFilter } from '../utils/dateRange.js';

export async function getDashboardSummary(req, res) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [todaySalesAgg, todayGrindingAgg, customers, lowStockCount, monthSalesAgg, monthGrindingAgg, monthExpensesAgg] =
    await Promise.all([
      Sale.aggregate([{ $match: { date: { $gte: startOfToday } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      GrindingLog.aggregate([{ $match: { date: { $gte: startOfToday } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Customer.find().select('creditBalance'),
      Product.countDocuments({ $expr: { $and: [{ $gt: ['$lowStockThreshold', 0] }, { $lte: ['$stockQty', '$lowStockThreshold'] }] } }),
      Sale.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$items.subtotal' },
            cost: { $sum: { $multiply: ['$items.qty', '$items.costRate'] } },
          },
        },
      ]),
      GrindingLog.aggregate([{ $match: { date: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { date: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

  const todaySales = (todaySalesAgg[0]?.total || 0) + (todayGrindingAgg[0]?.total || 0);
  const outstandingUdhaar = customers.reduce((sum, c) => sum + c.creditBalance, 0);
  const monthRevenue = (monthSalesAgg[0]?.revenue || 0) + (monthGrindingAgg[0]?.total || 0);
  const monthCost = monthSalesAgg[0]?.cost || 0;
  const monthExpenses = monthExpensesAgg[0]?.total || 0;
  const monthProfit = monthRevenue - monthCost - monthExpenses;

  res.json({
    todaySales: Number(todaySales.toFixed(2)),
    outstandingUdhaar: Number(outstandingUdhaar.toFixed(2)),
    lowStockCount,
    monthProfit: Number(monthProfit.toFixed(2)),
  });
}

export async function getProfitLoss(req, res) {
  const { from, to } = req.query;
  const saleFilter = dateRangeFilter(from, to);

  const [salesAgg, grindingAgg, expensesAgg] = await Promise.all([
    Sale.aggregate([
      { $match: saleFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$items.subtotal' },
          cost: { $sum: { $multiply: ['$items.qty', '$items.costRate'] } },
        },
      },
    ]),
    GrindingLog.aggregate([{ $match: saleFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $match: saleFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  const goodsRevenue = salesAgg[0]?.revenue || 0;
  const costOfGoods = salesAgg[0]?.cost || 0;
  const grindingRevenue = grindingAgg[0]?.total || 0;
  const totalExpenses = expensesAgg[0]?.total || 0;
  const totalRevenue = goodsRevenue + grindingRevenue;
  const grossProfit = totalRevenue - costOfGoods;
  const netProfit = grossProfit - totalExpenses;

  res.json({
    goodsRevenue: Number(goodsRevenue.toFixed(2)),
    grindingRevenue: Number(grindingRevenue.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    costOfGoods: Number(costOfGoods.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
  });
}

export async function getDailySales(req, res) {
  const { from, to } = req.query;
  const filter = dateRangeFilter(from, to);

  const rows = await Sale.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(rows.map((r) => ({ date: r._id, total: Number(r.total.toFixed(2)) })));
}

export async function getTopProducts(req, res) {
  const { from, to, limit } = req.query;
  const filter = dateRangeFilter(from, to);

  const rows = await Sale.aggregate([
    { $match: filter },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        qtySold: { $sum: '$items.qty' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: Number(limit) || 10 },
  ]);

  res.json(rows.map((r) => ({ name: r.name, qtySold: r.qtySold, revenue: Number(r.revenue.toFixed(2)) })));
}

export async function getLowStock(req, res) {
  const products = await Product.find({
    $expr: { $and: [{ $gt: ['$lowStockThreshold', 0] }, { $lte: ['$stockQty', '$lowStockThreshold'] }] },
  }).sort({ stockQty: 1 });
  res.json(products);
}
