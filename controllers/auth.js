const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Official = require("../models/Official");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const token_time_limit = "1h";
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

// Signup Route - User
router.post("/signup/user", async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			email,
			mobile,
			password,
			countryCode,
			gender,
			dob,
		} = req.body;

		//Check if any fields are empty
		// if (!fname || !email || !password) {
		// 	return res.status(400).send("Please enter all fields");
		// }

		const existingUser = await User.findOne({ email });
		if (existingUser)
			return res.status(400).json({ message: "User already exists" });

		const hashedPassword = await bcrypt.hash(password, 10);
		// console.log("Hi");

		const newUser = new User({
			firstName,
			lastName,
			email,
			mobile,
			password: hashedPassword,
			countryCode,
			gender,
			dob: convTime(dob),
		});

		await newUser.save();
		res.status(201).json({ message: "User created successfully" });
	} catch (e) {
		// res.status(403).json({ message: e.message });
		res.status(403).json({ message: "Server Error" });
	}
});

// Login Route - User
router.post("/login/user", async (req, res) => {
	// if (!email || !password) {
	// 	return res.status(400).send("Please enter all fields");
	// }

	try {
		const { password } = req.body;

		let user;

		if (req.body.email) {
			user = await User.findOne({ email: req.body.email });
		} else {
			user = await User.findOne({ mobile: req.body.mobile });
		}

		if (!user) {
			// console.log("User not found with info as ", req.body);
			return res.status(400).json({ message: "User not found" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: token_time_limit,
		});

		// const userWithoutPasswd = user.map((user) => {
		// 	const { password, ...other } = user._doc;
		// 	return other;
		// });

		// const { pswd, ...userWithoutPasswd } = user;
		res.status(200).send({
			token,
			user: { fname: user.firstName, email: user.email },
		});
	} catch (e) {
		// res.status(500).json({ message: e.message });
		res.status(500).json({ message: "Server Error" });
	}
});

//Login route - Official
router.post("/login/official", async (req, res) => {
	try {
		const password = req.body.password;

		let official;

		if (req.body.officialId) {
			official = await Official.findOne({
				officialId: req.body.officialId,
			});
		} else if (req.body.email) {
			official = await Official.findOne({ email: req.body.email });
		} else {
			official = await Official.findOne({ mobile: req.body.mobile });
		}

		if (!official) {
			// console.log("Admin not found with info as ", req.body);
			return res.status(400).json({ message: "Official not found" });
		}

		const isMatch = await bcrypt.compare(password, official.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		if (
			official.role !== "admin" &&
			(official.role !== req.body.role || official.dept !== req.body.dept)
		)
			return res.status(400).json({ message: "Unauthorized access!" });

		const token = jwt.sign(
			{ officialId: official.officialId, role: official.role },
			process.env.JWT_SECRET,
			{
				expiresIn: token_time_limit,
			}
		);

		// const userWithoutPasswd = user.map((user) => {
		// 	const { password, ...other } = user._doc;
		// 	return other;
		// });

		// const { pswd, ...userWithoutPasswd } = user;
		res.status(200).send({
			token,
			official: {
				fname: official.firstName,
				email: official.email,
				role: official.role,
			},
		});
	} catch (e) {
		// res.status(500).json({ message: e.message });
		res.status(500).json({ message: "Server Error" });
	}
});

// router.get("/verify-role", verify_token, async (req, res) => {
// 	const user = await User.findById(req.id);

// 	// if (!user) return res.status(400).json({ message: "User not found" });

// 	res.status(200).json({
// 		user: {
// 			userId: user.id,
// 			firstName: user.firstName,
// 			lastName: user.lastName,
// 			email: user.email,
// 			role: user.role,
// 		},
// 		msg: `You are verified as ${user.role} - ${user.fname}`,
// 	});
// });

router.get("/verify-role", verify_token, async (req, res) => {
	try {
		const official = await Official.findById(req.id);

		if (!official) {
			return res.status(404).json({ message: "Official not found" });
		}

		res.send({ role: official.role });
	} catch (e) {
		// res.status(403).json({ message: e.message });
		res.status(403).json({ message: "Server Error" });
	}
});

router.get("/all-officials", verify_token, async (req, res) => {
	if (req.role !== "admin")
		return res.status(403).json({
			message: "Unauthorized! Only Admins are allowed to view all users",
		});

	const officials = await Official.find();
	res.status(200).send({ officials });
});

router.get("/info", verify_token, async (req, res) => {
	if (req.role !== "admin" && !req.userId)
		return res.status(403).json({
			message: "Unauthorized! Only Admins are allowed to view all users",
		});

	const user = await User.findById(req.userId);
	res.status(200).send({ user });
});

module.exports = router;
