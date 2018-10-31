'use strict';

const transform = require('./transform');
const { fetchFilePathsRecursively, readAsync, writeAsync } = require('../utils/file');

const localTransformer = async (path, config) => {
  const files = await fetchFilePathsRecursively(path);

  const promises = files.map((filePath) => new Promise((resolve) => {
    readAsync(filePath)
      .then((content) => {
        const newContent = transform(content, config);

        writeAsync(filePath, newContent)
          .then(resolve);
      });
  }));

  Promise.all(promises);
};

module.exports = localTransformer;
