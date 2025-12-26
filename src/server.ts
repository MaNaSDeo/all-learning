import express, { type Express, type RequestHandler } from "express";

// Import Routes
import movieRoutes from "./routes/movieRoutes.js";

const app: Express = express();
const PORT = 5001;

// API Routes
app.use("/movies", movieRoutes);

// Using RequestHandler provides better type inference for req, res, and next
const homeHandler: RequestHandler = (_, res) => {
  res.send("Hello, TypeScript with Express!");
};

app.get("/", homeHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/**
 * ROUTE goals
 *
 * AUTH - signin, signup, logout, get current user.
 * MOVIE - Getting all movies, adding a movie, deleting a movie, updating a movie.
 * USER - Getting all users, adding a user, deleting a user, updating a user.
 * WATCHLIST - Getting all watchlist, adding a watchlist, deleting a watchlist, updating a watchlist.
 */
