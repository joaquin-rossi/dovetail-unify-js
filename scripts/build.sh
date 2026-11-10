#!/usr/bin/env bash
# Builds the bindings into src/ with the ghc-wasm-bindgen version in
# .ghc-wasm-bindgen-version, installing it into .cache/ the first time.
#
# Needs GHC 9.10 and cabal, and the WASM toolchain from ghc-wasm-meta
# (sourced from ~/.ghc-wasm/env when it is not already on PATH).
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)

if ! command -v wasm32-wasi-ghc >/dev/null; then
  source ~/.ghc-wasm/env
fi

version=$(<"$root/.ghc-wasm-bindgen-version")
cache="$root/.cache/ghc-wasm-bindgen-$version"
bindgen="$cache/bin/ghc-wasm-bindgen"

if [[ ! -x $bindgen ]]; then
  rm -rf "$cache"
  git clone -q --depth 1 --branch "v$version" \
    https://github.com/joaquin-rossi/ghc-wasm-bindgen.git "$cache/src"
  (cd "$cache/src" && cabal -v1 install exe:ghc-wasm-bindgen \
    --installdir="$cache/bin" --install-method=copy --overwrite-policy=always)
fi

rm -rf "$root/src"
cd "$root/haskell"
"$bindgen" build src/DovetailWasm.hs --name dovetail_unify --out "$root/src"
