import dotenv from "dotenv";
dotenv.config({ path: "dotenv.env" }); // Load environment variables

import express from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import cors from "cors";
import cookieParser from "cookie-parser";

import postRoutes from "./routes/posts.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js"; // Cloudinary upload route

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Allow requests from frontend
app.use(
  cors({
    origin: "http://localhost:3001", // frontend dev URL (React)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ------------------- DATABASE SETUP -------------------

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

    // Attach db to every request
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    // ------------------- ROUTES -------------------
    app.use("/api/posts", postRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/upload", uploadRoutes); // Cloudinary uploads
  

    // ------------------- START SERVER -------------------
    app.listen(3000, () => {
      console.log("🚀 Server running at http://localhost:3000");
    });
  } catch (err) {
    console.error(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
