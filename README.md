## Video Walkthrough

Watch the full ReadMore API code walkthrough and endpoint demonstration here:

[ReadMore API Video Demo] (https://youtu.be/Vn_cyYSHWnA)


The video includes:

- An overview of the project structure
- Express server setup and MongoDB Atlas connection
- Author and Book Mongoose models
- Author and Book CRUD endpoints
- The relationship between authors and books using `ObjectId` and `populate()`
- The `GET /authors/:id/books` linking endpoint
- Dynamic book filtering, searching, sorting, and pagination
- The `GET /authors/:id/stats` endpoint
- Demonstrations of all required business rules:
  - Rejection of books with nonexistent authors using `400 Bad Request`
  - Rejection of duplicate titles per author using `409 Conflict`
  - Rejection of invalid prices and publication years using `422 Unprocessable Entity`
  - Blocking deletion of authors who still have books using `409 Conflict`

### Author-Delete Policy

This project uses the **block-delete policy**. An author cannot be deleted while books still reference that author. This prevents orphan books and protects the relationship between the two collections.

The trade-off is that the books must first be deleted or reassigned before the author can be removed.
