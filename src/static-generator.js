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

module.exports = async function fetchAndSaveOnlinePages(files) {
  const file = files.pop()
  console.log(`Fetching page ${file}...`)

  try {
      const res = await http.get(file, {
        transformResponse: transformer.transformInternalLinks,
      })

      const { dir, base } = parse(file);
      const path = join('./', dir.replace(NORMALIZED_URL, ''), base || 'index.html')

      console.log(`Writing page ${file}...`)

      if (!fs.existsSync(dirname(path))) {
        execSync(`mkdir -p ${dirname(path)}`)
      }

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
