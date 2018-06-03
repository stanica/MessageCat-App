'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _file = require('./file.events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FileSchema = new _mongoose2.default.Schema({
  espId: _mongoose2.default.Schema.Types.ObjectId,
  folder: String,
  fileName: String,
  email: String,
  boot: { type: Boolean, default: 0 },
  active: { type: Boolean, default: true }
});

(0, _file.registerEvents)(FileSchema);
exports.default = _mongoose2.default.model('File', FileSchema);
//# sourceMappingURL=file.model.js.map
