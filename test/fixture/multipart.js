exports.rfc1867 = {
	boundary: "AaB03x",
	raw: '--AaB03x\r\ncontent-disposition: form-data; name="field1"\r\n\r\nJoe Blow\r\nalmost tricked you!\r\n--AaB03x\r\ncontent-disposition: form-data; name="pics"; filename="file1.txt"\r\nContent-Type: text/plain\r\n\r\n... contents of file1.txt ...\r\r\n--AaB03x--\r\n',
	parts: [{
		headers: {
			"content-disposition": 'form-data; name="field1"'
		},
		data: "Joe Blow\r\nalmost tricked you!"
	}, {
		headers: {
			"content-disposition": 'form-data; name="pics"; filename="file1.txt"',
			"Content-Type": "text/plain"
		},
		data: "... contents of file1.txt ...\r"
	}]
};
exports["noTrailing\r\n"] = {
	boundary: "AaB03x",
	raw: '--AaB03x\r\ncontent-disposition: form-data; name="field1"\r\n\r\nJoe Blow\r\nalmost tricked you!\r\n--AaB03x\r\ncontent-disposition: form-data; name="pics"; filename="file1.txt"\r\nContent-Type: text/plain\r\n\r\n... contents of file1.txt ...\r\r\n--AaB03x--',
	parts: [{
		headers: {
			"content-disposition": 'form-data; name="field1"'
		},
		data: "Joe Blow\r\nalmost tricked you!"
	}, {
		headers: {
			"content-disposition": 'form-data; name="pics"; filename="file1.txt"',
			"Content-Type": "text/plain"
		},
		data: "... contents of file1.txt ...\r"
	}]
};
exports.emptyHeader = {
	boundary: "AaB03x",
	raw: '--AaB03x\r\ncontent-disposition: form-data; name="field1"\r\n: foo\r\n\r\nJoe Blow\r\nalmost tricked you!\r\n--AaB03x\r\ncontent-disposition: form-data; name="pics"; filename="file1.txt"\r\nContent-Type: text/plain\r\n\r\n... contents of file1.txt ...\r\r\n--AaB03x--\r\n',
	expectError: true
};