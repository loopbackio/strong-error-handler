// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

module.exports = function sendJson(res, data) {
  var content = JSON.stringify({error: data});
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(content, 'utf-8');
};
