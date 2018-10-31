'use strict';

const fs = require('fs');
const { parse: parseUrl } = require('url');
const { uniq } = require('ramda');
const { fetchLinks } = require('./fetch-links');
const download = require('./download');

const readFileSync = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data.toString());
  })
});

const visitedUrls = [];

const downloadWebsite = async (host, urls, destination) => {
  if (0 === urls.length) {
    return;
  }

  const url = urls.pop();
  try {
    const file = await download(url, destination);

    const content = await readFileSync(file);
    const nextUrls = urls
      .concat(fetchLinks(content))
      // Download only internal links
      .filter(url => !!parseUrl(url).host.match(host))
      .filter(url => visitedUrls.indexOf(url) === -1);

    visitedUrls.push(url);
    return downloadWebsite(host, uniq(nextUrls), destination);
  } catch (err) {
    visitedUrls.push(url);
    return downloadWebsite(host, uniq(urls), destination);
  }
};

module.exports = downloadWebsite;
