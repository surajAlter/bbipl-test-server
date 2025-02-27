const mongoose = require("mongoose");

// const curTime = () => {
// 	const date = new Date();
// 	const days = [
// 		"Sunday",
// 		"Monday",
// 		"Tuesday",
// 		"Wednesday",
// 		"Thursday",
// 		"Friday",
// 		"Saturday",
// 	];

// 	let hour = date.getHours();
// 	const meridian = hour >= 12 ? "PM" : "AM";
// 	hour = hour % 12 || 12;

// 	return {
// 		$date: date.getDate(),
// 		$day: days[date.getDay()],
// 		$month: date.getMonth() + 1,
// 		$year: date.getFullYear(),
// 		$hour: hour,
// 		$minute: date.getMinutes(),
// 		$meridian: meridian,
// 	};
// };

const timeSchema = new mongoose.Schema({
	date: { type: Number, min: 1, max: 31 },
	day: {
		type: String,
		enum: [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		],
	},
	month: { type: Number, min: 1, max: 12 },
	year: { type: Number },
	hour: { type: Number, min: 1, max: 12 },
	minute: { type: Number, min: 0, max: 59 },
	meridian: {
		type: String,
		enum: ["AM", "PM"],
	},
});

// const timeSchema = new mongoose.Schema({
// 	$date: { type: Number, min: 1, max: 31 },
// 	$day: {
// 		type: String,
// 		enum: [
// 			"Sunday",
// 			"Monday",
// 			"Tuesday",
// 			"Wednesday",
// 			"Thursday",
// 			"Friday",
// 			"Saturday",
// 		],
// ,
// 	},
// 	$month: { type: Number, min: 1, max: 12 },
// 	$year: { type: Number },
// 	$hour: { type: Number, min: 1, max: 12 },
// 	$minute: { type: Number, min: 0, max: 59 },
// 	$meridian: {
// 		type: String,
// 		enum: ["AM", "PM"],
// ,
// 	},
// });

const TimeModel = mongoose.model("Time", timeSchema);

module.exports = TimeModel;
