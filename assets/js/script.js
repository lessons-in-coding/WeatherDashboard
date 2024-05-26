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
  if (savedSearches.length > 0) {
    var previousSavedSearches = localStorage.getItem("savedSearches");
    savedSearches = JSON.parse(previousSavedSearches);
  }
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

//UV index bg color and warning message
function getUvIndexWarning(uvi) {
  if (uvi <= 2) {
    return {
      background: "green",
      message:
        "ဤအဆင့် နေရောင်ခြည် UV သည် အန္တရာယ်အနည်းငယ်မျှရှိသောအဆင့်ဖြစ်သည်။ နေထွက်အားပြင်းသောအချိန် (မနက် ၁၀ နာရီမှ ၄ နာရီအထိ)တွင် နေရောင်အောက်တွင် တစ်နာရီလောက်သာ နေသင့်သည်။ သို့သော် အရေပြား အလွန်နုညံ့သောသူများနှင့် ကလေးငယ်များကို နေရောင်ထဲ၌ တာရှည်စွာနေခြင်းမှ ကာကွယ်ပေးရပါမည်။",
    };
  } else if (uvi <= 5) {
    return {
      background: "yellow",
      message:
        "ဤအဆင့် နေရောင်ခြည် UV သည်  နေရောင်ခြည်အောက်တွင် ကာကွယ်မှုမရှိဘဲနေလျှင် စတုတ္ထအန္တရာယ်ရှိသောအဆင့်ဖြစ်သည်။ သာမန်လူများသော်မှ ၂၀ မိနစ်အတွင်း အရေပြားလောင်ကျွမ်းသွားနိုင်ပါသည်။ ဦးထုပ်ဆောင်းခြင်းနှင့် နေကာမျက်မှန်ဝတ်ဆင်ခြင်းဖြင့် မျက်စိများကို ကာကွယ်နိုင်ပါသည်။ SPF ၃၀ အနည်းဆုံးပါဝင်သော နေရောင်ကာခရင်မ်(sunscreen)ကို သုံးစွဲရပါမည်။ အပြင်သို့ထွက်သည့်အခါ လက်ရှည်အင်္ကျီများ ဝတ်ဆင်ရန် လိုအပ်ပါသည်။",
    };
  } else if (uvi <= 7) {
    return {
      background: "orange",
      message:
        "ဤအဆင့် နေရောင်ခြည် UV သည်  နေရောင်ခြည်အောက်တွင် ကာကွယ်မှုမရှိဘဲနေလျှင် တတိယအန္တရာယ်ရှိသောအဆင့်ဖြစ်သည်။ သာမန်လူများသော်မှ ၂၀ မိနစ်အတွင်း အရေပြားလောင်ကျွမ်းသွားနိုင်ပါသည်။ ဦးထုပ်ဆောင်းခြင်းနှင့် နေကာမျက်မှန်ဝတ်ဆင်ခြင်းဖြင့် မျက်စိများကို ကာကွယ်နိုင်ပါသည်။ SPF ၃၀ အနည်းဆုံးပါဝင်သော နေရောင်ကာခရင်မ်(sunscreen)ကို သုံးစွဲရပါမည်။ အပြင်သို့ထွက်သည့်အခါ လက်ရှည်အင်္ကျီများ ဝတ်ဆင်ရန်လိုအပ်ပါသည်။ နှာခေါင်းနှင့် နားရွက်များကို ဂရုစိုက်ကာကွယ်ရမည်ကိုလည်းမမေ့ပါနှင့်။ နေရောင်ကာခရင်မ်သည် နေရောင်ကြောင့်မီးလောင်ခြင်းနှင့် နေရောင်၏သက်ရောက်မှုများမှ ကာကွယ်ပေးပါသည်။ နေရောင်ကာပါဝင်သော နှုတ်ခမ်းဆိုးဆေးတစ်ခုခုကို အသုံးပြုပါ။",
    };
  } else if (uvi <= 10) {
    return {
      background: "red",
      message:
        "ဤအဆင့် နေရောင်ခြည် UV သည် နေရောင်ခြည်အောက်တွင် ကာကွယ်မှုမရှိဘဲနေလျှင် ဒုတိယအန္တရာယ်ရှိသောအဆင့်ဖြစ်သည်။ သာမန်လူများသော်မှ ၁၀ မိနစ်အတွင်း အရေပြားလောင်ကျွမ်းသွားနိုင်ပါသည်။ နေထွက်အားပြင်းသောအချိန် (မနက် ၁၀ နာရီမှ ၄ နာရီအထိ) တွင် နေရောင်အောက်တိုက်ရိုက်နေခြင်းမှ ရှောင်ရှားပါ။ သင့်ကိုယ်ကိုယ်ကာကွယ်ရန် SPF ၃၀ အနည်းဆုံးပါဝင်သော နေရောင်ကာခရင်မ်ကို ခပ်ထူထူလိမ်းထားပါ။ မျက်စိများကိုကာကွယ်ရန် ကာကွယ်ရေးအဝတ်အစားများနှင့် နေကာမျက်မှန်များဝတ်ပါ။ အပြင်ထွက်သည့်အခါ အရိပ်ရှိရာနေရာကို ရှာဖွေပါ။ ရေ၊ သဲ၊ ကွန်ကရစ်လမ်းနှင့် မှန်များသည် UV ရောင်ခြည်များကို ရောင်ပြန်သက်ရောက်စေသည့်အတွက် ထိုအရာများမှရှောင်ရှားပါ။ လက်ရှည်အင်္ကျီနှင့် ဘောင်းဘီများဝတ်ပါ။ UV ရောင်ခြည်များသည် အပေါက်များနှင့် နေရာလွတ်များမှတဆင့် ဝင်ရောက်နိုင်သည်ကို သတိပြုပါ။",
    };
  } else {
    return {
      background: "violet",
      message:
        "ဤအဆင့် နေရောင်ခြည် UV သည်  နေရောင်ခြည်အောက်တွင် ကာကွယ်မှုမရှိဘဲနေလျှင် ပထမအန္တရာယ်ရှိသောအဆင့်ဖြစ်သည်။ သာမန်လူများသော်မှ ၅ မိနစ်အတွင်း အရေပြားလောင်ကျွမ်းသွားနိုင်ပါသည်။ အပြင်တွင်အလုပ်လုပ်သောသူများနှင့် အပျော်ခရီထွက်သူများအတွက် အထူးစိုးရိမ်ရပါသည်။ နေထွက်အားပြင်းသောအချိန် (မနက် ၁၀ နာရီမှ ၄ နာရီအထိ) တွင် နေရောင်အောက်တိုက်ရိုက်နေခြင်းမှ ရှောင်ရှားပါ။ SPF 30+ အနည်းဆုံးပါဝင်သော နေရောင်ကာခရင်မ်ကို ၂ နာရီခြားတစ်ခါ လိမ်းပေးပါ။ အကယ်၍ ချွေးထွက်လျှင် သို့မဟုတ် ရေကူးနေပါက ခဏခဏလိမ်းပေးပါ။ နေရောင်နှင့်တိုက်ရိုက်ထိတွေ့ခြင်းမှ ရှောင်ရှားပါ။ UVA နှင့် UVB ရောင်ခြည်ကို ၉၉-၁၀၀% တားဆီးနိုင်သော နေကာမျက်မှန်ကိုဝတ်ဆင်ပါ။ UV ရောင်ခြည် ၅၀% သည် မျက်စိကိုတိုက်ရိုက်ထိခိုင်စေနိုင်ပါသည်။ ဦးထုပ်ခပ်ပြန့်ပြန့်ကို ဆောင်းထားခြင်းဖြင့် ကာကွယ်ပါ။",
    };
  }
}
//ends

