var path = require("path"),
	root = path.join(__dirname, "../"),
	mysql = require("..");
exports.dir = {
	root: root,
	lib: root + "/lib",
	fixture: root + "/test/fixture",
	tmp: root + "/test/tmp"
};
exports.port = 13532;
exports.formidable = require("..");
exports.fastOrSlow = require("fast-or-slow");
exports.assert = require("assert");
exports.require = function (lib) {
	"use strict";
	return require(exports.dir.lib + "/" + lib);
};