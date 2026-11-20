// Builds the hosted page: injects book.json into template.html.
// Usage: node build.mjs <output.html>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const book = JSON.parse(fs.readFileSync(path.join(dir, 'book.json'), 'utf8'));
const json = JSON.stringify(book).replace(/</g, '\\u003c');
const tpl = fs.readFileSync(path.join(dir, 'template.html'), 'utf8');
if (!tpl.includes('"__BOOK__"')) throw new Error('placeholder missing');
const out = process.argv[2];
if (!out) throw new Error('output path required');
fs.writeFileSync(out, tpl.replace('"__BOOK__"', () => json));
console.log(`Built ${out} with ${book.accounts.length} account(s)`);
