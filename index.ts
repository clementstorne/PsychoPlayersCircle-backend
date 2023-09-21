import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";

import AuthRoutes from "./routes/AuthRoutes";
import UsersRoutes from "./routes/UsersRoutes";
import GamesRoutes from "./routes/GamesRoutes";

import verifyTokenMiddleware from "./middlewares/verifyToken";

const prisma = new PrismaClient();
const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json("🎲 Welcome to Psycho-Player's Circle backend ♟️");
});

app.use("/", AuthRoutes);
app.use("/users", verifyTokenMiddleware, UsersRoutes);
app.use("/games", verifyTokenMiddleware, GamesRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server ready on port ${PORT}`)
);
