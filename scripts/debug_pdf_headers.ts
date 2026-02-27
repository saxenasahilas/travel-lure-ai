import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse/lib/pdf-parse.js');

// Polyfill for pdf-parse in Node environments
if (typeof global.DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix { };
}
if (typeof global.ImageData === 'undefined') {
    (global as any).ImageData = class ImageData { };
}
if (typeof global.Path2D === 'undefined') {
    (global as any).Path2D = class Path2D { };
}

async function debug() {
    const filePath = path.join(process.cwd(), 'data', 'origin_context.pdf');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    // Search for column headers
    const queries = ["Qualitative Vibe", "Transit Corridor", "Demographic Insight", "Classification"];
    for (const q of queries) {
        let index = text.toLowerCase().indexOf(q.toLowerCase());
        if (index !== -1) {
            console.log(`--- Match for column header "${q}" at ${index} ---`);
            console.log(text.substring(index - 50, index + 2000));
        }
    }
}

debug();
