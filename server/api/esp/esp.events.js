/**
 * Esp model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerEvents = undefined;

var _events = require('events');

var EspEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
EspEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Esp) {
  for (var e in events) {
    let event = events[e];
    Esp.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function (doc) {
    EspEvents.emit(event + ':' + doc._id, doc);
    EspEvents.emit(event, doc);
  };
}

exports.registerEvents = registerEvents;
exports.default = EspEvents;
//# sourceMappingURL=esp.events.js.map
