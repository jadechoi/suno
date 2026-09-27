const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const html=fs.readFileSync('index.html','utf8');
const paths=[...html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"/g)].map(m=>m[1]);
assert(!paths.some(p=>p.includes('reference-v')||p.startsWith('archive/')));
for(const p of paths){assert(fs.existsSync(p),p);new vm.Script(fs.readFileSync(p,'utf8'),{filename:p});}
const ai=fs.readFileSync('hh-ai.js','utf8');
assert(!/return writeReferenceV[23]\(/.test(ai));
assert(!ai.includes('async function supplementReferenceSources('));
assert(ai.includes('async function writeReferenceDirect('));
assert(ai.includes('async function refineMusicPlan('));
assert(ai.includes('async function aiAnalyzeBrief('));
for(const v of ['v1','v2']){const m=JSON.parse(fs.readFileSync(`versions/${v}/manifest.json`));for(const [f,h]of Object.entries(m.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(`versions/${v}/${f}`)).digest('hex'),h);}
console.log('Runtime script files parse; retired reference scripts excluded; snapshots unchanged');
