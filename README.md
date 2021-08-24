# oo-lang
The OO programming language

A modern object-oriented language with a clean-yet-familiar syntax. OO is for
"Object Orientation". Please refer to [bigsample.oo](bigsample.oo) for a sample
of the syntax.

## Goals
OO aims for clean code. Basic feature list (not exhaustive):

- no scattered statements, top level grammar should be either class or function
definitions;
- the "main" function is the starting point for any program;
- clean syntax that avoids redundant symbols and typing;
- built-in indentation.

## Milestones
The first milestone is to compile OO code to environment-agnostic JavaScript.

## Sample usage
This will compile the `hello.oo` file and run it with `node`:
```
node ooc.js hello.oo | node
```

It should then produce the following output:
```
Hello, World!
```
