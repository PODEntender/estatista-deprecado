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

  $('script[src*="//podentender.com"]')
    .each((i, script) => $(script).attr('src', replaceBaseUrl($(script).attr('src'))))

  $('a[href*="//podentender.com"]')
    .each((i, a) => $(a).attr('href', replaceBaseUrl($(a).attr('href'))))

  return $.html();
}

module.exports = {
  transformInternalLinks: rawHtml => transformInternalLinks(cheerio.load(rawHtml)),
}
