/*!
 * strong-error-handler
 * Copyright(c) 2015-2016 strongloop
 * MIT Licensed
 */

'use strict';

var accepts = require('accepts');
var escapeHtml = require('escape-html');
var fs = require('fs');
var util = require('util');

var DOUBLE_SPACE_REGEXP = /  /g;
var inspect = util.inspect;
var NEW_LINE_GLOBAL_REGEXP = /\r?\n/;
var toString = Object.prototype.toString;

var defer = function(fn) { process.nextTick(fn.bind.apply(fn, arguments)); };

/**
 * Strong Error handler:
 *
 * Production error handler, providing stack traces for debugging
 * environment and error message responses for requests accepting text, html,
 * or json. strong-error-handler will only provide safeFields in production
 * mode.
 *
 * Text:
 *
 *   By default, and when _text/plain_ is accepted a simple stack trace
 *   or error message will be returned.
 *
 * JSON:
 *
 *   When _application/json_ is accepted, connect will respond with
 *   an object in the form of `{ "error": error }`.
 *
 * HTML:
 *
 *   When accepted connect will output a nice html stack trace.
 *
 * @return {Function}
 * @api public
 */
exports = module.exports = function strongErrorHandler(options) {
  // get environment (env) is not used. For enviornement variables,
  // options.debug should be configured
  options = options || {};
  // enable the development mode by default
  // In dev, all error properties (including) stack traces
  // are sent in the response
  var debug = options.debug;
  // get options
  // get log option
  var log = options.log === true;

  if (log === true) {
    log = logerror;
  }

  if (typeof log !== 'boolean') {
    throw new TypeError('option log must be boolean');
  }

  var safeFields = options.safeFields;

  return function strongErrorHandler(err, req, res, next) {
    if (!debug) {
      delete err.stack;
    }
    // respect err.statusCode
    if (err.statusCode) {
      res.statusCode = err.statusCode;
    }

    // respect err.status
    if (err.status) {
      res.statusCode = err.status;
    }

    // default status code to 500
    if (res.statusCode < 400) {
      res.statusCode = 500;
    }
    if (res.statusCode == undefined) {
      res.statusCode = 500;
    }
    // log the error
    var str = stringify(err);
    if (log) {
      console.error('Unhandled error for request %s %s: %s', req.method, req.path, err.stack);
    }

    // cannot actually respond
    if (res._header) {
      return req.socket.destroy();
    }

    // negotiate
    var accept = accepts(req);
    var type = accept.type('html', 'json', 'text');
    if (!accept) {
      return 'Strong error Handler does not support the requested type. ';
    }

    // Security header for content sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // html
    if (type === 'html') {
      fs.readFile(__dirname + '/views/style.css', 'utf8', function(e, style) {
        if (e) return next(e);
        fs.readFile(__dirname + '/views/error.jade', 'utf8', function(e, html) {
          if (e) return next(e);
          var isInspect = !err.stack && String(err) === toString.call(err);
          var errorHtml = !isInspect ?
            escapeHtmlBlock(str.split('\n', 1)[0] || 'Error') :
            'Error';
          var stack = !isInspect ?
             String(str).split('\n').slice(1) :
             [str];
          var stackHtml = stack
            .map(function(v) { return '<li>' + escapeHtmlBlock(v) + '</li>'; })
            .join('');
          var body = html
            .replace('{style}', style)
            .replace('{stack}', stackHtml)
            .replace('{title}', escapeHtml(exports.title))
            .replace('{statusCode}', res.statusCode)
            .replace(/\{error\}/g, errorHtml);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(body);
        });
      });
      if (res.statusCode === 401) {
        fs.readFile(__dirname + '/views/error-unauthorized.html', 'utf8', function(e, html) {
          if (e) return next(e);
        });
      }
      if (res.statusCode === 404)  {
        fs.readFile(__dirname + '/views/error-not-found.jade', 'utf8', function(e, html) {
          if (e) return next(e);
        });
      }
    // json
    } else if (type === 'json') {
      var error = { message: err.message, stack: err.stack };
      for (var prop in err) error[prop] = err[prop];
      var json = JSON.stringify({ error: error });
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(json);
// a custom JSON serializer function for producing JSON response bodies
// @param sanitizedData: response data containing only safe properties
// @param originalError: the original Error object
      var  jsonSerializer = function(sanitizedData, originalError) {
        if (originalError.name === 'ValidationError') {
          var details = sanitizedData.details || {};
          sanitizedData.issueCount =  details.codes && Object.keys(details.codes).length;
        }
        return sanitizedData;
      };
    // plain text
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(str);
    }
  };
};

/**
 * Escape a block of HTML, preserving whitespace.
 * @api private
 */

function escapeHtmlBlock(str) {
  return escapeHtml(str)
  .replace(DOUBLE_SPACE_REGEXP, ' &nbsp;')
  .replace(NEW_LINE_GLOBAL_REGEXP, '<br>');
}

/**
 * Stringify a value.
 * @api private
 */

function stringify(val) {
  var stack = val.stack;

  if (stack) {
    return String(stack);
  }

  var str = String(val);

  return str === toString.call(val) ?
     inspect(val) :
     str;
}

/**
 * Log error to console.
 * @api private
 */

function logerror(err, str) {
  console.error(str);
}
