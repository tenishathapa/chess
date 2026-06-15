import { Request, Response } from "express";
import { GameService } from "../services/game.service.js";

const game = new GameService();

export function newGame(req: Request, res: Response) {
  const mode = req.body.mode ?? "ai";
  const result = game.newGame(mode);
  res.json({ ok: true, ...result });
}

export function move(req: Request, res: Response) {
  const { from, to, promotion } = req.body;
  const move = game.applyMove(from, to, promotion ?? "q");
  if (!move) {
    res.json({ ok: false });
    return;
  }
  res.json({
    ok: true,
    fen: game.getFen(),
    move,
    gameOver: game.isGameOver(),
    turn: game.getTurn(),
  });
}

export function legalMoves(req: Request, res: Response) {
  const { square, fen } = req.body;
  if (fen) game.loadFen(fen);
  const moves = game.getLegalMoves(square);
  res.json({
    moves: moves.map((m) => m.to),
    captures: moves.filter((m) => m.captured).map((m) => m.to),
  });
}

export function position(req: Request, res: Response) {
  res.json({ fen: game.getFen() });
}
