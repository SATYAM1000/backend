/** @format */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minLength: 8,
		},
		verified:{
			type:Boolean,
			default:false,
		},
		verificationToken:{
			type:String,
		}

	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
	try {
		if (!this.isModified("password")) {
			return next();
		}
		const hashedPassword = await bcrypt.hash(this.password, 10);
		this.password = hashedPassword;
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.generateToken = async function () {
	try {
		return jwt.sign(
			{ _id: this._id.toString(), email: this.email },
			process.env.SECRET_KEY,
			{ expiresIn: "1d" }
		);
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

const UserModel = new mongoose.model("users", userSchema);
export default UserModel;
