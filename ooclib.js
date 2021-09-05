"use strict";

function compile(source, target = "JavaScript") {
	function compileJavaScript(tree) {
		function makeFunction(node) {
			const output = [];
			output.push("\n\tfunction " + node.name + "() {");

			if ("main" == node.name) {
				mainFunction = true;
			}

			for (const statement of node.statements) {
				output.push("\t\t" + makeStatement(statement));
			}

			output.push("\t}");
			return output.join("\n");
		}

		function makeStatement(node) {
			switch (node.type) {
			case "number":
				return node.value;

			case "print":
				return "console.log(" + makeStatement(node.value) + ");";

			case "return":
				return "return " + makeStatement(node.value) + ";";

			case "string":
				return "\"" + node.value + "\"";

			default:
				throw new Error("Unknown statement type: " + node.type);
			}
		}

		const output = [];
		let mainFunction;
		output.push("(function () {");
		output.push("\t\"use strict\";");

		if (tree.functions && tree.functions.length) {
			for (const node of tree.functions) {
				output.push(makeFunction(node));
			}
		}

		if (mainFunction) {
			output.push("\n\tconst mainReturn = main();");
			output.push("\n\tif (mainReturn) {");
			output.push("\t\tprocess.exit(mainReturn);");
			output.push("\t}");
		}

		output.push("})();");
		return output.join("\n");
	}

	const tree = parse(lex(source));

	switch (target) {
	case "JavaScript":
		return compileJavaScript(tree);

	default:
		throw new Error("Unknown target language: " + target);
	}
}

function lex(source) {
	const tokens = [];
	let charIndex = 0;
	let lineIndex = 0;
	let lexeme = "";
	let lexemeIndex = 0;

	for (let i = 0; i < source.length; ++i) {
		const character = source[i];

		if (character.match(/\W/)) {
			if (lexeme) {
				let type;

				if (lexeme.match(/\d/)) {
					type = "number";
				} else if (lexeme.match(/[A-Z]+/)) {
					type = "constant";
				} else if (lexeme.match(/[A-Z]\w/)) {
					type = "class";
				} else if (lexeme.match(/\w/)) {
					type = "identifier";
				}

				tokens.push({
					char: lexemeIndex + 1,
					line: lineIndex + 1,
					type,
					value: lexeme,
				});

				lexeme = "";
			}

			const type = {
				"(": "parenOpen",
				")": "parenClose",
				"[": "bracketOpen",
				"]": "bracketClose",
				"{": "braceOpen",
				"}": "braceClose",
				"#": "comment",
				"\t": "indent",
				"\n": "line",
				"\"": "string",
				" ": "space",
			}[character] || "symbol";

			tokens.push({
				char: charIndex + 1,
				line: lineIndex + 1,
				type,
				value: character,
			});

			if (character == "\n") {
				charIndex = -1;
				++lineIndex;
			}
		} else {
			if (!lexeme) {
				lexemeIndex = charIndex;
			}

			lexeme += character;
		}

		++charIndex;
	}

	return tokens;
}

function parse(tokens, tree = {}) {
	function expect(types = [], values = []) {
		if (!tokens.length) {
			throw new Error("Unexpected end of input");
		}

		const token = shift();
		types = [].concat(types);
		values = [].concat(values);

		if (types.length && !types.includes(token.type)) {
			throw new Error("Unexpected "
				+ token.type
				+ " at "
				+ token.line
				+ ":"
				+ token.char);
		}

		if (values.length && !values.includes(token.value)) {
			throw new Error("Unexpected "
			+ token.value
			+ " at "
			+ token.line
			+ ":"
			+ token.char);
		}

		return token;
	}

	function parseComment() {
		let innerToken;

		do {
			innerToken = shift();
		} while ("line" != innerToken.type);
	}

	function parseExpression() {
		let innerToken = expect(["number", "string"]);

		if ("number" == innerToken.type) {
			return {
				type: "number",
				value: innerToken.value,
			};
		} else if ("string" == innerToken.type) {
			return {
				type: "string",
				value: parseString(),
			};
		}
	}

	function parseStatements(statements = []) {
		let innerToken = expect(["braceClose", "indent", "line"]);

		if ("braceClose" == innerToken.type) {
			expect("line");
			return statements;
		} else if ("indent" == innerToken.type) {
			innerToken = expect(["identifier", "string"]);

			if ("identifier" == innerToken.type) {
				if ("print" == innerToken.value) {
					expect("space");

					statements.push({
						type: "print",
						value: parseExpression(),
					});
				} else if ("return" == innerToken.value) {
					expect("space");

					statements.push({
						type: "return",
						value: parseExpression(),
					});
				} else {
					throw new Error("Unexpected identifier at "
						+ innerToken.line
						+ ":"
						+ innerToken.char);
				}
			} else {
				throw new Error("Unexpected "
					+ innerToken.type
					+ " at "
					+ innerToken.line
					+ ":"
					+ innerToken.char);
			}

			expect("line");
		} else if ("line" == innerToken.type) {
			// TODO: manage empty lines
		}

		return parseStatements(statements);
	}

	function parseString() {
		const values = [];
		let innerToken;

		do {
			innerToken = shift();
			values.push(innerToken.value);
		} while ("string" != innerToken.type);

		values.pop();

		return values.join("");
	}

	function shift() {
		if (!tokens.length) {
			throw new Error("Unexpected end of input");
		}

		return tokens.shift();
	}

	if (!tokens.length) {
		return tree;
	}

	const token = expect(["comment", "identifier", "line"]);

	if ("comment" == token.type) {
		parseComment();
	} else if ("identifier" == token.type) {
		expect("parenOpen");
		expect("parenClose");
		expect("space");
		expect("braceOpen");
		expect("line");
		tree.functions = tree.functions || [];

		tree.functions.push({
			type: "function",
			name: token.value,
			statements: parseStatements(),
		});
	}

	return parse(tokens, tree);
}

module.exports = {
	compile,
	lex,
	parse,
};
