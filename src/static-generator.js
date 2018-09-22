'use strict'

const fs = require('fs')
const { dirname, join, parse, resolve: resolvePath } = require('path')
const { execSync } = require('child_process')

const sleep = require('./utils/sleep')
const http = require('./utils/http')
const transformer = require('./transformer')

const {
  NORMALIZED_URL,
  INTERVAL_TO_NEXT_PAGE,
  INTERVAL_TO_RETRY,
} = process.env

const generateDestinationFile = url => {
  const { dir, base } = parse(url);

  return join('./', dir.replace(NORMALIZED_URL, ''), base || 'index.html')
}

const generateDestinationDir = file => dirname(file)

module.exports = async function fetchAndSaveOnlinePages(files) {
  // const files = _files.filter(file => file.match(/news-podcast/))
  const file = files.pop()
  console.log(`Fetching page ${file}...`)

  try {
      const res = await http.get(file, {
        transformResponse: transformer.transformInternalLinks,
      })

      const path = generateDestinationFile(file)
      const dir = generateDestinationDir(path)

      console.log(`Writing page ${file}...`)

      try {
        if (!fs.existsSync(dir)) {
          execSync(`mkdir -p ${dir}`)
        }

        fs.writeFileSync(path, res.data)
      } catch (e) {
        console.log(`Failed to save file ${path}. Skipping...`)
      }

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
