'use strict'

const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const request = require('request');
const constants = require('./threadex-constants');
const states = require('./state-abbr-to-name');

let stations = {};
let stationNames;
// Use the arcgis.com geocoder to geocode station names.
let geocodeUrl = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
let q = {
  f: 'json',
  outSR: { wkid: 4326 },
  outFields: 'Match_addr,Addr_type,StAddr,City',
  maxLocations: 1
}
let geocoded = 0;

let cacheFile = './raw-data/station-locations.geojson';
let geojson = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
let cache = {};
geojson.features.forEach(f => cache[f.properties.name] = {
  display: f.properties.display,
  geocode_match: f.properties.geocode_match,
  latitude: f.geometry.coordinates[1],
  longitude: f.geometry.coordinates[0]
});

let processFile = (file, cb) => {
  let data = fs.readFileSync(file, 'utf8');
  let lines = data.split('\n').map(l => l.trim()).filter(l => l.length);

  let rows = [];
  let fields = Object.keys(constants.inventory.fields);
  lines.forEach(l => {
    let row = [];
    fields.forEach(f => {
      let field = constants.inventory.fields[f];
      row.push(l.slice(field[0], field[1]).trim());
    });
    rows.push(row);
    let stateIndex = fields.indexOf('state');
    let stateName = states[row[stateIndex]];
    let placeIndex = fields.indexOf('name');
    let placeName = row[placeIndex].replace(/area/i, '').trim() + ', ' + stateName;
    let sanitized = placeName.toLowerCase().replace(/[, ]+/g, '-');
    stations[sanitized] = { display: placeName };
  });
  cb();
}

let geocode = () => {
  if ( geocoded < stationNames.length ) {
    getCoordinates(stationNames[geocoded], geocode);
  } else {
    write();
  }
}

let getCoordinates = (place, cb) => {
  if ( !cache.hasOwnProperty(place) ) {
    console.log('geocoding...', place, stations[place].display);
    let query = JSON.parse(JSON.stringify(q));
    query.SingleLine = stations[place].display;
    request(geocodeUrl + '?' + qs.stringify(query), (err, response, body) => {
      let result = JSON.parse(body);
      if ( result && result.candidates && result.candidates.length ) {
        let loc = result.candidates[0].location;
        console.log('\tresult loc', loc);
        stations[place].latitude = loc.y;
        stations[place].longitude = loc.x;
        stations[place].geocode_match = result.candidates[0].attributes.Match_addr;
      } else {
        console.log('\nswing and a miss...', place, '\n');
      }
      geocoded += 1;
      cb();
    });
  } else {
    console.log('...cache hit:  ', place);
    stations[place] = cache[place];
    geocoded += 1;
    cb();
  }
}

let write = () => {
  let fc = makeFeatureCollection(stationNames);
  fs.writeFile(cacheFile, JSON.stringify(fc, null, 2), (err) => {
    console.log('wrote it');
  });
}

let makeFeatureCollection = (data) => {
  let fc = { "type": "FeatureCollection", "features": [] };
  data.forEach((d, index) => {
    fc.features.push({
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [ stations[d].longitude, stations[d].latitude ]
      },
      "properties": {
        "id": index,
        "name": d,
        "display": stations[d].display,
        "geocode_match": stations[d].geocode_match
      }
    });
  });
  return fc;
}

fs.readdir(constants.dataDir, (err, files) => {
  // Only interested in inventory files because they have station info.
  files = files.filter(f => f.indexOf('inv') > -1);
  files.forEach((f, index) => {
    processFile(constants.dataDir + path.sep + f, () => {
      if ( index === files.length - 1) {
        stationNames = Object.keys(stations);
        geocode();
      }
    });
  });
});
