import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './auth/auth.router';
import { OrderController } from './orders/order.controller';
import pool from './db/db';

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/api/orders', OrderController);

const start = async () => {
  try {
    await pool.query('SELECT 1'); // перевірка з'єднання
    console.log('Database connected');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
};

start();

export default app;