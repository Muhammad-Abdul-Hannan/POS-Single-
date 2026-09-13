import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import grindingRoutes from './routes/grindingRoutes.js';
import productRoutes from './routes/productRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
  : true; // no CLIENT_ORIGIN set (e.g. local dev) -> allow any origin

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/grinding', grindingRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
