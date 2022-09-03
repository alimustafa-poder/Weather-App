import React from 'react';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import './style.css';


const container = document.getElementById('root');
const root = createRoot(container);

const CityNotFound = () => {
    return (
        <div className={"cityNotFound"}>
            <h1>City not found</h1>
        </div>
    );
}
let retryCount = 0;
const GetInput = () => {
    let [city, setCity] = useState('London');
    let [weather, setWeather] = useState("");
    let [icon, setIcon] = useState("");
    let [iconKey, setIconKey] = useState("");
    let [loaded, setLoaded] = useState(false);
    let [error, setError] = useState(null);
    const completeKeys = {
        "lon": "Longitude",
        "lat": "Latitude",
        "temp": "Temperature",
        "feels_like": "Feels Like",
        "temp_min": "Minimum Temperature",
        "temp_max": "Maximum Temperature",
        "pressure": "Pressure",
        "humidity": "Humidity",
        "visibility": "Visibility",
        "speed": "Wind Speed",
        "deg": "Wind Direction",
        "main": "Sky",
        "description": "Sky Description",
        "icon": "Icon",
        "country": "Country",
        "sunrise": "Sunrise",
        "sunset": "Sunset",
        "gust": "Wind Gust",
        "sea_level": "Sea Level",
        "grnd_level": "Ground Level",
    }
    const regionNames = new Intl.DisplayNames(
        ['en'], { type: 'region' }
    );




    useEffect(() => {
        getWeather();
        setLoaded(false);
    }, [city]);

    useEffect(() => {
        setIconData();
    }, [iconKey]);


    function handleChange() {
        let input = document.querySelector("#cityName").value;
        if (input.length != 0) {
            setCity(input);
        }
        else {
            setCity("London");
        }
    };

    function HandleError(prop) {
        let retry = setTimeout(() => getWeather(), 1000);
        retryCount++;
        while (retryCount < 9) {
            if (prop != null) {
                return (
                    <div className={"errorModal active"}>
                        <p>{prop.message}</p>
                        <h4>{`Retrying...${retryCount}`}</h4>
                    </div>
                );
            }
            else {

                clearInterval(retry);

            }
        }
    }

    async function getWeather() {
        try {
            let getData = fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=e5b687926a7dec9b8b2c7978eda9d784`, { mode: 'cors' });
            let weatherData = await getData;
            let weatherDataJson = weatherData.json();
            weatherDataJson.then(data => { setWeather(data); setLoaded(true); setError(null) });
        }
        catch (error) {
            setError(Object.getOwnPropertyNames(error).reduce((p, e) => {
                p[e] = error[e];
                return p;
            }, {}));
        }
    }

    function setIconData() {
        if (iconKey == "") return;
        async function getIcon() {
            let getData = fetch(`http://openweathermap.org/img/wn/${iconKey}@2x.png`, { mode: 'cors' });
            let iconData = await getData;
            let iconDataJson = iconData.blob();
            return iconDataJson.then(data => {
                var reader = new FileReader();
                reader.readAsDataURL(data);
                return function getImgSrc() {
                    return new Promise(function (resolve, reject) {
                        reader.addEventListener("loadend", () => {
                            let base64data = reader.result;
                            resolve(base64data);
                        })
                    });
                }
            });
        }

        getIcon().then((data) => {
            return data();
        }).then(data => { setIcon(data); });
    }

    function retry(){
        retryCount = 0;
        getWeather();
    }

    function HandleValues(prop) {

        if (error != null) {
            
            if (retryCount < 9) {
                return <HandleError {...error} />;
            }
            else {
                return (
                    <div className={"errorModal active"}>
                        <p>{`Retry after securing internet`}</p>
                        <button onClick={retry}>Retry</button>
                    </div>
                )
            }
        }
        else if (error === null){
            if (!loaded) {
                return (<div id="app" className="loader"></div>);
            };
        }

        return Object.entries(prop).map(([key, value]) => {
            if (key === "all" || key === "cod"
                || key === "cod" || key === "dt"
                || key === "base" || key === "id"
                || key === "clouds" || key === "name"
                || key === "timezone" || key === "type") return;
            if (key === "icon") {
                useEffect(() => {
                    setIconKey(value);
                }, [value]);
                return <p key={key} className={"weatherIcon"}> {completeKeys[key]} : <img src={icon} alt="icon" /></p>;
            }
            if (typeof value !== "object") {
                if (key === "country") {
                    value = regionNames.of(value);
                    return <div key={key} className={key}><p>{completeKeys[key] ? completeKeys[key] : key}</p><p>{value}</p></div>;
                }
                else if (key === "sunrise" || key === "sunset") {
                    let date = new Date(value * 1000);
                    value = date.toLocaleTimeString();
                    return <div key={key} className={key}><p>{completeKeys[key] ? completeKeys[key] : key}</p><p>{value}</p></div>;
                }
                else if (key === "message") {
                    return <CityNotFound />;
                }
                return (
                    <div key={key} className={key}><p>{completeKeys[key] ? completeKeys[key] : key}</p><p>{value}</p></div>
                )
            }
            else if (typeof value === "object") {
                if (key === "0") {
                    return HandleValues(value);
                }
                else {
                    return <div className={key} key={key}>{HandleValues(value)}</div>;
                }
            }
        });
    }

    return (
        <div className="wrapper">
            <div className={"input"}>
                <input id={"cityName"} type="text" placeholder="Enter city name" />
                <button onClick={handleChange}>Search</button>
            </div>
            <div className={"weatherApp"}>
                <div className='cityLookedUp'>
                    <h1>{city.toLocaleUpperCase()}</h1>
                </div>
                <HandleValues {...weather} />
            </div>
        </div>
    );
}

const App = () => {
    return (
        <><div className={"heading"}>
            <h1>Weather App</h1>

        </div><GetInput /></>
    );
}

root.render(<App />);