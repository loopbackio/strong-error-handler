// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports = function sendHtml(res, data) {
  var content = '<html><body>' + data.message + '</body></html>';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(content, 'utf-8');
};
