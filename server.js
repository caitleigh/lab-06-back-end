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
// app.get('/location', locationHandler)
// app.get('/weather', weatherHandler);
// app.use(errorHandler);

//////LOCATION///////
app.get('/location', (request, response) => {
  try {
    const city = request.query.city;
    const geoData = require('./data/geo.json');
    const geoDataResults = geoData[0];
    const location = new Location(city, geoDataResults)
    response.status(200).send(location);

  } catch(error) {
    errorHandler('So sorry, something went wrong.', response)
  }
});

function Location(city, locationData){
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
}

/////Weather//////
const dailySummaries = []
app.get('/weather', (request, response)=> {
//   let city = request.query.city;
  try {
    const geoWeather = require('./data/darksky.json');
    geoWeather.daily.data.forEach(day => {
      dailySummaries.push(new DailySummaries(day));

      response.status(200).send(dailySummaries);
    })
  } catch (error){
    errorHandler('So sorry, something went wrong.', response)
  }
});

function DailySummaries(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
  dailySummaries.push(this);
}
//////////////////////////////////////////////
function errorHandler(string, response){
  response.status(500).send(string)
}

//turn it on//
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});
