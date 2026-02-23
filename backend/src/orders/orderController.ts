// backend/src/orders/orders.controller.ts
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import type { OrdersService } from './orderService';
import type { ImportError } from './orderService';

const router = express.Router();

// multer memory storage (зручно для PoC). Для великих файлів краще diskStorage.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

// Функція-обгортка для створення контролера з інжектованим сервісом
export function createOrdersController(service: OrdersService) {
  // POST /orders/import
  router.post(
    '/import',
    upload.single('file'), // expects field name 'file'
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: 'CSV file is required (field name: file)' });
        }

        const result = await service.importFromCSV(file);
        // Якщо є помилки, повертаємо їх у тілі, але статус 200 — успішна обробка частково
        return res.status(200).json({
          message: 'Import finished',
          processed: result.processed,
          saved: result.saved,
          errors: result.errors as ImportError[]
        });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}

export default createOrdersController;