function getToday() {
  function validateMinutes(time) {
    if (time < 10) {
      time = "0" + time;
    }
    return time;
  }

  let now = new Date();
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let day = days [now.getDay()];
  let hours = now.getHours();
  let minutes = validateMinutes(now.getMinutes());
  return {
    day: day, 
    hours: hours,
    minutes: minutes,
  }
}
function setTime(currentTime) {
  let dateTime = document.querySelector("h3");
  dateTime.innerHTML = `${currentTime.day}, ${currentTime.hours}:${currentTime.minutes}`;
}

function initialisePosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  if(latitude && longitude) {
    let url = getApiUrl({  
      latitude, 
      longitude, 
    });
    getWeatherInformation(url);
  }
}

function myCurrentPosition() {
  navigator.geolocation.getCurrentPosition(initialisePosition);
}

/*
input = {
  latitude, 
  longitude, 
  city,
} 
*/
function getApiUrl(apiData) {
  let apiKey = "5201594abea9f3e38b70e65b11a80c24";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric`;

  if (apiData.latitude && apiData.longitude) {
    apiUrl = `${apiUrl}&lat=${apiData.latitude}&lon=${apiData.longitude}`;
  }

  if (apiData.city) {
    apiUrl = `${apiUrl}&q=${apiData.city}`;
  }

  return apiUrl;
}

function getWeatherInformation(apiUrl) {
  axios.get(apiUrl).then(function (response) {
    let weather = response.data;
    displayWeatherInformation({
      cityName: weather.name,
      currentTemperature: Math.round(weather.main.temp),
      minimumTemperature: Math.round(weather.main.temp_min),
      windSpeed: Math.round(weather.wind.speed),
      humidity: weather.main.humidity,
      description: weather.weather[0].description,
      rainfall: weather.rain ? weather.rain : 0,
      weatherIcon: weather.weather[0].icon,
    });
  });
}

function displayWeatherIcon(weatherIconCode, weatherDescription) {
  let weatherIcon = document.querySelector("#weatherIcon");

  const url = `http://openweathermap.org/img/wn/${weatherIconCode}@4x.png`;

  weatherIcon.setAttribute("src", url);
  weatherIcon.setAttribute('alt', weatherDescription);
}

/*
input = {
  cityName,
  currentTemperature,
  minimumTemperature,
  windSpeed,
  humidity,
  description,
  rainfall,
  weatherIcon,
} 
*/
function displayWeatherInformation(weather) {
  let cityName = document.querySelector("#cityName");
  let currentTemperature = document.querySelector("#currentTemperature");
  let minimumTemperature = document.querySelector("#minimumTemperature");
  let windSpeed = document.querySelector("#windSpeed");
  let humidity = document.querySelector("#humidity");  
  let description = document.querySelector("#description");
  let rainfall = document.querySelector("#rainfall");

  cityName.innerHTML = `${weather.cityName}`;
  currentTemperature.innerHTML = `${weather.currentTemperature}°C`;
  minimumTemperature.innerHTML = `${weather.minimumTemperature}°C`;
  windSpeed.innerHTML = `Wind: ${weather.windSpeed}m/sec`;
  humidity.innerHTML = `Humidity: ${weather.humidity}%`;
  description.innerHTML = `${weather.description}`;
  rainfall.innerHTML = `${weather.rainfall}mm`;

  displayWeatherIcon(weather.weatherIcon, weather.description);
}

function displayOnHtml(id, message) {
  let element = document.querySelector(`#${id}`);
  element.innerHTML = message;
}

function searchCity(event) {
  event.preventDefault();
  setTime(getToday());
  let searchInput = document.querySelector("#search-city-input");
  let url = getApiUrl({city: searchInput.value});
  getWeatherInformation(url);
}

function searchCurrentLocation(event) {
  event.preventDefault();
  setTime(getToday());
  myCurrentPosition();
}

function celsiusToFahrenheit(temperature) {
  return temperature * 9/5 + 32;
}

function fahrenheitToCelsius(temperature) {
  return (temperature - 32)* 5/9;
}

function convertTemperature() {
  let currentTemperatureElement = document.querySelector("#currentTemperature");
  let minimumTemperatureElement = document.querySelector("#minimumTemperature");

  function getTemperature() {
    let curTemperature = currentTemperatureElement.innerHTML;
    let minTemperature = minimumTemperatureElement.innerHTML;

    return {
      currentTemperature: curTemperature.substring(0, curTemperature.length - 2),
      minimumTemperature: minTemperature.substring(0, minTemperature.length - 2),
      metric: curTemperature.substring(curTemperature.length - 1, curTemperature.length),
    }
  }
  function displayTemperature(currentTemperature, minimumTemperature, metric) {
    currentTemperatureElement.innerHTML = `${currentTemperature}°${metric}`;
    minimumTemperatureElement.innerHTML = `${minimumTemperature}°${metric}`;
    unitConversionButton.innerHTML = `°${metric === "F" ? "C" : "F"}`;
  }

  let rawTemperature = getTemperature();

  if(rawTemperature.metric.toLocaleLowerCase() === "c") {
    rawTemperature.currentTemperature = celsiusToFahrenheit(rawTemperature.currentTemperature);
    rawTemperature.minimumTemperature = celsiusToFahrenheit(rawTemperature.minimumTemperature);
    rawTemperature.metric = "F";
  } else {
    rawTemperature.currentTemperature = fahrenheitToCelsius(rawTemperature.currentTemperature);
    rawTemperature.minimumTemperature = fahrenheitToCelsius(rawTemperature.minimumTemperature);
    rawTemperature.metric = "C";
  }
  displayTemperature(rawTemperature.currentTemperature, rawTemperature.minimumTemperature, rawTemperature.metric);
}

let form = document.querySelector("#search-form");
form.addEventListener("submit", searchCity);

let searchButton = document.querySelector(".current-position");
searchButton.addEventListener("click", searchCurrentLocation);

let unitConversionButton = document.querySelector(".unit-conversion");
unitConversionButton.addEventListener("click", convertTemperature);

function main() {
  setTime(getToday());
  myCurrentPosition();
}

main();