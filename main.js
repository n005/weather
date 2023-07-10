// Dark Mode Triggered by Click
const themeToggle = document.querySelector('#flexSwitchCheckChecked');
themeToggle.addEventListener('click', changeTheme);

// User Theme Preference
const userTheme = localStorage.getItem('theme');
if (userTheme === 'dark') {
	themeToggle.click();
}

// Dark Mode Theme Change
function changeTheme() {
	document.querySelector('body').classList.toggle('dark');
	if (document.querySelector('body').classList.contains('dark')) {
		localStorage.setItem('theme', 'dark');
	} else {
		localStorage.setItem('theme', 'light');
	}
}

// Hover Function for Mobile
document.addEventListener('touchstart', function () {}, true);

// Variables for API & Location Heading
const apiWeather = 'https://api.open-meteo.com/v1/forecast/';
let units = 'imperial';
const locationHeading = document.querySelector('#location');
const geolocationButton = document.querySelector('#geolocation-btn');
var locationpreferences;

// User Location Preference
const userLocation = localStorage.getItem('location');
if (userLocation) {
	updateWeatherByName(userLocation);
} else {
	updateWeatherByName("Coursage");
}

// Get longitude and latitude
function updateWeatherByName(location) {
	console.log(location);
	if (location == "undefined") {location="Coursage"};
	locationHeading.innerHTML = location
	axios.get('https://geocoding-api.open-meteo.com/v1/search?name=' + location + '&count=1&language=en&format=json')
	.then(updateWeatherByNameLatLong);
}

// Call API by City Name
function updateWeatherByNameLatLong(location) {
	locationpreferences = location;
	const latitude = location.data.results[0].latitude;
	const longitude = location.data.results[0].longitude;
	const tz = locationpreferences.data.results[0].timezone;
	axios
		.get(`${apiWeather}?latitude=${latitude}&longitude=${longitude}&hourly=precipitation,dewpoint_2m,weathercode,is_day,temperature_2m,relativehumidity_2m,apparent_temperature,cloudcover,visibility,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=${tz}`)
		.then(displayCurrentTemperature, function () {
			alert(
				'There was a problem with your request! Try again or check back later.'
			);
		});
}

// Call API by Geolocation
geolocationButton.addEventListener('click', function () {
	navigator.geolocation.getCurrentPosition(getLocation);
});

function getLocation(position) {
	const lon = position.coords.longitude;
	const lat = position.coords.latitude;
	tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
	axios
		.get(`${apiWeather}?latitude=${lat}&longitude=${lon}&hourly=precipitation,dewpoint_2m,weathercode,is_day,temperature_2m,relativehumidity_2m,apparent_temperature,cloudcover,visibility,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=${tz}`)
		.then(displayCurrentTemperature);
}

// Call API by Search Functionality
function searchCity(event) {
	event.preventDefault();
	const searchInput = document.querySelector('#search-input').value;
	if (searchInput) {
		updateWeatherByName(searchInput);
	}
}

const searchBtn = document.querySelector('.search-form');
searchBtn.addEventListener('submit', searchCity);

// Call API for Daily Forecast
function getForecast(lat, lon, tz) {
	axios
		.get(
			`${apiWeather}?latitude=${lat}&longitude=${lon}&hourly=precipitation,weathercode,is_day,temperature_2m,relativehumidity_2m,apparent_temperature,cloudcover,visibility,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,windspeed_10m_max,windgusts_10m_max,precipitation_sum&timezone=${tz}&models=meteofrance_seamless`
		)
		.then(displayForecast);
}

// Change Temperature Type & Formula to Toggle Between C & F Values
const allTemps = document.querySelectorAll('#temp-now, .temps, .faded-temp');
const fahrenheit = document.querySelectorAll('.fahrenheit');
const celsius = document.querySelector('.celsius');
const windUnit = document.querySelector('#wind-unit');

function toggleTemp(event) {
	event.preventDefault();
	if (celsius.innerHTML === 'C') {
		celsius.innerHTML = 'F';
		fahrenheit.forEach(el => (el.innerHTML = 'C'));
		allTemps.forEach(
			el => (el.textContent = Math.round((el.innerHTML - 32) * (5 / 9)))
		);
		windUnit.innerHTML = `km/h`;
		units = 'metric';
	} else if (celsius.innerHTML === 'F') {
		celsius.innerHTML = 'C';
		fahrenheit.forEach(el => (el.innerHTML = 'F'));
		allTemps.forEach(
			el => (el.textContent = Math.round(el.innerHTML * (9 / 5) + 32))
		);
		windUnit.innerHTML = `mph`;
		units = 'imperial';
	}
	// Update Data to Reflect Celsius or Fahrenheit Change
	updateWeatherByName(locationHeading.textContent);
}

