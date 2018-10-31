'use strict';

const performReplace = (content, rule, replacement) => content.replace(new RegExp(rule, 'g'), replacement);

const transform = (content, config) => {
  let newContent = content.toString();
  for (const rule in config.replaceRules) {
    const replacement = config.replaceRules[rule];

    newContent = performReplace(newContent, rule, replacement);
  }

  return newContent;
};

module.exports = transform;
