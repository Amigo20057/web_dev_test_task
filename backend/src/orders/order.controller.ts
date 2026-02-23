import { NextFunction, Request, Response, Router } from "express";
import multer from 'multer';
import service from './order.service';

const router = Router();


// multer memory storage (зручно для PoC). Для великих файлів краще diskStorage.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

// Функція-обгортка для створення контролера з інжектованим сервісом
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
          errors: result.errors
        });
      } catch (err) {
        next(err);
      }
    }
  );



export const OrderController = router;
