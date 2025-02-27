require("dotenv").config();

// Import from env
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

//for cookies
const cookieParser = require("cookie-parser");

const app = express();

// CORS configuration
app.use(
	cors({
		origin: CLIENT_URL,
	})
);
app.use(cookieParser());
app.use(express.json());

// Connect to database
mongoose
	.connect(MONGODB_URI)
	.then(() => {
		console.log("Connected to database");
	})
	.catch((err) => {
		console.error("Connection error:", err);
	});

const authAuthController = require("./controllers/auth");
const loanFormsController = require("./controllers/loanForms");

// app.use("/api/user", userRoutes);
app.use("/api/auth", authAuthController);
app.use("/api/loan-forms", loanFormsController);

// Start the server
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
