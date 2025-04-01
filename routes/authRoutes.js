const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
//dkdj

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.post("/register", async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Log the username and password for debugging
      console.log("Received username and password:", username, password);
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user object
      const newUser = new User({ username, password: hashedPassword });
  
      // Log the user object before saving
      console.log("Saving new user:", newUser);
  
      // Save the new user to the database
      await newUser.save();
  
      // Success log
      console.log("User registered successfully");
  
      // Send success response
      res.json({ message: "User registered successfully" });
    } catch (error) {
      // Log the error
      console.error("Error details: ", error);
  
      // Send error response
      res.status(500).json({ error: "Error registeringggg user", details: error.message });
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

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

module.exports = router;
