const Book = require("../models/Book");
const Author = require("../models/Author");

// POST /books
const createBook = async (req, res) => {
  try {
    const { title, genre, price, publishedYear, author } = req.body;

    // Rule 1: Book must belong to a real author
    const authorExists = await Author.findById(author);

    if (!authorExists) {
      return res.status(400).json({
        message: "Author does not exist. A book must belong to a real author.",
      });
    }

    // Rule 2: No duplicate titles per author, case-insensitive
    const duplicateBook = await Book.findOne({
      author,
      title: { $regex: `^${title}$`, $options: "i" },
    });

    if (duplicateBook) {
      return res.status(409).json({
        message: "This author already has a book with this title.",
      });
    }

    // Rule 3: Price and published year rules
    const currentYear = new Date().getFullYear();

    if (price <= 0) {
      return res.status(422).json({
        message: "Price must be greater than zero.",
      });
    }

    if (publishedYear < 1450 || publishedYear > currentYear) {
      return res.status(422).json({
        message: `Published year must be between 1450 and ${currentYear}.`,
      });
    }

    const book = await Book.create({
      title,
      genre,
      price,
      publishedYear,
      author,
    });

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create book",
      error: error.message,
    });
  }
};

// GET /books
const getAllBooks = async (req, res) => {
  try {
    const {
      genre,
      minPrice,
      maxPrice,
      author,
      search,
      sort,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Filter by genre
    if (genre) {
      filter.genre = genre;
    }

    // Filter by author id
    if (author) {
      filter.author = author;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Search title, case-insensitive
    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    // Sorting
    const allowedSortFields = ["price", "title", "publishedYear"];
    const sortOptions = {};

    if (sort && allowedSortFields.includes(sort)) {
      sortOptions[sort] = order === "desc" ? -1 : 1;
    }

    // Pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const books = await Book.find(filter)
      .populate("author")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    const total = await Book.countDocuments(filter);

    res.status(200).json({
      page: pageNumber,
      limit: limitNumber,
      total,
      results: books,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get books",
      error: error.message,
    });
  }
};

// GET /books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author");

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get book",
      error: error.message,
    });
  }
};

// PUT /books/:id
const updateBook = async (req, res) => {
  try {
    const existingBook = await Book.findById(req.params.id);

    if (!existingBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const authorToCheck = req.body.author || existingBook.author;
    const titleToCheck = req.body.title || existingBook.title;

    // Check if new author exists
    if (req.body.author) {
      const authorExists = await Author.findById(req.body.author);

      if (!authorExists) {
        return res.status(400).json({
          message: "Author does not exist. A book must belong to a real author.",
        });
      }
    }

    // Check duplicate title for the same author
    if (req.body.title || req.body.author) {
      const duplicateBook = await Book.findOne({
        _id: { $ne: req.params.id },
        author: authorToCheck,
        title: { $regex: `^${titleToCheck}$`, $options: "i" },
      });

      if (duplicateBook) {
        return res.status(409).json({
          message: "This author already has a book with this title.",
        });
      }
    }

    const currentYear = new Date().getFullYear();

    if (req.body.price !== undefined && req.body.price <= 0) {
      return res.status(422).json({
        message: "Price must be greater than zero.",
      });
    }

    if (
      req.body.publishedYear !== undefined &&
      (req.body.publishedYear < 1450 || req.body.publishedYear > currentYear)
    ) {
      return res.status(422).json({
        message: `Published year must be between 1450 and ${currentYear}.`,
      });
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("author");

    res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update book",
      error: error.message,
    });
  }
};

// DELETE /books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete book",
      error: error.message,
    });
  }
};

// GET /authors/:id/books
const getBooksByAuthor = async (req, res) => {
  try {
    const authorExists = await Author.findById(req.params.id);

    if (!authorExists) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    const books = await Book.find({ author: req.params.id }).populate("author");

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get author's books",
      error: error.message,
    });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBooksByAuthor,
};
