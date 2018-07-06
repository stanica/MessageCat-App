/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/esp              ->  index
 * POST    /api/esp              ->  create
 * GET     /api/esp/:id          ->  show
 * PUT     /api/esp/:id          ->  upsert
 * PATCH   /api/esp/:id          ->  patch
 * DELETE  /api/esp/:id          ->  destroy
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _deleteProperty = require('babel-runtime/core-js/reflect/delete-property');

var _deleteProperty2 = _interopRequireDefault(_deleteProperty);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.index = index;
exports.show = show;
exports.create = create;
exports.upsert = upsert;
exports.patch = patch;
exports.destroy = destroy;
exports.getFollowers = getFollowers;

var _fastJsonPatch = require('fast-json-patch');

var _esp = require('./esp.model');

var _esp2 = _interopRequireDefault(_esp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const https = require('https');
var fs = require('fs');
var rimraf = require('rimraf');
const path = require('path');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      (0, _fastJsonPatch.applyPatch)(entity, patches, /*validate*/true);
    } catch (err) {
      return _promise2.default.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove().then(() => {
        if (typeof parseInt(entity.chipId) === 'number' && fs.existsSync(path.resolve('server/uploads/' + '/' + entity.chipId + '/'))) {
          rimraf(path.resolve('server/uploads/' + '/' + entity.chipId + '/'), function () {
            console.log('Deleted ' + entity.chipId + '/');
          });
        }
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Esps
function index(req, res) {
  if (req.user.role === 'admin') {
    return _esp2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
  } else {
    return _esp2.default.find({ email: req.user.email }).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
  }
}

// Gets a single Esp from the DB
function show(req, res) {
  return _esp2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new Esp in the DB
function create(req, res) {
  return _esp2.default.create(req.body).then(esp => {
    if (!fs.existsSync(path.resolve('server/uploads/') + '/' + esp.chipId + '/')) {
      fs.mkdir(path.resolve('server/uploads/') + '/' + esp.chipId, function (err) {
        if (err) {
          console.log('Error making folder for ' + esp.chipId, err);
          return handleError(res)(err);
        }
        fs.writeFile(path.resolve('server/uploads/') + '/' + esp.chipId + '/log.txt', "", function (err) {
          if (err) {
            console.log('Error writing log.txt', err);
            return handleError(res)(err);
          }
        });
      });
    }
    return respondWithResult(res, 201)(esp);
  }).catch(handleError(res));
}

// Upserts the given Esp in the DB at the specified ID
function upsert(req, res) {
  if (req.body._id) {
    (0, _deleteProperty2.default)(req.body, '_id');
  }
  return _esp2.default.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec().then(respondWithResult(res)).catch(handleError(res));
}

// Updates an existing Esp in the DB
function patch(req, res) {
  if (req.body._id) {
    (0, _deleteProperty2.default)(req.body, '_id');
  }
  return _esp2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(patchUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a Esp from the DB
function destroy(req, res) {
  return _esp2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}

// Get Instagram followers for a username
function getFollowers(req, res) {
  https.get('https://www.instagram.com/web/search/topsearch/?query=' + req.params.id, resp => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', chunk => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(JSON.parse(data).users[0]);
      return respondWithResult(res)(JSON.parse(data).users[0].user);
    });
  }).on("error", err => {
    console.log("Error: " + err.message);
    return handleError(res)(err);
  });
}
//# sourceMappingURL=esp.controller.js.map
