const Weather = require("./weatherSchema");
const WeatherError = require("./errorClass");
const checkDate = require("./checkDate");

const seperateDate = (dateString) => {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4);
  const seperateDateIs = { Year: year, Month: month };
  return seperateDateIs;
};

// reference from tutorial form online
const getSummary = async (dateString, name) => {
  const regExpress = "^" + dateString;
  let [summary] = await Weather.aggregate([
    {
      $match: { date: { $regex: regExpress } },
    },
    {
      $group: {
        _id: null,
        "Avg": { $avg: name === "Temp" ? "$meanT" : "$humidity" },
        "Max": { $max: name === "Temp" ? "$maxT" : "$humidity" },
        "Min": { $min: name === "Temp" ? "$minT" : "$humidity" },
      },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  return summary;
};

exports.getTemp = async (req, res, next) => {
  try {
    const dateString = checkDate(req.params, next);
    if (!dateString) return;
    let tempSummary = await getSummary(dateString, "Temp");
    if (!tempSummary) {
      return next(new WeatherError("not found", 404));
    }
    //console.log(tempSummary);
    const seperateDateIs = seperateDate(dateString);
    res.status(200).json({
      Year: seperateDateIs.Year,
      Month: seperateDateIs.Month,
      "Avg Temp":tempSummary.Avg,
      "Max Temp":tempSummary.Max,
      "Min Temp":tempSummary.Min,
    });
  } catch (err) {
    next(new WeatherError(err.message, 500));
  }
};

exports.getHumidity = async (req, res, next) => {
  try {
    const dateString = checkDate(req.params, next);
    if (!dateString) return;
    let humiSummary = await getSummary(dateString, "Humi");
    if (!humiSummary) {
      return next(new WeatherError("not found", 404));
    }
    const seperateDateIs = seperateDate(dateString);
    res.status(200).json({
      Year: seperateDateIs.Year,
      Month: seperateDateIs.Month,
      "Avg Humidity":humiSummary.Avg,
      "Max Humidity":humiSummary.Max,
      "Min Humidity":humiSummary.Min,
    });
  } catch (err) {
    next(new WeatherError(err.message, 500));
  }
};

exports.getRain = async (req, res, next) => {
  try {
    const dateString = checkDate(req.params, next);
    if (!dateString) return;
    const regExpress = "^" + dateString;
    let [rainSummary] = await Weather.aggregate([
      {
        $match: { date: { $regex: regExpress } },
      },
      {
        $group: {
          _id: null,
          "Avg": { $avg: "$rain" },
          "Max": { $max: "$rain" },
        },
      },
      {
        $project: { _id: 0 },
      },
    ]);
    if (!rainSummary) {
      return next(new WeatherError("not found", 404));
    }
    const seperateDateIs = seperateDate(dateString);
    res.status(200).json({
      Year: seperateDateIs.Year,
      Month: seperateDateIs.Month,
      "Avg Rainfall":rainSummary.Avg,
      "Max Daily Rainfall":rainSummary.Max,
    });
  } catch (err) {
    next(new WeatherError(err.message, 500));
  }
};