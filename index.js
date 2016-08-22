"use strict";

var Particle = require('particle-api-js');
let particle = new Particle();

let express = require('express');
let bodyparser = require('body-parser');

let app = new express();

let request = require('request');

let auth = require('./auth');

let access_token = "";
let thermostat_id = "";

let onPoint = 76;
let offPoint = 74;
let tempf = -1;

particle.login({
  username: auth.username,
  password: auth.password,
  tokenDuration: 0
}).then((data) => {
  access_token = data.body.access_token;
  particle.getEventStream({deviceId: "1f003b000f47343432313031", auth: access_token}).then((data) => {
    console.log("starting event listener");
    data.on('event', (event) => {
      tempCycle(event.data);
    });
  }, err => console.log(err));
}, (err) => {
  console.error(err);
});


let tempCycle = (temp) => {
  temp = Number(temp);
  tempf = 9 * temp / 5 + 32;
  console.log(Math.round(tempf * 10) / 10);
  if (tempf > onPoint) {
    console.log("Turn on");
    request.get('http://pyrelay:8080/api/1/on');
  } else if (tempf < offPoint) {
    request.get('http://pyrelay:8080/api/1/off');
    console.log("turn Off");
  } else {
    console.log("Steady");
  }
};


app.get('/temp', (req, res) => {
  res.json({temp: tempf});
});

app.put('/high', bodyparser.json(), (req, res) => {
  onPoint = Number(req.body.temp);
  res.status(204).send();
});

app.put('/low', bodyparser.json(), (req, res) => {
  offPoint = Number(req.body.temp);
  res.status(204).send();
});

app.get('/high', (req, res) => {
  res.json({temp: onPoint});
});

app.get('/low', (req, res) => {
  res.json({temp: offPoint});
});

app.listen(3000);
