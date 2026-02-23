// backend/src/app.ts (приблизний приклад)
import express from 'express';

import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { OrderController } from './orders/order.controller';
import 'dotenv/config';

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/orders', OrderController);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

