const Author = require("../models/Author");
const Book = require("../models/Book");

// POST /authors
const createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);

    res.status(201).json({
      message: "Author created successfully",
      author,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create author",
      error: error.message,
    });
  }
};

// GET /authors
const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find();

    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get authors",
      error: error.message,
    });
  }
};

// GET /authors/:id
const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get author",
      error: error.message,
    });
  }
};

// PUT /authors/:id
const updateAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    res.status(200).json({
      message: "Author updated successfully",
      author,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update author",
      error: error.message,
    });
  }
};

// DELETE /authors/:id
const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    const booksByAuthor = await Book.find({ author: req.params.id });

    if (booksByAuthor.length > 0) {
      return res.status(409).json({
        message:
          "Cannot delete author because they still have books. Delete or reassign the books first.",
      });
    }

    await Author.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Author deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete author",
      error: error.message,
    });
  }
};

// GET /authors/:id/stats
const getAuthorStats = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    const books = await Book.find({ author: req.params.id });

    if (books.length === 0) {
      return res.status(200).json({
        author: author.name,
        bookCount: 0,
        averagePrice: 0,
        cheapestBook: null,
        mostExpensiveBook: null,
      });
    }

    const bookCount = books.length;

    const totalPrice = books.reduce((sum, book) => {
      return sum + book.price;
    }, 0);

    const averagePrice = totalPrice / bookCount;

    const cheapestBook = books.reduce((cheapest, book) => {
      return book.price < cheapest.price ? book : cheapest;
    });

    const mostExpensiveBook = books.reduce((mostExpensive, book) => {
      return book.price > mostExpensive.price ? book : mostExpensive;
    });

    res.status(200).json({
      author: author.name,
      bookCount,
      averagePrice: Number(averagePrice.toFixed(2)),
      cheapestBook: cheapestBook.title,
      mostExpensiveBook: mostExpensiveBook.title,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get author statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  getAuthorStats,
};
