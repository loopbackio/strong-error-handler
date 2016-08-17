// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
var ejs = require('ejs');
var fs = require('fs');
var path = require('path');

var assetDir = path.resolve(__dirname, '../views');
var compiledTemplates = {
  // loading default template and stylesheet
  default: loadDefaultTemplates(),
};

module.exports = sendHtml;

function sendHtml(res, data, options) {
  var toRender = {options: {}, data: data};
  // TODO: ability to call non-default template functions from options
  var body = compiledTemplates.default(toRender);
  sendReponse(res, body);
}

/**
 * Compile and cache the file with the `filename` key in options
 *
 * @param filepath (description)
 * @returns {Function} render function with signature fn(data);
 */
function compileTemplate(filepath) {
  var options = {cache: true, filename: filepath};
  var fileContent = fs.readFileSync(filepath, 'utf8');
  return ejs.compile(fileContent, options);
}

// loads and cache default error templates
function loadDefaultTemplates() {
  var defaultTemplate = path.resolve(assetDir, 'default-error.ejs');
  return compileTemplate(defaultTemplate);
}

function sendReponse(res, body) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(body);
}
