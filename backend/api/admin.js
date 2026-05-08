const express = require("express");
const { getDB } = require("../config/mongodb");
const auth = require("../middleware/auth");
const reqAdmin = require("../middleware/reqAdmin");

const router = express.Router();

router.get("/stats", auth, reqAdmin, async (req, res, next) => {
  try {
    const db = getDB();

    const [
      totalRestaurants,
      totalReviews,
      totalFavorites,
      totalUsers,
      recentReviews,
    ] = await Promise.all([
      db.collection("restaurants").countDocuments(),
      db.collection("reviews").countDocuments(),
      db.collection("favorites").countDocuments(),
      db.collection("users").countDocuments(),
      db
        .collection("reviews")
        .find()
        .sort({ createdAt: -1 })
        .limit(4)
        .toArray(),
    ]);

    const restaurantIds = recentReviews.map((review) => review.restaurantId);
    
    const restaurants = await db.collection("restaurants").find ({_id: {$in: restaurantIds}}).toArray();

    const restaurantMap = {};
    restaurantIds.forEach((restaurant) => {
      restaurantMap[restaurant._id.toString()] = restaurant.title;
    });

    const recentReviewsWithNames = recentReviews.map((reviews) => ({
      ...review, 
      restaurantName: restaurantMap[review.restaurantId?.toString()] || "No restaurant",
    }));
    
    res.status(200).json({
      totalRestaurants,
      totalReviews,
      totalFavorites,
      totalUsers,
      recentReviews: recentReviewsWithNames,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/recent-reviews", auth, reqAdmin, async (req, res, next) => {
  try {
    const db = getDB();

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const recentReviews = await db
      .collection("reviews")
      .find({ createdAt: { $gte: tenDaysAgo } })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(recentReviews);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
