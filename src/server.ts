import express, { type Express, type RequestHandler } from "express";
import { config } from "dotenv";
import { connectDB, disConnectDB } from "./config/db.js";

// Import Routes
import movieRoutes from "./routes/movieRoutes.js";

config();
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5001;

// API Routes
app.use("/movies", movieRoutes);

// Using RequestHandler provides better type inference for req, res, and next
const homeHandler: RequestHandler = (_, res) => {
  res.send("Hello, TypeScript with Express!");
};

app.get("/", homeHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejection (e.g. database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection: ", err);
  server.close(async () => {
    await disConnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exceptions: ", err);
  await disConnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disConnectDB();
    process.exit(0);
  });
});

/**
 * ROUTE goals
 *
 * AUTH - signin, signup, logout, get current user.
 * MOVIE - Getting all movies, adding a movie, deleting a movie, updating a movie.
 * USER - Getting all users, adding a user, deleting a user, updating a user.
 * WATCHLIST - Getting all watchlist, adding a watchlist, deleting a watchlist, updating a watchlist.
 */
