"use strict";

function compile(source, target = "JavaScript") {
	function compileJavaScript(tree) {
		function indent(level) {
			const output = [];

			for (let i = 0; i < level; ++i) {
				output.push("\t");
			}

			return output.join("");
		}

		function makeFunction(node) {
			const output = [];

			if ("main" == node.name) {
				mainFunction = true;
			}

			output.push("\tfunction " + node.name + "() {");

			for (const statement of node.statements) {
				output.push("\t\t" + makeStatement(statement));
			}

			output.push("\t}\n");
			return output.join("\n");
		}

		function makeStatement(node) {
			switch (node.type) {
			case "if":
				return "if ("
					+ makeExpression(node.condition)
					+ ") {\n"
					+ makeStatements(node.statements, 1)
					+ " }";

			case "print":
				return "console.log(" + makeExpression(node.value) + ");";

			case "return":
				return "return " + makeExpression(node.value) + ";";
			}

			return makeExpression(node) + ";";
		}

		function makeStatements(statements, level) {
			const output = [];

			for (const statement of statements) {
				output.push("\t\t" + indent(level) + makeStatement(statement));
			}

			return output.join("\n");
		}

		function makeExpression(node) {
			switch (node.type) {
			case "boolean":
				return node.value;

			case "call":
				return node.value + "()";

			case "number":
				return node.value;

			case "string":
				return "\"" + node.value + "\"";

			case "variable":
				return node.value;

			case "symbol":
				switch (node.value) {
				case "=":
					return node.left.value + " = " + makeExpression(node.right);
				}
			}

			throw new Error("Not implemented: " + JSON.stringify(node));
		}

		const output = [];
		let mainFunction;
		output.push("(function () {");

		if (tree.functions && tree.functions.length) {
			for (const node of tree.functions) {
				output.push(makeFunction(node));
			}
		}

		if (mainFunction) {
			output.push("\tconst mainReturn = main();");
			output.push("\n\tif (mainReturn) {");
			output.push("\t\tprocess.exit(mainReturn);");
			output.push("\t}");
		}

		output.push("})();");
		return output.join("\n");
	}

	const tree = parse(lex(source));
	// console.log(JSON.stringify(tree, null, "\t"));

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
		const token = shift();
		types = [].concat(types);
		values = [].concat(values);

		if (types.length && !types.includes(token.type)) {
			throw new Error("Unexpected "
				+ token.type
				+ " \""
				+ token.value
				+ "\" at "
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
		let innerToken = expect(["identifier", "number", "string"]);

		if ("identifier" == innerToken.type) {
			if ("false" == innerToken.value) {
				return {
					type: "boolean",
					value: false,
				};
			} else if ("true" == innerToken.value) {
				return {
					type: "boolean",
					value: true,
				};
			}

			const lastToken = innerToken;
			innerToken = expect(["line", "parenOpen", "space"]);

			if ("line" == innerToken.type) {
				tokens.unshift(innerToken);

				return {
					type: "variable",
					value: lastToken.value
				};
			} else if ("parenOpen" == innerToken.type) {
				// TODO: expect optional parameters
				expect("parenClose");

				return {
					type: "call",
					value: lastToken.value
				};
			} else if ("space" == innerToken.type) {
				innerToken = expect("symbol");
				expect("space");

				return {
					type: innerToken.type,
					value: innerToken.value,

					left: {
						type: lastToken.type,
						value: lastToken.value,
					},

					right: parseExpression(),
				};
			}
		} else if ("number" == innerToken.type) {
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

	function parseStatements(statements = [], indent = 0) {
		for (let i = 0; i < indent; ++i) {
			expect("indent");
		}

		let innerToken = expect(["braceClose", "indent"]);

		if ("braceClose" == innerToken.type) {
			return statements;
		} else if ("indent" == innerToken.type) {
			innerToken = expect(["identifier"]);

			if ("identifier" == innerToken.type) {
				if ("if" == innerToken.value) {
					expect("space");
					expect("parenOpen");
					const condition = parseExpression();
					expect("parenClose");
					expect("space");
					expect("braceOpen");
					expect("line");

					statements.push({
						type: "if",
						condition,
						statements: parseStatements(undefined, indent + 1),
					});
				} else if ("print" == innerToken.value) {
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
					tokens.unshift(innerToken);
					statements.push(parseExpression());
				}

				expect("line");
			} else {
				throw new Error("Unexpected "
					+ innerToken.type
					+ " at "
					+ innerToken.line
					+ ":"
					+ innerToken.char);
			}
		} else if ("line" == innerToken.type) {
			// TODO: manage empty lines
		}

		return parseStatements(statements, indent);
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

		expect("line");
	}

	return parse(tokens, tree);
}

module.exports = {
	compile,
	lex,
	parse,
};
