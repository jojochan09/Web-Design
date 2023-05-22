const mongoose = require("mongoose");
const weatherSchema = new mongoose.Schema({
  date: String,
  meanT: Number,
  maxT: Number,
  minT: Number,
  humidity: Number,
  rain: Number,
});

const Weather = mongoose.model("wrecord", weatherSchema);

module.exports = Weather;