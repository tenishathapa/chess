import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

const auth = new AuthService();

export function getLogin(req: Request, res: Response) {
  res.render("auth/login.ejs");
}

export function getRegister(req: Request, res: Response) {
  res.render("auth/register.ejs");
}

export async function postRegister(req: Request, res: Response) {
  const { username, email, password } = req.body;
  const user = await auth.register(username, email, password);
  if (!user) {
    res.redirect("/auth/register?error=exists");
    return;
  }
  req.session.userId = user.id;
  res.redirect("/game");
}

export async function postLogin(req: Request, res: Response) {
  const { username, password } = req.body;
  const user = await auth.login(username, password);
  if (!user) {
    res.redirect("/auth/login?error=invalid");
    return;
  }
  req.session.userId = user.id;
  res.redirect("/game");
}

export function postLogout(req: Request, res: Response) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}
