# oo-lang
The OO programming language

![Oolong Tea cup](https://www.pngall.com/wp-content/uploads/2016/04/Tea-PNG.png)

A modern object-oriented language with a clean-yet-familiar syntax. OO is for
"Object Orientation". It's been developed since 2011 with a strong focus on
compatibility, maintainability and readability.

Please refer to [pilot.oo](sample/pilot.oo) for a sample of the currently-supported
syntax.

## Goals
OO aims for clean code. Basic feature list (not exhaustive):

- no global statements, top level grammar should be either class or function
definitions;
- the "main" function is the starting point for any program;
- indentation as part of the grammar to avoid unnecessary code-style hassles.

## Milestones
- concept and basic grammar; ✓
- compile to runtime-agnostic JavaScript; ✓
- primitive types; ✓
- functions; ✓
- variables; ✓
- basic math expressions; ✓
- control statements; (in progress)
- loop statements;
- string manipulation;
- classes;
- basic data structures;
- compile itself.

## Sample usage
This will compile the `hello.oo` file and run it with `node`:
```
node ooc.js sample/hello.oo | node
```

It should then produce the following output:
```
Hello, World!
```
