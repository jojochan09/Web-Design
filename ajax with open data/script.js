const currentDate = document.querySelector(".current_date");
const dept = document.querySelector(".dept");
const arr = document.querySelector(".arr");
const switchBtn = document.querySelector(".switch_btn");
const deptTag = document.querySelector(".dp_tag");
const arrTag = document.querySelector(".ar_tag");
const deptInfoContainer = document.querySelector(".departure_info_container");
const arrInfoContainer = document.querySelector(".arrival_info_container");
const loadEarlyBtn = document.querySelector(".load_early");
const loadMoreBtn = document.querySelector(".load_more");

let html_1 = "";
let html_2 = "";
let arrival = false;
let loadMore = false;
let loadEarly = false;
const now = new Date();
const hour = now.getHours();
const min = now.getMinutes();
const day = now.getDate();
const month = now.getMonth();
const year = now.getFullYear();

var monthNumber = [
  "January", "February", "March", "April", "May", "June", "July", 
  "August", "Sempteper", "October", "November", "December"];

const date = `${year}-${month + 1}-${day}`;
currentDate.textContent = `Date: ${day} ${monthNumber[month]} ${year}`;

//Initializate
window.addEventListener("load", function () {
  getFlightInfo(arrival, loadMore);
});

switchBtn.addEventListener("click", function () {
  loadEarly = false;
  loadMore = false;
  loadMoreBtn.style.display = "block";
  loadEarlyBtn.style.display = "block";
  ClickChange();
  getFlightInfo(arrival, loadMore);
  removeFlightInfo(arrival);
});

loadEarlyBtn.addEventListener("click", function (e) {
  e.preventDefault();
  removeFlightInfo(!arrival);
  loadEarly = true;
  getFlightInfo(arrival, loadMore, loadEarly);
  loadEarlyBtn.style.display = "none";
});

loadMoreBtn.addEventListener("click", function (e) {
  e.preventDefault();
  removeFlightInfo(!arrival);
  loadMore = true;
  getFlightInfo(arrival, loadMore, loadEarly);
  loadMoreBtn.style.display = "none";
});

const ClickChange = function () {
  arrival = !arrival;
  // reference from https://ithelp.ithome.com.tw/articles/10280129 
  dept.classList.toggle("decoration");
  deptTag.classList.toggle("hidden");
  arr.classList.toggle("decoration");
  arrTag.classList.toggle("hidden");
};

const displayFlight = function (arrival, list) {
  let flightNumber = "";
  list.flight.forEach((flight_number) => {
    flightNumber +=
      flight_number.no.split(" ").join("&nbsp") + "&nbsp;&nbsp;&nbsp;&#32;";
  });
  //reference from https://developer.mozilla.org/zh-TW/docs/Web/API/Element/insertAdjacentHTML 
  if (arrival) {
    const origin_detail = [...list.origin];
    html_1 = `
    <div class="flight_detail"> 
      <div><b>Flight No.: </b><span>${flightNumber}</span></div>
      <div><b>Schedule Time: </b><span>${list.time}</span></div>
      <div class="airport origin">${origin_detail}</div>
      <div><b>Parking Stand:</b>${list.stand}&nbsp;&#32<b>Hall:</b>${list.hall}&nbsp;&#32<b>Belt:</b>${list.baggage}</div>
      <div><b>Status: </b><span>${list.status}</span></div>
    </div>  `;
    arrInfoContainer.insertAdjacentHTML("beforeend", html_1);
  } else {
    const destination_detail = [...list.destination];
    html_2 = `
    <div class="flight_detail"> 
      <div><b>Flight No.: </b>${flightNumber}</div>
      <div><b>Schedule Time: </b>${list.time}</div>
      <div class="airport destination">${destination_detail}</div>
      <div><b>Terminal:</b>${list.terminal}&nbsp;&#32<b>Aisle:</b>${list.aisle}&nbsp;&#32<b>Gate:</b>${list.gate} </div>
      <div><b>Status: </b>${list.status} </div>
    </div>  `;
    deptInfoContainer.insertAdjacentHTML("beforeend", html_2);
  }
};

const renderAirportInfo = function (dataArray, isArrival) {
  let airportInfo = "";
  if (isArrival) {
    const childList = arrInfoContainer.children;
    Array.from(childList).forEach((component) => {
      const arrNode = component.querySelector(".origin");
      const codes = arrNode.textContent.split(",");
      codes.forEach((code) => {
        for (const data of dataArray) {
          if (data.iata_code === code) {
            airportInfo += `${data.municipality}&nbsp;(${data.name})<br>`;
          }
        }
      });
      arrNode.innerHTML = `<b>Origin (Airport): </b><br>${airportInfo}`;
      airportInfo = ""; //restart, clear the string for next node
    });
  } else {
    const childList = deptInfoContainer.children;
    Array.from(childList).forEach((component) => {
      const destNode = component.querySelector(".destination");
      const codes = destNode.textContent.split(",");
      codes.forEach((code) => {
        for (const data of dataArray) {
          if (data.iata_code === code) {
            airportInfo += `${data.municipality}&nbsp;(${data.name})<br>`;
          }
        }
      });
      destNode.innerHTML = `<b>Destination (Airport): </b><br>${airportInfo}`;
      airportInfo = "";
    });
  }
};

const appendDayBeforeFlights = function (dayBeforeArray, isArr) {
  dayBeforeArray.list.forEach((schedule) => {
    displayFlight(isArr, schedule);
  });
};

let count = 0;
const getFlightInfo = function (isArrival, isLoadMore, isLoadEarly) {
  fetch(
    `flight.php?date=${date}&lang=en&cargo=false&arrival=${isArrival}`
  )
    .then((response) => response.json())
    .then((data) => {
      let dayBeforeData;
      let onDayData;
      if (data.length == 2) {
        [dayBeforeData, onDayData] = data;
      } else if (data.length == 1) onDayData = data[0];
      if (dayBeforeData && isLoadEarly) {
        appendDayBeforeFlights(dayBeforeData, isArrival);
        html_1 = "";
        html_2 = "";
      }
      for (const schedule of onDayData.list) {
        const hourMin = schedule.time.split(":");
        if (
          (+hourMin[0] >= hour && +hourMin[1] >= min) ||
          (+hourMin[0] > hour && +hourMin[1] <= min)
        ) {// 10 current flights
          if (!isLoadMore && count < 10) {
            displayFlight(isArrival, schedule);
            count++;
          } else if (isLoadMore) {
            displayFlight(isArrival, schedule);
          }
        } else {
          if (isLoadEarly) 
          displayFlight(isArrival, schedule);
        }
      }
      if (count < 10) {
        loadMoreBtn.style.display = "none";
      }
      count = 0;
      html_1 = "";
      html_2 = "";
      return fetch("iata.json");
    })
    .then((response) => response.json())
    .then((iataArray) => {
      renderAirportInfo(iataArray, isArrival);
    });
};
const removeFlightInfo = function (arr) {
  if (arr) {
    while (deptInfoContainer.hasChildNodes()) {
      deptInfoContainer.removeChild(deptInfoContainer.firstChild);
    }
  } else {
    while (arrInfoContainer.hasChildNodes()) {
      arrInfoContainer.removeChild(arrInfoContainer.firstChild);
    }
  }
};