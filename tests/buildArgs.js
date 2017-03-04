/*global describe, it, beforeEach */
"use strict";

var gSpawn = require("../"),
	path = require("path"),
	Stream = require("stream"),
	gutil = require("gulp-util"),
	assert = require("assert"),
	es = require("event-stream");

describe("gulp-spawn", function () {

	describe("build args", function () {

		it("should work with args array", function (done) {

			var stream = gSpawn({
				cmd: "cat",
				args: ["-n"]
			});

			var inputStream = new Stream.PassThrough({objectMode: true}),
				outputStream = new Stream.PassThrough({objectMode: true});

			var fakeFile = new gutil.File({
				cwd: "./",
				base: "test",
				path: "test/file.js",
				contents: new Buffer("line1\nline2")
			});

			inputStream
				.pipe(stream)
				.pipe(outputStream);

			outputStream.on("readable", function () {
				var newFile;
				while (newFile = outputStream.read()) {
					var text = newFile.contents.toString();
					assert.equal(text, "     1\tline1\n     2\tline2");
				}
			});

			outputStream.on("end", function () {
				done();
			});

			inputStream.write(fakeFile);
			inputStream.end();

		});

		it("should work with return args array function", function (done) {

			var stream = gSpawn({
				cmd: "cat",
				args: function () { return ["-n"]; }
			});

			var inputStream = new Stream.PassThrough({objectMode: true}),
				outputStream = new Stream.PassThrough({objectMode: true});

			var fakeFile = new gutil.File({
				cwd: "./",
				base: "test",
				path: "test/file.js",
				contents: new Buffer("line1\nline2")
			});

			inputStream
				.pipe(stream)
				.pipe(outputStream);

			outputStream.on("readable", function () {
				var newFile;
				while (newFile = outputStream.read()) {
					var text = newFile.contents.toString();
					assert.equal(text, "     1\tline1\n     2\tline2");
				}
			});

			outputStream.on("end", function () {
				done();
			});

			inputStream.write(fakeFile);
			inputStream.end();

		});

		it("should work with return args array function, and hand over file info", function (done) {

			var stream = gSpawn({
				cmd: "sed",
				args: function (file) {
					var basename = path.basename(file.path);
					return ["s/line/" + basename + "/"];
				}
			});

			var inputStream = new Stream.PassThrough({objectMode: true}),
				outputStream = new Stream.PassThrough({objectMode: true});

			var fakeFile = new gutil.File({
				cwd: "./",
				path: "test/file.js",
				base: "test",
				basename: "file.js",
				contents: new Buffer("line1\nline2")
			});

			inputStream
				.pipe(stream)
				.pipe(outputStream);

			outputStream.on("readable", function () {
				var newFile;
				while (newFile = outputStream.read()) {
					var text = newFile.contents.toString();
					assert.equal(text, "file.js1\nfile.js2");
				}
			});

			outputStream.on("end", function () {
				done();
			});

			inputStream.write(fakeFile);
			inputStream.end();

		});

	});

});
