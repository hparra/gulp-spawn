# gulp-cli

CLI program piping plugin for [gulp](https://github.com/wearefractal/gulp). Uses [spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options).

**This plugin has NOT been test thoroughly**

## Usage

gulp-cli options follow spawn's conventions.

Not all CLI programs support piping. In fact, many newer ones don't. Some programs require that you pass certain arguments if you intend to use stdin and/or stdout. Please check the documentation of the program you intend to use to ensure piping is supported.

The following example pipes image files to ImageMagick's `convert`. In the case of `convert`, you must specify a `-` before arguments and after arguments if you wish to use stdin and stdout, respectively.

```javascript
var cli = require("gulp-cli");

// example using ImageMagick's convert
gulp.src("./src/images/*.{jpg,png,gif}")
	.pipe(cli({
		cmd: "convert",
		args: [
			"-",
			"-resize",
			"50%",
			"-"
		]
	}))
	.pipe(gulp.dest("./dist/images/"));
```

## The UNIX Pipe Philosophy

If you write CLI programs please consider taking the time to support stdin & stdout. Piping is one of the reasons UNIX systems have endured the test of time. There is no reason to reinvent the wheel.
