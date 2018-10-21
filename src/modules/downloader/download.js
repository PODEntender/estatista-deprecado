'use strict';

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { execSync } = require('child_process');
const { existsAsync } = require('../utils/file');

const HTTP_OK = 200;

const http = axios.create({
  timeout: 10000,
  transformResponse: [],
  responseType: 'stream',
});

const createDirectoryIfNotExistent = async (destination) => {
  const exists = await existsAsync(destination);
  if (false === exists) {
    // @todo implement a proper way to recursively create path
    execSync(`mkdir -p ${destination}`);
  }
};

const resolveDestinationFilePath = (websiteUrl, destination) => {
  const parsedUrl = url.parse(websiteUrl);
  const { base, dir, ext } = path.parse(parsedUrl.pathname);
  const isIndex = base === '' || ext === '';
  const fileName = isIndex ? path.join(base, 'index.html') : base;

  return path.join(destination, dir, fileName);
};

const download = (url, destination) => new Promise(async (resolve, reject) => {
  const fileName = resolveDestinationFilePath(url, destination);
  const fileExists = await existsAsync(fileName);

  if (fileExists) {
    resolve(fileName);
    return;
  }
  const { dir } = path.parse(fileName);

  // @debug Creating destination path if not existent
  try {
    await createDirectoryIfNotExistent(dir);
  } catch (err) {
    console.debug(`Could not create directory ${dir}.`);
    reject(fileName);
    return;
  }

  // @debug Downloading url to destination folder
  try {
    const res = await http.get(encodeURI(url));
    if (HTTP_OK !== res.status) {
      throw `Could not fetch URL ${url}. Status code "${res.status}"`;
    }

    // @debug Writing file locally
    const stream = fs.createWriteStream(fileName);
    await res.data.pipe(stream);

    stream.on('close', () => resolve(fileName))
  } catch (err) {
    reject(err);
  }
});

module.exports = download;
