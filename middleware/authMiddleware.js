import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export const verifyUser = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Not authenticated!" });

  jwt.verify(token, JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json({ message: "Token is not valid!" });

    req.user = userInfo; // attach user info to request
    next();
  });
};
