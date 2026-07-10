const express = require("express");
const { getBooksByAuthor } = require("../controllers/bookController");

const {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  getAuthorStats,
} = require("../controllers/authorController");

const router = express.Router();

router.post("/", createAuthor);
router.get("/", getAllAuthors);
router.get("/:id/books", getBooksByAuthor);
router.get("/:id/stats", getAuthorStats);
router.get("/:id", getAuthorById);
router.put("/:id", updateAuthor);
router.delete("/:id", deleteAuthor);

module.exports = router;
