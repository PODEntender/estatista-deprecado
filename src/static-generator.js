'use strict'

const fs = require('fs')
const { dirname, join, parse } = require('path')
const { execSync } = require('child_process')

const sleep = require('./utils/sleep')
const http = require('./utils/http')
const transformer = require('./transformer')
const cheerio = require('cheerio')

const {
  NORMALIZED_URL,
  INTERVAL_TO_NEXT_PAGE,
  INTERVAL_TO_RETRY,
} = process.env

const isHtml = url => parse(url).ext === '.html'

const generateDestinationFile = url => {
  const { dir, base, ext } = parse(url);
  const fileName = ext ? base : `${base || 'index'}.html`

  return join('./', dir.replace(NORMALIZED_URL, ''), fileName)
}

const generateDestinationDir = file => dirname(file)

const fetchUrl = url => http.get(url, {
  transformResponse: [],
  responseType: 'stream',
})

const sanitizeContent = content => transformer.transformInternalLinks(content)

const extractAssetUrls = html => {
  const urls = []
  const $ = cheerio.load(html)

  $('img[src],script[src*="//podentender.com"]').toArray().forEach(elm => urls.push(elm.attribs.src))

  $('link[href*="//podentender.com"][href*=".css"]').toArray().forEach(elm => urls.push(elm.attribs.href))

  return urls
}

module.exports = async function fetchAndSaveOnlinePages(urls) {
  const url = urls.pop()
  console.log(`Fetching page ${url}...`)

  try {
    const file = generateDestinationFile(url)
    const dir = generateDestinationDir(file)

    if (false === fs.existsSync(file)) {
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
              extractAssetUrls(content.toString()).forEach(url => urls.push(url))

              return fs.writeFileSync(file, sanitizeContent(content))
            }

            return fs.writeFileSync(file, content)
          })
      } catch (e) {
        console.log(`Failed to save file ${file}. Skipping...`)
      }
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
