const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/mongodb");

const router = express.Router();

const auth = require("../middleware/auth");
const reqAdmin = require("../middleware/reqAdmin");

//create review
router.post("/", async (req, res, next) => {
  try {
    const db = getDB();
    const { restaurantId, rating, authorName, comment } = req.body;

    if (!restaurantId || !rating || !authorName) {
      return res.status(400).json({
        status: 400,
        message: "restaurantId, rating, and authorName are needed",
      });
    }

    if (!ObjectId.isValid(restaurantId)) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found",
      });
    }

    const restaurant = await db
      .collection("restaurants")
      .findOne({ _id: new ObjectId(restaurantId) });

    if (!restaurant) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found",
      });
    }

    const newReview = {
      restaurantId: new ObjectId(restaurantId),
      rating,
      authorName,
      comment: comment || " ",
      createdAt: new Date(),
    };

    await db.collection("reviews").insertOne(newReview);

    const allReviews = await db.collection("reviews").find({ restaurantId: new ObjectId(restaurantId) }).toArray();
    
    const totalReviews = allReviews.length;
    const sumRatings = allReviews.reduce((acc, rev) => acc + rev.rating, 0);
    const avgRating = sumRatings / totalReviews ;

    await db.collection("restaurants").updateOne(
      { _id: new ObjectId(restaurantId) },
      { $set: { averageRating: avgRating, ratingCount: totalReviews } }
    );

    res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
});

// find reviews for a restaurant
router.get("/:restaurantId", async (req, res, next) => {
  try {
    const db = getDB();
    const { restaurantId } = req.params;

    if (!ObjectId.isValid(restaurantId)) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found",
      });
    }

    const restaurant = await db
      .collection("restaurants")
      .findOne({ _id: new ObjectId(restaurantId) });

    if (!restaurant) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found",
      });
    }

    const reviews = await db
      .collection("reviews")
      .find({ restaurantId: new ObjectId(restaurantId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
});

// delete a review
router.delete("/:reviewId", auth, reqAdmin, async (req, res, next) => {
  try {
    if(!ObjectId.isValid(req.params.reviewId)) {
      return res.status(404).json({
        status: 404,
        message: "Review not found",
      });
    }

    const db = getDB();
    const id = new ObjectId(req.params.reviewId);

    const review = await db.collection("reviews").findOne({ _id: id });
    if (!review) {
      return res.status(404).json({ 
        status: 404,
        message: "Review not found", 
    });
    }

    await db.collection("reviews").deleteOne({ _id: id });

    const allReviews = await db.collection("reviews").find({ restaurantId: review.restaurantId }).toArray();
    
    const totalReviews = allReviews.length;
    const sumRatings = allReviews.reduce((acc, rev) => acc + rev.rating, 0);
    const avgRating = sumRatings / totalReviews ;

    await db.collection("restaurants").updateOne(
      { _id: review.restaurantId},
      { $set: { averageRating: avgRating, ratingCount: totalReviews } }
    );

    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
