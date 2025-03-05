const express = require("express");
const router = express.Router();
const ContactUs = require("../models/ContactUs");
const verify_token = require("../middlewares/verify_token");
const sendEmail = require("../middlewares/send_email");

// POST endpoint to save contact us messages
router.post("/", async (req, res) => {
	try {
		const data = req.body;
		const newContactUs = new ContactUs(data);

		await newContactUs.save();

		// console.log("Message submitted");
		res.status(200).send({
			message: "Message submitted! We'll reach you soon.",
		});
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

router.get("/", verify_token, async (req, res) => {
	try {
		if (req.role !== "admin")
			res.status(403).send({ message: "Unauthorized" });

		const data = await ContactUs.find();

		res.status(200).send({
			data,
		});
	} catch (e) {
		res.status(500).json({ message: "Server Error" });
	}
});

router.put("/", verify_token, async (req, res) => {
	try {
		// console.log("Request received as:\n", req);
		if (req.role !== "admin")
			return res.status(403).send({ message: "Unauthorized" });
		else if (
			!req.body.id ||
			!req.body.responseMethod ||
			!req.body.responseMessage
		) {
			return res.status(400).send({
				message: "Please provide all the required fields",
			});
		}

		const data = await ContactUs.findById(req.body.id);

		if (!data) {
			return res.status(404).send({
				message: "Such contact request was not found",
			});
		}

		const mailOptions = {
			to: data.email,
			subject: "Response to your query",
			html: `<p>Hello ${data.name},</p>
                <p>${req.body.responseMessage}</p>
                <br />
                <p>Thanks for reaching out!</p>
                <p>Team BBIPL</p>`,
		};

		await sendEmail(
			mailOptions,
			res,
			"Reply email couldn't be sent",
			"Reply email sent"
		);

		data.responseMethod = req.body.responseMethod;
		data.responseMessage = req.body.responseMessage;
		data.status = req.body.status || "Complete";
		await data.save();

		res.status(200).send({
			message: "Reply sent successfully!",
		});
	} catch (e) {
		return res.status(500).json({ message: "Server Error" });
	}
});

module.exports = router;
