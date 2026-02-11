import multer from 'multer';

const storage = multer.memoryStorage();

const allowedTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
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
    fileSize: 1024 * 1024 * 500 // 500MB
  }
});
