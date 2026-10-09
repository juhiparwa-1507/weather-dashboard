
var unit = "C";      
var weather = null;  


var cityInput = document.getElementById("cityInput");
var searchBtn = document.getElementById("searchBtn");
var unitBtn = document.getElementById("unitBtn");
var message = document.getElementById("message");
var currentBox = document.getElementById("current");
var forecastBox = document.getElementById("forecast");

function describe(code) {
  if (code === 0) return { text: "Clear sky", icon: "☀️", mood: "sunny" };
  if (code <= 2) return { text: "Partly cloudy", icon: "⛅", mood: "cloudy" };
  if (code === 3) return { text: "Overcast", icon: "☁️", mood: "cloudy" };
  if (code <= 48) return { text: "Foggy", icon: "🌫️", mood: "cloudy" };
  if (code <= 57) return { text: "Drizzle", icon: "🌦️", mood: "rainy" };
  if (code <= 67) return { text: "Rain", icon: "🌧️", mood: "rainy" };
  if (code <= 77) return { text: "Snow", icon: "❄️", mood: "snowy" };
  if (code <= 82) return { text: "Rain showers", icon: "🌧️", mood: "rainy" };
  if (code <= 86) return { text: "Snow showers", icon: "🌨️", mood: "snowy" };
  return { text: "Thunderstorm", icon: "⛈️", mood: "stormy" };
}


function convert(celsius) {
  if (unit === "F") {
    return Math.round(celsius * 9 / 5 + 32);
  }
  return Math.round(celsius);
}


function sampleData() {
  var days = [];
  var codes = [2, 0, 3, 61, 1];
  for (var i = 0; i < 5; i++) {
    var d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      code: codes[i],
      max: 20 + i,
      min: 12 + i
    });
  }
  return {
    city: "London", country: "United Kingdom",
    temp: 18, feels: 17, humidity: 64, wind: 14, code: 2,
    days: days
  };
}

async function getWeather(city) {
  message.textContent = "Loading...";

  try {
   
    var geoUrl = "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" + encodeURIComponent(city);
    var geoResponse = await fetch(geoUrl);
    var geo = await geoResponse.json();

    if (!geo.results) {
      message.textContent = "City not found. Check the spelling and try again.";
      return;
    }
    var place = geo.results[0];

 
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + place.latitude +
      "&longitude=" + place.longitude +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto";
    var response = await fetch(url);
    var data = await response.json();

   
    var days = [];
    for (var i = 0; i < 5; i++) {
      days.push({
        date: data.daily.time[i],
        code: data.daily.weather_code[i],
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i]
      });
    }

    weather = {
      city: place.name,
      country: place.country || "",
      temp: data.current.temperature_2m,
      feels: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      wind: data.current.wind_speed_10m,
      code: data.current.weather_code,
      days: days
    };
    message.textContent = "";
  } catch (error) {
    weather = sampleData();
    message.textContent = "Can't reach the weather service right now. Showing sample data.";
  }

  showWeather();
}


function showWeather() {
  var info = describe(weather.code);
  document.body.className = info.mood;   // change the background colour

  var today = new Date().toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long"
  });

  currentBox.innerHTML =
    '<div class="top">' +
      '<div><h2 id="cityName"></h2><div class="date">' + today + '</div></div>' +
      '<div class="icon">' + info.icon + '</div>' +
    '</div>' +
    '<div class="temp">' + convert(weather.temp) + '°' + unit + '</div>' +
    '<div class="desc">' + info.text + '</div>' +
    '<div class="stats">' +
      '<div class="stat"><span>Feels like</span><strong>' + convert(weather.feels) + '°</strong></div>' +
      '<div class="stat"><span>Humidity</span><strong>' + Math.round(weather.humidity) + '%</strong></div>' +
      '<div class="stat"><span>Wind</span><strong>' + Math.round(weather.wind) + ' km/h</strong></div>' +
    '</div>';

  
  document.getElementById("cityName").textContent =
    weather.city + (weather.country ? ", " + weather.country : "");


  var html = "";
  for (var i = 0; i < weather.days.length; i++) {
    var day = weather.days[i];
    var dayInfo = describe(day.code);
    var name = "Today";
    if (i > 0) {
      name = new Date(day.date + "T12:00").toLocaleDateString(undefined, { weekday: "short" });
    }
    html +=
      '<div class="day">' +
        '<div class="name">' + name + '</div>' +
        '<div class="small-icon">' + dayInfo.icon + '</div>' +
        '<div class="range"><b>' + convert(day.max) + '°</b> / ' + convert(day.min) + '°</div>' +
      '</div>';
  }
  forecastBox.innerHTML = html;
}


function search() {
  var city = cityInput.value.trim();
  if (city !== "") {
    getWeather(city);
  }
}

searchBtn.addEventListener("click", search);

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    search();
  }
});

unitBtn.addEventListener("click", function () {
  unit = (unit === "C") ? "F" : "C";
  unitBtn.textContent = "Show °" + (unit === "C" ? "F" : "C");
  if (weather) {
    showWeather();
  }
});

getWeather("London");