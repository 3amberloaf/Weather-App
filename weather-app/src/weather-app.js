import React, { useState, useEffect } from "react";
import "./Weatherapp.css";
import "./opening.css";
import DayForecast  from "./dayforest";

const Weatherapp = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [city, setCity] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [fiveDayForecast, setFiveDayForecast] = useState([]);
    const iconMapping = {
        "01d": '/images/sunny.gif', // example path for clear sky day
        "02d": '/images/rainy.gif', // example path for few clouds day
        "03d": '/images/cloudy.gif', // example path for few clouds day
            };

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
        setLoading(true);
        try {
            // Fetch current weather
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${process.env.REACT_APP_API_KEY}&units=imperial`;
            const weatherResponse = await fetch(currentWeatherUrl);
            const currentWeatherData = await weatherResponse.json();
    
            // Fetch 5-day forecast
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${process.env.REACT_APP_API_KEY}&units=imperial`;
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();
    
            // Process the 5-day forecast data
            const processedForecastData = processForecastData(forecastData.list);
    
            if (currentWeatherData.cod === 200) {
                setWeatherData({ 
                    location: currentWeatherData.name,
                 });
                
            }
    
            if (forecastData.cod === "200") {
                setFiveDayForecast(processedForecastData);
            }
            
            setErrorMessage("");
        } catch (error) {
            console.error("error fetching weather data: ", error);
            setErrorMessage("Failed to fetch weather data. Please try again later.");
        }
        setLoading(false);
    };
    
    // A helper function to process the 5-day forecast data
    const processForecastData = (forecastList) => {
        // Process the forecast data to get daily summaries
        const dailyData = {};
        forecastList.forEach((forecast) => {
            const day = new Date(forecast.dt_txt).toLocaleDateString();
            if (!dailyData[day]) {
                dailyData[day] = [];
            }
            dailyData[day].push(forecast);
        });
    
        // Reduce the data to get the high, low, and other information for each day
        return Object.keys(dailyData).map((day) => {
            const dayForecasts = dailyData[day];
            const highs = dayForecasts.map(f => f.main.temp_max);
            const lows = dayForecasts.map(f => f.main.temp_min);
            const daySummary = {
                day,
                high: Math.max(...highs).toFixed(1),
                low: Math.min(...lows).toFixed(1),
                icon: dayForecasts[0].weather[0].icon,
                description: dayForecasts[0].weather[0].main
            };
            return daySummary;
        }).slice(0, 5); 
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
                return 'images/clouds.jpeg';
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
                    <div className="weather-location">{weatherData.location}</div>
                        <img src={weatherData.weatherIcon} alt="Weather icon" />
                    </div>
                    <div className = "weather-flexbox">

                            
                            <div className="weather-feels">Feels Like: {weatherData.feels}</div>
                            <div className="humidity-percent">Humidity: {weatherData.humidity}</div>
                            <div className="wind-rate">Wind Speed: {weatherData.windspeed}</div>

                    </div>
                    {fiveDayForecast.length > 0 && (
                        <div className="forecast-container">
                            {fiveDayForecast.map((forecastData, index) => (
                            <DayForecast
                                key={index}
                                day={forecastData.day} // Make sure to format the date correctly
                                high={forecastData.high}
                                low={forecastData.low}
                                icon={iconMapping[forecastData.iconCode]} // Map the icon code to your gif images
                                description={forecastData.description}
                            />
                            ))}
          </div>
        )}
                </>
            )}
        </div>
        </>
    );
};

export default Weatherapp;
