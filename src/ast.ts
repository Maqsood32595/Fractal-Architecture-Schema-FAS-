export type FASPrimitiveType = 'String' | 'Int64' | 'Float64' | 'UUID' | 'Boolean' | 'Timestamp';

export interface FASField {
    name: string;
    type: FASPrimitiveType | string; // Primitive or Custom Entity reference
    validators?: {
        sanitize?: string;
        max_bytes?: number;
        max_len?: number;
        matches?: string;
    };
    isArray?: boolean;
}

export interface FASEntity {
    name: string;
    fields: FASField[];
}

export interface FASContractInputOutput {
    name: string;
    type: string;
    isArray?: boolean;
    validators?: any;
}

export interface FASStep {
    name: string;
    action: string;
    args: string[];
    onError?: string;
}

export interface FASFlow {
    name: string;
    target: 'Rust' | 'Go' | 'Node';
    requires?: string[];
    steps: FASStep[];
}

export interface FASContract {
    name: string;
    inputs: FASContractInputOutput[];
    outputs: FASContractInputOutput[];
    flows: FASFlow[];
}

export interface FASGateway {
    name: string;
    target: string;
    namespace: string;
    room_identifier: string;
    relays: { from: string, to: string }[];
}

export interface FASDomain {
    name: string;
    entities: FASEntity[];
    contracts: FASContract[];
    gateways: FASGateway[];
}
