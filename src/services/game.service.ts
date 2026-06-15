import { Chess, Square } from "chess.js";
import prisma from "../lib/prisma.js";

export class GameService {
  private chess = new Chess();
  private gameId: number | null = null;
  private mode: "ai" | "pvp-local" | "pvp-online" = "ai";

  getFen() {
    try {
      return this.chess.fen();
    } catch {
      return "start";
    }
  }

  getLegalMoves(square: Square) {
    try {
      return this.chess.moves({ square, verbose: true });
    } catch {
      return [];
    }
  }

  loadFen(fen: string) {
    try {
      this.chess.load(fen);
    } catch {
      this.chess.reset();
    }
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
    let move;
    try {
      move = this.chess.move({ from, to, promotion });
    } catch {
      return null;
    }
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
    try {
      return this.chess.isGameOver();
    } catch {
      return true;
    }
  }

  getTurn() {
    try {
      return this.chess.turn();
    } catch {
      return "w";
    }
  }

  getHistory() {
    try {
      return this.chess.history({ verbose: true });
    } catch {
      return [];
    }
  }

  loadGame(id: number) {
    this.gameId = id;
  }
}
