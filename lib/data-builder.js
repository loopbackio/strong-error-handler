// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var httpStatus = require('http-status');

module.exports = function buildResponseData(err, isDebugMode) {
  if (Array.isArray(err) && isDebugMode) {
    err = serializeArrayOfErrors(err);
  }

  var data = Object.create(null);
  fillStatusCode(data, err);

  if (typeof err !== 'object') {
    data.statusCode = 500;
    data.message = '' + err;
    err = {};
  }

  if (isDebugMode) {
    fillDebugData(data, err);
  } else if (data.statusCode >= 400 && data.statusCode <= 499) {
    fillBadRequestError(data, err);
  } else {
    fillInternalError(data, err);
  }

  return data;
};

function serializeArrayOfErrors(errors) {
  var details = [];
  for (var ix in errors) {
    var err = errors[ix];
    if (typeof err !== 'object') {
      details.push('' + err);
      continue;
    }

    var data = {stack: err.stack};
    for (var p in err) { // eslint-disable-line one-var
      data[p] = err[p];
    }
    details.push(data);
  }

  return {
    name: 'ArrayOfErrors',
    message: 'Failed with multiple errors, ' +
      'see `details` for more information.',
    details: details,
  };
}

function fillStatusCode(data, err) {
  data.statusCode = err.statusCode || err.status;
  if (!data.statusCode || data.statusCode < 400)
    data.statusCode = 500;
}

function fillDebugData(data, err) {
  for (var p in err) {
    if ((p in data)) continue;
    data[p] = err[p];
  }
  // NOTE err.stack is not an enumerable property
  data.stack = err.stack;
}

function fillBadRequestError(data, err) {
  data.name = err.name;
  data.message = err.message;
  data.details = err.details;
}

function fillInternalError(data, err) {
  data.message = httpStatus[data.statusCode] || 'Unknown Error';
}
