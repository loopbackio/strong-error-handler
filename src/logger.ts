// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import type Express from 'express';
import SG from 'strong-globalize';
import {format} from 'util';
const g = new SG();

export function logToConsole(req: Express.Request, err: Error) {
  if (!Array.isArray(err)) {
    g.error('Request %s %s failed: %s', req.method, req.url, err.stack || err);
    return;
  }

  const errMsg = g.f(
    'Request %s %s failed with multiple errors:\n',
    req.method,
    req.url,
  );
  const errors = err.map(formatError).join('\n');
  console.error(errMsg, errors);
}

function formatError(err) {
  return format('%s', err.stack || err);
}
