// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import ejs from 'ejs';
import type Express from 'express';
import fs from 'fs';
import path from 'path';

const assetDir = path.resolve(__dirname, '../views');
const compiledTemplates = {
  // loading default template and stylesheet
  default: loadDefaultTemplates(),
};

export function sendHtml(
  res: Express.Response,
  data: ejs.Data['data'],
  options: ejs.Data['options'],
) {
  const toRender = {options, data};
  // TODO: ability to call non-default template functions from options
  const body = compiledTemplates.default(toRender);
  sendResponse(res, body);
}

/**
 * Compile and cache the file with the `filename` key in options
 *
 * @param filepath (description)
 * @returns Render function with signature fn(data);
 */
function compileTemplate(filepath: string): ejs.TemplateFunction {
  const options = {cache: true, filename: filepath};
  const fileContent = fs.readFileSync(filepath, 'utf8');
  return ejs.compile(fileContent, options);
}

// loads and cache default error templates
function loadDefaultTemplates() {
  const defaultTemplate = path.resolve(assetDir, 'default-error.ejs');
  return compileTemplate(defaultTemplate);
}

function sendResponse(res: Express.Response, body: string) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(body);
}
