// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var cloneAllProperties = require('../lib/clone.js');
var httpStatus = require('http-status');

function isEmpty(obj) {
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

module.exports = function buildResponseData(err, options) {
  // Debugging mode is disabled by default. When turned on (in dev),
  // all error properties (including) stack traces are sent in the response
  var isDebugMode = options.debug;
  var data;

  if (Array.isArray(err) && isDebugMode) {
    err = serializeArrayOfErrors(err);
  }

  if (!isEmpty(err.data)) {
    data = err.data
  }
  else {
    fillStatusCode(data, err);

    if (typeof err !== 'object') {
      err = {
        statusCode: 500,
        message: '' + err,
      };
    }

    if (isDebugMode) {
      fillDebugData(data, err);
    } else if (data.code >= 400 && data.code <= 499) {
      fillBadRequestError(data, err);
    } else {
      fillInternalError(data, err);
    }

    var safeFields = options.safeFields || [];
    fillSafeFields(data, err, safeFields);
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
    delete data.statusCode;
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
  data.code = err.code;
  data.details = err.details;
}

function fillInternalError(data, err) {
  data.message = httpStatus[data.statusCode] || 'Unknown Error';
}

function fillSafeFields(data, err, safeFields) {
  if (!Array.isArray(safeFields)) {
    safeFields = [safeFields];
  }

  safeFields.forEach(function(field) {
    data[field] = err[field];
  });
}
