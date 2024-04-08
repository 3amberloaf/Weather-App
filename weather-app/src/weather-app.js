import React, { useState, useEffect } from "react";
import "./Weatherapp.css";
import "./opening.css";

const Weatherapp = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [city, setCity] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const api_key = "f56a9502abe192977b18d3434e1da040";

    useEffect(() => {
        fetchWeatherForRandomCity();
        
        const timer = setTimeout(() => {
            // Hide the preloader
            const preloader = document.getElementById("preloader");
            if (preloader) {
                preloader.style.display = 'none';
            }
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.classList.add('fade-in');
                // Optionally, make sure the main content is visible
                mainContent.style.display = 'block';
            }
        }, 3000); // Adjust the time based on the duration of your GIF

        // Clear the timeout if the component is unmounted before the timer runs out
        return () => clearTimeout(timer);


    }, []);

    const fetchWeatherForRandomCity = async () => {
        const cities = ["Warren", "Bedminster", "Newark", "Trenton", "Hillsborough"];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        fetchWeatherData(randomCity);
    };

    const fetchWeatherData = async (searchCity) => {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${api_key}&units=metric`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.cod === 200) {
                setWeatherData({
                    temperature: `${data.main.temp}°C`,
                    humidity: `${data.main.humidity}%`,
                    windspeed: `${data.wind.speed}m/s`,
                    location: data.name,
                    // Assuming you want to use weather icons from the API response
                    weatherIcon: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
                });
                setErrorMessage("");
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error("error fetching weather data: ", error);
            setErrorMessage("Failed to fetch Weather Data. Please try again later.");
        }
    };

    const search = () => {
        if (city.trim() === "") {
            setErrorMessage("Please enter a city name");
            return;
        }
        fetchWeatherData(city);
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            search();
        }
    };

    return (
            <>
                <div id="preloader">
                    <div className="text-container">
                        <h1> New Jersey Local Weather</h1>
                        <p> News Anchor Amber Sautner </p>
                    </div>
                    <img src="images/sun.gif" alt="loading" className="character-graphic" />
                </div>
                <div className="container">
            <div className="top-bar">
                <input
                    type="text"
                    className="cityInput"
                    placeholder="Enter city name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button className="search-icon" onClick={search}>
                    Search
                </button>
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            {weatherData && (
                <>
                    <div className="weather-image">
                        <img src={weatherData.weatherIcon} alt="Weather icon" />
                    </div>
                    <div className="weather-temp">{weatherData.temperature}</div>
                    <div className="weather-location">{weatherData.location}</div>
                    <div className="data-container">
                        <div className="humidity-percent">{weatherData.humidity}</div>
                        <div className="text">Humidity</div>
                    </div>
                    <div className="element">
                        <div className="wind-rate">{weatherData.windspeed}</div>
                        <div className="text">Wind Speed</div>
                    </div>
                </>
            )}
        </div>

        <script src="script.js"></script>
        </>
    );
};

export default Weatherapp;
