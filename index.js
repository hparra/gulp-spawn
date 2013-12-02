var fs = require("fs");
var es = require("event-stream");
var clone = require("clone");
var cp = require("child_process");

module.exports = function(options) {
	"use strict";

	// generic cli plugin
	function cli(file, callback) {

		// clone file object, reset buffer
		var newFile = clone(file);
		newFile.contents = new Buffer(0);

		// cli program
		var program = cp.spawn(options.cmd, options.args);

		// when program receives data add it to newFile buffer
		program.stdout.on("data", function (buffer) {
			newFile.contents = Buffer.concat([
				newFile.contents,
				buffer
			]);
		});

		// when program finishes call callback
		program.stdout.on("end", function (close) {
			callback(null, newFile);
		});

		// "execute"
		// write file buffer to program
		program.stdin.write(file.contents, function () {
			program.stdin.end();
		});
	}

	return es.map(cli);
}
