import type { Request, Response, RequestHandler } from "express";
import { prisma } from "../config/db.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

const register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Please provide all required fields: name, email, password",
      });
      return;
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userExists) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "User already exists with this email",
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: { // Select only fields we want to return
        id: true,
        name: true,
        email: true
      }
    });

    const token = generateToken(user.id, res);

    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
    });
  }
};

const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Please provide both email and password",
      });
      return;
    }

    // Check if user email exists in the table
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Invalid credentials",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Invalid credentials",
      });
      return;
    }

    // Generate JWT Token
    const token = generateToken(user.id, res);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
    });
  }
};

const logout: RequestHandler = async (_: Request, res: Response): Promise<void> => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0), // Sets expiration date to the past
    });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
    });
  }
};

export { register, login, logout };
