'use strict!';

// require the libraries //
const express = require('express');
require('dotenv').config();
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3001;

//the policeperson of our server - allows our server to talk to the frontend//
app.use(cors());

//Routes//

//////LOCATION///////
app.get('/location', (request, response) => {
  let city = request.query.city;
  const geoData = require('./data/geo.json');
  let geoDataResults = geoData[0];

  let location = new Location(city, geoDataResults)

  response.status(200).send(location);
})

function Location(city, locationData){
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
}

/////Weather//////

app.get('/weather', (request, response)=> {
  let city = request.query.city;
  const geoWeather = require('./data/darksky.json');
  let geoWeatherDailyData = geoWeather.daily.data;

  let weather = new Weather(city, geoWeatherDailyData)

  response.status(200).send(weather);
})

function Weather(city, locationWeather) {
  this.forecast = locationWeather.summary;
  this.time = new Date(locationWeather.time);
}

//turn it on//
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});
