var clone = require("clone"),
	cp = require("child_process"),
	es = require("event-stream"),
	fs = require("fs"),
	path = require("path");

module.exports = function(options) {
	"use strict";

	// generic cli plugin
	function cli(file, callback) {

		// options.cmd required
		if(!options.cmd) {
			throw new Error("gulp-cli: command (\"cmd\") argument required");
		}

		// clone file object, reset buffer
		var newFile = clone(file);
		newFile.contents = new Buffer(0);

		// rename file if optional `filename` function specified
		if (options.filename && typeof options.filename === "function") {
			var dir = path.dirname(file.path),
				ext = path.extname(file.path),
				base = path.basename(file.path, ext);

			newFile.shortened = options.filename(base, ext);
			newFile.path = path.join(dir, newFile.shortened);
		}

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
