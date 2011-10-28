var common = require("../common"),
	multipartParser = require(common.lib + "/multipart_parser"),
	MultipartParser = multipartParser.MultipartParser,
	parser,
	Buffer = require("buffer").Buffer,
	events = require("events");
function test(a) {
	"use strict";
	parser = new MultipartParser();
	a();
}
test(function () {
	"use strict";
	assert.equal(parser.boundary, null);
	assert.equal(parser.state, 0);
	assert.equal(parser.flags, 0);
	assert.equal(parser.boundaryChars, null);
	assert.equal(parser.index, null);
	assert.equal(parser.lookbehind, null);
	assert.equal(parser.constructor.name, "MultipartParser");
});
test(function () {
	"use strict";
	parser.initWithBoundary("abc");
	assert.deepEqual(Array.prototype.slice.call(parser.boundary), [13, 10, 45, 45, 97, 98, 99]);
	assert.equal(parser.state, multipartParser.START);
	assert.deepEqual(parser.boundaryChars, {
		10: true,
		13: true,
		45: true,
		97: true,
		98: true,
		99: true
	});
});
test(function () {
	"use strict";
	var a = new Buffer(5);
	parser.initWithBoundary("abc");
	a.write("--ad", "ascii", 0);
	assert.equal(parser.write(a), 3);
});
test(function () {
	"use strict";
	assert.equal(parser.end().message, "MultipartParser.end(): stream ended unexpectedly: " + parser.explain());
	parser.state = multipartParser.END;
	assert.strictEqual(parser.end(), void 0);
});