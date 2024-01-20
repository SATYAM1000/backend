/** @format */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDatabase from "./db-config/db.js";
import router from "./routes/user-routes.js";
dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
  });



app.use(cors({
	origin: ["https://fakeapi-lete.onrender.com/"],
	methods: ["GET", "POST"],
	Credential: true

}));
app.use(express.json());

//routers--------

app.get("/api", (req, res) => {
	res.send("Hello World");
})
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
