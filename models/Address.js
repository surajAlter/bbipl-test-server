const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
	houseFlatNo: { type: String, required: true },
	buildingName: { type: String },
	streetName: { type: String, required: true },
	area: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	pinCode: { type: String, required: true },
	country: { type: String, required: true, default: "India" },
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
