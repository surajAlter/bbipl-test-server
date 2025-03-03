const nodemailer = require("nodemailer");

//Nodemailer Transporter
const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false, // true for port 465, false for other ports
	auth: {
		user: process.env.AUTH_EMAIL,
		pass: process.env.AUTH_PASSWORD,
	},
});

//Testing Email connection
transporter.verify((err, success) => {
	if (err) {
		console.log(err);
	} else {
		console.log("Server is ready to send emails");
	}
});

module.exports = transporter;
