"use strict";

const DEBUG = process.env.DEBUG == "true";

const fs = require("fs");
const path = require("path");
const { compile } = require("./ooclib");

if (process.argv.length < 3) {
	console.log("Usage: " + path.basename(process.argv[0])
		+ " " + path.basename(process.argv[1])
		+ " <input file> [output file]");

	process.exit(1);
}

try {
	const output = compile(fs.readFileSync(process.argv[2], "utf8"));

	if (process.argv.length > 3) {
		fs.writeFileSync(process.argv[3], output);
	} else {
		console.log(output);
	}
} catch (e) {
	if (DEBUG) {
		console.error(e);
	} else {
		console.error(e.message);
	}

	process.exit(1);
}
