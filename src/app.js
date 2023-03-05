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
  console.log("api url", apiUrl);
  axios.get(apiUrl).then(function (response) {
    let weather = response.data;
    console.log(weather)
    displayWeatherInformation({
      cityName: weather.name,
      currentTemperature: Math.round(weather.main.temp),
      minimumTemperature: Math.round(weather.main.temp_min),
      windSpeed: Math.round(weather.wind.speed),
      humidity: weather.main.humidity,
      description: weather.weather[0].description,
      rainfall: weather.rain ? weather.rain : 0,
    });
  });
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
} 
*/
function displayWeatherInformation(weather) {
  let cityName = document.querySelector("#cityName")
  let currentTemperature = document.querySelector("#currentTemperature");
  let minimumTemperature = document.querySelector("#minimumTemperature");
  let windSpeed = document.querySelector("#windSpeed");
  let humidity = document.querySelector("#humidity");  
  let description = document.querySelector("#description");
  let rainfall = document.querySelector("#rainfall");

  cityName.innerHTML = `${weather.cityName}`
  currentTemperature.innerHTML = `${weather.currentTemperature}°C`;
  minimumTemperature.innerHTML = `${weather.minimumTemperature}°C`;
  windSpeed.innerHTML = `Wind: ${weather.windSpeed}m/sec`;
  humidity.innerHTML = `Humidity: ${weather.humidity}%`;
  description.innerHTML = `${weather.description}`;
  rainfall.innerHTML = `${weather.rainfall}mm`;
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

let form = document.querySelector("#search-form");
form.addEventListener("submit", searchCity);

let searchButton = document.querySelector(".current-position");
searchButton.addEventListener("click", searchCurrentLocation);

setTime(getToday());