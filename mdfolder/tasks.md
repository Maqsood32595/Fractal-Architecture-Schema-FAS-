# Fractal Architecture Schema (FAS) - Meta-Compiler Implementation Tasks

This document outlines the micro-level phases required to build the FAS Meta-Compiler. The goal is to solve LLM context-exhaustion and hallucination by allowing the LLM to write dense semantic blueprints (FAS) which are then compiled into polyglot code (Node.js/Rust) powered by the Fractal Kernel.

## 🏗️ Phase 1: FAS Schema Definition & Parser
- [ ] Define the `.fas` language syntax (using a YAML-like structured format).
- [ ] Create the AST (Abstract Syntax Tree) schema in TypeScript to represent Entities, Contracts, and Gateways.
- [ ] Build the Lexer/Parser (`parser.ts`) to read `.fas` files and convert them into the JSON AST.
- [ ] Implement Semantic Validation (e.g., ensuring target languages are specified, types match).

## ⚙️ Phase 2: The Fractal Kernel Adapter (Manifest Generator)
- [ ] Build the `KernelGenerator` module.
- [ ] Translate the FAS AST metadata into a valid `feature.manifest.json`.
- [ ] Ensure the manifest outputs the correct `basePath`, `routes`, and `websocket` hooks.

## 🌐 Phase 3: Node.js (Express & Socket.io) Target Generator
- [ ] Build the `NodeTargetGenerator` module.
- [ ] Template Engine: Create pre-audited templates for Express routers.
- [ ] Database Adapter: Generate SQL `db.run/get/all` calls from FAS entity definitions.
- [ ] WebSocket Relay: Generate the Socket.io namespace and event relay logic from FAS `gateway` definitions.
- [ ] Security Enforcer: Automatically inject XSS sanitization and payload limits into the generated routes.

## 🦀 Phase 4: Rust (WASM) Target Generator for Heavy Compute
- [ ] Build the `RustTargetGenerator` module.
- [ ] Define the Rust crate structure template (`Cargo.toml`, `src/lib.rs`).
- [ ] Translate FAS `requires` and `step` blocks into Rust traits and functional iterators.
- [ ] Implement the `wasm-bindgen` adapter to allow Node.js to seamlessly invoke the compiled Rust logic.

## 🚀 Phase 5: The CLI Compiler Tool
- [ ] Build the `fas-cli` (Command Line Interface).
- [ ] Implement the `fas build <directory>` command to parse a folder of `.fas` files.
- [ ] Wire the CLI to output the compiled Node.js and Rust files into the `/features` directory of the server.
- [ ] Implement error tracing (mapping compiler errors back to the exact line in the `.fas` file).

## 🧪 Phase 6: E2E Self-Assembly Test
- [ ] Write a test `clinical_intake.fas` file.
- [ ] Run the FAS compiler to generate the JS/WASM files.
- [ ] Boot the server and verify the Fractal Kernel dynamically loads the generated feature perfectly.
