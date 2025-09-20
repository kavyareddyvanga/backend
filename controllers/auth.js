import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config.js";
export const register=async (req,res)=>{
    //check existing user
    const q="SELECT * FROM users WHERE email=? OR username=?";
    try {
    // req.db comes from your middleware in index.js
    const existingUser = await req.db.get(q, [req.body.email, req.body.username]);

    if (existingUser) {
        
        return res.status(409).json("User already exists!");
    }
    // If user doesn't exist, insert new user by encrypting the password
    
    const hashedPassword=await bcrypt.hash(req.body.password,10);

    
    const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    await req.db.run(insertQuery, [req.body.username, req.body.email, hashedPassword]);

    res.status(201).json("User registered successfully");
    } catch (err) {
        res.status(500).json(err.message);
    }
}

export const login= async(req,res)=>{
    //check existing user
    const q = "SELECT * FROM users WHERE username = ?";

    try {
        // db comes from your middleware (req.db)
        const user = await req.db.get(q, [req.body.username]);
        
        
        if (!user) {
            return res.status(404).json("User not found!");
        }
        //check password 
        const isPasswordMatched=await bcrypt.compare(req.body.password,user.password);

        // user exists, do something
        if(!isPasswordMatched){
            return res.status(400).json("Wrong username or password");
        }
        const {password,...other}=user;
        const payload={id:user.id}
        const jwtToken=jwt.sign(payload,JWT_SECRET)
        res.cookie("access_token",jwtToken,{
            httpOnly:true
        }).status(200).json(other)

    } 
    catch (err) {
        res.status(500).json(err.message);
    }
   
}

export const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: false,   // false on localhost
    sameSite: "lax", // "lax" works on localhost
  }).status(200).json("User has been logged out.");
};

