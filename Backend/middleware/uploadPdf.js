// middleware/uploadPdf.js
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(
        Object.assign(new Error("Only PDF files are allowed"), {
          badRequest: true,
        })
      );
    }
    cb(null, true);
  },
});

module.exports = upload;
