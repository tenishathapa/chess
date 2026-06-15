import { hash, compare } from "bcryptjs";
import prisma from "../lib/prisma.js";

export class AuthService {
  async register(username: string, email: string, password: string) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) return null;

    const passwordHash = await hash(password, 10);

    return prisma.user.create({
      data: { username, email, passwordHash },
    });
  }

  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;

    const valid = await compare(password, user.passwordHash);
    if (!valid) return null;

    return user;
  }

  async getUser(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }
}
