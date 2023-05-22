const Weather = require("./weatherSchema");
const WeatherError = require("./errorClass");
const checkDate = require("./checkDate");

const seperateDate = (dateString) => {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4,6);
  const date = dateString.slice(6);
  const seperateDateIs = { Year: year, Month: month, Date: date };
  return seperateDateIs;
};

exports.getWeather = async (req, res, next) => {
  try {
    const dateString = checkDate(req.params, next);
    if (!dateString) return;
    const weather = await Weather.findOne({ date: dateString });
    if (!weather) {
      return next(new WeatherError("not found", 404));
    }
    //console.log(dateString);
    const seperateDateIs = seperateDate(dateString);
    res.status(200).json({
      Year: seperateDateIs.Year,
      Month: seperateDateIs.Month,
      Date: seperateDateIs.Date,
      "Avg Temp": weather.meanT,
      "Max Temp":weather.maxT,
      "Min Temp":weather.minT,
      "Humidity":weather.humidity,
      "Rainfall":weather.rain,
    });
  } catch (err) {
    next(new WeatherError(err.message, 500));
  }
};

exports.createWeather = async (req, res, next) => {
  try {
    const dateString = checkDate(req.params, next);
    if (!dateString) return;
    const weather = await Weather.findOne({ date: dateString });
    if (weather) {
      console.log("duplicate record!!");
      next(new WeatherError("find an existing record. Cannot override!!", 403));
      return;
    }
    req.body.date = dateString;
    const newWeather = await Weather.create(req.body);
    res.status(200).json({
      okay: "record added",
    });
  } catch (err) {
    next(new WeatherError(err.message, 500));
  }
};