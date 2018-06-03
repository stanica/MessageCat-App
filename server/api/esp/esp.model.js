'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _esp = require('./esp.events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EspSchema = new _mongoose2.default.Schema({
  name: String,
  chipId: String,
  description: String,
  email: String,
  update: { type: Number, default: 0 },
  heartbeat: Date,
  active: { type: Boolean, default: true }
});

(0, _esp.registerEvents)(EspSchema);
exports.default = _mongoose2.default.model('Esp', EspSchema);
//# sourceMappingURL=esp.model.js.map
