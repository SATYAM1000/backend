/** @format */

import express from "express";
import {
	registerUser,
	loginUser,
	verifyUser,
} from "../controllers/user-controllers.js";
// import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify/:token", verifyUser);
// router.get("/user", authMiddleware, getUserData);
export default router;
