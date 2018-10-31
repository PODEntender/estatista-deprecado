'use strict';

const cheerio = require('cheerio');
const { parse } = require('url');

const fetchLinksFromSitemap = (xml) => cheerio.load(xml)('loc').toArray().map(elm => elm.children[0].data);

const fetchLinksFromCss = (css) => {
  let m;
  const regex = /url\('?([\.\?\w\d\/=\-#&:]+)'?\)/g;
  const links = [];

  while ((m = regex.exec(css)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    links.push(m[1]);
  }

  return links;
};

const fetchLinksFromHtml = (html) => {
  const links = fetchLinksFromCss(html);

  const $ = cheerio.load(html);
  return links
    .concat(
      $('[src]').toArray().map(elm => elm.attribs.src)
    )
    .concat(
      $('[href]').toArray().map(elm => elm.attribs.href)
    )
    .concat(
      $('meta[property*="og:image"],meta[name="twitter:image"],meta[name*="TileImage"]')
        .toArray().map(elm => elm.attribs.content)
    )
    .map(link => link.match(/^\/\//) ? `https:${link}` : link)
    .filter(link => !link.match(/^javascript:/)) // Filter void() refs
    .filter(link => !link.match(/^#/)) // Filter anchors
    .filter(link => !link.match(/^mailto:/)) // Filter mail`
    .filter(link => !!parse(link).host); // Only valid URLs
};

const fetchLinks = (data, host) => {
  return fetchLinksFromSitemap(data)
    .concat(fetchLinksFromCss(data))
    .concat(fetchLinksFromHtml(data));
};

module.exports = {
  fetchLinks,
};
