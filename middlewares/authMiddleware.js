// /** @format */

import UserModel from "../models/user-schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
dotenv.config();

export const authMiddleware = async (req, res, next) => {
	try {
		const token = req.header("Authorization");

		if (!token) {
			return res.status(401).json({ error: "Access Denied: No token provided" });
		}

		const jwtToken = token.split(" ")[1];

		if (!jwtToken) {
			return res.status(401).json({ error: "Access Denied: Invalid token format" });
		}

		const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);

		if (!isVerified) {
			return res.status(401).json({ error: "Access Denied: Invalid token" });
		}

		const userData = await UserModel.findOne({ _id: isVerified._id });

		if (!userData) {
			return res.status(401).json({ error: "Access Denied: User not found" });
		}

		req.user = userData;
		next();
	} catch (error) {
		console.error("Authentication error:", error);
		return res.status(401).json({ error: "Access Denied: Invalid token or server error" });
	}
};
