import { PrismaClient, User } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

import bcrypt from "bcrypt";

export interface CustomRequest extends Request {
  auth: string | JwtPayload;
}

const prisma = new PrismaClient();

const UsersController = {
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          games: {
            select: {
              id: true,
              name: true,
              description: true,
              image: true,
            },
          },
        },
        orderBy: [
          {
            name: "asc",
          },
        ],
      });

      return res
        .status(201)
        .json({ message: "Users successfully fetched.", users });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
      });
    }
  },

  getSingleUser: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          email: true,
          games: true,
        },
      });

      return res
        .status(201)
        .json({ message: "User successfully fetched.", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
      });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    const { id } = req.body.user;

    const { email } = req.body;
    let { password } = req.body;

    if (!email && !password) {
      return res.status(400).json({
        error:
          "The server could not process the request because a required parameter is missing. Please include all necessary parameters and try again.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "The requested user could not be found.",
      });
    }

    if (password) {
      // const regex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})/g;
      // if (!regex.test(password)) {
      //   return res.status(400).json({
      //     error:
      //       "The password provided does not meet the required format. Please ensure your password meets the specified criteria and try again.",
      //   });
      // }

      password = bcrypt.hashSync(password, 10);
    }

    try {
      const updatedUser: User = await prisma.user.update({
        where: { id },
        data: {
          email,
          password,
        },
      });

      return res
        .status(201)
        .json({ message: "User successfully updated.", updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
      });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    const { id } = req.body.user;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "The requested user could not be found.",
      });
    }

    try {
      await prisma.user.delete({ where: { id } });

      return res.status(204).json({ message: "User successfully deleted." });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
      });
    }
  },
};

export default UsersController;
