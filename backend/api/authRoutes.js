const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/mongodb");

const router = express.Router();

// SIGN UP
router.post("/signup", async (req, res, next) => {
  try {
    const db = getDB();
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 400,
        message: "Username and password are required",
      });
    }

    const existingUser = await db.collection("users").findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      password: hashedPassword,
      role: role || "user",
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    res.status(201).json({
      id: result.insertedId,
      username: newUser.username,
      role: newUser.role,
    });
  } catch (err) {
    next(err);
  }
});

// LOG IN
router.post("/login", async (req, res, next) => {
  try {
    const db = getDB();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 400,
        message: "Username and password are required",
      });
    }

    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Incorrect username or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        status: 401,
        message: "Incorrect username or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;