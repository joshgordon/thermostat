FROM mhart/alpine-node:latest

RUN apk add --no-cache tini
workdir /src/thermostat

add . /src/thermostat

cmd ["/sbin/tini", "node", "index.js"]

