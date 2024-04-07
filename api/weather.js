import axios from 'axios';
import { apiKey } from '../constants';

const forecastEndPoint = params => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;
const locationsEndPoint = params => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint
    }

    try{
        const response = await axios.request(options);
        return response.data;
    }catch(err){
        console.log('Error: '+err);
        return null;
    }
}


const fetchWeatherForecast = (params) => {
    return apiCall(forecastEndPoint(params));
}
const fetchLocations = (params) => {
    return apiCall(locationsEndPoint(params));
}

export {
    fetchWeatherForecast,
    fetchLocations
}