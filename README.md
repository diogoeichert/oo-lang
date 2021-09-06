# oo-lang
The OO programming language

A modern object-oriented language with a clean-yet-familiar syntax. OO is for
"Object Orientation". Please refer to [pilot.oo](pilot.oo) for a sample
of the currently-supported syntax.

## Goals
OO aims for clean code. Basic feature list (not exhaustive):

- no global statements, top level grammar should be either class or function
definitions;
- the "main" function is the starting point for any program;
- indentation as part of the grammar.

## Milestones
- compile OO code to JavaScript; ✓
- implement primitive types; ✓
- implement functions; ✓
- implement control statements;
- implement loop statements;
- implement essential expressions;
- implement classes;
- implement basic data structures;
- implement environment-agnostic code generation.

## Sample usage
This will compile the `hello.oo` file and run it with `node`:
```
node ooc.js hello.oo | node
```

It should then produce the following output:
```
Hello, World!
```
