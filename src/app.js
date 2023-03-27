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

function getForecastDayName(daysSinceToday) {
  let now = new Date();
  let days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
  let forecastIndex = (now.getDay() + daysSinceToday) % 7;
  return days [forecastIndex];
}

function setTime(currentTime) {
  let dateTime = document.querySelector("h3");
  dateTime.innerHTML = `${currentTime.day}, ${currentTime.hours}:${currentTime.minutes}`;
}

function initialisePosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  if(latitude && longitude) {
    let url = getCurrentWeatherApiUrl({
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
function getCurrentWeatherApiUrl(apiData) {
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

    let latitude = response.data.coord.lat;
    let longitude = response.data.coord.lon;
    updateForecast(latitude, longitude);
  });
}



function displayWeatherIcon(weatherIconCode, weatherDescription, id, size) {
  let weatherIcon = document.querySelector(`${id}`);

  const url = `http://openweathermap.org/img/wn/${weatherIconCode}@${size}.png`;

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
  displayOnHtml("#cityName", `${weather.cityName}`);
  displayOnHtml("#currentTemperature", `${weather.currentTemperature}°C`);
  displayOnHtml("#minimumTemperature", `${weather.minimumTemperature}°C`);
  displayOnHtml("#windSpeed", `Wind: ${weather.windSpeed}m/sec`);
  displayOnHtml("#humidity", `Humidity: ${weather.humidity}%`);
  displayOnHtml("#description", `${weather.description}`);
  displayOnHtml("#rainfall", `${weather.rainfall}mm`);

  displayWeatherIcon(weather.weatherIcon, weather.description, "#weatherIcon", "4x");
}

function displayOnHtml(id, message) {
  let element = document.querySelector(`${id}`);
  element.innerHTML = message;
}

function searchCity(event) {
  event.preventDefault();
  setTime(getToday());
  let searchInput = document.querySelector("#search-city-input");
  let url = getCurrentWeatherApiUrl({city: searchInput.value});
  getWeatherInformation(url);
}

function getForecastApiUrl(latitude, longitude) {
  let forecastApiKey = "3ea208daca9158focfbta47e6bf32fe7";
  return `https://api.shecodes.io/weather/v1/forecast?lon=${longitude}&lat=${latitude}&key=${forecastApiKey}&units=metric`;
}
/*
"description": "sky is clear",
    "icon_url": "http://shecodes-assets.s3.amazonaws.com/api/weather/icons/clear-sky-day.png",
                "temperature": {
                "day": 30.78,
                "minimum": 15.44,
                "maximum": 31.66,
                "humidity": 27
            },
 */

function getForecastWeatherInformation(forecastUrl) {
  axios.get(forecastUrl).then(function (response) {
    let data = response.data.daily;
    let apiData = [];

    data.forEach((dayData, index) => {
      if(index >= 6) {
        return
      }

      apiData.push({
          dayName: getForecastDayName(index + 1),
          maximumTemperature: Math.round(dayData.temperature.maximum),
          minimumTemperature: Math.round(dayData.temperature.minimum),
          icon_url: dayData.condition.icon_url,
          weatherDescription: dayData.condition.description,
          weatherHtmlId: `#weather-${index}`,
          temperatureHtmlId: `#temperature-${index}`,
          dayNameHtmlId: `#day-${index}`,
        })
    })

    displayForecastWeather(apiData);

  });
}



function displayForecastWeather(forecastApiData) {
  /*
    input = [
      dayName
      maximumTemperature
      minimumTemperature
      icon_url
      weatherDescription
      weatherHtmlId
      temperatureHtmlId
      dayNameHtmlId
    ]
   */
  function displayForecastDay(information) {
    displayOnHtml(information.dayNameHtmlId, `${information.dayName}`);
    displayOnHtml(information.temperatureHtmlId, `${information.minimumTemperature} | ${information.maximumTemperature}`);
    displayForecastWeatherIcon(information.icon_url, information.weatherDescription, information.weatherHtmlId);
  }

  function displayForecastWeatherIcon(weatherIconCode, weatherDescription, id) {
    let weatherIcon = document.querySelector(`${id}`);

    const url = `${weatherIconCode}`;

    weatherIcon.setAttribute("src", url);
    weatherIcon.setAttribute('alt', weatherDescription);
  }

  forecastApiData.forEach((day) => {
    displayForecastDay(day);
  });
}

function updateForecast(latitude, longitude) {
  let url = getForecastApiUrl(latitude, longitude);
  getForecastWeatherInformation(url);
}

function searchCurrentLocation(event) {
  event.preventDefault();
  setTime(getToday());
  myCurrentPosition();
}

function celsiusToFahrenheit(temperature) {
  return Math.round(temperature * 9/5 + 32);
}

function fahrenheitToCelsius(temperature) {
  return Math.round((temperature - 32)* 5/9);
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

  function updateForecastTemperature(metric){
    for (let i = 0; i < 6; i++) {
      let rawTemperature = getForecastTemperature(i);
      let convertedTemperature = convertForecastTemperature(rawTemperature, metric);
      displayForecastTemperature(i, convertedTemperature);
    }
  }

  function getForecastTemperature(index) {
    return document.querySelector(`#temperature-${index}`).innerHTML;
  }

  function convertForecastTemperature(rawTemperature, metric) {
    let elements = rawTemperature.split(" ");
    if (metric === "c"){
      return {
        min: celsiusToFahrenheit(elements[0]),
        max: celsiusToFahrenheit(elements[2]),
      }
    } else {
      return {
        min: fahrenheitToCelsius(elements[0]),
        max: fahrenheitToCelsius(elements[2]),
      }
    }
  }

  function displayForecastTemperature(id, convertedTemperature) {
    displayOnHtml(`#temperature-${id}`, `${convertedTemperature.min} | ${convertedTemperature.max}`)
  }

  let rawTemperature = getTemperature();
  updateForecastTemperature(rawTemperature.metric.toLocaleLowerCase());
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