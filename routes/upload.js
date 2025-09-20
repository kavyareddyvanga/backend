import express from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import { Readable } from "stream";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const stream = cloudinary.uploader.upload_stream(
      { folder: "blog_posts" },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ secure_url: result.secure_url });
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(req.file.buffer);
    readable.push(null);
    readable.pipe(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
