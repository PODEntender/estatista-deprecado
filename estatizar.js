'use strict'
const cheerio = require('cheerio')
const fs = require('fs')
const { dirname, join, parse } = require('path')
const { execSync } = require('child_process')

const BASE_URL = 'https://podentender.com'
const NEW_URL = 'https://podentender.com';

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

async function fetchAndSaveOnlinePages(files) {
  const file = files.pop()
  console.log(`Fetching page ${file}...`)
  const res = await axios.get(file, {
    transformResponse: data => data.replace(/https?:\/\/podentender\.com/g, 'https://estatista.podentender.com'),
  })

  const { dir, base } = parse(file);
  const path = join('./', dir.replace(NEW_URL, ''), base || 'index.html')

  if (res.status === 200) {
    console.log(`Writing page ${file}...`)

    execSync(`mkdir -p ${dirname(path)}`)
    fs.writeFileSync(path, res.data)
  } else {
    console.log(`Retrying page ${file} in 3 seconds...`)

    files.push(file)
    await sleep(3000)
    return fetchAndSaveOnlinePages(files)
  }

  if (files.length) {
    console.log(`Fetching next file in 2 seconds...`)

    await sleep(2000)
    return fetchAndSaveOnlinePages(files)
  }

  return res
}

fetchUrlsToDownload()
  .then(fetchAndSaveOnlinePages);
