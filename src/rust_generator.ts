import * as fs from 'fs';
import * as path from 'path';
import { FASDomain, FASFlow } from './ast';

export class RustTargetGenerator {
    public generate(domain: FASDomain, outputDir: string): void {
        const hasRustTargets = domain.contracts.some(c => c.flows.some(f => f.target === 'Rust'));
        if (!hasRustTargets) return;

        const rustDir = path.join(outputDir, 'rust_wasm');
        if (!fs.existsSync(rustDir)) {
            fs.mkdirSync(rustDir, { recursive: true });
        }

        this.generateCargoToml(domain.name, rustDir);
        this.generateLibRs(domain, rustDir);
    }

    private generateCargoToml(domainName: string, rustDir: string): void {
        const crateName = domainName.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_wasm';
        const toml = `[package]
name = "${crateName}"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
`;
        const tomlPath = path.join(rustDir, 'Cargo.toml');
        fs.writeFileSync(tomlPath, toml);
        console.log(`✅ RustTargetGenerator: Created ${tomlPath}`);
    }

    private generateLibRs(domain: FASDomain, rustDir: string): void {
        const srcDir = path.join(rustDir, 'src');
        if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);

        let code = `use wasm_bindgen::prelude::*;\n`;
        code += `use serde::{Serialize, Deserialize};\n\n`;

        // Generate data structures based on entities
        for (const entity of domain.entities) {
            code += `#[derive(Serialize, Deserialize)]\n`;
            code += `pub struct ${entity.name} {\n`;
            for (const field of entity.fields) {
                let rustType = 'String';
                if (field.type === 'Int64') rustType = 'i64';
                if (field.type === 'Float64') rustType = 'f64';
                if (field.type === 'Boolean') rustType = 'bool';
                if (field.isArray) rustType = `Vec<${rustType}>`;
                
                code += `    pub ${field.name.toLowerCase()}: ${rustType},\n`;
            }
            code += `}\n\n`;
        }

        // Generate WASM exported functions for flows
        for (const contract of domain.contracts) {
            for (const flow of contract.flows) {
                if (flow.target === 'Rust') {
                    code += `#[wasm_bindgen]\n`;
                    code += `pub fn execute_${flow.name.toLowerCase()}(payload: &str) -> String {\n`;
                    code += `    // 🦀 Auto-generated FAS WASM Bindings\n`;
                    code += `    // TODO: Deserialize payload, execute steps, serialize result.\n`;
                    
                    for (const step of flow.steps) {
                        code += `    // Step: ${step.name} => ${step.action}(...)\n`;
                    }
                    
                    code += `    format!("{{\\"success\\":true, \\"flow\\":\\"${flow.name}\\"}")\n`;
                    code += `}\n\n`;
                }
            }
        }

        const libPath = path.join(srcDir, 'lib.rs');
        fs.writeFileSync(libPath, code);
        console.log(`✅ RustTargetGenerator: Created ${libPath}`);
    }
}
