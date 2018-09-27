'use strict'
const cheerio = require('cheerio')

const replaceBaseUrl = url => url.replace(
  /\/\/podentender\.com/g,
  '//estatista.podentender.com'
)

const transformInternalLinks = document => {
  const $ = document

  $('link[href*="//podentender.com"][href*=".css"]')
    .each((i, link) => $(link).attr('href', replaceBaseUrl($(link).attr('href'))))

  $('img[src],script[src*="//podentender.com"]')
    .each((i, elm) => $(elm).attr('src', replaceBaseUrl($(elm).attr('src'))))

  $('a[href*="//podentender.com"]')
    .each((i, a) => $(a).attr('href', replaceBaseUrl($(a).attr('href'))))

  return $.html();
}

module.exports = {
  transformInternalLinks: rawHtml => transformInternalLinks(cheerio.load(rawHtml)),
}
