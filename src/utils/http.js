'use strict'

const {
  BASE_URL,
  NORMALIZED_URL,
} = process.env

module.exports = require('axios').create({
  baseURL: BASE_URL,
  responseType: 'text',
  transformResponse: data => data.replace(/https?:\/\/podentender\.com/g, NORMALIZED_URL),
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Accept': 'text/html',
    'X-Agent': 'PODBot',
  },
})
