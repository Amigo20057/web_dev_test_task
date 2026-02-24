import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './auth/auth.router';
import pool from './db/db';
import orderRouter from './orders/order.router';

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/orders', orderRouter);

const start = async () => {
  try {
    await pool.query('SELECT 1');
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
