import express, { type Router, type RequestHandler } from "express";

const router: Router = express.Router();

const getAllMovies: RequestHandler = (_, res) => {
  res.json({
    httpMethod: "get",
    message: "Get all movies",
  });
};

const createMovie: RequestHandler = (_, res) => {
  res.json({
    httpMethod: "post",
    message: "Create a movie",
  });
};

const updateMovie: RequestHandler = (_, res) => {
  res.json({
    httpMethod: "put",
    message: "Update a movie",
  });
};

const deleteMovie: RequestHandler = (_, res) => {
  res.json({
    httpMethod: "delete",
    message: "Delete a movie",
  });
};

router.get("/", getAllMovies);
router.post("/", createMovie);
router.put("/", updateMovie);
router.delete("/", deleteMovie);

export default router;
