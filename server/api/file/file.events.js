/**
 * File model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerEvents = undefined;

var _events = require('events');

var FileEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
FileEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(File) {
  for (var e in events) {
    let event = events[e];
    File.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function (doc) {
    FileEvents.emit(event + ':' + doc._id, doc);
    FileEvents.emit(event, doc);
  };
}

exports.registerEvents = registerEvents;
exports.default = FileEvents;
//# sourceMappingURL=file.events.js.map
