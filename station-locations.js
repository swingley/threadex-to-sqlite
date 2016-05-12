'use strict'

const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

let stationFile = 'raw-data/station-locations.xml';
let locations = {};

// Read an xml file with all locations.
// Original source:  http://w1.weather.gov/xml/current_obs/index.xml
let stationsXml = fs.readFileSync(stationFile, 'utf8');
let stations = parser.parseString(stationsXml, (err, stations) => {
  stations.wx_station_index.station.forEach(s => {
    locations[s.station_id[0]] = {
      latitude: parseFloat(s.latitude[0]),
      longitude: parseFloat(s.longitude[0])
    }
  });
});

module.exports = locations;
