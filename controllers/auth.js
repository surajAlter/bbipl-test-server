const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const token_time_limit = "1h";
const verify_token = require("../middlewares/verify_token");

//Role codes
const USER_CODE = 0;
const ADMIN_CODE = 1;

// Signup route
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
			dob,
			role: USER_CODE,
		});

		await newUser.save();
		res.status(201).json({ message: "User created successfully" });
	} catch (e) {
		console.log(e);
		res.status(500).send(e.message);
	}
});

// Login route - USER
router.post("/login/user", async (req, res) => {
	// if (!email || !password) {
	// 	return res.status(400).send("Please enter all fields");
	// }

	try {
		const { userinput, password } = req.body;

		let user;

		if (userinput.includes("@")) {
			user = await User.findOne({ email: userinput });
		} else {
			user = await User.findOne({ mobile: userinput });
		}

		if (!user) {
			// console.log("User not found with info as ", req.body);
			return res.status(400).json({ message: "User not found" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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
		res.status(500).json({ message: e.message });
	}
});

//Login route - Admin
router.post("/login/admin", async (req, res) => {
	try {
		const password = req.body.password;

		let user;

		if (req.body.email) {
			user = await User.findOne({ email: req.body.email });
		} else {
			user = await User.findOne({ mobile: req.body.mobile });
		}

		if (!user) {
			// console.log("Admin not found with info as ", req.body);
			return res.status(400).json({ message: "Admin not found" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		const token = jwt.sign(
			{ id: user._id, role: ADMIN_CODE },
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
			user: { fname: user.firstName, email: user.email, role: user.role },
		});
	} catch (e) {
		console.log(e);
		res.status(500).json({ message: e.message });
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
		const user = await User.findById(req.id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.send({ role: user.role });
	} catch (e) {
		res.status(403).json({ message: "Server Error" });
	}
});

router.get("/all-users", verify_token, async (req, res) => {
	if (!req.id || req.role !== ADMIN_CODE)
		return res.status(403).json({
			message: "Unauthorized! Only Admins are allowed to view all users",
		});
	const users = await User.find();
	res.status(200).send({ users });
});

module.exports = router;
