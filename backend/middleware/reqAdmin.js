function reqAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: 401,
      message: "You must be logged in",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: 403,
      message: "Admin access required",
    });
  }

  next();
}

module.exports = reqAdmin;