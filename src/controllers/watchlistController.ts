import { type RequestHandler } from "express";
import { prisma } from "../config/db.js";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "@prisma/client";
import { error } from "node:console";

type AddToWatchlistBody = {
  movieId: string;
  userId: string;
  status?: "PLANNED" | "WATCHING" | "COMPLETED";
  rating?: number;
  notes?: string;
};

type UpdateWatchlistBody = {
  status?: "PLANNED" | "WATCHING" | "COMPLETED";
  rating?: number;
  notes?: string;
};

type UpdateWatchlistParams = {
  id: string;
};

type RemoveFromWatchlistParams = {
  id: string;
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

/**
 * Update watchlist item
 * Updates status, rating, or notes
 * Ensures only owner can update
 * Requires protect middleware
 */
const updateWatchlistItem: RequestHandler<
  UpdateWatchlistParams,
  any,
  UpdateWatchlistBody
> = async (req, res) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Not authenticated",
    });
  }

  const { status, rating, notes } = req.body;

  // Find watchlist item and verify ownership
  const watchlist = await prisma.watchlistItem.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!watchlist) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Watchlist item not found",
    });
  }

  // Ensure only owner can update
  if (watchlist.userId !== req.user.id) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: "Not allowed to update this watchlist item",
    });
  }

  // Build update data
  const updateData: Prisma.WatchlistItemUpdateInput = {};

  if (status !== undefined) updateData.status = status;
  if (rating !== undefined) updateData.rating = rating;
  if (notes !== undefined) updateData.notes = notes;

  // Update watchlist item
  const updatedItem = await prisma.watchlistItem.update({
    where: {
      id: req.params.id,
    },
    data: updateData,
  });

  return res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      watchlist: updatedItem,
    },
  });
};

/**
 * Remove movie from watchlist
 * Deletes watchlist item
 * Ensures only owner can delete
 * Requires protect middleware
 */
const removeFromWatchlist: RequestHandler<
  RemoveFromWatchlistParams,
  any,
  any
> = async (req, res) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Not authenticated",
    });
  }

  // Find watchlist item and verify ownership
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!watchlistItem) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Watchlist item not found",
    });
  }

  // Ensure only owner can delete
  if (req.user.id !== watchlistItem.userId) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: "Not allowed to update this watchlist item",
    });
  }

  await prisma.watchlistItem.delete({
    where: {
      id: req.params.id,
    },
  });

  return res.status(StatusCodes.OK).json({
    status: "success",
    message: "Movie removed from watchlist",
  });
};

export { addToWatchList, updateWatchlistItem, removeFromWatchlist };
