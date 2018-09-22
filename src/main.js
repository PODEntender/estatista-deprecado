'use strict'

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' })
}

const sitemap = require('./sitemap')
const fetchAndSaveOnlinePages = require('./static-generator')

sitemap.readUrlsFromSitemaps()
  .then(fetchAndSaveOnlinePages);
