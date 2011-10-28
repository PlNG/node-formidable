var common = require("../common"),
	QuerystringParser = require(common.lib + "/querystring_parser").QuerystringParser,
	Buffer = require("buffer").Buffer,
	gently,
	parser;
function test(test) {
	"use strict";
	gently = new Gently();
	parser = new QuerystringParser();
	test();
	gently.verify(test.name);
}
test(function constructor() {
	"use strict";
	assert.equal(parser.buffer, "");
	assert.equal(parser.constructor.name, "QuerystringParser");
});
test(function write() {
	"use strict";
	var a = new Buffer("a=1"),
		b = new Buffer("&b=2");
	assert.equal(parser.write(a), a.length);
	parser.write(b);
	assert.equal(parser.buffer, a + b);
});
test(function end() {
	"use strict";
	var FIELDS = {
		a: ["b",
			{
				c: "d"
			}],
		e: "f"
	};
	gently.expect(GENTLY.hijacked.querystring, "parse", function (str) {
		assert.equal(str, parser.buffer);
		return FIELDS;
	});
	gently.expect(parser, "onField", Object.keys(FIELDS).length, function (key, val) {
		assert.deepEqual(FIELDS[key], val);
	});
	gently.expect(parser, "onEnd");
	parser.buffer = "my buffer";
	parser.end();
	assert.equal(parser.buffer, "");
});