'use strict!'

// require the libraries //
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

//the policeperson of our server - allows our server to talk to the frontend//
app.use(cors());

//Routes//
//LOCATIONS//
app.get('/location', (request, response) => {
  let city = request.query.city;
  const geoData = require('./data/geo.json');

  let location = {
    search_query: city,
    formatted_query: geoData[0].display_name,
    latitude: geoData[0].lat,
    longitude: geoData[0].lon
  }
  response.status(200).send(location);
})



//turn it on//
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});
