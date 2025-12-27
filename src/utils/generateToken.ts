import jwt, { type SignOptions } from "jsonwebtoken";
import { type Response } from "express";
import { config } from "dotenv";

config();

export const generateToken = (userId: string, res: Response) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const payload = { id: userId };
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as SignOptions);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

/**
 * openssl rand -base64 32
 */
