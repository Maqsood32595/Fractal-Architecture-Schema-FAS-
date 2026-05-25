import * as fs from 'fs';
import * as path from 'path';
import { FASDomain } from './ast';

export class KernelGenerator {
    public generate(domain: FASDomain, outputDir: string): void {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const manifest: any = {
            id: domain.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: `${domain.name} Module`,
            enabled: true,
            basePath: `/${domain.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        };

        // If we have contracts, we likely have routes.
        if (domain.contracts.length > 0) {
            manifest.routes = 'routes.js';
        }

        // If we have gateways, we map the websocket hook.
        if (domain.gateways.length > 0) {
            const gw = domain.gateways[0]; // Assuming one primary gateway per cell for simplicity
            manifest.websocket = {
                namespace: gw.namespace,
                handler: 'hub.js'
            };
        }

        const manifestPath = path.join(outputDir, 'feature.manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`✅ KernelGenerator: Created ${manifestPath}`);
    }
}
