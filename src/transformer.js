'use strict'
const cheerio = require('cheerio')

const replaceBaseUrl = url => url.replace(
  /\/\/internal.podentender\.com/g,
  '//estatista.podentender.com'
)

const transformInternalLinks = document => {
  const $ = document

  $('link[href*="//internal.podentender.com"][href*=".css"],link[rel*="icon"]')
    .each((i, link) => $(link).attr('href', replaceBaseUrl($(link).attr('href'))))

  $('img[src],script[src*="//internal.podentender.com"]')
    .each((i, elm) => $(elm).attr('src', replaceBaseUrl($(elm).attr('src'))))

  $('a[href*="//internal.podentender.com"]')
    .each((i, a) => $(a).attr('href', replaceBaseUrl($(a).attr('href').replace(/\/$/, ''))))

  $('meta[property*="og:image"][content*="//internal.podentender.com"],meta[name="twitter:image"],meta[name*="TileImage"]')
    .each((i, meta) => $(meta).attr('content', replaceBaseUrl($(meta).attr('content'))))

  $('[style*=url]')
    .each((i, elm) => $(elm).attr('style', replaceBaseUrl($(elm).attr('style'))))

  return $.html({decodeEntities: false});
}

module.exports = {
  transformInternalLinks: rawHtml => transformInternalLinks(cheerio.load(rawHtml)),
}
