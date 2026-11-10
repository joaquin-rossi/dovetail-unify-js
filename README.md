# dovetail-unify-js

[![CI](https://github.com/joaquin-rossi/dovetail-unify-js/actions/workflows/ci.yml/badge.svg)](https://github.com/joaquin-rossi/dovetail-unify-js/actions/workflows/ci.yml)

JavaScript/TypeScript bindings for
[dovetail-unify](https://github.com/joaquin-rossi/dovetail-unify), compiled
from Haskell to WebAssembly with
[ghc-wasm-bindgen](https://github.com/joaquin-rossi/ghc-wasm-bindgen).

```ts
import { antiUnify, parseTerm, prettySubst, prettyTerm, unify } from "dovetail-unify";

function term(src: string) {
    const result = parseTerm(src);
    if ("Left" in result) throw new SyntaxError(result.Left);
    return result.Right;
}

const result = unify(term("f(X, g(Y))"), term("f(a, g(X))"));
if ("Right" in result) prettySubst(result.Right);  // "{X ↦ a, Y ↦ a}"

const [gen] = antiUnify(term("f(a, a)"), term("f(b, b)"));
prettyTerm(gen);                                     // "f(G1, G1)"
```

Importing the package loads the `.wasm` (with top-level `await`), so the
functions are ready to call. It works in Node 20.16+ and 22.3+, and in
bundlers that copy the `.wasm` next to the module (webpack 5, Vite, Parcel).
With Vite, add `optimizeDeps: { exclude: ["dovetail-unify"] }`; with esbuild,
copy `dovetail_unify.wasm` next to the bundle yourself.

The API is the one of the Haskell library; see
[`haskell/src/DovetailWasm.hs`](haskell/src/DovetailWasm.hs) for what is
exported and [ghc-wasm-bindgen](https://github.com/joaquin-rossi/ghc-wasm-bindgen#types)
for how its types map to TypeScript.

## Install

From a [release](https://github.com/joaquin-rossi/dovetail-unify-js/releases):

```sh
npm install https://github.com/joaquin-rossi/dovetail-unify-js/releases/download/v0.1.0/dovetail-unify-0.1.0.tgz
```

Or from git, which needs [Git LFS](https://git-lfs.com) for the `.wasm`:

```sh
npm install github:joaquin-rossi/dovetail-unify-js#v0.1.0
```

## Build

```sh
npm run build   # regenerates src/
npm test
```

`src/` is generated but committed (its `.wasm` through Git LFS), so the
package can be used and tested without the Haskell toolchain, and a change in
the bindings shows up in the diff.

Requires GHC 9.10, cabal and the WASM toolchain from
[ghc-wasm-meta](https://gitlab.haskell.org/haskell-wasm/ghc-wasm-meta) in
`~/.ghc-wasm`. The build installs the ghc-wasm-bindgen version in
[`.ghc-wasm-bindgen-version`](.ghc-wasm-bindgen-version) into `.cache/`, and
builds the dovetail-unify commit pinned in
[`haskell/cabal.project`](haskell/cabal.project).

## Releasing

1. Update the pins: the `tag:` in `haskell/cabal.project` and
   `.ghc-wasm-bindgen-version`.
2. Bump `version` in `package.json`.
3. Tag it as `v<version>` and push the tag. CI builds, tests and creates the
   release with the package attached.
