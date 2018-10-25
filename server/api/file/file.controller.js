/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/files              ->  index
 * POST    /api/files              ->  create
 * GET     /api/files/:id          ->  show
 * PUT     /api/files/:id          ->  upsert
 * PATCH   /api/files/:id          ->  patch
 * DELETE  /api/files/:id          ->  destroy
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
exports.setBoot = setBoot;
exports.list = list;
exports.getFile = getFile;
exports.getUpdate = getUpdate;
exports.create = create;
exports.upsert = upsert;
exports.patch = patch;
exports.destroy = destroy;
exports.destroyLog = destroyLog;
exports.log = log;

var _fastJsonPatch = require('fast-json-patch');

var _file = require('./file.model');

var _file2 = _interopRequireDefault(_file);

var _esp = require('../esp/esp.model');

var _esp2 = _interopRequireDefault(_esp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fs = require('fs');
const path = require('path');
const readLastLines = require('read-last-lines');
const luamin = require('luamin');

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
      return entity.remove().then(() => res.status(204).end());
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

// Gets a list of Files
function index(req, res) {
  if (req.user.role === 'admin') {
    return _file2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
  } else {
    return _file2.default.find({ email: req.user.email }).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
  }
}

// Gets a single File from the DB
function show(req, res) {
  return _file2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

//Sets boot flag for a file
function setBoot(req, res) {
  _file2.default.find({ folder: req.params.id, email: req.user.email }, function (err, files) {
    if (err) {
      return handleError(res, 500)(err);
    }
    if (files.length === 0) {
      return handleEntityNotFound(res)();
    }
    for (var x = 0; x < files.length; x++) {
      if (files[x].fileName === req.params.file) {
        files[x].boot = 1;
      } else {
        files[x].boot = 0;
      }
      files[x].save(function (err, saved) {
        if (err) {
          return handleError(res)(err);
        }
      });
    }
    _esp2.default.findOne({ _id: files[files.length - 1].espId }, function (err, esp) {
      if (err) {
        return handleError(res)(err);
      }
      if (!esp) {
        return handleEntityNotFound(res)();
      }
      esp.update = 1;
      esp.save(function (err, saved) {
        if (err) {
          return handleError(res)(err);
        }
        return respondWithResult(res, 200)(files);
      });
    });
  });
}

// Gets a list of files for a chip id
function list(req, res) {
  return _esp2.default.findOne({ 'chipId': req.params.id }).exec().then(handleEntityNotFound(res)).then(esp => {
    return _file2.default.find({ espId: esp._id }).sort({ boot: -1 }).exec(function (err, files) {
      if (!files) {
        return res.status(404).end();
      }
      var result = '';
      for (var x = 0; x < files.length; x++) {
        if (x !== files.length - 1) {
          result += files[x].fileName + '\n';
        } else {
          result += files[x].fileName;
        }
      }
      result = result.trim();
      res.writeHead(200, { 'Content-Type': 'text/json', 'Transfer-Encoding': 'Identity', 'Content-Length': Buffer.byteLength(result) });
      res.write(result);
      res.end();
      //respondWithResult(res, 200)(result);
    });
  }).catch(handleError(res));
}

// Gets file content for a single file
function getFile(req, res) {
  fs.readFile(path.resolve('server/uploads/') + '/' + req.params.id + '/' + req.params.file, "utf8", function (err, data) {
    if (!err) {
      if (req.params.file === 'log.txt') {
        readLastLines.read(path.resolve('server/uploads/') + '/' + req.params.id + '/' + req.params.file, 50).then(lines => {
          res.writeHead(200, { 'Content-Type': 'text/json', 'Transfer-Encoding': 'Identity', 'Content-Length': Buffer.byteLength(lines) });
          res.write(lines);
          res.end();
        });
      } else {
        if (req.query.min === 'true') {
          data = luamin.minify(data);
        }
        res.writeHead(200, { 'Content-Type': 'text/json', 'Transfer-Encoding': 'Identity', 'Content-Length': Buffer.byteLength(data.toString()) });
        res.write(data);
        res.end();
      }
    } else {
      if (req.params.file === 'log.txt') {
        fs.writeFile(path.resolve('server/uploads/') + '/' + req.params.id + '/log.txt', "", function (err) {
          if (err) {
            console.log('Error writing log.txt', err);
            return handleError(res)(err);
          }
        });
        res.writeHead(200, { 'Content-Type': 'text/json', 'Transfer-Encoding': 'Identity', 'Content-Length': 0 });
        res.write("");
        res.end();
      } else {
        return handleError(res)(err);
      }
    }
  });
}

// Gets update status for ESP board
function getUpdate(req, res) {
  return _esp2.default.findOne({ 'chipId': req.params.id }).exec().then(handleEntityNotFound(res)).then((esp, err) => {
    if (err) {
      return handleError(res)(err);
    }
    res.writeHead(200, { 'Content-Type': 'text/json', 'Transfer-Encoding': 'Identity' });
    if (esp.update === 1) {
      res.write('UPDATE');
      esp.update = 0;
    } else {
      res.write('');
    }
    res.end();
    esp.heartbeat = Date.now();
    esp.save();
  });
}

// Creates a new File in the DB
function create(req, res) {
  if (req.body.fileName) {
    return _file2.default.create(req.body).then(file => {
      fs.writeFile(path.resolve('server/uploads/') + '/' + req.body.folder + '/' + req.body.fileName, "", function (err) {
        if (err) {
          console.log(err);
        }
        return respondWithResult(res, 201)(file);
      });
    }).catch(handleError(res));
  } else {
    return handleEntityNotFound(res)({});
  }
}

// Upserts the given File in the DB at the specified ID
function upsert(req, res) {
  if (req.body._id) {
    (0, _deleteProperty2.default)(req.body, '_id');
  }
  fs.writeFile(path.resolve('server/uploads/') + '/' + req.body.folder + '/' + req.body.fileName, req.body.text, function (err) {
    if (err) {
      console.log(err);
    } else {
      _esp2.default.findOne({ _id: req.body.espId }, function (err, esp) {
        if (err) {
          return handleError(res)(err);
        }
        if (!esp) {
          return handleEntityNotFound(res)();
        }
        esp.update = 1;
        esp.save(function (err, saved) {
          if (err) {
            return handleError(res)(err);
          }
          respondWithResult(res, 201)({ status: 'success' });
        });
      });
    }
  });
}

// Updates an existing File in the DB
function patch(req, res) {
  if (req.body._id) {
    (0, _deleteProperty2.default)(req.body, '_id');
  }
  return _file2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(patchUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a File from the DB
function destroy(req, res) {
  if (req.params.id) {
    return _file2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(file => {
      fs.unlink(path.resolve('server/uploads') + '/' + file.folder + '/' + file.fileName, function (err) {
        return removeEntity(res)(file);
      });
    }).catch(handleError(res));
  } else {}
}

// Deletes log files
function destroyLog(req, res) {
  if (req.params.id) {
    return _esp2.default.findOne({ 'chipId': req.params.id, 'email': req.user.email }).exec().then(handleEntityNotFound(res)).then(esp => {
      fs.unlink(path.resolve('server/uploads') + '/' + esp.chipId + '/log.txt', function (err) {
        respondWithResult(res, 201)({ status: 'success' });
      });
    }).catch(handleError(res));
  }
}

// Writes to a log file
function log(req, res) {
  req.body = JSON.parse(req.body);
  fs.access(path.resolve('server/uploads/') + '/' + req.params.id + '/log.txt', "utf8", function (err) {
    if (err) {
      fs.writeFile(path.resolve('server/uploads/') + '/' + req.params.id + '/log.txt', req.body.text + '\n', function (err) {
        if (err) {
          console.log('Error writing to log.txt', err);
        }
      });
    } else {
      var stream = fs.createWriteStream(path.resolve('server/uploads/') + '/' + req.params.id + '/log.txt', { flags: 'a' });
      stream.write(req.body.text + '\n');
      stream.end();
    }
  });
  respondWithResult(res, 201)({ status: 'success' });
}
//# sourceMappingURL=file.controller.js.map
