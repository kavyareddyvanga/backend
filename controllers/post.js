import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

// GET all posts (optionally by category)
export const getPosts = async (req, res) => {
  const q = req.query.cat ? "SELECT * FROM posts WHERE cat=?" : "SELECT * FROM posts";
  const params = req.query.cat ? [req.query.cat] : [];

  try {
    const posts = await req.db.all(q, params);
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET single post by id
export const getPost = async (req, res) => {
  const q = `
    SELECT p.id, u.username, p.title, p.desc, p.img,  p.cat, p.date 
    FROM users u 
    JOIN posts p ON u.id = p.uid 
    WHERE p.id = ?`;

  try {
    const post = await req.db.get(q, [req.params.id]);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ADD a new post
export const addPost = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, JWT_SECRET, async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { title, desc, img, cat } = req.body; // don't take uid from body
    const date = new Date().toISOString();

    const q = `
      INSERT INTO posts (title, desc, img, date, uid, cat)
      VALUES (?, ?, ?, ?, ?, ?)`;

    try {
      const result = await req.db.run(q, [title, desc, img, date, userInfo.id, cat]);
      res.status(201).json({ message: "Post created successfully", postId: result.lastID });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// DELETE a post
export const deletePost = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, JWT_SECRET, async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "DELETE FROM posts WHERE id = ? AND uid = ?";

    try {
      const result = await req.db.run(q, [postId, userInfo.id]);
      if (result.changes === 0) {
        return res.status(403).json("You can delete only your post!");
      }
      return res.json("Post has been deleted!");
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
};

// UPDATE a post
export const updatePost = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, JWT_SECRET, async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const { title, desc, img, cat } = req.body;

    try {
      // Fetch existing post
      const existingPost = await req.db.get("SELECT * FROM posts WHERE id = ? AND uid = ?", [postId, userInfo.id]);
      if (!existingPost) return res.status(403).json("You can update only your post!");

      // Use existing values if request fields are empty/null
      const updatedTitle = title || existingPost.title;
      const updatedDesc = desc || existingPost.desc;
      const updatedImg = img || existingPost.img;
      const updatedCat = cat || existingPost.cat;

      const q = `
        UPDATE posts
        SET title = ?, desc = ?, img = ?, cat = ?
        WHERE id = ? AND uid = ?`;

      await req.db.run(q, [updatedTitle, updatedDesc, updatedImg, updatedCat, postId, userInfo.id]);

      res.status(200).json({ message: "Post updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// GET all posts of the logged-in user
export const getUserPosts = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, JWT_SECRET, async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const q = `
        SELECT p.id, u.username, p.title, p.desc, p.img, p.cat, p.date 
        FROM posts p
        JOIN users u ON u.id = p.uid
        WHERE p.uid = ?`;
      const posts = await req.db.all(q, [userInfo.id]);

      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
