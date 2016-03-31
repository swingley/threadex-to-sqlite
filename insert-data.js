'use strict'

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const constants = require('./threadex-constants');
const days = require('./month-day-strings');

const insert = (dataFile, next) => {
  const db = new sqlite3.Database(constants.dbName);
  const table = constants.dataTable;

  let dbInsert = (rows) => {
    // Use a transaction, speeds things up by an order of magnitude.
    db.exec('BEGIN TRANSACTION');
    let insert = db.prepare(`INSERT INTO ${table} VALUES (?, ?, ?, ?, ?, ?)`);
    rows.forEach(r => {
      insert.run(r);
    });
    insert.finalize();
    db.exec('COMMIT');
    db.close(next);
  }
  fs.readFile(dataFile, 'utf8', (err, data) => {
    let lines = data.split('\n').filter(l => l.length);

    let rows = [];
    let place = constants.data.place;
    let when = constants.data.when;
    let cols = Object.keys(place);

    for ( let i = 0; i < lines.length; i+=2 ) {
      let line = lines[i];
      let nextLine = lines[i+1];
      // get station id, record type and rank
      let placeBase = [];
      cols.forEach(f => {
        placeBase.push(line.slice(place[f][0], place[f][1]).trim());
      });
      // console.log('placeBase', placeBase);
      // build an array for each record for each day
      for ( let j = when.records_start; j < line.length-1; j+=when.jump ) {
        let rec = placeBase.slice();
        // record value
        let recValStart = j;
        let recValEnd = j + when.jump - 1;
        rec.push(line.slice(recValStart, recValEnd).trim());
        // record date
        let recYear = nextLine.slice(recValStart, recValEnd).trim();
        let recDayNumber = (j - when.records_start) / when.jump;
        let recDate = days[recDayNumber] + '-' + recYear;
        rec.push(recDate);
        // whether or not there's a tie
        let recTie = recValEnd;
        let tie = (nextLine.slice(recTie, recTie + 1) === '+') ? 1 : 0;
        rec.push(tie);
        // console.log('rec', rec);
        rows.push(rec);
      }
    }

    dbInsert(rows);
  });
}

module.exports = insert;
