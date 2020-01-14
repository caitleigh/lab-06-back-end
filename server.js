'use strict!'

// require the libraries //
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

//turn it on//
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});
