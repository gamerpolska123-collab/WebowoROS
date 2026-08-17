import { Injectable, BadRequestException } from '@nestjs/common';
import * as multer from 'multer';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'products');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class UploadService {
  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch {
      // ignore
    }
  }

  getMulterOptions(): multer.Options {
    return {
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          callback(new Error(`Invalid file extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
          return;
        }
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIMETYPES.join(', ')}`), false);
        }
      },
    };
  }

  async processAndSaveImage(
    file: Express.Multer.File,
    productId: string,
  ): Promise<{ originalUrl: string; thumbnailUrl: string; webpUrl: string }> {
    await this.ensureUploadDir();

    const filename = `${productId}_${uuidv4()}`;
    const originalPath = path.join(UPLOAD_DIR, `${filename}_original.jpg`);
    const thumbnailPath = path.join(UPLOAD_DIR, `${filename}_thumb.jpg`);
    const webpPath = path.join(UPLOAD_DIR, `${filename}.webp`);

    // Save original (resized to max 1200px)
    await sharp(file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(originalPath);

    // Generate thumbnail (300x300)
    await sharp(file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Generate WebP (800px)
    await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);

    const baseUrl = process.env.UPLOAD_BASE_URL || '/uploads/products';

    return {
      originalUrl: `${baseUrl}/${path.basename(originalPath)}`,
      thumbnailUrl: `${baseUrl}/${path.basename(thumbnailPath)}`,
      webpUrl: `${baseUrl}/${path.basename(webpPath)}`,
    };
  }

  async deleteProductImages(productId: string): Promise<void> {
    try {
      const files = await fs.readdir(UPLOAD_DIR);
      const productFiles = files.filter((f) => f.startsWith(`${productId}_`));
      for (const file of productFiles) {
        await fs.unlink(path.join(UPLOAD_DIR, file));
      }
    } catch {
      // ignore
    }
  }
}
