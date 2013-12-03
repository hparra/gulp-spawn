var clone = require("clone"),
	cp = require("child_process"),
	es = require("event-stream"),
	fs = require("fs"),
	path = require("path");

module.exports = function(options) {
	"use strict";

	// generic spawn plugin
	function spawn(file, callback) {

		// options.cmd required
		if(!options.cmd) {
			throw new Error("gulp-spawn: command (\"cmd\") argument required");
		}

		// FIXME: this is potentially inefficient
		// clone file object
		var newFile = clone(file);

		// rename file if optional `filename` function specified
		if (options.filename && typeof options.filename === "function") {
			var dir = path.dirname(file.path),
				ext = path.extname(file.path),
				base = path.basename(file.path, ext);

			newFile.shortened = options.filename(base, ext);
			newFile.path = path.join(dir, newFile.shortened);
		}

		// spawn program
		var program = cp.spawn(options.cmd, options.args);

		// check if we have a buffer or stream
		if (file.contents instanceof Buffer) {

			// create buffer
			newFile.contents = new Buffer(0);

			// when program receives data add it to buffer
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

		} else { // assume we have a stream.Readable

			// stream away!
			newFile.contents = es.pipeline(
				file.contents,
				es.duplex(program.stdin, program.stdout)
			)

			callback(null, newFile);
		}
	}

	return es.map(spawn);
}
