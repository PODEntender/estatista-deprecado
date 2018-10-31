'use strict';

const downloader = require('./modules/downloader/website-downloader');
const { resolve } = require('path');

const host = process.argv[2];
const url = process.argv[3];
const dest = resolve(process.argv[4]);

console.log('Downloading website with params', {
  host,
  url,
  dest,
});

downloader(host, [url], dest)
  .then(() => console.log('Successfully downloaded.'));
