var http = require("http"),
	connections = 0,
	fs = require("fs"),
	port = process.env.PORT || 8080,
	server = http.createServer(function (req, res) {
		"use strict";
		var socket = req.socket;
		console.log("Request: %s %s -> %s", req.method, req.url, socket.filename);
		req.on("end", function () {
			if (req.url !== "/") {
				res.end(JSON.stringify({
					method: req.method,
					url: req.url,
					filename: socket.filename
				}));
				return;
			}
			res.writeHead(200, {
				"content-type": "text/html"
			});
			res.end('<form action="/upload" enctype="multipart/form-data" method="post"><input type="text" name="title"><br><input type="file" name="upload" multiple="multiple"><br><input type="submit" value="Upload"></form>');
		});
	}).on("connection", function (socket) {
		"use strict";
		connections += 1;
		socket.id = connections;
		socket.filename = "connection-" + socket.id + ".http";
		socket.file = fs.createWriteStream(socket.filename);
		socket.pipe(socket.file);
		console.log("--> %s", socket.filename);
		socket.on("close", function () {
			console.log("<-- %s", socket.filename);
		});
	}).listen(port, function () {
		"use strict";
		console.log("Recording connections on port %s", port);
	});