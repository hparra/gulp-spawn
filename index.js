var cp = require("child_process"),
	es = require("event-stream"),
	fs = require("fs"),
	path = require("path");

module.exports = function(options) {
	"use strict";

	// generic spawn plugin
	function spawn(file, callback) {

		// options.cmd required
		if(!options.cmd) {
			callback(new Error("gulp-spawn: command (\"cmd\") argument required"), null);
		}

		// rename file if optional `filename` function specified
		if (options.filename && typeof options.filename === "function") {
			var dir = path.dirname(file.path),
				ext = path.extname(file.path),
				base = path.basename(file.path, ext);

			file.shortened = options.filename(base, ext);
			file.path = path.join(dir, file.shortened);
		}

		// spawn program
		var program = cp.spawn(options.cmd, options.args);

		// check if we have a buffer or stream
		if (file.contents instanceof Buffer) {

			// create buffer
			var new_contents = new Buffer(0);

			// when program receives data add it to buffer
			program.stdout.on("data", function (buffer) {
				new_contents = Buffer.concat([
					new_contents,
					buffer
				]);
			});

			// when program finishes call callback
			program.stdout.on("end", function (close) {
				file.contents = new_contents;
				callback(null, file);
			});

			// "execute"
			// write file buffer to program
			program.stdin.write(file.contents, function () {
				program.stdin.end();
			});

		} else { // assume we have a stream.Readable

			// stream away!
			file.contents = es.pipeline(
				file.contents,
				es.duplex(program.stdin, program.stdout)
			)

			callback(null, file);
		}
	}

	return es.map(spawn);
}
