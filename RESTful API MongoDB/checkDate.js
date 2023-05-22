const WeatherError = require("./errorClass");

//reference from the Internet --> checking vaild input date
const isDate = (dataArray) => {
  const thirtyOneDay = [1, 3, 5, 7, 8, 10, 12];
  const numArray = dataArray.map((el) => +el);
  numArray.forEach((element) => {
    if (!Number.isInteger(element)) return false;
  });
  if (numArray[0].toString().length !== 4) return false;
  if (numArray[1] < 1 || numArray[1] > 12) return false;

  if (numArray[2] || numArray[2] === 0) {
    if (numArray[1] === 2 && numArray[2] > 28) return false;

    if (thirtyOneDay.includes(numArray[1])) {
      if (numArray[2] < 1 || numArray[2] > 31) return false;
    } else {
      if (numArray[2] < 1 || numArray[2] > 30) return false;
    }
  }
  return true;
};

const checkDate = (params, next) => {
  const dateArray = Object.values(params);
  if (!isDate(dateArray)) {
    next(new WeatherError("not a valid year/month/date", 400));
    return;
  }
  const dateString = dateArray.map((el) => el.padStart(2, "0")).join("");
  return dateString;
};

module.exports = checkDate;