'use strict';

var _auth = require('../../auth/auth.service');

var auth = _interopRequireWildcard(_auth);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var express = require('express');
var controller = require('./file.controller');


var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', controller.show);
router.get('/:id/list', controller.list);
router.get('/:id/update', controller.getUpdate);
router.get('/:id/uploads/:file', controller.getFile);
router.get('/:id/boot/:file', auth.isAuthenticated(), controller.setBoot);
router.post('/', controller.create);
router.post('/:id/log', controller.log);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);
router.delete('/:id/log', auth.isAuthenticated(), controller.destroyLog);

module.exports = router;
//# sourceMappingURL=index.js.map
