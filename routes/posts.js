import express from "express";
import { verifyUser } from "../middleware/authMiddleware.js";
import { addPost, updatePost, deletePost, getPosts, getPost, getUserPosts } from "../controllers/post.js";

const router = express.Router();

// Public routes (anyone can view)
router.get("/", getPosts);
router.get("/myposts", verifyUser, getUserPosts); 
router.get("/:id", getPost);

// Protected routes (require login)
router.post("/", verifyUser, addPost);          // only logged-in users can add
router.put("/:id",verifyUser, updatePost);    // only owner can update
router.delete("/:id",verifyUser,  deletePost);// only owner can delete


export default router;
