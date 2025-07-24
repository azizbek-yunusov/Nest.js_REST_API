import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = (folder: string) => ({
  storage: diskStorage({
    destination: `./uploads/${folder}`,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
});
