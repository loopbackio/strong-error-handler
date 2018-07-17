// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var format = require('util').format;

module.exports = function sendText(res, data) {
  var content = format('%s: %s {%s}', data.name, data.message,
    data.statusCode);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(content, 'utf-8');
};
