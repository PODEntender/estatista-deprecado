'use strict';

const transform = require('./transform');
const { parse } = require('path');
const { fetchFilePathsRecursively, readAsync, writeAsync } = require('../utils/file');

const READABLE_EXTENSIONS = ['.html', '.css', '.js', '.xml'];

const localTransformer = async (path, config) => {
  const files = await fetchFilePathsRecursively(path);

  const promises = files.map((filePath) => new Promise((resolve) => {
    readAsync(filePath)
      .then((content) => {
        const { ext } = parse(filePath);
        const isBinary = READABLE_EXTENSIONS.indexOf(ext) === -1;

        if (isBinary) {
          writeAsync(filePath, content)
            .then(resolve);
        } else {
          writeAsync(filePath, transform(content, config))
            .then(resolve);
        }
      });
  }));

  Promise.all(promises);
};

module.exports = localTransformer;
