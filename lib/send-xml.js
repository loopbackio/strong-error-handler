// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const js2xmlparser = require('js2xmlparser');

module.exports = function sendXml(res, data) {
  const content = js2xmlparser.parse('error', data);
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.end(content, 'utf-8');
};
