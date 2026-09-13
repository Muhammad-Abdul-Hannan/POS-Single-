import Expense from '../models/Expense.js';
import { dateRangeFilter } from '../utils/dateRange.js';

export async function listExpenses(req, res) {
  const { from, to, category } = req.query;
  const filter = dateRangeFilter(from, to);
  if (category) filter.category = category;

  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json(expenses);
}

export async function createExpense(req, res) {
  const { category, amount, date, note } = req.body;
  if (!category || amount == null) {
    return res.status(400).json({ message: 'category and amount are required' });
  }
  const expense = await Expense.create({
    category,
    amount: Number(amount),
    date: date ? new Date(date) : undefined,
    note,
    recordedBy: req.user.id,
  });
  res.status(201).json(expense);
}

export async function deleteExpense(req, res) {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.status(204).send();
}
