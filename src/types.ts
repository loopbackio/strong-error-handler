import type Express from 'express';

/**
 * Options for writing errors to the response
 */
export interface ErrorWriterOptions {
  debug?: boolean;
  safeFields?: string[];
  defaultType?: string;
  negotiateContentType?: boolean;
  rootProperty?: string | false;
}

/**
 * Options for error-handling
 */
export interface ErrorHandlerOptions extends ErrorWriterOptions {
  log?: boolean;
}

/**
 * Error-handling middleware function. Includes server-side logging
 */
export type StrongErrorHandler = (
  err: Error,
  req: Express.Request,
  res: Express.Response,
  next: (err?: unknown) => void,
) => void;
