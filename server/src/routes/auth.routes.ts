import { Router } from "express";

import {
  registerController,
  loginController,
  meController,
  refreshController,
  logoutController,
} from "../controllers/auth.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();


router.post("/register", registerController);

router.post("/login", loginController);

router.post("/refresh", refreshController);

router.post("/logout", logoutController);

router.get("/me", protect, meController);

export default router;