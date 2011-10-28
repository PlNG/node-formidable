var form,
	common = require("../common"),
	test = common.fastOrSlow.fast(),
	IncomingForm = common.require("incoming_form").IncomingForm,
	assert = common.assert;
test.before(function () {
	"use strict";
	form = new IncomingForm();
});
function makeHeader(filename) {
	"use strict";
	return 'Content-Disposition: form-data; name="upload"; filename="' + filename + '"';
}
test("#_fileName with regular characters", function () {
	"use strict";
	var filename = "foo.txt";
	assert.equal(form._fileName(makeHeader(filename)), "foo.txt");
});
test("#_fileName with unescaped quote", function () {
	"use strict";
	var filename = 'my".txt';
	assert.equal(form._fileName(makeHeader(filename)), 'my".txt');
});
test("#_fileName with escaped quote", function () {
	"use strict";
	var filename = "my%22.txt";
	assert.equal(form._fileName(makeHeader(filename)), 'my".txt');
});
test("#_fileName with bad quote and additional sub-header", function () {
	"use strict";
	var filename = 'my".txt',
		header = makeHeader(filename) + '; foo="bar"';
	assert.equal(form._fileName(header), filename);
});
test("#_fileName with semicolon", function () {
	"use strict";
	var filename = "my;.txt";
	assert.equal(form._fileName(makeHeader(filename)), "my;.txt");
});
test("#_fileName with utf8 character", function () {
	"use strict";
	var filename = "my&#9731;.txt";
	assert.equal(form._fileName(makeHeader(filename)), "my\u2603.txt");
});