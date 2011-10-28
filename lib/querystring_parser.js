if (global.GENTLY) {
	require = GENTLY.hijack(require);
}
var querystring = require("querystring");
function QuerystringParser() {
	"use strict";
	this.buffer = "";
}
exports.QuerystringParser = QuerystringParser;
QuerystringParser.prototype.write = function (buffer) {
	"use strict";
	this.buffer += buffer.toString("ascii");
	return buffer.length;
};
QuerystringParser.prototype.end = function () {
	"use strict";
	var field,
		fields = querystring.parse(this.buffer);
	for (field in fields) {
		if (fields.hasOwnProperty(field)) {
			this.onField(field, fields[field]);
		}
	}
	this.buffer = "";
	this.onEnd();
};