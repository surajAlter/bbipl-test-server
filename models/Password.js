const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		unique: true,
		required: true,
	},
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
});

const password = mongoose.model("password", passwordSchema);

module.exports = password;