celsius.addEventListener('click', toggleTemp);

// Variables for Elements Representing Data
const currentTemp = document.querySelector('#temp-now');
const highTemp = document.querySelector('#high-temp');
const lowTemp = document.querySelector('#low-temp');
const feelsLikeTemp = document.querySelector('#feels-like');
const tempDescription = document.querySelector('#description-temp');
const wind = document.querySelector('#wind');
const humidity = document.querySelector('#humidity');
const visibility = document.querySelector('#visibility');
const clouds = document.querySelector('#clouds');
const sunrise = document.querySelector('#sunrise-time');
const sunset = document.querySelector('#sunset-time');
const scenery = document.querySelector('#scenery');
const conditionMsg = document.querySelector('#condition-msg');
const todaysDate = document.querySelector('#today');

//Create a chart 
const ctx = document.getElementById('myChart');

var mychart = new Chart(ctx, {
	  data: {
        datasets: [{
            type: 'line',
            label: 'Température (°C)',
            data: []
        }, {
            type: 'bar',
            label: 'Précipitaion (mm)',
            data: []
        }],
		labels: []
    },
    options: {responsive: true, 
		interaction: {
			intersect: false,
			}
		}
  });

// Display Temperature
function displayCurrentTemperature(response) {
	if (response.status == 200) {
		const data = response.data;

		// Sunset & Sunrise Times
		const apiSunrise = new Date(data.daily.sunrise[0]);
		const apiSunset = new Date(data.daily.sunset[0]);
		const options = {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		};
		sunrise.innerHTML = apiSunrise.toLocaleString([], options);
		sunset.innerHTML = apiSunset.toLocaleString([], options);

		// Change Current Time/Date to Location
		const tz = locationpreferences.data.results[0].timezone;
		const today = new Date();
		const localToday = today.toLocaleString('fr-FR', { timeZone: tz });
		todaysDate.innerHTML = `${localToday}`;

		// Change Landscape Image Based on Sunset / Sunrises
		const sunriseHour = apiSunrise.getHours();
		const sunsetHour = apiSunset.getHours();

		today.getHours() < sunriseHour ||
		today.getHours() >= sunsetHour
			? (scenery.src = 'assets/night-landscape.png')
			: (scenery.src = 'assets/day-landscape.png');
		
		// Get hour number 
		//const hournb = new Date().getHours();
		const hournb = new Date(localToday).getHours();
		
		// Is Day ?
		const dayornight = data.hourly.is_day[hournb];
		
		//Get Descriptions & Change Icon for Main Overview
		var desci;
		const code = data.hourly.weathercode[hournb];
		axios.get('descriptions.json').then(desc => {
			const mainWeatherIcon = document.querySelector('.default-main-icon');
			weathercdtupdate(desc);
			if (dayornight == 1) {
			desci = desc.data[code].day.description;
			tempDescription.innerHTML = `${desci}`;
			mainWeatherIcon.setAttribute('src', desc.data[code].day.image);
			mainWeatherIcon.setAttribute('alt', desc.data[code].day.description);}
			else {
			desci = desc.data[code].night.description;
			tempDescription.innerHTML = `${desci}`;
			mainWeatherIcon.setAttribute('src', desc.data[code].night.image);
			mainWeatherIcon.setAttribute('alt', desc.data[code].night.description);
			}
		});
		
		// Update Weather Details
		locationHeading.innerHTML = `${locationpreferences.data.results[0].name}, ${locationpreferences.data.results[0].country}`;
		currentTemp.innerHTML = `${Math.round(data.hourly.temperature_2m[hournb])}`;
		highTemp.innerHTML = `${Math.round(data.daily.temperature_2m_max[0])}`;
		lowTemp.innerHTML = `${Math.round(data.daily.temperature_2m_min[0])}`;
		feelsLikeTemp.innerHTML = `${Math.round(data.hourly.apparent_temperature[hournb])}`;
		// tempDescription.innerHTML = `${data.weather[0].description}`;
		wind.innerHTML = `${Math.round(data.hourly.windspeed_10m[hournb])}`;
		humidity.innerHTML = `${data.hourly.relativehumidity_2m[hournb]}`;
		visibility.innerHTML = `${Math.round(data.hourly.visibility[hournb] / 1000)}`;
		clouds.innerHTML = `${data.hourly.cloudcover[hournb]}`;
		const dewPoint = document.querySelector('#dew-point');
		dewPoint.innerHTML = `${Math.round(response.data.hourly.dewpoint_2m[hournb])}`;

		// Weather Condition Message Indicator
		function weathercdtupdate(desc){
		const weatherType = desc.data[code].day.description;
		if (
			weatherType === 'Pluie' ||
			weatherType === 'Bruine'
		) {
			conditionMsg.innerHTML = `<i class="fa-solid fa-umbrella"></i> Parapluie requis`;
		} else if (weatherType.toLowerCase().includes('Orage') || weatherType === 'Tornado') {
			conditionMsg.innerHTML = `<i class="fa-solid fa-cloud-bolt"></i> Reste à l'intérieur`;
		} else if (weatherType.toLowerCase().includes('Neige')) {
			conditionMsg.innerHTML = `<i class="fa-solid fa-snowflake"></i> Habillez-vous chaudement`;
		} else if (weatherType.toLowerCase().includes('ensoleillé')) {
			conditionMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Conditions idéales`;
		} else if (
			weatherType.toLowerCase().includes('Brumeux') ||
			weatherType.toLowerCase().includes('Brouillard') ||
			weatherType.toLowerCase().includes('Haze')
		) {
			conditionMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Visibilité réduite`;
		} else {
			conditionMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Mauvaise qualité de l'air`;
		}
		}

		// Call Daily Forecast Function Based on Current Location Data
		getForecast(response.data.latitude, response.data.longitude, response.data.timezone);
		//displayForecast(response);

		// Local Storage
		localStorage.setItem('location', `${data.name}`);
		
		//TEST
		const time_list=data.hourly.time.slice(hournb,hournb+24);
		const hours = time_list.map(hours => new Date(hours).getHours() + "h")
		
		mychart.data.labels = hours;
		mychart.data.datasets[0].data = data.hourly.temperature_2m.slice(hournb,hournb+24);
		mychart.data.datasets[1].data = data.hourly.precipitation.slice(hournb,hournb+24);
		mychart.update();

	}
}

