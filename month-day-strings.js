'use strict'
// Generate a list of all dates, starts with 01/01, ends with 12/31
const moment = require('moment')

let pad = (n) => (n < 10) ? '0' + n : '' + n
let stringDate = (month, day) => pad(month+1) + '-' + pad(day)
let lastDay = (month) => moment([year, month]).endOf('month').date()

let year = 2016
let month = 0
let day = 1
let dayEnd = lastDay(month)

let days = []

while ( month < 12 ) {
  while ( day <= dayEnd ) {
    days.push(stringDate(month, day))
    day += 1
  }
  day = 1
  month += 1
  dayEnd = lastDay(month)
}

module.exports = days
