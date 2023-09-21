import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error:
        "The server could not process the request because a required parameter is missing. Please include all necessary parameters and try again.",
    });
  }

  // const regex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})/g;
  // if (!regex.test(password)) {
  //   return res.status(400).json({
  //     error:
  //       "The password provided does not meet the required format. Please ensure your password meets the specified criteria and try again.",
  //   });
  // }

  try {
    const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      return res.status(409).json({
        error:
          "The provided email is already in use. Please choose a different email address or try to reset your password if you have forgotten it.",
      });
    }

    const hash = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
      },
    });

    return res
      .status(201)
      .json({ message: "User successfully created.", newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error:
        "The server could not process the request because a required parameter is missing. Please include all necessary parameters and try again.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        error:
          "The requested user could not be found. Please verify the email and try again.",
      });
    }

    const passwordMatch = await bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        error:
          "The provided password does not match our records. Please verify your password and try again.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_DURING }
    );
    return res
      .status(200)
      .json({ message: "User successfully logged in.", access_token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
    });
  }
};
