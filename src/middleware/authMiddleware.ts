import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/db.js";
import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

interface AuthTokenPayload extends JwtPayload {
  id: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

const authMiddleware: RequestHandler = async (req, res, next) => {
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Not authorized, no token provided",
    });
  }

  try {
    // Verify token and extract the user Id
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "User no longer exists",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Not authorized, token failed",
    });
  }
};

export { authMiddleware };
