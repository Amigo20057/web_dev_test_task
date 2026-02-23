// backend/src/app.ts (приблизний приклад)
import express from 'express';
import createOrdersController from './orders/orderController';
import { OrdersService } from './orders/orderService';
import { StubTaxCalculator } from './orders/taxCalculator';

const app = express();
const taxCalc = new StubTaxCalculator();
const ordersService = new OrdersService(taxCalc /*, optional repo */);

app.use('/api/orders', createOrdersController(ordersService));

export default app;