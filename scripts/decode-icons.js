#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const files = [
  { in: path.join('public','icon-192.b64'), out: path.join('public','icon-192.png') },
  { in: path.join('public','icon-512.b64'), out: path.join('public','icon-512.png') }
];

files.forEach(f => {
  if (!fs.existsSync(f.in)) {
    console.warn('Missing', f.in);
    return;
  }
  const b64 = fs.readFileSync(f.in, 'utf8').trim();
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(f.out, buf);
  console.log('Wrote', f.out);
});
