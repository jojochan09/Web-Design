const express = require("express");
const checkWeather = require("./checkWeather");
const getData = require("./getData");
const WeatherError = require("./errorClass");
const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//connect to MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://mongodb/weather', {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on("error", (err) => {
  console.log("MongoDB connection error: "+err);
});
db.on("connected", () => {
  console.log("Connected to MongoDB");
});
db.on('close',() => {
  console.log("disconnected to MongoDB");
  process.exit(1);
  });

//http://localhost:8000/weather/{temp}/YYYY/MM
app.get("/weather/temp/:year/:month", getData.getTemp);
app.get("/weather/humi/:year/:month", getData.getHumidity);
app.get("/weather/rain/:year/:month", getData.getRain);

//http://localhost:8000/weather/YYYY/MM/DD
app
  .route("/weather/:year/:month/:day")
  .get(checkWeather.getWeather)
  .post(checkWeather.createWeather);

// any non matching routers
app.all("*", (req, res, next) => {
  next(new WeatherError(`Cannot ${req.method} ${req.originalUrl} !`, 404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

const server = app.listen(8000, () => {
  console.log("Weather app listening on port 8000!");
});