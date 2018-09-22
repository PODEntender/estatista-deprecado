'use strict'
const cheerio = require('cheerio')
const fs = require('fs')
const { dirname, join, parse } = require('path')
const { execSync } = require('child_process')

const BASE_URL = 'https://podentender.com'
const NEW_URL = 'https://podentender.com';
const INTERVAL_TO_NEXT_PAGE = 500;
const INTERVAL_TO_RETRY = 500;

const axios = require('axios').create({
  baseURL: BASE_URL,
  responseType: 'text',
  transformResponse: data => data.replace(/https?:\/\/podentender\.com/g, NEW_URL),
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Accept': 'text/html',
    'X-Agent': 'PODBot',
  },
})

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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const fetchFilesFromSitemap = sitemap => cheerio.load(sitemap)('loc')
  .toArray()
  .map(elm => elm.children[0].data)

const fetchUrlsToDownload = () => {
  const defaultUrls = ['/']

  return new Promise(resolve => {
    console.log('Fetching sitemaps...')

    Promise.all(
      SITEMAP_FILES.map(file => axios.get(file))
    )
    .then(responses => {
      const files = responses.reduce((files, response) => {
        return files.concat(fetchFilesFromSitemap(response.data))
      }, defaultUrls)

      resolve(files)
    })
  })
}

const transformInternalLinks = data => {
  const $ = cheerio.load(data)

  const replaceBaseUrl = url => url.replace(
    /\/\/podentender\.com/g,
    '//estatista.podentender.com'
  )

  $('link[href*="//podentender.com"][href*=".css"]')
    .each((i, link) => $(link).attr('href', replaceBaseUrl($(link).attr('href'))))

  $('script[src*="//podentender.com"]')
    .each((i, script) => $(script).attr('src', replaceBaseUrl($(script).attr('src'))))

  $('a[href*="//podentender.com"]')
    .each((i, a) => $(a).attr('href', replaceBaseUrl($(a).attr('href'))))

  return $.html();
}

async function fetchAndSaveOnlinePages(files) {
  const file = files.pop()
  console.log(`Fetching page ${file}...`)

  try {
      const res = await axios.get(file, {
        transformResponse: transformInternalLinks,
      })

      const { dir, base } = parse(file);
      const path = join('./', dir.replace(NEW_URL, ''), base || 'index.html')

      console.log(`Writing page ${file}...`)

      execSync(`mkdir -p ${dirname(path)}`)
      fs.writeFileSync(path, res.data)

      if (files.length) {
        console.log(`Fetching next file in ${INTERVAL_TO_NEXT_PAGE} ms...`)

        await sleep(INTERVAL_TO_NEXT_PAGE);
        return fetchAndSaveOnlinePages(files)
      }
  } catch (e) {
    console.log(`Retrying page ${file} in ${INTERVAL_TO_RETRY} ms...`)

    files.push(file)
    await sleep(INTERVAL_TO_RETRY)
    return fetchAndSaveOnlinePages(files)
  }
}

fetchUrlsToDownload()
  .then(fetchAndSaveOnlinePages);
