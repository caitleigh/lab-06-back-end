'use strict!';

// require the libraries //
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
const PORT = process.env.PORT || 3001;
const app = express();


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));


//the policeperson of our server - allows our server to talk to the frontend//
app.use(cors());


//Routes//
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/events', eventHandler);

//////LOCATION///////
function locationHandler (request, response) {
  const city = request.query.city;

  let sql = 'SELECT * FROM locations WHERE search_query=$1;';
  let safeValues = [city];

  client.query(sql, safeValues)
    .then(results => {
      if (results.rowCount.length > 0) {
        response.status(200).json(results.rows[0])
      }
      else {
        let key = process.env.GEOCODE_API_KEY;
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

        superagent.get(url)
          .then(data => {
            const geoDataResults = data.body[0];
            const location = new Location(city, geoDataResults)

            let sql2 = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ( $1, $2, $3, $4);';

            let safeValues = [location.search_query, location.formatted_query, location.latitude, location.longitude];

            client.query(sql2, safeValues);

            response.status(200).send(location);
          })
          .catch ((error) => { errorHandler('So sorry, something went wrong.', request, response)
          });
      }
    })
}


function Location(city, locationData){
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
}

/////Weather//////

function weatherHandler (request, response) {
  let key = process.env.WEATHER_API_KEY;
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  const url = `https://api.darksky.net/forecast/${key}/${latitude},${longitude}`;

  superagent.get(url)
    .then(data => {
      const weatherSummaries = data.body.daily.data.map(day => {
        return new DailySummaries(day);
      })
      response.status(200).send(weatherSummaries);
    })
    .catch ((error) => {
      errorHandler('So sorry, something went wrong.', request, response)
    })
}

function DailySummaries(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}

////////EVENTS/////////////

function eventHandler(request, response) {
  let key = process.env.EVENTFUL_API_KEY;
  let search_query = request.query.search_query;

  const eventDataUrl = `http://api.eventful.com/json/events/search?keywords=music&location=${search_query}&app_key=${key}`;

  superagent.get(eventDataUrl)
    .then(eventData => {
      let eventMassData = JSON.parse(eventData.text);
      let localEvent = eventMassData.events.event.map (eventData => {
        return new Event(eventData);
      })
      response.status(200).send(localEvent);
    })
    .catch ((error) => {
      errorHandler('So sorry, something went wrong.', request, response)
    })
}

/// Constructor function for events///
function Event(eventData){
  this.link = eventData.url;
  this.name = eventData.title;
  this.event_date = eventData.start_time.slice(0, 10);
  this.summary = eventData.description;
}



//////////////////////////////////////////////
function errorHandler(error, request, response){
  response.status(500).send(error)
}

app.get('*', (request, response) => {
  response.status(404).send('this route does not exist');
})

// function noResponseError(request, response){
//   response.status(404).send('huh?');
// }

//turn it on//
client.connect()
  .then(app.listen(PORT, () => console.log(`listen on ${PORT}`)))
  .catch((err) => console.error(err));
