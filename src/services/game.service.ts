import { Chess, Square } from "chess.js";
import prisma from "../lib/prisma.js";

export class GameService {
  private chess = new Chess();
  private gameId: number | null = null;
  private mode: "ai" | "pvp-local" | "pvp-online" = "ai";

  getFen() {
    return this.chess.fen();
  }

  getLegalMoves(square: Square) {
    return this.chess.moves({ square, verbose: true });
  }

  loadFen(fen: string) {
    this.chess.load(fen);
  }

  reset() {
    this.chess.reset();
    this.gameId = null;
  }

  newGame(mode: "ai" | "pvp-local" | "pvp-online" = "ai") {
    this.chess.reset();
    this.mode = mode;
    this.gameId = null;
    return { fen: this.chess.fen() };
  }

  async applyMove(from: string, to: string, promotion = "q") {
    const move = this.chess.move({ from, to, promotion });
    if (!move) return null;

    if (this.gameId) {
      await prisma.move.create({
        data: {
          gameId: this.gameId,
          moveNumber: this.chess.moveNumber(),
          fromSq: from,
          toSq: to,
          promotion: promotion !== "q" ? promotion : null,
          san: move.san,
          fen: this.chess.fen(),
        },
      });

      await prisma.game.update({
        where: { id: this.gameId },
        data: { fen: this.chess.fen() },
      });
    }

    return {
      from: move.from,
      to: move.to,
      piece: move.piece,
      captured: move.captured,
      promotion: move.promotion,
      san: move.san,
      lan: move.lan,
    };
  }

  isGameOver() {
    return this.chess.isGameOver();
  }

  getTurn() {
    return this.chess.turn();
  }

  getHistory() {
    return this.chess.history({ verbose: true });
  }

  loadGame(id: number) {
    this.gameId = id;
  }
}
