var server,
	common = require("../common"),
	formidable = common.formidable,
	fs = require("fs"),
	net = require("net"),
	test = common.fastOrSlow.slow(),
	assert = require("assert"),
	http = require("http"),
	findit = require("findit"),
	path = require("path"),
	hashish = require("hashish");
function uploadFixture(name, cb) {
	"use strict";
	server.once("request", function (req) {
		var form = new formidable.IncomingForm(),
			parts = [];
		form.uploadDir = common.dir.tmp;
		form.parse(req);
		function callback() {
			var realCallback = cb;
			cb = function () {};
			realCallback.apply(null, arguments);
		}
		form.on("error", callback).on("fileBegin", function (name, value) {
			parts.push({
				type: "file",
				name: name,
				value: value
			});
		}).on("field", function (name, value) {
			parts.push({
				type: "field",
				name: name,
				value: value
			});
		}).on("end", function () {
			callback(null, parts);
		});
	});
	var file = fs.createReadStream(common.dir.fixture + "/http/" + name),
		socket = net.createConnection(common.port);
	file.pipe(socket);
}
function addTest(name, fixture) {
	"use strict";
	test("fixture: " + name, function (done) {
		console.error(this.name);
		uploadFixture(name, function (err, parts) {
			if (err) {
				return done(err);
			}
			fixture.forEach(function (expectedPart, i) {
				var parsedPart = parts[i],
					filename;
				assert.equal(parsedPart.type, expectedPart.type);
				assert.equal(parsedPart.name, expectedPart.name);
				if (parsedPart.type === "file") {
					filename = parsedPart.value.name;
					assert.equal(filename, expectedPart.filename);
				}
			});
			done();
		});
	});
}
test.before(function (done) {
	"use strict";
	if (server) {
		return done();
	}
	server = http.createServer();
	server.listen(common.port, done);
});
findit.sync(common.dir.fixture + "/js").forEach(function (jsPath) {
	"use strict";
	if (!/\.js$/.test(jsPath)) {
		return;
	}
	var group = path.basename(jsPath, ".js");
	hashish.forEach(require(jsPath), function (fixture, name) {
		addTest(group + "/" + name, fixture);
	});
});