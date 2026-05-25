# Fractal Architecture Schema (FAS)

This is an experimental meta-compiler built to make generating backend code easier for LLMs. 

The idea is that instead of having an AI try to write hundreds of lines of complex WebSocket or Express routing (which it often hallucinates or messes up), you just have the AI write a simple, dense `.fas` schema file. This compiler then takes that `.fas` file and auto-generates the actual backend code for you.

## Current Status
- It currently generates Node.js routes, Socket.io hubs, and basic Rust/WASM shells.
- **This is a prototype and highly experimental. It needs a lot of real-world testing.** 
- Do not use this in a production environment yet without manually verifying the generated code. There are bound to be edge cases we haven't caught.

## How to try it
1. Clone the repo and run `npm install`
2. Look at the `sandbox_collab.fas` or `clinical_intake.fas` files to see how the syntax looks.
3. Run the compiler on a file: `npx ts-node src/index.ts build sandbox_collab.fas`
4. Check the `dist/` folder to see the Node.js/Rust code it generated.

Still very much a work in progress!
