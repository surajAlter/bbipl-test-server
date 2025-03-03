const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
	try {
		const authHeader = req.headers["authorization"];
		if (!authHeader)
			return res.status(401).send("No token, authorization denied");

		const token = authHeader.split(" ")[1];

		if (!token) {
			return res.status(401).send("No token, authorization denied");
		}

		jwt.verify(token, JWT_SECRET, (err, payload) => {
			if (err) {
				return res.status(403).send("Token is not valid");
			}

			if (payload.role) {
				req.role = payload.role;
				req.officialId = payload.officialId;
			} else if (payload.userId) {
				req.userId = payload.userId;
			} else {
				return res.status(403).send("Token is not valid");
			}

			next();
		});
	} catch (e) {
		// res.status(500).json({ message: e.message });
		res.status(500).json({ message: "Server Error" });
	}
};
