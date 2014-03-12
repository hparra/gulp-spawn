var cp = require("child_process"),
	path = require("path"),
	Duplexer = require("plexer"),
	Stream = require("stream"),
	gUtil = require("gulp-util");

var PLUGIN_NAME = "gulp-spawn";

function gulpSpawn(options) {
	"use strict";

	var stream = new Stream.PassThrough({objectMode: true});

	// options.cmd required
	if (!options.cmd) {
		throw new gUtil.PluginError(PLUGIN_NAME,
			"command (\"cmd\") argument required");
	}

	stream._transform = function (file, unused, cb) {

		if (file.isNull()) {
			stream.push(file);
			return cb();
		}

		// rename file if optional `filename` function specified
		if (options.filename && typeof options.filename === "function") {
			var dir = path.dirname(file.path),
				ext = path.extname(file.path),
				base = path.basename(file.path, ext);

			file.shortened = options.filename(base, ext);
			file.path = path.join(dir, file.shortened);
		}
		if (options.args && typeof options.args === "function") {
			options.args = options.args(file);
		}

		// spawn program
		var program = cp.spawn(options.cmd, options.args);

		// listen to stderr and emit errors if any
		var errBuffer = new Buffer(0);
		program.stderr.on("readable", function () {
			var chunk;
			while (chunk = program.stderr.read()) {
				errBuffer = Buffer.concat([
					errBuffer,
					chunk
				], errBuffer.length + chunk.length);
			}
		});
		program.stderr.on("end", function () {
			if (errBuffer.length) {
				stream.emit("error", new gUtil.PluginError(PLUGIN_NAME,
				errBuffer.toString("utf-8")));
			}
		});

		// check if we have a buffer or stream
		if (file.contents instanceof Buffer) {

			// create buffer
			var newBuffer = new Buffer(0);

			// when program receives data add it to buffer
			program.stdout.on("readable", function () {
				var chunk;
				while (chunk = program.stdout.read()) {
					newBuffer = Buffer.concat([
						newBuffer,
						chunk
					], newBuffer.length + chunk.length);
				}
			});

			// when program finishes call callback
			program.stdout.on("end", function () {
				file.contents = newBuffer;
				stream.push(file);
				cb();
			});

			// "execute"
			// write file buffer to program
			program.stdin.write(file.contents, function () {
				program.stdin.end();
			});

		} else { // assume we have a stream.Readable

			// stream away!
			file.contents = file.contents
				.pipe(new Duplexer(program.stdin, program.stdout));

			stream.push(file);
			cb();
		}
	};

	return stream;
}

module.exports = gulpSpawn;
