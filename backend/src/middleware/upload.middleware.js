const multer = require('multer');
const path = require('path');
const fs = require('fs');
const directory = path.resolve(process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(directory, { recursive: true });
const storage = multer.diskStorage({ destination: directory, filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).toLowerCase()}`) });
const upload = multer({ storage, limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024 }, fileFilter: (_, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) });
module.exports = { upload };
