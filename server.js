require("dotenv").config();

// Import from env
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const LoanForm = require("./models/LoanForm");

const app = express();

// CORS configuration
app.use(
	cors({
		origin: CLIENT_URL,
	})
);

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

app.post("/api/loan-forms", async (req, res) => {
	try {
		const data = req.body;

		const newLoanForm = new LoanForm(data);

		await newLoanForm.save();

		console.log("Data saved successfully:", newLoanForm);
		res.status(200).json({
			message: "Data saved successfully",
			data: newLoanForm,
		});
	} catch (err) {
		console.error("Error saving data:", err);
		res.status(500).json({
			message: "Error saving data",
			error: err.message,
		});
	}
});

app.get("/api/loan-forms", async (req, res) => {
	try {
		const data = await LoanForm.find();
		res.status(200).json(data);
	} catch (err) {
		console.error("Error retrieving data:", err);
		res.status(500).json({
			message: "Error retrieving data",
			error: err.message,
		});
	}
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
