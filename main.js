'use strict'

const fs = require('fs');
const path = require('path');
const constants = require('./threadex-constants');
const createTables = require('./create-tables');
const insertInventory = require('./insert-inventory');
const insertData = require('./insert-data');

// Time how long this takes.
let elapsedStart = new Date().getTime(), elapsedFinish, elapsed;

// Get a list of data files.
fs.readdir(constants.dataDir, (err, files) => {
  // Keep track of total files and which one is being processed.
  let fileCount = files.length;
  let current = -1;
  // processFiles is called recursively as files are processed.
  // Trying to do everything at once resulted in SQLITE_BUSY: database is locked
  let processFiles = () => {
    if (current < fileCount - 1) {
      current = current + 1;
      let file = files[current];
      console.log('\tprocessing:  ', file);
      if (file.indexOf('data') > -1) {
        insertData(constants.dataDir + path.sep + file, processFiles);
      }
      if (file.indexOf('inv') > -1) {
        insertInventory(constants.dataDir + path.sep + file, processFiles);
      }
    } else {
      elapsedFinish = new Date().getTime();
      elapsed = ((elapsedFinish - elapsedStart) / 1000 / 60);
      elapsed = (Math.round(elapsed * 100) / 100).toFixed(2);
      console.log(`Finished in ${elapsed} minutes.`);
    }
  }
  // Create the db and necessary tables before trying to insert data.
  console.log('Creating db...');
  createTables(processFiles);
});
