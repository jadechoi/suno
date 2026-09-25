const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({console}),run=s=>vm.runInContext(s,ctx);
for(const f of ['hh-data.js','hh-ai.js'])run(fs.readFileSync(f,'utf8'));
run(`const st={genre:0};const HH_VOCAL_STYLE=[],HH_VOCAL_CHAR=[];pickCompatibleTextures=x=>x;`);
const p=ctx.buildBriefProposal('Despacito',{genre:'Reggaeton',mood:'감각적·관능적',drums:['Dembow kick & snare','Shaker groove'],bass808:'None',melodyLead:'Puerto Rican cuatro',melodyBackground:'Nylon-string guitar',instrumentalProfile:{groove:'dembow',instruments:'cuatro and guitar'}});
assert.equal(run(`GENRES[${p.v.genre}].tag`),'reggaeton');
assert.equal(p.v.drums[0],'Dembow kick & snare');assert.equal(p.v.lead,'Puerto Rican cuatro');assert.equal(p.v.bg,'Nylon-string guitar');
assert.equal(run('GENRES[0].tag'),'trap');assert.equal(run('GENRES[44].tag'),'j-pop');
const app=fs.readFileSync('app.js','utf8');
run('const GENRE_MELODY_TIPS={},GENRE_DRUMS_TIPS={},GENRE_TEXTURE_TIPS={};');
const start=app.indexOf('for(const p of RHYTHM_POP_PROFILES)');run(app.slice(start,app.indexOf('// 텍스처 추천',start)));
for(const profile of run('RHYTHM_POP_PROFILES')){
 ctx.setInstrumentMenus('pop');ctx.profile=profile;
 assert.equal(run("scorePick(HH_DRUMS,GENRE_DRUMS_TIPS,{},profile.index,null,null)[0]"),profile.drums[0]);
 assert.equal(run("scorePick(HH_MELODY,GENRE_MELODY_TIPS,{},profile.index,null,null)[0]"),profile.melody[0]);
 assert.ok(run('POP_GENRES.some(g=>g.tag===profile.tag)'));
 assert.ok(run('POP_AUTO[profile.tag].instruments.every(n=>POP_INSTR.includes(n)&&POP_INSTR_SOUND[n])'));
 assert.ok(run('GENRE_FEEL[profile.index]&&GENRE_HOOK_NAME[profile.index]'));
}
console.log('PASS: precise Latin reference mapping, new genre defaults, pop instruments and stable history indices.');
