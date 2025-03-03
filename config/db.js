const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to database
module.exports = () => {
	mongoose
		.connect(MONGODB_URI)
		.then(() => {
			console.log("Connected to database");
		})
		.catch((err) => {
			console.error("Connection error:", err);
		});
};
