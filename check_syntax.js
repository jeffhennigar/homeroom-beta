import fs from 'fs';
import { parse } from 'node-html-parser';

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node check_syntax.js <file_path>');
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const root = parse(content);
const scriptTag = root.querySelector('script[type="text/babel"]');

if (scriptTag) {
    const script = scriptTag.text;
    try {
        new Function(script);
        console.log("Syntax OK");
    } catch (e) {
        console.error("Syntax Error:", e.message);
        // Find line number
        const lines = script.split('\n');
        // This won't work perfectly because new Function() doesn't give line numbers of the source string easily
        // But we can try to find snippets
    }
} else {
    console.log("No script tag found");
}
