if (global.GENTLY) {
    require = GENTLY.hijack(require);
}
var util = require("./util"),
	EventEmitter = require("events").EventEmitter,
	WriteStream = require("fs").WriteStream;
function File(properties) {
	"use strict";
	EventEmitter.call(this);
	this.size = 0;
	this.path = null;
	this.name = null;
	this.type = null;
	this.lastModifiedDate = null;
	this._writeStream = null;
	var key;
	for (key in properties) {
		if (properties.hasOwnProperty(key)) {
			this[key] = properties[key];
		}
	}
	this._backwardsCompatibility();
}
File.prototype._backwardsCompatibility = function () {
	"use strict";
	var self = this;
	this.__defineGetter__("length", function () {
		return self.size;
	});
	this.__defineGetter__("filename", function () {
		return self.name;
	});
	this.__defineGetter__("mime", function () {
		return self.type;
	});
};
File.prototype.open = function () {
	"use strict";
	this._writeStream = new WriteStream(this.path);
};
File.prototype.write = function (buffer, cb) {
	"use strict";
	var self = this;
	this._writeStream.write(buffer, function () {
		self.lastModifiedDate = new Date();
		self.size += buffer.length;
		self.emit("progress", self.size);
		cb();
	});
};
File.prototype.end = function (cb) {
	"use strict";
	var self = this;
	this._writeStream.end(function () {
		self.emit("end");
		cb();
	});
};
util.inherits(File, EventEmitter);
module.exports = File;