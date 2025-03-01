const mongoose = require("mongoose");
const Time = require("./Time");

// Counter schema to keep track of official IDs per year
const counterSchema = new mongoose.Schema({
	year: { type: Number, required: true, unique: true },
	count: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

const OfficialSchema = new mongoose.Schema({
	officialId: {
		type: String,
		unique: true,
		required: true,
	},
	firstName: { type: String, required: true },
	lastName: String,
	email: { type: String, unique: true, required: true },
	countryCode: String,
	mobile: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	gender: { type: String, enum: ["male", "female", "other"], required: true },
	dob: { type: Time.schema, required: true },
	dept: { type: String, enum: ["finance"], required: true },
	role: {
		type: String,
		enum: ["admin", "teamLeader", "telecaller"],
		required: true,
	},
});

// Pre-save hook to generate officialId
OfficialSchema.pre("save", async function (next) {
	if (!this.isNew) {
		return next();
	}

	const currentYear = new Date().getFullYear();
	const prefix = `BB-FIN-${currentYear}-`;

	let counter = await Counter.findOne({ year: currentYear });
	if (!counter) {
		counter = new Counter({ year: currentYear, count: 0 });
	}

	counter.count += 1;
	await counter.save();

	const linearOrder = String(counter.count).padStart(4, "0");

	this.officialId = `${prefix}${linearOrder}`;

	next();
});

const Official = mongoose.model("Official", OfficialSchema);

module.exports = Official;
