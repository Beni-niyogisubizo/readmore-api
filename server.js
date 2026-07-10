const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const authorRoutes = require("./routes/authorRoutes");
const bookRoutes = require("./routes/bookRoutes");

dotenv.config();

const app = express();

app.use(express.json());

app.use("/authors", authorRoutes);
app.use("/books", bookRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "ReadMore API is running",
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
