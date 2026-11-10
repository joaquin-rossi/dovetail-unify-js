-- | The API exposed to JavaScript: its export list is what
-- ghc-wasm-bindgen turns into bindings.
module DovetailWasm
  ( -- * Terms
    Term (..)
  , atom
  , vars
  , occursVar
  , rename

    -- * Substitutions
  , applySubst
  , composeSubst

    -- * Unification
  , Equation (..)
  , UnifyError (..)
  , unify
  , unifyAll

    -- * Matching
  , match
  , subsumes
  , variant

    -- * Anti-unification
  , antiUnify
  , antiUnifyAll

    -- * Parsing
  , parseTerm
  , parseEquation
  , parseEquations

    -- * Pretty-printing
  , prettyTerm
  , prettyEquation
  , prettyEquations
  , prettySubst
  , prettyUnifyError
  ) where

import Dovetail
import Dovetail.Parser qualified as Parser
import Dovetail.Pretty

-- Parse errors are returned as their message, since 'Parser.ParseError'
-- has no JavaScript counterpart.

parseTerm :: String -> Either String Term
parseTerm = either (Left . show) Right . Parser.parseTerm

parseEquation :: String -> Either String Equation
parseEquation = either (Left . show) Right . Parser.parseEquation

parseEquations :: String -> Either String [Equation]
parseEquations = either (Left . show) Right . Parser.parseEquations
