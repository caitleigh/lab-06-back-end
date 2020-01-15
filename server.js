'use strict!';

// require the libraries //
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
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
    let key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

    superagent.get(url)
      .then( data => {
        const geoDataResults = data.body[0];
        const location = new Location(city, geoDataResults)
        response.status(200).send(location);
      })}
  catch(error){
    errorHandler('So sorry, something went wrong.', request, response)
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
  try {
    // let city = request.query.city;
    const geoWeather = require('./data/darksky.json');
    let dailySummaries = geoWeather.daily.data;
    const data = dailySummaries.map(day => {
      return new DailySummaries(day);
    })
    response.status(200).send(data);
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

function errorNoResponse(request, response) {
  response.status(404).send('???')
}

//turn it on//
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});
