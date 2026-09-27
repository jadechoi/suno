const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c=vm.createContext({});vm.runInContext(fs.readFileSync('hh-data.js','utf8'),c);
const sp=fs.readFileSync('hh-spotify.js','utf8');vm.runInContext(sp.slice(sp.indexOf('const SP_KEY_MAP='),sp.indexOf('function toggleSpPanel')),c);
const keys=vm.runInContext('KEYS',c),map=vm.runInContext('SP_KEY_MAP',c);
assert.equal(keys.length,24);assert.equal(new Set(Object.values(map)).size,24);
const names=['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
for(let pitch=0;pitch<12;pitch++)for(const mode of [0,1]){let name=names[pitch];if(!mode&&pitch===1)name='C#';assert.equal(keys[map[`${pitch},${mode}`]],name+(mode?' major':' minor'));}
assert.equal(keys[7],'A minor');assert.equal(keys[14],'G minor');
console.log('PASS: exact 24 pitch/mode mappings and historical key indices');
