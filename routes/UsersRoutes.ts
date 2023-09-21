import express from "express";
import UsersController from "../controllers/UsersController";

const router = express.Router();

router.get("/", UsersController.getAllUsers);
router.get("/:id", UsersController.getSingleUser);
router.patch("/:id", UsersController.updateUser);
router.delete("/:id", UsersController.deleteUser);

export default router;
