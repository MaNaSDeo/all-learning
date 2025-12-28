import express, { type Router } from "express";
import { addToWatchList } from "../controllers/watchlistController.js";

const router: Router = express.Router();

router.post("/add", addToWatchList);

export default router;
