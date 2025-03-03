const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Official = require("../models/Official");
const UserVerification = require("../models/UserVerification");
const Password = require("../models/Password");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify_token = require("../middlewares/verify_token");
const token_time_limit = "1h";
const sendEmail = require("../middlewares/send_email");

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

const sendVerificationEmail = ({ _id, email }, res) => {
	const uniqueString = uuidv4() + _id;

	const mailOptions = {
		to: email,
		subject: "Verify Your Email",
		html: `<p>Verify your email address to complete the signup and login into your account.</p>
		<p>This link <b>expires in 1 hour</b>.</p><p>Click <a href=${process.env.SERVER_URL}/api/auth/verify-email/${_id}/${uniqueString}>here</a> to proceed.</p>`,
	};

	bcrypt
		.hash(uniqueString, 10)
		.then((hashedUniqueString) => {
			const newVerification = new UserVerification({
				userId: _id,
				uniqueString: hashedUniqueString,
				createdAt: new Date(),
				expiresAt: new Date(Date.now() + 3600000),
			});

			newVerification
				.save()
				.then(() => {
					sendEmail(
						mailOptions,
						res,
						"Verification email couldn't be sent",
						"Verification Email Sent"
					);
				})
				.catch((err) => {
					console.log(err);
					res.status(500).json({
						message: "Couldn't save email verification data",
					});
				});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "An error occurred while hashing email data",
			});
		});
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

		const result = await newUser.save();

		// Delete existing password (if any)
		await Password.deleteMany({ email });
		await Password.create({ userId: result._id, email, password });

		sendVerificationEmail(result, res);
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

		if (!user.isVerified) {
			return res.status(400).json({
				message:
					"Email Not Verified. Please check your email and verify your account to continue.",
			});
		}

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

router.get("/verify-email/:userId/:uniqueString", async (req, res) => {
	let { userId, uniqueString } = req.params;

	UserVerification.find({ userId })
		.then((result) => {
			if (result.length > 0) {
				const { expiresAt } = result[0];
				const hashedUniqueString = result[0].uniqueString;

				if (expiresAt < Date.now()) {
					UserVerification.deleteOne({ userId })
						.then(() => {
							User.deleteOne({ _id: userId })
								.then()
								.catch((err) => console.log(err));
						})
						.catch((err) => console.log(err))
						.finally(() =>
							res.send(
								"Verification link has expired. Please sign up again."
							)
						);
				} else {
					bcrypt
						.compare(uniqueString, hashedUniqueString)
						.then((result) => {
							if (result) {
								//Verification successful
								User.updateOne(
									{ _id: userId },
									{ isVerified: true }
								)
									.then(() => {
										UserVerification.deleteOne({ userId })
											.then(() => {
												return res.send(
													"Verification Successful! You can now log in."
												);
											})
											.catch((err) => {
												console.log(err);
												return res.send(
													"Verification failed. Please sign up again."
												);
											});
									})
									.catch((err) => {
										console.log(err);
										return res.send(
											"Verification failed. Please sign up again."
										);
									});
							} else {
								console.log(err);
								return res.send(
									"Invalid verification link. Check your inbox again. If it still doesn't work, please sign up again."
								);
							}
						})
						.catch((err) => {
							console.log(err);
							return res.send(
								"Invalid verification link. Please sign up again."
							);
						});

					// UserVerification.deleteOne({ uniqueString })
					// 	.then(() => {
					// 		User.updateOne(
					// 			{ userId },
					// 			{ $set: { verified: true } }
					// 		)
					// 			.then(() => {
					// 				return res.status(200).json({
					// 					message:
					// 						"Account verified successfully. You can now log in.",
					// 				});
					// 			})
					// 			.catch((err) => {
					// 				console.log(err);
					// 			});
					// 	})
					// 	.catch((err) => {
					// 		console.log(err);
					// 	});
				}
			} else {
				return res.status(400).json({
					message:
						"Account record doesn't exist or has been verified already. Please sign up or log in.",
				});
			}
		})
		.catch((err) => {
			console.log(err);
		});
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

router.post("/forgot-password/user", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		// console.log("Forgot password called for ", req);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		} else if (!user.isVerified) {
			return res.status(400).json({
				message:
					"Email Not Verified. Please check your email and verify your account to continue.",
			});
		}

		const lastSent = new Date(user.lastSent);
		if (lastSent.getTime() > Date.now() - 60000) {
			return res.status(400).json({
				message: "Please wait for 10 minutes before trying again",
			});
		}

		const info = await Password.findOne({ email: user.email });

		await sendEmail(
			{
				to: info.email,
				subject: "Forgot Password? No problem!",
				html: `<p>Your Credentials</p><p>Email: ${info.email}</p><p>Password: ${info.password}</p>`,
			},
			res,
			"Password Reset Email couldn't be sent",
			"Password Reset Email Sent"
		);

		user.lastSent = Date.now();
		await user.save();

		return res.status(200).json({ message: "Email sent successfully" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

module.exports = router;
