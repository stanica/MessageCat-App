/**
 * Main application file
 */

'use strict';

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _environment = require('./config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express3 = require('./config/express');

var _express4 = _interopRequireDefault(_express3);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _seed = require('./config/seed');

var _seed2 = _interopRequireDefault(_seed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = require('bluebird');


// Connect to MongoDB
_mongoose2.default.connect(_environment2.default.mongo.uri, _environment2.default.mongo.options);
_mongoose2.default.connection.on('error', function (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(-1); // eslint-disable-line no-process-exit
});

// Setup server
var bodyParser = require('body-parser');
var app = (0, _express2.default)();
app.use(bodyParser.text());
var server = _http2.default.createServer(app);

(0, _express4.default)(app);
(0, _routes2.default)(app);

// Start server
function startServer() {
    app.angularFullstack = server.listen(_environment2.default.port, _environment2.default.ip, function () {
        console.log('Express server listening on %d, in %s mode', _environment2.default.port, app.get('env'));
    });
}

(0, _setImmediate3.default)(startServer);

// Expose app
exports = module.exports = app;
//# sourceMappingURL=app.js.map
