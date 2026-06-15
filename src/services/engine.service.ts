import { spawn, ChildProcess } from "child_process";

export class EngineService {
  private process: ChildProcess | null = null;
  private buffer = "";
  private pendingResolve: ((line: string) => void) | null = null;

  constructor(private enginePath: string = "./engine/stockfish") {}

  async init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.process = spawn(this.enginePath, [], { stdio: ["pipe", "pipe", "pipe"] });

      this.process.stdout!.on("data", (data: Buffer) => {
        this.buffer += data.toString();
        const lines = this.buffer.split("\n");
        this.buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === "uciok" && this.pendingResolve) {
            const r = this.pendingResolve;
            this.pendingResolve = null;
            r("uciok");
          }
          if (trimmed === "readyok" && this.pendingResolve) {
            const r = this.pendingResolve;
            this.pendingResolve = null;
            r("readyok");
          }
          if (trimmed.startsWith("bestmove") && this.pendingResolve) {
            const r = this.pendingResolve;
            this.pendingResolve = null;
            r(trimmed);
          }
        }
      });

      this.process.on("error", reject);
      this.process.on("exit", (code) => {
        if (code !== 0 && this.pendingResolve) {
          const r = this.pendingResolve;
          this.pendingResolve = null;
          r("");
        }
      });

      this.send("uci");
      this.waitFor("uciok").then(() => {
        this.send("isready");
        return this.waitFor("readyok");
      }).then(() => resolve());
    });
  }

  setPosition(fen: string, moves: string[] = []) {
    const cmd = moves.length
      ? `position fen ${fen} moves ${moves.join(" ")}`
      : `position fen ${fen}`;
    this.send(cmd);
  }

  go(depth: number): Promise<string> {
    this.send(`go depth ${depth}`);
    return this.waitFor("bestmove").then(
      (line) => line.split(" ")[1] ?? ""
    );
  }

  async stop() {
    this.send("stop");
  }

  async quit() {
    this.send("quit");
    this.process?.kill();
    this.process = null;
  }

  private send(cmd: string) {
    this.process?.stdin?.write(cmd + "\n");
  }

  private waitFor(marker: string): Promise<string> {
    return new Promise((resolve) => {
      this.pendingResolve = resolve;
    });
  }
}
