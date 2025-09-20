import express from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import multer from "multer";

import postRoutes from "./routes/posts.js";
import authRoutes from "./routes/auth.js";





const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Allow requests from frontend
app.use(
  cors({
    origin: "http://localhost:3001", // frontend dev URL (React default)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ------------------- FILE UPLOAD CONFIG -------------------

// Save uploads inside backend/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  // return the file URL
  res.status(200).json(`/uploads/${file.filename}`);
});

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// ------------------- DATABASE SETUP -------------------

const dbPath = path.join(path.resolve(), "blogs.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Connected to SQLite DB ✅");

    await db.run("PRAGMA foreign_keys = ON");

    // Attach db to every request
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    // Routes
    app.use("/api/posts", postRoutes);
    app.use("/api/auth", authRoutes);
    
    

    app.listen(3000, () => {
      console.log("🚀 Server running at http://localhost:3000");
    });
  } catch (e) {
    console.error(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
