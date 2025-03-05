const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
	name: { type: String, required: true },
	mobile: { type: String, required: true },
	email: { type: String, required: true },
	message: { type: String, required: true },
	responseMethod: { type: String, enum: ["email", "mobile"] },
	responseMessage: { type: String },
	status: { type: String, enum: ["Pending", "Complete"], default: "Pending" },
	createdAt: { type: Date, default: new Date() },
});

const contactUs = mongoose.model("contactUs", contactUsSchema);

module.exports = contactUs;
