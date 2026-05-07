const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/mongodb");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend is running",
    status: "ok"
  });
});

app.use("/api/restaurants", require("./api/restaurant"));
app.use("/api/admin", require("./api/admin"));
app.use("/api/reviews", require("./api/reviews"));
app.use("/api/auth", require("./api/authRoutes"));
app.use("/api/favorites", require("./api/favorites"));

app.use("/api/*splat", (req, res) => {
  res.status(404).json({
    status: 404,
    message: "API route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    status: 500,
    message: "Internal server error"
  });
});

connectDB()
  .catch((err) => {
    console.error("DB startup failed:", err);
  });

module.exports = app;