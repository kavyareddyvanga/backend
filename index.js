import dotenv from "dotenv";
dotenv.config({ path: "dotenv.env" });

import express from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import cors from "cors";
import cookieParser from "cookie-parser";

import postRoutes from "./routes/posts.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ------------------- CORS -------------------
const allowedOrigins = [
  "http://localhost:3001", // dev frontend
  "https://mitt-arv-blog-frontend.vercel.app", // deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);


// ------------------- DATABASE -------------------
const dbPath = "blogs.db";
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Connected to SQLite DB ✅");

    await db.run("PRAGMA foreign_keys = ON");

    // Attach DB to every request
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    // ------------------- ROUTES -------------------
    app.use("/api/posts", postRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/upload", uploadRoutes);

    // ------------------- START SERVER -------------------
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
