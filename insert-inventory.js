'use strict'

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const constants = require('./threadex-constants');
const states = require('./state-abbr-to-name');

// Create a look-up for station -> lat, long
let stationLookup = {};
let geojson = fs.readFileSync('./raw-data/station-locations.geojson');
geojson = JSON.parse(geojson);
geojson.features.forEach(f => {
  stationLookup[f.properties.name] = {
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0]
  }
});

const insert = (dataFile, next) => {
  const db = new sqlite3.Database(constants.dbName);
  const table = constants.inventoryTable;

  let dbInsert = (rows) => {
    // Use a transaction, speeds things up by an order of magnitude (maybe more).
    db.exec('BEGIN TRANSACTION');
    let insert = db.prepare(`INSERT INTO ${table} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    rows.forEach(r => {
      insert.run(r);
    });
    insert.finalize();
    db.exec('COMMIT');
    db.close(next);
  }
  fs.readFile(dataFile, 'utf8', (err, data) => {
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
      // Values for two columns, state and place, are not in the data
      // but are helpful in displaying this data.
      let stateIndex = fields.indexOf('state');
      let stateName = states[row[stateIndex]];
      let placeIndex = fields.indexOf('name');
      let placeName = row[placeIndex].replace(/area/i, '').trim() + '-' + stateName;
      placeName = placeName.toLowerCase().replace(/ /g, '-');
      row.push(stateName);
      row.push(placeName);
      // Find and put latitude and longitude in the row too.
      if ( stationLookup[placeName] ) {
        row.push(stationLookup[placeName].latitude);
        row.push(stationLookup[placeName].longitude);
      } else {
        row.push(null);
        row.push(null);
      }
    });

    dbInsert(rows);
  });
}

module.exports = insert;
