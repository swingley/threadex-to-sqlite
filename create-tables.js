'use strict'

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const constants = require('./threadex-constants');

const create = (next) => {
  let dbFile = constants.dbName;
  let exists = fs.existsSync(dbFile);
  if (!exists) {
    fs.openSync(dbFile, 'w');
  }
  const db = new sqlite3.Database(dbFile);
  let inventory = 'inventory';
  let data = 'data';
  let ddlInventory = `CREATE TABLE ${inventory} (
    station text,
    state_abbr text,
    name text,
    temp_year_start integer,
    temp_year_end integer,
    precip_year_start integer,
    precip_year_end integer,
    state text,
    place text
  )`;
  let ddlData = `CREATE TABLE ${data} (
    station text,
    record_type text,
    rank integer,
    value integer,
    record_date text,
    tie integer
  )`;
  db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS ${inventory}`);
    db.run(`DROP TABLE IF EXISTS ${data}`);
    db.run(ddlInventory);
    db.run(ddlData);
  });
  db.close(next);
}

module.exports = create;
