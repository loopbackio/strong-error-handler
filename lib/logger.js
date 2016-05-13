// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var format = require('util').format;

module.exports = function logToConsole(req, err) {
  if (!Array.isArray(err)) {
    console.error('Unhandled error for request %s %s: %s',
      req.method, req.url, err.stack || err);
    return;
  }

  var errors = err.map(formatError).join('\n');
  console.error('Unhandled array of errors for request %s %s\n',
    req.method, req.url, errors);
};

function formatError(err) {
  return format('%s', err.stack || err);
}
