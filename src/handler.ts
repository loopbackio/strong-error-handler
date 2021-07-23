// Copyright IBM Corp. 2016,2018. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import type Express from 'express';
import {HttpError, isHttpError} from 'http-errors';
import path from 'path';
import SG from 'strong-globalize';
import {negotiateContentProducer} from './content-negotiation';
import {buildResponseData} from './data-builder';
import {logToConsole} from './logger';
import {
  ErrorHandlerOptions,
  ErrorWriterOptions,
  StrongErrorHandler,
} from './types';

SG.SetRootDir(path.resolve(__dirname, '..'));
const debug = debugFactory('strong-error-handler');

function noop() {}

/**
 * Create a middleware error handler function.
 *
 * @param {Object} options
 * @returns {Function}
 */
export function createStrongErrorHandler(
  options: ErrorHandlerOptions = {},
): StrongErrorHandler {
  debug('Initializing with options %j', options);

  // Log all errors via console.error (enabled by default)
  const logError = options.log !== false ? logToConsole : noop;

  return function strongErrorHandler(
    err: Error,
    req: Express.Request,
    res: Express.Response,
    next: (err: unknown) => void,
  ) {
    logError(req, err);
    writeErrorToResponse(err, req, res, options);
  };
}

/**
 * Writes thrown error to response
 *
 * @param err
 * @param req
 * @param res
 * @param options
 */
function writeErrorToResponse(
  err: Error | HttpError,
  req: Express.Request,
  res: Express.Response,
  options: ErrorWriterOptions = {},
) {
  debug('Handling %s', err.stack || err);

  if (res.headersSent) {
    debug('Response was already sent, closing the underlying connection');
    return req.socket.destroy();
  }

  // this will alter the err object, to handle when res.statusCode is an error
  if (!isHttpError(err) && res.statusCode >= 400)
    (err as Partial<HttpError> & Error).statusCode = res.statusCode;

  const data = buildResponseData(err, options);
  debug('Response status %s data %j', data.statusCode, data);

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = data.statusCode;

  const sendResponse = negotiateContentProducer(req, warn, options);
  sendResponse(res, data, options);

  function warn(msg: string) {
    res.header('X-Warning', msg);
    debug(msg);
  }
}

module.exports = createStrongErrorHandler;
module.exports.writeErrorToResponse = writeErrorToResponse;
