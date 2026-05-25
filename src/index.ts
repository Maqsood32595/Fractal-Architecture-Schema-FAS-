import * as path from 'path';
import * as fs from 'fs';
import { FASParser } from './parser';
import { KernelGenerator } from './kernel_generator';
import { NodeTargetGenerator } from './node_generator';
import { RustTargetGenerator } from './rust_generator';

function main() {
    const args = process.argv.slice(2);
    if (args.length < 2 || args[0] !== 'build') {
        console.log('Usage: fas build <file_or_directory>');
        process.exit(1);
    }

    const inputPath = path.resolve(args[1]);
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ Input path not found: ${inputPath}`);
        process.exit(1);
    }

    const parser = new FASParser();
    const kernelGen = new KernelGenerator();
    const nodeGen = new NodeTargetGenerator();
    const rustGen = new RustTargetGenerator();

    const processFile = (filePath: string) => {
        if (!filePath.endsWith('.fas')) return;
        console.log(`\n⚙️  Compiling: ${filePath}`);
        
        try {
            const ast = parser.parse(filePath);
            const outputDir = path.join(process.cwd(), 'dist', ast.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            
            kernelGen.generate(ast, outputDir);
            nodeGen.generate(ast, outputDir);
            rustGen.generate(ast, outputDir);
            
            console.log(`✅ Compilation successful for domain: ${ast.name}`);
        } catch (err: any) {
            console.error(`❌ Compilation Error in ${filePath}:`, err.message);
        }
    };

    const stat = fs.statSync(inputPath);
    if (stat.isDirectory()) {
        const files = fs.readdirSync(inputPath);
        for (const file of files) {
            processFile(path.join(inputPath, file));
        }
    } else {
        processFile(inputPath);
    }
}

main();
