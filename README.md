# dovetail-unify-js

[![CI](https://github.com/joaquin-rossi/dovetail-unify-js/actions/workflows/ci.yml/badge.svg)](https://github.com/joaquin-rossi/dovetail-unify-js/actions/workflows/ci.yml)

JavaScript/TypeScript bindings for
[dovetail-unify](https://github.com/joaquin-rossi/dovetail-unify), compiled
from Haskell to WebAssembly with
[ghc-wasm-bindgen](https://github.com/joaquin-rossi/ghc-wasm-bindgen).

```ts
import { antiUnify, parseTerm, prettySubst, prettyTerm, unify } from "dovetail-unify";
import { init } from "dovetail-unify/runtime";
import wasmUrl from "dovetail-unify/dovetail_unify.wasm?url";  // Vite

await init(wasmUrl);

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

`init` takes the URL or the bytes of the `.wasm`; in Node:

```ts
await init(await readFile(new URL(import.meta.resolve("dovetail-unify/dovetail_unify.wasm"))));
```

The API is the one of the Haskell library; see
[`haskell/src/DovetailWasm.hs`](haskell/src/DovetailWasm.hs) for what is
exported and [ghc-wasm-bindgen](https://github.com/joaquin-rossi/ghc-wasm-bindgen#types)
for how its types map to TypeScript.

## Install

From a [release](https://github.com/joaquin-rossi/dovetail-unify-js/releases):

```sh
npm install https://github.com/joaquin-rossi/dovetail-unify-js/releases/download/v0.1.0/dovetail-unify-0.1.0.tgz
```

## Build

```sh
npm run build   # writes dist/
npm test
```

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
