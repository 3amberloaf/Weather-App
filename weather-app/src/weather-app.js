import React, { useState, useEffect, useCallback } from "react";
import "./Weatherapp.css";
import "./opening.css";
import DayForecast from "./dayforest";

const CACHE_EXPIRATION = 10 * 60 * 1000; // Cache expiration time in milliseconds (e.g., 10 minutes)

const Weatherapp = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [city, setCity] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [fiveDayForecast, setFiveDayForecast] = useState([]);
    const [loading, setLoading] = useState(true);

    const iconMapping = {
        "01d": '/images/01d.png',
        "01n": '/images/01n.png',
        "02d": '/images/02d.png',
        "02n": '/images/02n.png',
        "03d": '/images/03d.png',
        "03n": '/images/03n.png',
        "04d": '/images/04d.png',
        "04n": '/images/04n.png',
        "09d": '/images/09d.png',
        "09n": '/images/09n.png',
        "10d": '/images/10d.png',
        "10n": '/images/10n.png',
        "11d": '/images/11d.png',
        "11n": '/images/11n.png',
        "13d": '/images/13d.png',
        "13n": '/images/13n.png',
        "50d": '/images/50d.png',
        "50n": '/images/50n.png'
    };

    const fetchWeatherForRandomCity = useCallback(async () => {
        const cities = ["Warren", "Bedminster", "Newark", "Trenton", "Hillsborough"];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        fetchWeatherData(randomCity);
    }, []);

    useEffect(() => {
        fetchWeatherForRandomCity();
    }, [fetchWeatherForRandomCity]);

    const fetchWeatherData = async (searchCity) => {
        setLoading(true);
        try {
            const cachedData = getCachedData(searchCity);
            if (cachedData) {
                setWeatherData(cachedData.currentWeather);
                setFiveDayForecast(cachedData.fiveDayForecast);
            } else {
                const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${process.env.REACT_APP_API_KEY}&units=imperial`;
                const weatherResponse = await fetch(currentWeatherUrl);
                const currentWeatherData = await weatherResponse.json();

                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${process.env.REACT_APP_API_KEY}&units=imperial`;
                const forecastResponse = await fetch(forecastUrl);
                const forecastData = await forecastResponse.json();

                const processedForecastData = processForecastData(forecastData.list);

                if (currentWeatherData.cod === 200) {
                    const weatherData = {
                        location: currentWeatherData.name,
                        weatherIcon: iconMapping[currentWeatherData.weather[0].icon],
                        feels: currentWeatherData.main.feels_like,
                        humidity: currentWeatherData.main.humidity,
                        windspeed: currentWeatherData.wind.speed
                    };
                    setWeatherData(weatherData);
                    setFiveDayForecast(processedForecastData);
                    setCachedData(searchCity, weatherData, processedForecastData);
                }
            }
            setErrorMessage("");
        } catch (error) {
            console.error("Error fetching weather data: ", error);
            setErrorMessage("Failed to fetch weather data. Please try again later.");
        }
        setLoading(false);
    };

    const processForecastData = (forecastList) => {
        const dailyData = {};
        forecastList.forEach((forecast) => {
            const day = new Date(forecast.dt_txt).toLocaleDateString();
            if (!dailyData[day]) {
                dailyData[day] = [];
            }
            dailyData[day].push(forecast);
        });

        return Object.keys(dailyData).map((day) => {
            const dayForecasts = dailyData[day];
            const highs = dayForecasts.map(f => f.main.temp_max);
            const lows = dayForecasts.map(f => f.main.temp_min);
            const feels = dayForecasts.map(f => f.main.feels_like);
            const humidity = dayForecasts.map(f => f.main.humidity);
            const wind = dayForecasts.map(f => f.wind.speed);

            const daySummary = {
                day,
                high: Math.max(...highs).toFixed(1),
                low: Math.min(...lows).toFixed(1),
                feels: Math.max(...feels).toFixed(1),
                humidity: Math.max(...humidity),
                wind: Math.max(...wind).toFixed(1),
                iconCode: dayForecasts[0].weather[0].icon,
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

    const getCachedData = (city) => {
        const cachedData = JSON.parse(localStorage.getItem(city));
        if (!cachedData) return null;
        const now = new Date().getTime();
        if (now - cachedData.timestamp > CACHE_EXPIRATION) {
            localStorage.removeItem(city);
            return null;
        }
        return cachedData;
    };

    const setCachedData = (city, currentWeather, fiveDayForecast) => {
        const data = {
            currentWeather,
            fiveDayForecast,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(city, JSON.stringify(data));
    };

    return (
        <>
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

                        {fiveDayForecast.length > 0 && (
                            <div className="forecast-container">
                                {fiveDayForecast.map((forecastData, index) => (
                                    <DayForecast
                                        key={index}
                                        day={forecastData.day}
                                        high={forecastData.high}
                                        low={forecastData.low}
                                        humidity={forecastData.humidity}
                                        feels={forecastData.feels}
                                        wind={forecastData.wind}
                                        icon={iconMapping[forecastData.iconCode]}
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
