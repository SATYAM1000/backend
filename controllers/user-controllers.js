/** @format */

import express from "express";
import UserModel from "../models/user-schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const registerUser = async (req, res) => {
	try {
		const { username, email, password } = req.body;
		if (!username || !email || !password) {
			return res.status(400).json({ msg: "All fields are required" });
		}

		const existingUser = await UserModel.findOne({ email });
		if (existingUser && existingUser.verified === true) {
			return res
				.status(400)
				.json({ msg: "User with this email already exists" });
		}
		if (existingUser && existingUser.verified === false) {
			await existingUser.deleteOne({ email: email });
		}
		const newUser = new UserModel({ username, email, password });
		await newUser.save();

		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		const token = await newUser.generateToken();
		newUser.verificationToken = token;
		await newUser.save();

		const verificationLink = `http://localhost:5173/verification/${token}`;
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: newUser.email,
			subject: "Verify Your Email",
			html: `<p>Please click on the following link to verify your email:</p>
			   <a href="${verificationLink}">${verificationLink}</a>`,
		};

		await transporter.sendMail(mailOptions);

		return res.status(201).json({
			msg: "Verification link sent successfully",
			token: token,
		});
	} catch (error) {
		console.error("Error while registering", error);
		return res.status(500).json({ msg: "Error during registration process" });
	}
};

export const verifyUser = async (req, res) => {
	try {
		const token = req.params.token;
		if (!token) {
			return res.status(400).json({ msg: "Token is required" });
		}

		try {
			const user = await UserModel.findOne({ verificationToken: token });

			if (!user) {
				return res.status(404).json({ msg: "User not found" });
			}

			if (user.verified) {
				return res.status(400).json({ msg: "User is already verified" });
			}

			user.verified = true;
			await user.save();
			return res.status(200).json({ msg: "User verified successfully" });
		} catch (error) {
			console.error("Error while verifying user", error);

			if (error.name === "TokenExpiredError") {
				return res.status(400).json({ msg: "Token has expired" });
			}

			return res.status(400).json({ msg: "Invalid token" });
		}
	} catch (error) {
		console.error("Error while verifying user", error);
		return res.status(500).json({ msg: "Something went wrong" });
	}
};

export const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		const existingUser = await UserModel.findOne({ email });
		if (!existingUser) {
			return res.status(404).json({ msg: "User doesn't exist" });
		}
		if (existingUser.verified === false) {
			return res.status(400).json({ msg: "Please verify your email" });
		}
		const isPasswordCorrect = await bcrypt.compare(
			password,
			existingUser.password
		);
		if (!isPasswordCorrect) {
			return res.status(400).json({ msg: "Invalid credentials" });
		}
		const token = await existingUser.generateToken();
		const userData = {
			_id: existingUser._id,
			username: existingUser.username,
			email: existingUser.email,
		};

		res.status(200).json({ token, msg: "Login successful", userData });
	} catch (error) {
		console.log("Error while logging in", error);
		throw new Error("Something went wrong");
	}
};

export const getUserData = async () => {
	try {
		const user = await UserModel.findById(req.user._id).select("-password");
		return res.status(200).json({ user });
	} catch (error) {
		console.log("Error while getting user data", error);
		throw new Error("Something went wrong");
	}
};
