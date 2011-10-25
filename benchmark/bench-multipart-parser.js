require("../test/common");
var multipartParser = require("../lib/multipart_parser"),
	MultipartParser = multipartParser.MultipartParser,
	parser = new MultipartParser(),
	Buffer = require("buffer").Buffer,
	boundary = "-----------------------------168072824752491622650073",
	mb = 100,
	createMultipartBuffer = function (boundary, size) {
		"use strict";
		var head = "--" + boundary + "\r\n" + 'content-disposition: form-data; name="field1"\r\n' + "\r\n",
			tail = "\r\n--" + boundary + "--\r\n",
			buffer = new Buffer(size);
		buffer.write(head, "ascii", 0);
		buffer.write(tail, "ascii", buffer.length - tail.length);
		return buffer;
	},
	buffer = createMultipartBuffer(boundary, mb * 1048576),
	callbacks = {
		partBegin: -1,
		partEnd: -1,
		headerField: -1,
		headerValue: -1,
		partData: -1,
		end: -1
	},
	start,
	nparsed,
	duration,
	mbPerSec;
parser.initWithBoundary(boundary);
parser.onHeaderField = function () {
	"use strict";
	callbacks.headerField += 1;
};
parser.onHeaderValue = function () {
	"use strict";
	callbacks.headerValue += 1;
};
parser.onPartBegin = function () {
	"use strict";
	callbacks.partBegin += 1;
};
parser.onPartData = function () {
	"use strict";
	callbacks.partData += 1;
};
parser.onPartEnd = function () {
	"use strict";
	callbacks.partEnd += 1;
};
parser.onEnd = function () {
	"use strict";
	callbacks.end += 1;
};
start = +new Date();
nparsed = parser.write(buffer);
duration = +new Date() - start;
mbPerSec = (mb / (duration / 1E3)).toFixed(2);
process.on("exit", function () {
	"use strict";
	var k;
	for (k in callbacks) {
		if (callbacks.hasOwnProperty(k)) {
			assert.equal(0, callbacks[k], k + " count off by " + callbacks[k]);
		}
	}
});
console.log(mbPerSec + " mb/sec");
assert.equal(nparsed, buffer.length);