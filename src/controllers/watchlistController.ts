import { type RequestHandler } from "express";
import { prisma } from "../config/db.js";
import { StatusCodes } from "http-status-codes";

type AddToWatchlistBody = {
  movieId: string;
  userId: string;
  status?: "PLANNED" | "WATCHING" | "COMPLETED";
  rating?: number;
  notes?: string;
};

const addToWatchList: RequestHandler<
  {}, // params
  any, // response body
  AddToWatchlistBody // request body
> = async (req, res) => {
  const { movieId, status, rating, notes, userId } = req.body;

  // Verify if movie already exists
  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
  });

  if (!movie) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: "Movie not found",
    });
  }

  // Check if movie is already added
  const existingInWathclist = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId: userId,
        movieId: movieId,
      },
    },
  });

  if (existingInWathclist) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Movie already in the watchlist",
    });
  }

  const watchlistItem = await prisma.watchlistItem.create({
    data: {
      userId: userId,
      movieId,
      status: status || "PLANNED",
      ...(rating !== undefined && { rating }),
      ...(notes !== undefined && { notes }),
    },
  });

  return res.status(StatusCodes.CREATED).json({
    status: "success",
    data: {
      watchlistItem,
    },
  });
};

export { addToWatchList };