// Display Daily Forecast Data
function displayForecast(response) {
	const forecastData = response.data.daily;
	const forecastContainer = document.querySelector('.full-forecast');
	var forecastHTML = '';
	
	for (let i = 1; i < 5; i++){
		forecastHTML += `<div class="daily m-2 m-md-0">
							<p>${formatDay(i)}</p>
							<img
								src="assets/loading.svg"
								class="weather-icon forecast-icon mb-2"
								height="45px"
								width="50px"
							/>
							<p>
								<span class="temps">${Math.round(
									forecastData.temperature_2m_max[i]
								)}</span>°<span class="fahrenheit">${
				units === 'metric' ? 'C' : 'C'
			} </span
								><br />
								${Math.round(forecastData.windspeed_10m_max[i])} km/h
								<br />
								<span class="daily-low">
									<span class="forecast-low temps">${Math.round(
										forecastData.temperature_2m_min[i]
									)}</span>°<span class="fahrenheit"
										>${units === 'metric' ? 'C' : 'C'}
									</span>
									<br> 
									${Math.round(forecastData.precipitation_sum[i])} mm
								</span>
							</p>
						</div>
						`;
		//Change Icons
		let code = forecastData.weathercode[i];
		axios.get('descriptions.json').then(desc => {
			//console.log(forecastHTML);
			forecastHTML = forecastHTML.replace(
							'src="assets/loading.svg"',
							`src="${desc.data[code].day.image}"`
							);
			forecastContainer.innerHTML = forecastHTML;
		});
		//console.log(forecastHTML);
		
	//forecastContainer.innerHTML = forecastHTML;
	
	}
}

// Format Daily Forecast Unix Timestamps
function formatDay(dayct) {
	const date = new Date();
	date.setDate(date.getDate() + dayct - 1);
	const day = date.getDay();
	const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
	return days[day];
}
