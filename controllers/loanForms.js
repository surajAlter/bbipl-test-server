const express = require("express");
const router = express.Router();
const LoanForm = require("../models/LoanForm");
const verify_token = require("../middlewares/verify_token");

convTime = (d) => {
	const date = new Date(d);
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	let hour = date.getHours();
	const meridian = hour >= 12 ? "PM" : "AM";
	hour = hour % 12 || 12;

	return {
		date: date.getDate(),
		day: days[date.getDay()],
		month: date.getMonth() + 1,
		year: date.getFullYear(),
		hour: hour,
		minute: date.getMinutes(),
		meridian: meridian,
	};
};
// POST endpoint to save loan forms
router.post("/", async (req, res) => {
	try {
		const data = req.body;

		//changing the date formats to Date object
		data.dateOfBirth = convTime(data.dateOfBirth);
		if (data.spouseDob) data.spouseDob = convTime(data.spouseDob);

		const newLoanForm = new LoanForm(data);

		await newLoanForm.save();

		console.log("New loan form submitted");
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

// GET endpoint with pagination
router.get("/", verify_token, async (req, res) => {
	try {
		if (req.role !== "admin") {
			return res.status(403).json({ message: "Unauthorized" });
		}

		const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
		const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		const totalDocuments = await LoanForm.countDocuments(); // Total number of documents

		const data = await LoanForm.find()
			.sort({ _id: -1 })
			.skip(startIndex)
			.limit(limit);

		// Pagination result
		const pagination = {};

		if (endIndex < totalDocuments) {
			pagination.next = {
				page: page + 1,
				limit: limit,
			};
		}

		if (startIndex > 0) {
			pagination.previous = {
				page: page - 1,
				limit: limit,
			};
		}

		res.status(200).json({
			data,
			pagination,
			totalDocuments,
		});
	} catch (err) {
		console.error("Error retrieving data:", err);
		res.status(500).json({
			message: "Error retrieving data",
			error: err.message,
		});
	}
});

module.exports = router;
