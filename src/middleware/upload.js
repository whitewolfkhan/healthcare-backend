const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const createStorage = (subfolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../uploads', subfolder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|dicom|dcm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/|application\/dicom/.test(file.mimetype);
  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, TXT and image files are allowed'));
  }
};

const uploadMedicalImage = multer({
  storage: createStorage('medical-images'),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadDocument = multer({
  storage: createStorage('documents'),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: documentFilter,
});

const uploadAvatar = multer({
  storage: createStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

module.exports = { uploadMedicalImage, uploadDocument, uploadAvatar };
