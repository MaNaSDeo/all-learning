import type { RequestHandler } from "express";
import { prisma } from "../config/db.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";

const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (userExists) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "User already exists with this email",
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hashSync(password, salt);

  // Create User
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  });
};

export { register };
