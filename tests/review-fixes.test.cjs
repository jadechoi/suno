const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const ctx=vm.createContext({console});
for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(read(f),ctx);
const run=s=>vm.runInContext(s,ctx);
const spotify=read('hh-spotify.js');
run(spotify.slice(spotify.indexOf('function isChartTrack('),spotify.indexOf('// Billboard엔 트랙 ID')));
assert.equal(ctx.isChartTrack({name:'Old hit'},{name:'Current hit'}),false);
assert.equal(ctx.isChartTrack({name:' Current  Hit '},{name:'current hit'}),true);
assert.equal(ctx.isChartTrack({name:'Current hit remix'},{name:'Current hit'}),false);
assert.equal(ctx.isChartTrack({name:'Current hit'},null),false);
assert.equal(run("GENRES[GENRE_PRESETS.find(p=>p.name==='UK Garage').genre].tag"),'uk garage');
run(`
const nodes=Object.fromEntries(['hh-sect-ta','hh-style-ta','hh-lyrics-ta','hh-lyrics-only-ta'].map(id=>[id,{value:''}]));
globalThis.document={getElementById:id=>nodes[id]||null};
const st={};
aiWriteEnabled=()=>true;renderWriteBadge=()=>{};updateWriteCounters=()=>{};
buildWriteSpec=()=>({limits:{style:1000,sectionTotal:5000}});
updatePromptHistoryTexts=()=>{globalThis.historyWrites=(globalThis.historyWrites||0)+1;};
function seed(){
 _hhWritten={fpBase:'old',fpFull:'old',section:'[Intro]\\nPrevious direction',style:'Previous style',lyrics:'',meta:{ok:true}};
 _hhDraft={fpBase:'new',fpFull:'new',sect:'rule draft',style:'rule style'};
 _writeFix=null;
}
`);
(async()=>{
  run("seed();_hhDraft.fpBase='old';writeOnce=async({mode})=>{globalThis.selectedMode=mode;return {section:'[Intro]\\nFresh direction',style:'Short style',lyrics:''};};");
  await ctx.hhAiWrite('fresh',{fresh:true});
  assert.equal(ctx.selectedMode,'create');
  await ctx.hhAiWrite('feedback');
  assert.equal(ctx.selectedMode,'edit');

  run("seed();writeOnce=async()=>{throw new Error('fixture API failure');};");
  await ctx.hhAiWrite('failure');
  assert.equal(run("nodes['hh-sect-ta'].value"),'[Intro]\nPrevious direction');
  assert.equal(run('_hhWritten.fpFull'),'old');
  assert.match(run('_writeNote'),/아직 반영되지/);
  run("seed();writeOnce=async()=>({section:'',style:'',lyrics:''});");
  await ctx.hhAiWrite('invalid');
  assert.equal(run("nodes['hh-style-ta'].value"),'Previous style');
  run("seed();writeOnce=async()=>({section:'[Intro]\\nAI direction',style:'x'.repeat(1100),lyrics:''});");
  await ctx.hhAiWrite('over-budget');
  assert.equal(run("nodes['hh-style-ta'].value.length"),1100);
  assert.equal(run('_writeState'),'ok');
  assert.match(run('_writeWarn[0]'),/1000자/);
  ctx.historyWrites=undefined;
  // A stale streaming callback and completed response must not replace a restored result.
  run(`seed();writeOnce=({onPartial})=>new Promise(resolve=>{globalThis.finish=resolve;globalThis.partial=onPartial;});`);
  const pending=ctx.hhAiWrite('old');
  ctx.invalidateAiWrite();
  run(`_hhWritten={section:'Restored',style:'Restored style',meta:{ok:true}};nodes['hh-sect-ta'].value='Restored';nodes['hh-style-ta'].value='Restored style';partial('<section>Old stream');finish({section:'[Intro]\\nOld response',style:'Old style',lyrics:''});`);
  await pending;
  assert.equal(run("nodes['hh-sect-ta'].value"),'Restored');
  assert.equal(run('_hhWritten.section'),'Restored');
  assert.equal(ctx.historyWrites,undefined);
  const app=read('app.js');
  const restore=app.slice(app.indexOf('function restorePromptHistoryEntry('),app.indexOf('let _historyShowAll'));
  assert.ok(restore.indexOf('invalidateAiWrite();')<restore.indexOf('Object.assign(st,'));
  assert.match(app,/function hhReset\(\)\{\s*invalidateAiWrite\(\);/);
  console.log('PASS: stale responses, failed rewrites, chart badge identity and UK Garage preset.');
})().catch(e=>{console.error(e);process.exitCode=1;});
