import multer from 'multer';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix); //update later
    // cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 5 * 1024 * 1024, // 5MB in bytes
  },
});

export const localFileRemove = async (localFilePath) => {
  try {
    if (filePath) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Removed file: ${filePath}`);
    }
  } catch (error) {
    console.error(`⚠️ Failed to remove file: ${filePath}`, err.message);
  }
};