var fiveDayForecastSection = function (cityName) {
  // get and use data from open weather current weather api end point
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
  )
    // get response and turn it into objects
    .then(function (response) {
      return response.json();
    })
    // get city's longitude and latitude
    .then(function (response) {
      var cityLon = response.coord.lon;
      var cityLat = response.coord.lat;

      fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`
      )
        // get response from one call api and turn it into objects
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          console.log(response);

          add 5 day forecast title
          var futureForecastTitle = $("#future-forecast-title");
          futureForecastTitle.text("5-Day Forecast:");
                    // Append an image after setting the title
          futureForecastTitle.after('<img id="forecast-title-image" src="./assets/images/uv-index-scale.gif" alt="uv-index-scale-image" class="forecast-title-image">');

          // using data from response, set up each day of 5 day forecast
          for (var i = 1; i <= 5; i++) {
            // add class to future cards to create card containers
            var futureCard = $(".future-card");
            futureCard.addClass("future-card-details");

            // add date to 5 day forecast
            var futureDate = $("#future-date-" + i);
            var date = moment().add(i, "d").format("M/D/YYYY");
            futureDate.text(date);

            // add icon to 5 day forecast
            var futureIcon = $("#future-icon-" + i);
            futureIcon.addClass("future-icon");
            var futureIconCode = response.daily[i].weather[0].icon;
            futureIcon.attr(
              "src",
              `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`
            );

            // add temp to 5 day forecast
            var futureTemp = $("#future-temp-" + i);
            futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

            // add humidity to 5 day forecast
            var futureHumidity = $("#future-humidity-" + i);
            futureHumidity.text(
              "Humidity: " + response.daily[i].humidity + "%"
            );

            // add wind speed to 5 day forecast
            var futureWind = $("#future-wind-" + i);
            futureWind.text("Wind: " + response.daily[i].wind_speed + " MPH");

            // add UV index and warning to 5 day forecast
            var futureUv = $("#future-uv-" + i);
            // futureUv.text("UV Index: " + response.daily[i].uvi);
            var uvIndex = response.daily[i].uvi;
            var uvInfo = getUvIndexWarning(uvIndex);
            futureUv.text("UV Index: " + uvIndex);
            futureUv.css("background-color", uvInfo.background);
            futureUv.attr("title", uvInfo.message); // Adding a tooltip with the warning message
          }
        });
    });
};

// $(document).ready(function() {
//   function updateFutureForecastTitle() {
//     var futureForecastTitle = $("#future-forecast-title");
//     futureForecastTitle.text("5-Day Forecast:");

//     // Check if the image already exists
//     if ($("#forecast-title-image").length === 0) {
//       // Append an image after setting the title if it doesn't already exist
//       futureForecastTitle.after('<img id="forecast-title-image" src="./assets/images/uv-index-scale.gif" alt="uv-index-scale-image" class="forecast-title-image">');
//     }
//   }

//   // Call this function whenever you need to update the future forecast title
//   // For example, when a new city is added
//   $("#search-form").on("submit", function(event) {
//     event.preventDefault();
//     var cityName = $("#search-input").val().trim();
//     if (cityName) {
//       // Perform your search and update actions here
//       updateFutureForecastTitle();
//     }
//   });
// });


// $(document).ready(function() {
//   function updateFutureForecastTitle() {
//     var futureForecastTitle = $("#future-forecast-title");
//     futureForecastTitle.text("5-Day Forecast:");

//     // Check if the image already exists
//     if ($("#forecast-title-image").length === 0) {
//       // Append an image after setting the title if it doesn't already exist
//       futureForecastTitle.after('<img id="forecast-title-image" src="./assets/images/uv-index-scale.gif" alt="uv-index-scale-image" class="forecast-title-image">');
//     }
//   }

//   // Call this function whenever you need to update the future forecast title
//   updateFutureForecastTitle();
// });

// $(document).ready(function() {
//   var futureForecastTitle = $("#future-forecast-title");
//   futureForecastTitle.text("5-Day Forecast:");

//   // Append an image after setting the title
//   futureForecastTitle.after('<img id="forecast-title-image" src="./assets/images/uv-index-scale.gif" alt="uv-index-scale-image" class="forecast-title-image">');
// });

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

loadSearchHistory();

/*
var apiKey = "1b18ce13c84e21faafb19c931bb29331";
var savedSearches = [];

var searchHistoryList = function(cityName) {
    $('.past-search:contains("' + cityName + '")').remove();
    var searchHistoryEntry = $("<p>");
    searchHistoryEntry.addClass("past-search");
    searchHistoryEntry.text(cityName);
    var searchEntryContainer = $("<div>");
    searchEntryContainer.addClass("past-search-container");
    searchEntryContainer.append(searchHistoryEntry);
    var searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(searchEntryContainer);
    if (savedSearches.length > 0){
        var previousSavedSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(previousSavedSearches);
    }
    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
    $("#search-input").val("");
};

var loadSearchHistory = function() {
    var savedSearchHistory = localStorage.getItem("savedSearches");
    if (!savedSearchHistory) {
        return false;
    }
    savedSearchHistory = JSON.parse(savedSearchHistory);
    for (var i = 0; i < savedSearchHistory.length; i++) {
        searchHistoryList(savedSearchHistory[i]);
    }
};

var clearSearchHistory = function() {
    localStorage.removeItem("savedSearches");
    $("#search-history-container").empty();
    savedSearches = [];
};

var currentWeatherSection = function(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                .then(function(response) {
                    return response.json();
                })
                .then(function(response){
                    searchHistoryList(cityName);

                    var currentWeatherContainer = $("#current-weather-container");
                    currentWeatherContainer.addClass("current-weather-container");

                    var currentTitle = $("#current-title");
                    var currentDay = moment().format("M/D/YYYY");
                    currentTitle.text(`${cityName} (${currentDay})`);
                    var currentIcon = $("#current-weather-icon");
                    currentIcon.addClass("current-weather-icon");
                    var currentIconCode = response.current.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

                    var currentTemperature = $("#current-temperature");
                    currentTemperature.text("Temperature: " + response.current.temp + " \u00B0F");

                    var currentHumidity = $("#current-humidity");
                    currentHumidity.text("Humidity: " + response.current.humidity + "%");

                    var currentWindSpeed = $("#current-wind-speed");
                    currentWindSpeed.text("Wind Speed: " + response.current.wind_speed + " MPH");

                    var currentUvIndex = $("#current-uv-index");
                    currentUvIndex.text("UV Index: ");
                    var currentNumber = $("#current-number");
                    currentNumber.text(response.current.uvi);

                    if (response.current.uvi <= 2) {
                        currentNumber.addClass("favorable");
                    } else if (response.current.uvi >= 3 && response.current.uvi <= 7) {
                        currentNumber.addClass("moderate");
                    } else {
                        currentNumber.addClass("severe");
                    }
                })
        })
        .catch(function(err) {
            $("#search-input").val("");
            alert("We could not find the city you searched for. Try searching for a valid city.");
        });
};

var fiveDayForecastSection = function(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
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
                        futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

                        var futureTemp = $("#future-temp-" + i);
                        futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

                        var futureHumidity = $("#future-humidity-" + i);
                        futureHumidity.text("Humidity: " + response.daily[i].humidity + "%");

                        var futureWind = $("#future-wind-" + i);
                        futureWind.text("Wind: " + response.daily[i].wind_speed + " MPH");

                        var futureUv = $("#future-uv-" + i);
                        futureUv.text("UV Index: " + response.daily[i].uvi);
                    }
                });
        });
};

$("#search-form").on("submit", function() {
    event.preventDefault();
    
    var cityName = $("#search-input").val();
    if (cityName === "" || cityName == null) {
        alert("Please enter name of city.");
        event.preventDefault();
    } else {
        currentWeatherSection(cityName);
        fiveDayForecastSection(cityName);
    }
});

$("#search-history-container").on("click", "p", function() {
    var previousCityName = $(this).text();
    currentWeatherSection(previousCityName);
    fiveDayForecastSection(previousCityName);
    var previousCityClicked = $(this);
    previousCityClicked.remove();
});

$("#clear-history-button").on("click", function() {
    clearSearchHistory();
});

loadSearchHistory();
*/
