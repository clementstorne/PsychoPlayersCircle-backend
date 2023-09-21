import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

const GamesController = {
  createGame: async (req: Request, res: Response) => {
    const { name, description, image } = req.body;
    const userId = req.body.user.id;

    if (!name || !description) {
      return res.status(400).json({
        error:
          "The server could not process the request because a required parameter is missing. Please include all necessary parameters and try again.",
      });
    }

    try {
      const newGame = await prisma.game.create({
        data: {
          name,
          description,
          image,
          owners: { connect: { id: userId } },
        },
      });
      return res
        .status(201)
        .json({ message: "Game successfully created.", newGame });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
      });
    }
  },

  getAllGames: async (req: Request, res: Response) => {
    try {
      const games = await prisma.game.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          owners: {
            select: {
              id: true,
              name: true,
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
        .status(200)
        .json({ message: "Games successfully fetched.", games });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
      });
    }
  },

  getSingleGame: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const game = await prisma.game.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          owners: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res
        .status(200)
        .json({ message: "Game successfully fetched.", game });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
      });
    }
  },

  updateGame: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, image } = req.body;

    if (!name && !description && !image) {
      return res.status(400).json({
        error:
          "The server could not process the request because a required parameter is missing. Please include all necessary parameters and try again.",
      });
    }

    const game = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        owners: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!game) {
      return res.status(404).json({
        error: "The requested game could not be found.",
      });
    }

    try {
      const updatedGame = await prisma.game.update({
        where: { id },
        data: {
          name,
          description,
          image,
        },
      });

      return res
        .status(201)
        .json({ message: "Game successfully updated.", updatedGame });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
      });
    }
  },

  updateOwners: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.body.user.id;

    if (!userId) {
      next();
    } else {
      const game = await prisma.game.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          owners: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!game) {
        return res.status(404).json({
          error: "The requested game could not be found.",
        });
      }

      try {
        let updatedGame;

        if (
          game.owners.some(
            (el: { id: string; name: string }) => el.id === userId
          )
        ) {
          updatedGame = await prisma.game.update({
            where: { id },
            data: {
              owners: { disconnect: { id: userId } },
            },
          });
          return res
            .status(201)
            .json({ message: "Owner deleted from owners list.", updatedGame });
        } else {
          updatedGame = await prisma.game.update({
            where: { id },
            data: {
              owners: { connect: { id: userId } },
            },
          });
          return res
            .status(201)
            .json({ message: "Owner added to owners list.", updatedGame });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({
          error:
            "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
        });
      }
    }
  },

  deleteGame: async (req: Request, res: Response) => {
    const { id } = req.params;

    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return res.status(404).json({
        error: "The requested user could not be found.",
      });
    }

    try {
      await prisma.game.delete({ where: { id } });

      return res.status(204).json({ message: "Game successfully deleted." });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator.",
      });
    }
  },
};

export default GamesController;
