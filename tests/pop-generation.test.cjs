// Offline integration checks: repeated lyrics, output limits and stale responses.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const nodes={};
const ctx=vm.createContext({console,document:{getElementById:id=>nodes[id]??=( {value:'',style:{}} )},showToast:()=>{},updateFloatSummary:()=>{},getOpenAIKey:()=> 'fixture'});
const app=fs.readFileSync('app.js','utf8');
vm.runInContext(fs.readFileSync('hh-data.js','utf8'),ctx);
vm.runInContext(`const antiAI=true;const VTS={pop:{genre:'neo soul',bpm:100,key:7,mood:null,instruments:['피아노','베이스','드럼'],vocalStyle:null,concept:'',userLyrics:'',refSong:'',narrSt:{},structSegs:['verse','chorus']}};`,ctx);
vm.runInContext(app.slice(app.indexOf('const POP_VOCAL_GUIDE='),app.indexOf('// TOAST')),ctx);
const run=s=>vm.runInContext(s,ctx);
for(const tag of run('POP_GENRES.map(g=>g.tag)')){
  ctx.tag=tag;
  const text=run(`popStylePrompt({...VTS.pop,...POP_AUTO[tag],narrSt:POP_AUTO[tag].narr},POP_GENRES.find(g=>g.tag===tag),null,120)`);
  assert.ok(text.length<=1000,`${tag}: ${text.length}`);
}
assert.doesNotThrow(()=>ctx.checkPopBudget('x'.repeat(5000),'x'.repeat(1000)));
assert.throws(()=>ctx.checkPopBudget('x'.repeat(5001),'x'));
assert.throws(()=>ctx.checkPopBudget('x','x'.repeat(1001)));
const base='[Verse]\n(Soft piano.)\n[Chorus]\n(Wider piano.)';
ctx.base=base;
assert.throws(()=>ctx.mergePopLyricsAndSection(base,'[Bridge]\nUnmatched lyric'));
(async()=>{
  run('popBaseSection=base;');nodes['pop-style-ta']={value:'Soulful pop.'};
  ctx.callOpenAI=async()=>'<lyrics>[Verse]\nOld verse\n[Chorus]\nOld hook</lyrics>';
  await ctx.popGenerateLyrics();
  ctx.callOpenAI=async()=>'<lyrics>[Verse]\nNew verse\n[Chorus]\nNew hook</lyrics>';
  await ctx.popGenerateLyrics();
  assert.doesNotMatch(nodes['pop-sect-ta'].value,/Old/);
  assert.match(nodes['pop-sect-ta'].value,/\(Soft piano\.\)\nNew verse/);
  const previous=nodes['pop-sect-ta'].value;
  ctx.callOpenAI=async()=>'<lyrics>[Verse]\n'+'x'.repeat(5001)+'</lyrics>';
  await ctx.popGenerateLyrics();assert.equal(nodes['pop-sect-ta'].value,previous);
  let resolve;
  ctx.callOpenAI=()=>new Promise(r=>resolve=r);
  const pending=ctx.popAiWriteStyle(run('VTS.pop'),{section:base,style:'old'},run('popWriteToken'));
  run('++popWriteToken;');resolve('<section>'+base+'</section><style>stale</style>');
  await pending;assert.equal(nodes['pop-style-ta'].value,'Soulful pop.');
  run('popStylePending=true;');ctx.callOpenAI=()=>{throw new Error('Must not request lyrics during style writing');};
  await ctx.popGenerateLyrics();assert.equal(nodes['pop-sect-ta'].value,previous);
  console.log('PASS: pop budgets, repeated lyrics, unmatched headers, stale responses and pending guard.');
})().catch(e=>{console.error(e);process.exitCode=1;});
