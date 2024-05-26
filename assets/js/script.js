var apiKey = "1b18ce13c84e21faafb19c931bb29331";
var savedSearches = [];

var searchHistoryList = function (cityName) {
  // Remove existing entry if it exists
  $("#search-history-list")
    .find('li:contains("' + cityName + '")')
    .remove();

  // Create a list item for the city name
  var searchHistoryEntry = $("<li>");
  searchHistoryEntry.addClass("list-group-item past-search");
  searchHistoryEntry.text(cityName);

  // Append the new entry to the list
  var searchHistoryListEl = $("#search-history-list");
  searchHistoryListEl.append(searchHistoryEntry);

  // Update savedSearches array and localStorage
  savedSearches = JSON.parse(localStorage.getItem("savedSearches")) || [];
  savedSearches.push(cityName);
  localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

  // Reset search input
  $("#search-input").val("");
};

var loadSearchHistory = function () {
  var savedSearchHistory = localStorage.getItem("savedSearches");
  if (!savedSearchHistory) {
    return false;
  }
  savedSearchHistory = JSON.parse(savedSearchHistory);
  for (var i = 0; i < savedSearchHistory.length; i++) {
    searchHistoryList(savedSearchHistory[i]);
  }
};

var clearSearchHistory = function () {
  localStorage.removeItem("savedSearches");
  $("#search-history-list").empty();
  savedSearches = [];
};

var currentWeatherSection = function (cityName) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
  )
    .then(function (response) {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(function (response) {
      var cityLon = response.coord.lon;
      var cityLat = response.coord.lat;

      fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`
      )
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          searchHistoryList(cityName);

          var currentWeatherContainer = $("#current-weather-container");
          currentWeatherContainer.addClass("current-weather-container");

          var currentTitle = $("#current-title");
          var currentDay = moment().format("M/D/YYYY");
          currentTitle.text(`${cityName} (${currentDay})`);

          var currentIcon = $("#current-weather-icon");
          currentIcon.addClass("current-weather-icon");
          var currentIconCode = response.current.weather[0].icon;
          currentIcon.attr(
            "src",
            `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`
          );

          var currentTemperature = $("#current-temperature");
          currentTemperature.text(
            "Temperature: " + response.current.temp + " \u00B0F"
          );

          var currentHumidity = $("#current-humidity");
          currentHumidity.text("Humidity: " + response.current.humidity + "%");

          var currentWindSpeed = $("#current-wind-speed");
          currentWindSpeed.text(
            "Wind Speed: " + response.current.wind_speed + " MPH"
          );

          var currentUvIndex = $("#current-uv-index");
          currentUvIndex.text("UV Index: ");
          var currentNumber = $("#current-number");
          currentNumber.text(response.current.uvi);

          // Remove any existing UV index classes
          currentNumber.removeClass("favorable moderate severe");

          if (response.current.uvi <= 2) {
            currentNumber.addClass("favorable");
          } else if (response.current.uvi >= 3 && response.current.uvi <= 7) {
            currentNumber.addClass("moderate");
          } else {
            currentNumber.addClass("severe");
          }
        });
    })
    .catch(function (err) {
      $("#search-input").val("");
      alert(
        "We could not find the city you searched for. Try searching for a valid city."
      );
    });
};

// UV index background color and warning message
function getUvIndexWarning(uvi) {
  if (uvi <= 2) {
    return {
      background: "green",
      message:
        "UV index is low. Minimal sun protection required.",
    };
  } else if (uvi <= 5) {
    return {
      background: "yellow",
      message:
        "UV index is moderate. Protection against sun damage is needed.",
    };
  } else if (uvi <= 7) {
    return {
      background: "orange",
      message:
        "UV index is high. Extra protection against sun damage is needed.",
    };
  } else if (uvi <= 10) {
    return {
      background: "red",
      message:
        "UV index is very high. Take extra precautions.",
    };
  } else {
    return {
      background: "violet",
      message:
        "UV index is extreme. Take all precautions possible.",
    };
  }
}

var fiveDayForecastSection = function (cityName) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var cityLon = response.coord.lon;
      var cityLat = response.coord.lat;

      fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`
      )
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          console.log(response);

          var futureForecastTitle = $("#future-forecast-title");
          futureForecastTitle.text("5-Day Forecast:");

          for (var i = 1; i <= 5; i++) {
            var futureCard = $(".future-card");
            futureCard.addClass("future-card-details");

            var futureDate = $("#future-date-" + i);
            var date = moment().add(i, "d").format("M/D/YYYY");
            futureDate.text(date);

            var futureIcon = $("#future-icon-" + i);
            futureIcon.addClass("future-icon");
            var futureIconCode = response.daily[i].weather[0].icon;
            futureIcon.attr(
              "src",
              `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`
            );

            var futureTemp = $("#future-temp-" + i);
            futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

            var futureHumidity = $("#future-humidity-" + i);
            futureHumidity.text(
              "Humidity: " + response.daily[i].humidity + "%"
            );

            var futureWind = $("#future-wind-" + i);
            futureWind.text("Wind: " + response.daily[i].wind_speed + " MPH");

            var futureUv = $("#future-uv-" + i);
            var uvIndex = response.daily[i].uvi;
            var uvInfo = getUvIndexWarning(uvIndex);
            futureUv.text("UV Index: " + uvIndex);
            futureUv.css("background-color", uvInfo.background);
            futureUv.attr("title", uvInfo.message);
          }
        });
    });
};

$(document).ready(function () {
  var futureForecastTitle = $("#future-forecast-title");
  futureForecastTitle.text("5-Day Forecast:");

  futureForecastTitle.after(
    '<img id="forecast-title-image" src="./assets/images/uv-index-scale.gif" alt="uv-index-scale-image" class="forecast-title-image">'
  );

  loadSearchHistory();
});

$("#search-form").on("submit", function (event) {
  event.preventDefault();

  var cityName = $("#search-input").val();
  if (cityName === "" || cityName == null) {
    alert("Please enter name of city.");
  } else {
    currentWeatherSection(cityName);
    fiveDayForecastSection(cityName);
  }
});

$("#search-history-container").on("click", "li", function () {
  var previousCityName = $(this).text();
  currentWeatherSection(previousCityName);
  fiveDayForecastSection(previousCityName);
  $(this).remove();
});

$("#clear-history-button").on("click", function () {
  clearSearchHistory();
});
