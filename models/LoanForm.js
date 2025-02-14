const mongoose = require("mongoose");
const Address = require("./Address");

const loanFormSchema = new mongoose.Schema({
	// Personal Details
	customerName: { type: String, required: true },
	dateOfBirth: { type: Date, required: true },
	fatherName: { type: String, required: true },
	motherName: { type: String, required: true },

	// Contact Details
	mobile: { type: String, required: true },
	telephone: { type: String },

	// Address Information
	currentAddress: { type: Address.schema, required: true }, // Current Address
	// address: { type: String, required: true }, // Current Address
	yearsPresent: { type: Number, required: true },
	yearsCity: { type: Number, required: true },

	// Rental Status
	rentalStatus: { type: String, enum: ["Y", "N"], required: true },
	rentalAmount: {
		type: Number,
		min: [0, "Rental amount cannot be negative"], // Non-negative constraint
	},
	permanentAddress: { type: Address.schema }, // Permanent Address
	// permanentAddress: { type: String }, // Permanent Address

	// Marital Status
	maritalStatus: { type: String, enum: ["Y", "N"], required: true },
	dependents: { type: String, enum: ["Y", "N"], required: true },
	spouseName: { type: String },
	spouseDob: { type: Date },

	// Employment Details
	officeName: { type: String },
	officePhone: { type: String },
	officeAddress: { type: Address.schema }, // Office Address
	// officeAddress: { type: String }, // Office Address
	yearsEmployed: {
		type: Number,
		min: [0, "Years employed cannot be negative"],
		required: true,
	},
	yearsTotalEmployed: {
		type: Number,
		min: [0, "Total years employed cannot be negative"],
		required: true,
	},

	// Bank Details
	bankDetails: {
		type: Object,
		required: true,
		properties: {
			bankName: { type: String, required: true },
			bankAcNo: { type: Number, required: true },
			bankBranch: { type: String, required: true },
		},
	},

	loanAmount: {
		type: Number,
		min: [0, "Loan amount cannot be negative"],
		required: true,
	},

	// References
	relativeName: { type: String, required: true },
	relativeMobile: { type: String, required: true },
	relativeAddress: { type: Address.schema, required: true }, // Relative's Address
	// relativeAddress: { type: String, required: true }, // Relative's Address
	friendName: { type: String, required: true },
	friendMobile: { type: String, required: true },
	friendAddress: { type: Address.schema, required: true }, // Friend's Address
	// friendAddress: { type: String, required: true }, // Friend's Address

	// Timestamps
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const LoanForm = mongoose.model("LoanForm", loanFormSchema);

module.exports = LoanForm;
