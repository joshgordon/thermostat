FROM mhart/alpine-node:latest

RUN mkdir -p /src/thermostat && apk add --no-cache tini
workdir /src/thermostat

add . /src

cmd ["/sbin/tini", "node", "index.js"]

