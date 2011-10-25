var s,
    S = {
		PARSER_UNINITIALIZED: 1,
		START: 2,
		START_BOUNDARY: 3,
		HEADER_FIELD_START: 4,
		HEADER_FIELD: 5,
		HEADER_VALUE_START: 6,
		HEADER_VALUE: 7,
		HEADER_VALUE_ALMOST_DONE: 8,
		HEADERS_ALMOST_DONE: 9,
		PART_DATA_START: 10,
		PART_DATA: 11,
		PART_END: 12,
		END: 13
	},
	Buffer = require("buffer").Buffer,
	CR = 13,
	LF = 10,
	HYPHEN = 45,
	COLON = 58,
	lower = function (c) {
		"use strict";
		return c | 32;
	},
	A = 97,
	Z = 122,
	SPACE = 32,
	f = 1,
	F = {
		PART_BOUNDARY: f,
		LAST_BOUNDARY: f *= 2
	};
for (s in S) {
	if (S.hasOwnProperty(s)) {
		exports[s] = S[s];
	}
}
function MultipartParser() {
	"use strict";
	this.boundary = null;
	this.boundaryChars = null;
	this.lookbehind = null;
	this.state = S.PARSER_UNINITIALIZED;
	this.index = null;
	this.flags = 0;
}
exports.MultipartParser = MultipartParser;
MultipartParser.stateToString = function (stateNumber) {
	"use strict";
	var state, number;
	for (state in S) {
		if (S.hasOwnProperty(state)) {
			number = S[state];
			if (number === stateNumber) {
				return state;
			}
		}
	}
};
MultipartParser.prototype.initWithBoundary = function (str) {
	"use strict";
	this.boundary = new Buffer(str.length + 4);
	this.boundary.write("\r\n--", "ascii", 0);
	this.boundary.write(str, "ascii", 4);
	this.lookbehind = new Buffer(this.boundary.length + 8);
	this.state = S.START;
	this.boundaryChars = {};
	var i;
	for (i = 0; i < this.boundary.length; i += 1) {
		this.boundaryChars[this.boundary[i]] = true;
	}
};
MultipartParser.prototype.write = function (buffer) {
	"use strict";
	var
		i = 0,
		len = buffer.length,
		c,
		state = this.state,
		index = this.index,
		boundary = this.boundary,
		self = this,
		callback = function (name, buffer, start, end) {
			if (start !== undefined && start === end) {
				return;
			}
			var callbackSymbol = "on" + name.substr(0, 1).toUpperCase() + name.substr(1);
			if (self.hasOwnProperty(callbackSymbol)) {
				self[callbackSymbol](buffer, start, end);
			}
		},
		mark = function (name) {
			self[name + "Mark"] = i;
		},
		clear = function (name) {
			delete self[name + "Mark"];
		},
		dataCallback = function (name, clear) {
			var markSymbol = name + "Mark";
			if (!self.hasOwnProperty(markSymbol)) {
				return;
			}
			if (!clear) {
				callback(name, buffer, self[markSymbol], buffer.length);
				self[markSymbol] = 0;
			} else {
				callback(name, buffer, self[markSymbol], i);
				delete self[markSymbol];
			}
		},
		cl,
		prevIndex = this.index,
		boundaryLength = this.boundary.length,
		boundaryEnd = boundaryLength - 1,
		bufferLength = buffer.length,
		boundaryChars = this.boundaryChars,
		flags = this.flags,
		lookbehind = this.lookbehind;
	for (i = 0; i < len; i += 1) {
		c = buffer[i];
		switch (state) {
		case S.PARSER_UNINITIALIZED:
			return i;
		case S.START:
			index = 0;
			state = S.START_BOUNDARY;
		case S.START_BOUNDARY:
			if (index === boundary.length - 2) {
				if (c !== CR) {
					return i;
				}
				index += 1;
				break;
			} else {
				if (index - 1 === boundary.length - 2) {
					if (c !== LF) {
						return i;
					}
					index = 0;
					callback("partBegin");
					state = S.HEADER_FIELD_START;
					break;
				}
			}
			if (c !== boundary[index + 2]) {
				return i;
			}
			index += 1;
			break;
		case S.HEADER_FIELD_START:
			state = S.HEADER_FIELD;
			mark("headerField");
			index = 0;
		case S.HEADER_FIELD:
			if (c === CR) {
				clear("headerField");
				state = S.HEADERS_ALMOST_DONE;
				break;
			}
			index += 1;
			if (c === HYPHEN) {
				break;
			}
			if (c === COLON) {
				if (index === 1) {
					return i;
				}
				dataCallback("headerField", true);
				state = S.HEADER_VALUE_START;
				break;
			}
			cl = lower(c);
			if (cl < A || cl > Z) {
				return i;
			}
			break;
		case S.HEADER_VALUE_START:
			if (c === SPACE) {
				break;
			}
			mark("headerValue");
			state = S.HEADER_VALUE;
		case S.HEADER_VALUE:
			if (c === CR) {
				dataCallback("headerValue", true);
				callback("headerEnd");
				state = S.HEADER_VALUE_ALMOST_DONE;
			}
			break;
		case S.HEADER_VALUE_ALMOST_DONE:
			if (c !== LF) {
				return i;
			}
			state = S.HEADER_FIELD_START;
			break;
		case S.HEADERS_ALMOST_DONE:
			if (c !== LF) {
				return i;
			}
			callback("headersEnd");
			state = S.PART_DATA_START;
			break;
		case S.PART_DATA_START:
			state = S.PART_DATA;
			mark("partData");
		case S.PART_DATA:
			prevIndex = index;
			if (index === 0) {
				i += boundaryEnd;
				while (i < bufferLength && !boundaryChars.hasOwnProperty(buffer[i])) {
					i += boundaryLength;
				}
				i -= boundaryEnd;
				c = buffer[i];
			}
			if (index < boundary.length) {
				if (boundary[index] === c) {
					if (index === 0) {
						dataCallback("partData", true);
					}
					index += 1;
				} else {
					index = 0;
				}
			} else {
				if (index === boundary.length) {
					index += 1;
					if (c === CR) {
						flags |= F.PART_BOUNDARY;
					} else {
						if (c === HYPHEN) {
							flags |= F.LAST_BOUNDARY;
						} else {
							index = 0;
						}
					}
				} else {
					if (index - 1 === boundary.length) {
						if (flags & F.PART_BOUNDARY) {
							index = 0;
							if (c === LF) {
								flags &= ~F.PART_BOUNDARY;
								callback("partEnd");
								callback("partBegin");
								state = S.HEADER_FIELD_START;
								break;
							}
						} else {
							if (flags & F.LAST_BOUNDARY) {
								if (c === HYPHEN) {
									callback("partEnd");
									callback("end");
									state = S.END;
								} else {
									index = 0;
								}
							} else {
								index = 0;
							}
						}
					}
				}
			}
			if (index > 0) {
				lookbehind[index - 1] = c;
			} else {
				if (prevIndex > 0) {
					callback("partData", lookbehind, 0, prevIndex);
					prevIndex = 0;
					mark("partData");
					i -= 1;
				}
			}
			break;
		case S.END:
			break;
		default:
			return i;
		}
	}
	dataCallback("headerField");
	dataCallback("headerValue");
	dataCallback("partData");
	this.index = index;
	this.state = state;
	this.flags = flags;
	return len;
};
MultipartParser.prototype.end = function () {
	"use strict";
	if (this.state !== S.END) {
		return new Error("MultipartParser.end(): stream ended unexpectedly: " + this.explain());
	}
};
MultipartParser.prototype.explain = function () {
	"use strict";
	return "state = " + MultipartParser.stateToString(this.state);
};