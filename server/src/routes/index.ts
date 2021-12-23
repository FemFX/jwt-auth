import { Router } from "express";
import user from "../controllers/user";
import { body } from "express-validator";
import isAuth from "../middleware/auth";

const router = Router();

router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 20 }),
  user.registration
);
router.post("/login", user.login);
router.post("/logout", user.logout);
router.get("/activate/:link", user.activate);
router.get("/refresh", user.refresh);
router.get("/users", isAuth, user.users);

export default router;
