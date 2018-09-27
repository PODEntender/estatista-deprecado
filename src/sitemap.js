'use strict'

const cheerio = require('cheerio')
const http = require('./utils/http')
const fs = require('fs')
const { parse } = require('path')

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
      SITEMAP_FILES.filter(file => !fs.existsSync(file)).map(file => http.get(file))
    )
    .then(responses => {
      responses.forEach(response => fs.writeFileSync(parse(response.request.path).base, response.data))

      return SITEMAP_FILES.map(file => parse(file).base).map(file => fs.readFileSync(file))
    })
    .then(contents => resolve(
      contents.reduce((files, content) => files.concat(fetchFilesFromSitemap(content)), defaultUrls)
    ))
  })
}

module.exports = {
  readUrlsFromSitemaps: readUrlsFromSitemaps,
}
