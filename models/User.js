const mongoose = require("mongoose");
const Time = require("./Time");

const UserSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: String,
	email: { type: String, unique: true, required: true },
	mobile: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	countryCode: String,
	gender: { type: String, enum: ["male", "female", "other"], required: true },
	dob: { type: Time.schema, required: true },
	lastSent: { type: Date, default: new Date() },
	isVerified: { type: Boolean, default: false },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
