import { Router, json } from "express";
import {
  newGame,
  move,
  legalMoves,
  position,
} from "../controllers/game.controller.js";

const router = Router();
router.use(json());

router.post("/api/new-game", newGame);
router.post("/api/move", move);
router.post("/api/legal-moves", legalMoves);
router.get("/api/position", position);

export default router;
