'use strict';

const fs = require('fs');

module.exports = {
  existsAsync: (path) => new Promise((resolve, reject) => {
    fs.stat(path, (err) => {
      // Exists
      if (!err) {
        resolve(true);
        return;
      }

      // Error is not "Doesnt exist"
      if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
        reject(err);
        return;
      }

      // Does not exist
      resolve(false);
    });
  }),
};
