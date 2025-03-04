const transporter = require("../config/email");

const sendEmail = async (
	options,
	res,
	errMessage,
	successMessage = "Email sent"
) => {
	const mailOptions = {
		from: `BBIPL <${process.env.AUTH_EMAIL}>`,
		to: options.to,
		subject: options.subject,
		html: options.html,
	};

	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			console.log(err);
			return res
				.status(err.code)
				.json({ message: errMessage ? errMessage : err.message });
		} else {
			console.log("Email sent: " + info.response);
			return res.status(200).json({ message: successMessage });
		}
	});
};

module.exports = sendEmail;
