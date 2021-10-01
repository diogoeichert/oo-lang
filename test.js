"use strict";

const assert = require("assert");
const fs = require("fs");
const { compile, lex, parse } = require("./ooclib");

// TODO: test compiler
assert.strictEqual(
	compile(fs.readFileSync("empty.oo", "utf8")),
	"(function () {\n})();"
);

assert.strictEqual(
	compile(fs.readFileSync("hello.oo", "utf8")),
	"(function () {\n\tfunction main() {\n\t\tconsole.log(\"Hello, World!\");\n\t}\n\n\tconst mainReturn = main();\n\n\tif (mainReturn) {\n\t\tprocess.exit(mainReturn);\n\t}\n})();"
);

assert.strictEqual(
	compile(fs.readFileSync("variable.oo", "utf8")),
	`(function () {
	function main() {
		a = 1;
		b = a;
		console.log(b);
	}

	const mainReturn = main();

	if (mainReturn) {
		process.exit(mainReturn);
	}
})();`
);

// TODO: test lexer
assert.strictEqual(
	JSON.stringify(lex(fs.readFileSync("empty.oo", "utf8"))),
	JSON.stringify([])
);

// TODO: test parser
assert.strictEqual(
	JSON.stringify(parse([])),
	JSON.stringify({})
);
