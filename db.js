// db.js
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/emptyclassroom", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
