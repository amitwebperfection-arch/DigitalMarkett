import multer from 'multer';

const storage = multer.memoryStorage();

const allowedTypes = new Set([
  // ===== Images =====
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
  'image/tiff',
  'image/heic',
  'image/heif',
  'image/avif',

  // ===== Videos =====
  'video/mp4',
  'video/mpeg',
  'video/quicktime',        // .mov
  'video/x-msvideo',        // .avi
  'video/x-matroska',       // .mkv
  'video/webm',
  'video/3gpp',
  'video/ogg',

  // ===== Documents =====
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  // ===== Archives =====
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
  'application/x-rar-compressed',
  'application/vnd.rar',

  // ===== Generic fallback =====
  'application/octet-stream'
]);

const fileFilter = (req, file, cb) => {
  if (allowedTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationError =
      'Invalid file type. Only JPEG, PNG, ZIP, and PDF files are allowed.';
    cb(null, false); // ❗ error throw mat karo
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024 //1GB
  }
});
