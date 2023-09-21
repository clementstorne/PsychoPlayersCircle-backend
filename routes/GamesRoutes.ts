import express from "express";
import GamesController from "../controllers/GamesController";

const router = express.Router();

router.post("/", GamesController.createGame);
router.get("/", GamesController.getAllGames);
router.get("/:id", GamesController.getSingleGame);
router.patch("/:id", GamesController.updateOwners, GamesController.updateGame);
router.delete("/:id", GamesController.deleteGame);

export default router;
