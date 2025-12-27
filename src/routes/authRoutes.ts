import express, { type Router } from "express";
import { login, logout, register } from "../controllers/authController.js";

const router: Router = express.Router();

router.post("/register", register);
router.post("/sign-in", login);
router.post("/sign-out", logout);

export default router;
