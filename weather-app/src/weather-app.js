import React, { useState, useEffect } from "react";
import "./Weatherapp.css";
import "./opening.css";


const Weatherapp = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [city, setCity] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const api_key = "f56a9502abe192977b18d3434e1da040";
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeatherForRandomCity();
    
        const timer = setTimeout(() => {
            // Start the fade-out
            const preloader = document.getElementById("preloader");
            if (preloader) {
                preloader.classList.add('fade-out');
            }
    
            // Wait for the fade-out to finish before hiding the preloader
            const fadeOutDuration = 1000; // duration of fade-out in milliseconds
            setTimeout(() => {
                if (preloader) {
                    preloader.style.display = 'none';
                }
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.classList.add('fade-in');
                    mainContent.style.display = 'block';
                }
            }, fadeOutDuration);
        }, 3000);
    
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
                    temperature: `${data.main.temp}°F`,
                    humidity: `${data.main.humidity}%`,
                    windspeed: `${data.wind.speed}m/s`,
                    location: data.name,
                    weatherIcon: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
                    weatherCondition: data.weather[0].main,
                });
                setErrorMessage("");
                setLoading(false);
            } else {
                setErrorMessage(data.message); 
                setLoading(false);
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

    const getBackgroundImage = (weatherCondition) => {
        switch (weatherCondition) {
            case 'Rain':
                return 'images/rain.gif'; 
            case 'Clear':
                return 'images/flowers.gif';
            default:
                return 'images/clouds.jpeg'; 
        }
    };
    
    const backgroundStyle = weatherData ? { backgroundImage: `url(${getBackgroundImage(weatherData.weatherCondition)})` } : {};


    return (
        <>
            <div id="preloader"> 
                    <><div className="text-container">
                        <h1> New Jersey Local Weather</h1>
                        <p> News Anchor Amber Sautner </p>
                    </div><img src="images/sun.gif" alt="loading" className="character-graphic" /></>
              </div> 
        <div className="container" style={!loading ? backgroundStyle : {}}>
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
                    <div className = "weather-information">
                        <div className="weather-location">{weatherData.location}</div>
                        <div className="weather-temp">Temperature: {weatherData.temperature}</div>
                        <div className="data-container">
                            <div className="humidity-percent">Humidity: {weatherData.humidity}</div>
                        </div>
                        <div className="element">
                            <div className="wind-rate">Wind Speed: {weatherData.windspeed}</div>
                        </div> 
                    </div>
                </>
            )}
        </div>
        </>
    );
};

export default Weatherapp;
