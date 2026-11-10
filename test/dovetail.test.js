import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { before, describe, it } from "node:test";

import {
    antiUnify, Equation, Fun, parseEquations, parseTerm, prettySubst,
    prettyTerm, prettyUnifyError, rename, subsumes, unify, unifyAll, Var,
} from "dovetail-unify";
import { init } from "dovetail-unify/runtime";

before(async () => {
    await init(await readFile(new URL(import.meta.resolve("dovetail-unify/dovetail_unify.wasm"))));
});

const term = (src) => parseTerm(src).Right;

describe("unify", () => {
    it("returns a most general unifier", () => {
        const { Right: sub } = unify(term("f(X, g(Y))"), term("f(a, g(X))"));
        assert.equal(prettySubst(sub), "{X ↦ a, Y ↦ a}");
    });

    it("returns why it fails", () => {
        const { Left: err } = unify(term("X"), term("f(X)"));
        assert.equal(prettyUnifyError(err), "occurs check: X occurs in f(X)");
    });

    it("solves a system of equations", () => {
        const { Right: sub } = unifyAll(parseEquations("X = f(Y), Y = a").Right);
        assert.deepEqual(sub, new Map([["X", Fun("f", [Fun("a", [])])], ["Y", Fun("a", [])]]));
    });
});

describe("antiUnify", () => {
    it("returns the generalization and both substitutions", () => {
        const [gen, sub1, sub2] = antiUnify(term("f(a, a)"), term("f(b, b)"));
        assert.equal(prettyTerm(gen), "f(G1, G1)");
        assert.equal(prettySubst(sub1), "{G1 ↦ a}");
        assert.equal(prettySubst(sub2), "{G1 ↦ b}");
    });
});

describe("subsumes", () => {
    it("holds for a more general term", () => {
        assert.equal(subsumes(term("f(X, Y)"), term("f(a, g(b))")), true);
        assert.equal(subsumes(term("f(a, g(b))"), term("f(X, Y)")), false);
    });
});

describe("rename", () => {
    it("renames the variables in the set", () => {
        const [t] = rename(new Set(["X"]), term("f(X, Y)"));
        assert.equal(prettyTerm(t), "f(X1, Y)");
    });
});

describe("parseTerm", () => {
    it("builds the same terms as the constructors", () => {
        assert.deepEqual(term("f(X, a)"), Fun("f", [Var("X"), Fun("a", [])]));
        assert.deepEqual(parseEquations("X = a").Right, [Equation(Var("X"), Fun("a", []))]);
    });

    it("returns the error message", () => {
        assert.match(parseTerm("f(").Left, /unexpected end of input/);
    });
});
