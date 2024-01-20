/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectToDatabase = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB successfully");
	} catch (error) {
		console.log("Error connecting to database", error);
		process.exit(1);
	}
};

export default connectToDatabase;
