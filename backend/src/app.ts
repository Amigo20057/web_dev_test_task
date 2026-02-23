import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ordersRouter from './routes/orders.routes';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/orders', ordersRouter);

app.use(errorHandler);

export default app;