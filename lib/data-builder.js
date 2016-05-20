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
    err = {
      statusCode: 500,
      message: '' + err,
    };
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

    var data = {};
    cloneAllProperties(data, err);
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
  cloneAllProperties(data, err);
}

function fillBadRequestError(data, err) {
  data.name = err.name;
  data.message = err.message;
  data.details = err.details;
}

function fillInternalError(data, err) {
  data.message = httpStatus[data.statusCode] || 'Unknown Error';
}

function cloneAllProperties(data, err) {
  // NOTE err.name and err.message are not enumerable properties
  data.name = err.name;
  data.message = err.message;
  for (var p in err) {
    if ((p in data)) continue;
    data[p] = err[p];
  }
  // NOTE err.stack is not an enumerable property
  // stack is appended last to ensure order is the same for response
  data.stack = err.stack;
}
