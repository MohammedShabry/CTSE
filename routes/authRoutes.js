const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching profile" });
  }
});

function authenticateToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied" });
  
    console.log("Token received:", token); // Check the token received in the request
  
    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
      if (err) {
        console.log("Error verifying token:", err);  // Log the verification error
        return res.status(403).json({ error: "Invalid token" });
      }
  
      console.log("Decoded user:", user);  // Check the decoded user info
      req.user = user;
      next();
    });
  }
  

module.exports = router;
