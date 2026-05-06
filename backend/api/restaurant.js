const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/mongodb");
// const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// GET all restaurants
router.get("/", async (req, res, next) => {
  try {
    const db = getDB();
    const { search = "", city, category, categories, price } = req.query;
    const selectedCategory = category || categories;

    const query = { isActive: { $ne: false } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (city) query.city = city;
    if (selectedCategory) query.categories = { $in: Array.isArray(selectedCategory) ? selectedCategory : [selectedCategory] };
    if (price) query.price = price;

    const restaurants = await db
      .collection("restaurants")
      .find(query)
      .sort({ title: 1 })
      .toArray();

    res.status(200).json(restaurants);
  } catch (err) {
    next(err);
  }
});

// GET dish of the week
router.get("/dotw", async (req, res, next) => {
  try {
    const db = getDB();
    const dotw = await db.collection("restaurants").findOne({ isDishOfTheWeek: true });

    if (!dotw) {
      return res.status(404).json({
        status: 404,
        message: "No dish of the week has been set.",
      });
    }

    res.status(200).json(dotw);
  } catch (err) {
    next(err);
  }
});

// GET one restaurant
router.get("/:id", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found",
      });
    }
    const db = getDB();
    const restaurant = await db
      .collection("restaurants")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!restaurant) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found"
      });
    }

    res.status(200).json(restaurant);
  } catch (err) {
    next(err);
  }
});

// POST create restaurant
router.post("/", async (req, res, next) => {
  try {
    const db = getDB();
    const {
      title,
      address,
      city,
      imageUrl,
      menu,
      website,
      price,
      description,
      categories,
      specialtyDish,
      isDishOfTheWeek,
      socialMedia,
      placeId,
      url,
      averageRating,
      ratingCount,
    } = req.body;

    if (!title || !address || !city) {
      return res.status(400).json({ error: "title, address, and city are required" });
    }

    const duplicate = await db.collection("restaurants").findOne({
      title: { $regex: `^${title}$`, $options: "i" },
      address: { $regex: `^${address}$`, $options: "i" }
    });

    if (duplicate) {
      return res.status(409).json({ 
        status: 409,
        message: "Restaurant already exists"
      });
    }

    const newRestaurant = {
      title,
      address,
      city,
      imageUrl: imageUrl || "",
      menu: menu || null,
      website: website || "",
      price: price || "",
      description: description || "",
      categories: Array.isArray(categories) ? categories : [],
      specialtyDish: specialtyDish || "",
      socialMedia: Array.isArray(socialMedia) ? socialMedia : [],
      placeId: placeId || "",
      url: url || "",
      isDishOfTheWeek: isDishOfTheWeek || false,
      averageRating: 0,
      ratingCount: 0
    };

    const result = await db.collection("restaurants").insertOne(newRestaurant);
    const inserted = await db.collection("restaurants").findOne({ _id: result.insertedId });

    res.status(201).json(inserted);
  } catch (err) {
    next(err);
  }
});

// PUT update restaurant
router.put("/:id", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found",
      });
    }
    const db = getDB();
    const id = new ObjectId(req.params.id);

    const updateDoc = {
      $set: {
        ...req.body,
        updatedAt: new Date()
      }
    };

    if (updateDoc.$set._id) delete updateDoc.$set._id;

    const result = await db.collection("restaurants").updateOne({ _id: id }, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found"
      });
    }

    const updated = await db.collection("restaurants").findOne({ _id: id });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE restaurant
router.delete("/:id", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found",
      });
    }
    const db = getDB();
    const id = new ObjectId(req.params.id);

    const restaurant = await db.collection("restaurants").findOne({ _id: id });
    if (!restaurant) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found"
      });
    }

    await db.collection("restaurants").deleteOne({ _id: id });
    res.status(200).json(restaurant);
  } catch (err) {
    next(err);
  }
});

module.exports = router;