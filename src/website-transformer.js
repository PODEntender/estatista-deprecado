'use strict';

const transformer = require('./modules/transformer/local-transformer');
const config = require('./config');
const { resolve } = require('path');

const path = resolve(process.argv[2]);

console.log('Transforming downloaded files...');

transformer(path, config)
  .then(() => console.log('Finished transforming files.'));
