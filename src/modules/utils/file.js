'use strict';

const fs = require('fs');
const { join, parse } = require('path');
const { flatten } = require('ramda');

const fileStatsAsync = (path) => new Promise((resolve, reject) => fs.stat(path, (err, stats) => {
  if (!err) {
    resolve(stats);
    return;
  }

  reject(err);
}));

const existsAsync = (path) => new Promise(async (resolve, reject) => {
  try {
    await fileStatsAsync(path);
    resolve(true);
  } catch (err) {
    // Error is not "Doesnt exist"
    if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
      reject(err);
      return;
    }
  }

  resolve(false);
});

const readAsync = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, (err, data) => {
    if (!err) {
      resolve(data);
      return;
    }

    reject(err);
  });
});

const readDirAsync = (path) => new Promise((resolve, reject) => {
  fs.readdir(path, async (err, files) => {
    if (err) {
      reject(err);
      return;
    }

    resolve(files);
  });
});

const readDirRecursivelyAsync = (path) => new Promise(async (resolve) => {
  const items = await readDirAsync(path);
  const fullPathItems = items.map((item) => join(path, item));

  // hacky way to find out if that's a dir or not
  const isDir = (file) => {
    const ext = parse(join(path, file)).ext;
    return ext === '' || ext.length < 3;
  };

  const isNotDir = (file) => !isDir(file);
  const files = fullPathItems.filter(isNotDir);
  const dirs = fullPathItems.filter(isDir);
  const dirsFiles = dirs.map((dir) => readDirRecursivelyAsync(dir));

  const resolved = await Promise.all([
    Promise.resolve(files),
    Promise.resolve(Promise.all(dirsFiles)),
  ]);

  resolve(flatten(resolved).filter(isNotDir));
});

const writeAsync = (path, data) => new Promise((resolve, reject) => {
  fs.writeFile(path, data, (err) => {
    if (err) {
      reject(err);
      return;
    }

    resolve();
  });
});

const fetchFilePathsRecursively = (path) => new Promise(async (resolve, reject) => {
  const exists = await existsAsync(path);
  if (false === exists) {
    reject(`"${path}" does not exist.`);
    return;
  }

  const files = await readDirRecursivelyAsync(path);
  resolve(files);
});

module.exports = {
  fileStatsAsync,
  existsAsync,
  readAsync,
  writeAsync,
  fetchFilePathsRecursively,
};
