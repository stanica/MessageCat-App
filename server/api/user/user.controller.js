'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.index = index;
exports.create = create;
exports.show = show;
exports.destroy = destroy;
exports.changePassword = changePassword;
exports.me = me;
exports.authCallback = authCallback;

var _user = require('./user.model');

var _user2 = _interopRequireDefault(_user);

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return function (err) {
        return res.status(statusCode).json(err);
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        return res.status(statusCode).send(err);
    };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
function index(req, res) {
    return _user2.default.find({}, '-salt -password').exec().then(users => {
        res.status(200).json(users);
    }).catch(handleError(res));
}

/**
 * Creates a new user
 */
function create(req, res) {
    var newUser = new _user2.default(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    return newUser.save().then(function (user) {
        var token = _jsonwebtoken2.default.sign({ _id: user._id }, _environment2.default.secrets.session, {
            expiresIn: 60 * 60 * 5
        });
        res.json({ token });
    }).catch(validationError(res));
}

/**
 * Get a single user
 */
function show(req, res, next) {
    var userId = req.params.id;

    return _user2.default.findById(userId).exec().then(user => {
        if (!user) {
            return res.status(404).end();
        }
        res.json(user.profile);
    }).catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
function destroy(req, res) {
    return _user2.default.findByIdAndRemove(req.params.id).exec().then(function () {
        res.status(204).end();
    }).catch(handleError(res));
}

/**
 * Change a users password
 */
function changePassword(req, res) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    return _user2.default.findById(userId).exec().then(user => {
        if (user.authenticate(oldPass)) {
            user.password = newPass;
            return user.save().then(() => {
                res.status(204).end();
            }).catch(validationError(res));
        } else {
            return res.status(403).end();
        }
    });
}

/**
 * Get my info
 */
function me(req, res, next) {
    var userId = req.user._id;

    return _user2.default.findOne({ _id: userId }, '-salt -password').exec().then(user => {
        // don't ever give out the password or salt
        if (!user) {
            return res.status(401).end();
        }
        return res.json(user);
    }).catch(err => next(err));
}

/**
 * Authentication callback
 */
function authCallback(req, res) {
    res.redirect('/');
}
//# sourceMappingURL=user.controller.js.map
