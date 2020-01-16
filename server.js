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

// let locations = {};

//Routes//
// app.get('/location', locationHandler)
// app.get('/weather', weatherHandler);
// app.use(errorHandler);
// app.use('*', noResponseError);


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
        // locations[url] = location;
        response.status(200).send(location);
      })
  }
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
// const dailySummaries = []
app.get('/weather', (request, response)=> {
  try {
    let key = process.env.WEATHER_API_KEY;
    let latitude = request.query.latitude;
    let longitude = request.query.longitude;
    const url = `https://api.darksky.net/forecast/${key}/${latitude},${longitude}`;

    superagent.get(url)
      .then(data => {
        let weatherSummaries = data.body.daily.data.map(day => {
          return new DailySummaries(day);
        });
        response.status(200).send(weatherSummaries);
      });
  } catch (error){
    errorHandler('So sorry, something went wrong.',request, response)
  }
});

function DailySummaries(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
  // dailySummaries.push(this);
}

////////EVENTS/////////////

// http://api.eventful.com/rest/events/search?...&where=${location.latitude},${location.longitude}&within=5`

// https://eventful.com/oauth/authoriz
// app.get('/events', (request, response) => {
//   try {
//     let latitude = request.query.latitude;
//     let longitude = request.query.longitude;
//   }


// })

// {
//   "link": "http://seattle.eventful.com/events/geekzonehosting-raspberry-pi-jam-session-code-c-/E0-001-121109275-3?utm_source=apis&utm_medium=apim&utm_campaign=apic",
//   "name": "GeekZoneHosting Raspberry Pi Jam Session & Code Carnival 2019",
//   "event_date": "Sat Dec 7 2019",
//   "summary": "Join fellow coders, builders, and Raspberry Pi makers in an 8 hour all day event Jam Session builder and code-a-thone to celebrate computer science education week 2019."
// },

// function Event(city, ){
//   this.link = link;
//   this.name =
//   this.event_date =
//   this.summary =
// }

//////////////////////////////////////////////
function errorHandler(string, response){
  response.status(500).send(string)
}

function noResponseError(request, response){
  response.status(404).send('huh?');
}

//turn it on//
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});
