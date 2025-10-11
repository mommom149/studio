import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// تأكد إن فولدر uploads موجود
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد multer لتخزين الملفات محليًا
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const app = express();
const PORT = 3000;

// API لرفع الملفات
app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ message: "File uploaded successfully", url: fileUrl });
});

// خدمة الملفات الاستاتيكية (serve uploaded files)
app.use("/uploads", express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
