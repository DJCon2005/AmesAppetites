const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/mongodb");
const auth = require("../middleware/auth");

const router = express.Router();

// GET all favorites for the logged-in user
router.get("/", auth, async (req, res, next) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    // Find favorite entries for this user
    const favorites = await db.collection("favorites").find({ userId: new ObjectId(userId) }).toArray();
    
    if (favorites.length === 0) {
      return res.status(200).json([]);
    }

    // Get the restaurant details for those favorites
    const restaurantIds = favorites.map(f => new ObjectId(f.restaurantId));
    const restaurants = await db.collection("restaurants").find({ _id: { $in: restaurantIds } }).toArray();

    res.status(200).json(restaurants);
  } catch (err) {
    next(err);
  }
});

// POST add a favorite
router.post("/", auth, async (req, res, next) => {
  try {
    const db = getDB();
    const userId = req.user.id;
    const { restaurantId } = req.body;

    if (!restaurantId || !ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        status: 400,
        message: "Valid restaurantId is required"
      });
    }

    // Check if restaurant exists
    const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId) });
    if (!restaurant) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found"
      });
    }

    // Check if already favorited
    const existing = await db.collection("favorites").findOne({
      userId: new ObjectId(userId),
      restaurantId: new ObjectId(restaurantId)
    });

    if (existing) {
      return res.status(409).json({
        status: 409,
        message: "Restaurant already in favorites"
      });
    }

    const newFavorite = {
      userId: new ObjectId(userId),
      restaurantId: new ObjectId(restaurantId),
      createdAt: new Date()
    };

    await db.collection("favorites").insertOne(newFavorite);

    res.status(201).json(newFavorite);
  } catch (err) {
    next(err);
  }
});

// DELETE remove a favorite
router.delete("/:restaurantId", auth, async (req, res, next) => {
  try {
    const db = getDB();
    const userId = req.user.id;
    const { restaurantId } = req.params;

    if (!ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        status: 400,
        message: "Valid restaurantId is required"
      });
    }

    const result = await db.collection("favorites").deleteOne({
      userId: new ObjectId(userId),
      restaurantId: new ObjectId(restaurantId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Favorite not found"
      });
    }

    res.status(200).json({
      status: 200,
      message: "Favorite removed"
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;