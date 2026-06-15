import { Router } from "express";
import {
  getLogin,
  getRegister,
  postRegister,
  postLogin,
  postLogout,
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/auth/login", getLogin);
router.get("/auth/register", getRegister);
router.post("/auth/register", postRegister);
router.post("/auth/login", postLogin);
router.post("/auth/logout", postLogout);

export default router;
