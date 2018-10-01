'use strict'

const fs = require('fs')
const { dirname, join, parse } = require('path')
const { execSync } = require('child_process')
const cheerio = require('cheerio')

const sleep = require('./utils/sleep')
const http = require('./utils/http')
const transformer = require('./transformer')

const {
  NORMALIZED_URL,
  INTERVAL_TO_NEXT_PAGE,
  INTERVAL_TO_RETRY,
  OVERWRITE_FILES,
} = process.env

const isHtml = url => parse(url).ext === '.html'
const isCss = url => parse(url).ext === '.css'

const generateDestinationFile = url => {
  const { dir, base, ext } = parse(url);
  const fileName = ext ? base : `${base || 'index'}.html`

  return join('./', dir.replace(NORMALIZED_URL, ''), fileName)
}

const generateDestinationDir = file => dirname(file)

const fetchUrl = url => http.get(encodeURI(url), {
  transformResponse: [],
  responseType: 'stream',
})

const sanitizeContent = content => transformer.transformInternalLinks(content)

const extractAssetUrlsFromHtml = html => {
  const urls = []
  const $ = cheerio.load(html)

  $('img[src],script[src*="//podentender.com"]')
    .toArray()
    .forEach(elm => urls.push(elm.attribs.src))
  $('link[href*="//podentender.com"][href*=".css"],link[rel*="icon"]')
    .toArray()
    .forEach(elm => urls.push(elm.attribs.href))
  $('meta[property*="og:image"][content*="//podentender.com"],meta[name="twitter:image"],meta[name*="TileImage"]')
    .toArray()
    .forEach(elm => urls.push(elm.attribs.content))
  $('[style*=url]')
    .toArray()
    .forEach(elm => extractAssetsFromInlineCss(elm.attribs.style))

  return urls
}

const extractAssetsFromInlineCss = style => style.replace(/.+url|[\(\)';]/g, '')

const extractAssetUrlsFromCss = css => css.match(/url\('[\.\?\w\d\/=\-#&]+'\)/g).map(url => url.replace(/url|[\(\)';]/g, ''))

module.exports = async function fetchAndSaveOnlinePages(urls) {
  const url = urls.pop().replace('http://', 'https://')
  console.log(`Fetching page ${url}...`)

  try {
    const file = generateDestinationFile(url)
    const dir = generateDestinationDir(file)

    if (true === JSON.parse(OVERWRITE_FILES) || false === fs.existsSync(file)) {
      console.log(`Writing page ${url}...`)

      try {
        if (false === fs.existsSync(dir)) {
          execSync(`mkdir -p ${dir}`)
        }

        const stream = fs.createWriteStream(file)
        await fetchUrl(url)
          .then(res => res.data.pipe(stream))
          .then(
            stream => new Promise(
              resolve => stream.on(
                'close',
                () => {
                  resolve(fs.readFileSync(file))
                }
              )
            )
          )
          .then(content => {
            if (true === isHtml(file)) {
              extractAssetUrlsFromHtml(content.toString()).forEach(url => urls.push(url))

              return fs.writeFileSync(file, sanitizeContent(content))
            }

            if (true === isCss(file)) {
              extractAssetUrlsFromCss(content.toString()).forEach(url => urls.push(join(parse(file).dir, url)))

              return fs.writeFileSync(file, content)
            }

            return fs.writeFileSync(file, content)
          })
      } catch (e) {
        console.log(`Failed to save file ${file}. Skipping...`)
      }
    } else if (0 < urls.length) {
      return fetchAndSaveOnlinePages(urls)
    }

    if (0 < urls.length) {
      console.log(`Fetching next file in ${INTERVAL_TO_NEXT_PAGE} ms...`)

      await sleep(INTERVAL_TO_NEXT_PAGE);
      return fetchAndSaveOnlinePages(urls)
    }
  } catch (e) {
    console.log(`Retrying page ${url} in ${INTERVAL_TO_RETRY} ms...`)

    urls.push(url)
    await sleep(INTERVAL_TO_RETRY)
    return fetchAndSaveOnlinePages(urls)
  }
}
