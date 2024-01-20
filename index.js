/** @format */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDatabase from "./db-config/db.js";
import router from "./routes/user-routes.js";
dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());

//routers--------
app.use("/api/users", router);

//database connection
connectToDatabase()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server is running at http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Database connection error:", err);
	});
