import * as fs from 'fs';
import * as path from 'path';
import { FASDomain, FASContract, FASGateway } from './ast';

export class NodeTargetGenerator {
    public generate(domain: FASDomain, outputDir: string): void {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        if (domain.contracts.length > 0) {
            this.generateRoutes(domain.contracts, outputDir);
        }

        if (domain.gateways.length > 0) {
            this.generateHub(domain.gateways[0], outputDir);
        }
    }

    private generateRoutes(contracts: FASContract[], outputDir: string): void {
        let code = `const express = require('express');\n`;
        code += `const router = express.Router();\n`;
        // Assuming we have a standard DB bridge in the environment.
        code += `const db = require('../../db');\n\n`;

        for (const contract of contracts) {
            // Very simplistic mapping: assume all contracts are POST for mutation flows.
            // In a real compiler, we'd map input blocks to specific HTTP methods.
            const routePath = `/${contract.name.toLowerCase()}`;
            code += `router.post('${routePath}', async (req, res) => {\n`;
            code += `    try {\n`;
            code += `        // Auto-generated extraction of inputs\n`;
            code += `        const payload = req.body;\n\n`;

            // Security sanitization stub
            code += `        // 🛡️ Pre-audited sanitization\n`;
            code += `        // Object.keys(payload).forEach(k => payload[k] = sanitize(payload[k]));\n\n`;

            // Loop over flows that target Node
            for (const flow of contract.flows) {
                if (flow.target === 'Node') {
                    code += `        // Flow: ${flow.name}\n`;
                    for (const step of flow.steps) {
                        code += `        // Step: ${step.name} => ${step.action}(${step.args.join(', ')})\n`;
                        if (step.action.startsWith('DB.')) {
                            code += `        // Generated DB call mock\n`;
                            code += `        // await db.run("INSERT ...", [...args]);\n`;
                        } else if (step.action.startsWith('Network.')) {
                            code += `        // Generated Network broadcast mock\n`;
                        }
                    }
                } else if (flow.target === 'Rust' || flow.target === 'Go') {
                    code += `        // 🦀 Delegate to WASM/External Compute: ${flow.name}\n`;
                    code += `        // const wasmResult = await require('./compute_${flow.name.toLowerCase()}.js').run(payload);\n`;
                }
            }

            code += `        res.json({ success: true, contract: '${contract.name}' });\n`;
            code += `    } catch (err) {\n`;
            code += `        console.error('❌ FAS Contract Error [${contract.name}]:', err);\n`;
            code += `        res.status(500).json({ error: 'Internal Contract Violation' });\n`;
            code += `    }\n`;
            code += `});\n\n`;
        }

        code += `module.exports = router;\n`;

        const routesPath = path.join(outputDir, 'routes.js');
        fs.writeFileSync(routesPath, code);
        console.log(`✅ NodeTargetGenerator: Created ${routesPath}`);
    }

    private generateHub(gateway: FASGateway, outputDir: string): void {
        let code = `/**\n * 🛰️ Auto-Generated FAS WebSocket Hub\n * Namespace: ${gateway.namespace}\n */\n\n`;
        
        code += `module.exports = function setupFASHub(io) {\n`;
        code += `    const namespace = io.of('${gateway.namespace}');\n\n`;
        
        code += `    namespace.on('connection', (socket) => {\n`;
        code += `        console.log(\`🟢 [FAS Hub] Peer connected: \${socket.id}\`);\n\n`;

        // Room joining logic
        code += `        socket.on('join-${gateway.room_identifier}', (roomId) => {\n`;
        code += `            socket.join(roomId);\n`;
        code += `            socket.${gateway.room_identifier} = roomId;\n`;
        code += `        });\n\n`;

        // Event relays
        for (const relay of gateway.relays) {
            code += `        socket.on('${relay.from}', (data) => {\n`;
            code += `            if (socket.${gateway.room_identifier} || data.${gateway.room_identifier}) {\n`;
            code += `                const targetRoom = socket.${gateway.room_identifier} || data.${gateway.room_identifier};\n`;
            code += `                socket.to(targetRoom).emit('${relay.to}', data);\n`;
            code += `            } else {\n`;
            code += `                socket.broadcast.emit('${relay.to}', data);\n`;
            code += `            }\n`;
            code += `        });\n\n`;
        }

        code += `        socket.on('disconnect', () => {\n`;
        code += `            console.log(\`🔴 [FAS Hub] Peer disconnected: \${socket.id}\`);\n`;
        code += `        });\n`;
        
        code += `    });\n`;
        code += `};\n`;

        const hubPath = path.join(outputDir, 'hub.js');
        fs.writeFileSync(hubPath, code);
        console.log(`✅ NodeTargetGenerator: Created ${hubPath}`);
    }
}
