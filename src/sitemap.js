'use strict'

const {
  BASE_URL,
  NORMALIZED_URL,
} = process.env

const cheerio = require('cheerio')
const http = require('./utils/http')

const SITEMAP_FILES = [
  'post-sitemap.xml',
  'page-sitemap.xml',
  'galleries-sitemap.xml',
  'portfolios-sitemap.xml',
  'testimonials-sitemap.xml',
  'team-sitemap.xml',
  'category-sitemap.xml',
  'post_tag-sitemap.xml',
  'portfoliosets-sitemap.xml',
  'author-sitemap.xml',
]

const fetchFilesFromSitemap = sitemap => cheerio.load(sitemap)('loc')
  .toArray()
  .map(elm => elm.children[0].data)

const readUrlsFromSitemaps = () => {
  const defaultUrls = ['/']

  return new Promise(resolve => {
    console.log('Fetching sitemaps...')

    Promise.all(
      SITEMAP_FILES.map(file => http.get(file))
    )
    .then(responses => {
      const files = responses.reduce((files, response) => {
        return files.concat(fetchFilesFromSitemap(response.data))
      }, defaultUrls)

      resolve(files)
    })
  })
}

module.exports = {
  readUrlsFromSitemaps: readUrlsFromSitemaps,
}
