module.exports = {
  dataDir: 'raw-data',
  dbName: './threadex-records.db',

  dataTable: 'data',
  inventoryTable: 'inventory',

  inventory: {
    fields: {
      station: [0, 3],
      state: [4, 6],
      name: [7, 37],
      temp_year_start: [38, 42],
      temp_year_end: [43, 47],
      precip_year_start: [48, 52],
      precip_year_end: [53, 57]
    }
  },
  data: {
    place: {
      station: [0, 3],
      record_type: [4,10],
      rank: [10,11]
    },
    when: {
      records_start: 13,
      jump: 6
    }
  }
}
