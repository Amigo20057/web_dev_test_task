import { Router } from 'express';
import {
  createOrderHandler,
  deleteOrdersHandler,
  getOrdersHandler,
  uploadCsvHandler,
} from './order.controller';
import multer from 'multer';

const orderRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

orderRouter.post('/', createOrderHandler);
orderRouter.get('/', getOrdersHandler);
orderRouter.post('/upload', upload.single('file'), uploadCsvHandler);
orderRouter.delete('/', deleteOrdersHandler);

export default orderRouter;
