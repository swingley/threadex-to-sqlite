const sqlite3 = require('sqlite3').verbose();
const constants = require('./threadex-constants');

const create = (next) => {
  const db = new sqlite3.Database(constants.dbName);
  db.serialize(() => {
    db.run('create index data_station_idx on data(station)')
    db.run('create index data_value_idx on data(value)')
    db.run('create index data_record_date_idx on data(record_date)')
    db.run('create index data_record_type_idx on data(record_type)')
    db.run('create index data_rank_idx on data(rank)')
    db.run('create index inventory_name_idx on inventory(name)')
    db.run('create index inventory_state_idx on inventory(state)')
    db.run('create index inventory_station_idx on inventory(station)')
  });
  db.close(next);
}

module.exports = create;