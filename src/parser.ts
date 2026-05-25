import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { FASDomain, FASEntity, FASContract, FASGateway, FASField, FASFlow, FASStep } from './ast';

export class FASParser {
    public parse(filePath: string): FASDomain {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        // We parse standard YAML but strictly type-check it into our AST.
        const doc: any = yaml.load(fileContents);

        if (!doc.domain) {
            throw new Error(`Invalid FAS: Missing 'domain' declaration in ${filePath}`);
        }

        const domain: FASDomain = {
            name: doc.domain,
            entities: [],
            contracts: [],
            gateways: []
        };

        if (doc.entities) {
            for (const [name, entityDef] of Object.entries(doc.entities)) {
                domain.entities.push(this.parseEntity(name, entityDef));
            }
        }

        if (doc.contracts) {
            for (const [name, contractDef] of Object.entries(doc.contracts)) {
                domain.contracts.push(this.parseContract(name, contractDef));
            }
        }

        if (doc.gateways) {
            for (const [name, gatewayDef] of Object.entries(doc.gateways)) {
                domain.gateways.push(this.parseGateway(name, gatewayDef));
            }
        }

        return domain;
    }

    private parseEntity(name: string, def: any): FASEntity {
        const fields: FASField[] = [];
        for (const [fieldName, fieldTypeRaw] of Object.entries(def)) {
            let typeStr = fieldTypeRaw as string;
            let isArray = false;
            if (typeStr.startsWith('Array[')) {
                isArray = true;
                typeStr = typeStr.substring(6, typeStr.length - 1);
            }
            fields.push({
                name: fieldName,
                type: typeStr,
                isArray
            });
        }
        return { name, fields };
    }

    private parseContract(name: string, def: any): FASContract {
        const inputs = this.parseInputOutputs(def.input || {});
        const outputs = this.parseInputOutputs(def.output || {});
        const flows: FASFlow[] = [];

        if (def.flows) {
            for (const [flowName, flowDef] of Object.entries<any>(def.flows)) {
                flows.push({
                    name: flowName,
                    target: flowDef.target,
                    requires: flowDef.requires || [],
                    steps: this.parseSteps(flowDef.steps || {})
                });
            }
        }

        return { name, inputs, outputs, flows };
    }

    private parseInputOutputs(def: any) {
        const result = [];
        for (const [name, type] of Object.entries(def)) {
            result.push({ name, type: type as string });
        }
        return result;
    }

    private parseSteps(def: any): FASStep[] {
        const steps: FASStep[] = [];
        for (const [stepName, actionStr] of Object.entries<string>(def)) {
            // Very simple parser for "Action.method(arg1, arg2)"
            const actionMatch = actionStr.match(/^([a-zA-Z0-9_.]+)\((.*)\)$/);
            if (actionMatch) {
                steps.push({
                    name: stepName,
                    action: actionMatch[1],
                    args: actionMatch[2].split(',').map(s => s.trim())
                });
            } else {
                 steps.push({
                    name: stepName,
                    action: actionStr,
                    args: []
                });
            }
        }
        return steps;
    }

    private parseGateway(name: string, def: any): FASGateway {
        return {
            name,
            target: def.target || 'Node',
            namespace: def.namespace || '/',
            room_identifier: def.room_identifier || 'room',
            relays: def.relays ? def.relays.map((r: string) => {
                const parts = r.split('->').map(s => s.trim());
                return { from: parts[0], to: parts[1] };
            }) : []
        };
    }
}
