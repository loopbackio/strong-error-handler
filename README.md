# strong-error-handler

Error handler for use in development (debug) and production environments.

 - When run in production mode, error responses are purposely undetailed
   in order to prevent leaking sensitive information.

 - When in debug mode, detailed information such as stack traces
   are returned in the HTTP responses.

## Install

```bash
$ npm install strong-error-handler
```

## Usage

In an express-based application:

```js
var express = require('express');
var errorHandler = require('strong-error-handler');

var app = express();
// setup your routes
app.use(errorHandler({ /* options, see below */ }));

app.listen(3000);
```

In LoopBack applications, add the following entry to your
`server/middleware.json` file.

```json
{
  "final:after": {
    "strong-error-handler": {
      "params": {
       }
    }
  }
}
```

## Content Type

Depending on the request header's `Accepts`, response will be returned in
 the corresponding content-type, current supported types include:
- JSON (`json`/`application/json`)
- HTML (`html`/`text/html`)

*There are plans to support other formats such as Text and XML.*

## Options

#### debug

`boolean`, defaults to `false`.

When enabled, HTTP responses include all error properties, including
sensitive data such as file paths, URLs and stack traces.

#### log

`boolean`, defaults to `true`.

When enabled, all errors are printed via `console.error`.

Customization of the log format is intentionally not allowed. If you would like
to use a different format/logger, disable this option and add your own custom
error-handling middleware.

```js
app.use(myErrorLogger());
app.use(errorHandler({ log: false }));
```
