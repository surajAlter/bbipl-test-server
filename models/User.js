const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	email: { type: String, unique: true, required: true },
	mobile: String,
	password: { type: String, required: true },
	countryCode: String,
	gender: String,
	dob: String,
	role: {
		type: Number,
		min: 0,
		max: 1,
		required: true,
	},
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
