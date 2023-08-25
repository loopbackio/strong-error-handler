// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const assetDir = path.resolve(__dirname, '../views');
const compiledTemplates = {
  // loading default template and stylesheet
  default: loadDefaultTemplates(),
};

module.exports = sendHtml;

/**
 * Sends HTML response to the client.
 *
 * @param {Object} res - The response object.
 * @param {Object} data - The data object to be rendered in the HTML.
 * @param {Object} options - The options object.
 */
function sendHtml(res, data, options) {
  const toRender = {options, data};
  // TODO: ability to call non-default template functions from options
  const body = compiledTemplates.default(toRender);
  sendResponse(res, body);
}

/**
 * Returns the content of a Handlebars partial file as a string.
 * @param {string} name - The name of the Handlebars partial file.
 * @returns {string} The content of the Handlebars partial file as a string.
 */
function partial(name) {
  const partialPath = path.resolve(assetDir, `${name}.hbs`);
  const partialContent = fs.readFileSync(partialPath, 'utf8');
  return partialContent;
}

handlebars.registerHelper('partial', partial);

/**
 * Checks if the given property is a standard property.
 * @param {string} prop - The property to check.
 * @param {Object} options - The Handlebars options object.
 * @returns {string} - The result of the Handlebars template.
 */
function standardProps(prop, options) {
  const standardProps = ['name', 'statusCode', 'message', 'stack'];
  if (standardProps.indexOf(prop) === -1) {
    return options.fn(this);
  }
  return options.inverse(this);
}

handlebars.registerHelper('standardProps', standardProps);

/**
 * Compile and cache the file with the `filename` key in options
 *
 * @param filepath (description)
 * @returns {Function} render function with signature fn(data);
 */
function compileTemplate(filepath) {
  const options = {cache: true, filename: filepath};
  const fileContent = fs.readFileSync(filepath, 'utf8');
  return handlebars.compile(fileContent, options);
}

/**
 * Loads the default error handlebars template from the asset directory and compiles it.
 * @returns {Function} The compiled handlebars template function.
 */
function loadDefaultTemplates() {
  const defaultTemplate = path.resolve(assetDir, 'default-error.hbs');
  return compileTemplate(defaultTemplate);
}

/**
 * Sends an HTML response with the given body to the provided response object.
 * @param {Object} res - The response object to send the HTML response to.
 * @param {string} body - The HTML body to send in the response.
 */
function sendResponse(res, body) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(body);
}
