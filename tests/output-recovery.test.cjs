const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const storage=new Map();
const ctx=vm.createContext({console,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}});
for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
vm.runInContext("getOpenAIKey=()=> 'fixture';",ctx);
const parse=vm.runInContext('(raw)=>JSON.parse(raw)',ctx);
(async()=>{
 let requests=[],diagnostics=[];
 ctx.callOpenAI=async(_key,r)=>{requests.push(r);return requests.length===1?' {"identity":"same",}':'{"identity":"same"}';};
 const result=await ctx.recoverAiFormat('plan',{maxTokens:6000},parse,diagnostics);
 assert.equal(result.identity,'same');assert.equal(requests.length,2);
 assert.equal(JSON.parse(requests[1].dynamicText).raw,' {"identity":"same",}');
 assert.equal(diagnostics[0].status,'failed');assert.equal(diagnostics[1].status,'repaired');
 assert.match(requests[1].staticText,/do not compose new content/);
 requests=[];diagnostics=[];
 ctx.callOpenAI=async(_key,r)=>{requests.push(r);return '{bad';};
 await assert.rejects(()=>ctx.recoverAiFormat('plan',{},parse,diagnostics));
 assert.equal(requests.length,2);assert.equal(diagnostics.length,2);
 assert.ok(diagnostics.every(x=>x.raw==='{bad'&&x.error));
 // Transport failures are not format failures and do not spend a repair call.
 let calls=0;diagnostics=[];
 ctx.callOpenAI=async()=>{calls++;throw new Error('HTTP 429');};
 await assert.rejects(()=>ctx.recoverAiFormat('plan',{},parse,diagnostics),/429/);
 assert.equal(calls,1);
 calls=0;diagnostics=[];
 ctx.callOpenAI=async()=>{if(!calls++)throw Object.assign(new Error('truncated'),{code:'output_truncated',raw:'{"identity":'});return '{"identity":"retained"}';};
 await ctx.recoverAiFormat('plan',{},parse,diagnostics);
 assert.equal(diagnostics[0].raw,'{"identity":');
 // Writing repair retains raw malformed wrapper and musical content.
 calls=0;diagnostics=[];
 const bad='<section>[Intro]\nDry bass.)\n</section><style>Cold club. No vocals.</style>';
 ctx.callOpenAI=async()=>++calls===1?bad:bad.replace('Dry bass.)','(Dry bass.)');
 const written=await ctx.recoverAiFormat('writing',{},raw=>ctx.readWrittenOutput(raw,{}),diagnostics);
 assert.equal(calls,2);assert.equal(diagnostics[0].raw,bad);assert.match(written.section,/\(Dry bass\.\)/);
 calls=0;diagnostics=[];
 ctx.callOpenAI=async()=>{calls++;return 'no wrappers';};
 await assert.rejects(()=>ctx.recoverAiFormat('writing',{},raw=>ctx.readWrittenOutput(raw,{}),diagnostics),/태그/);
 assert.equal(calls,2);
 // Real previously generated text, not made-up examples.
 const fixtures=JSON.parse(fs.readFileSync('tests/fixtures/live-output-regressions.json','utf8'));
 const club=fixtures.find(x=>x.name==='club'),trap=fixtures.find(x=>x.name==='trap'),pop=fixtures.find(x=>x.name==='pop');
 assert.ok(ctx.sectionFormatIssues(club.section).some(x=>x.includes('괄호')));
 assert.ok(ctx.sectionFormatIssues(trap.section).some(x=>x.includes('잔여 태그')));
 assert.ok(ctx.outputReviewWarnings({referenceSong:'Taylor Swift - Style'},pop).some(x=>x.includes('아티스트')));
 assert.ok(!ctx.outputReviewWarnings({},pop).some(x=>x.includes('확대'))); // Musical benefit is not a keyword warning.
 // Balanced nested parentheses and no-change later hooks are valid.
 const clean={style:'Instrumental club.',section:'[Intro]\n(Bass enters (dry and close).)\n[Instrumental Hook 1]\n(Maintain the pocket.)\n[Instrumental Hook 2]\n(Return to the same groove.)'};
 assert.equal(ctx.outputReviewWarnings({},clean).length,0);
 // A requested expansion is a review signal, never a hard rejection or deletion.
 const expanded={...clean,section:clean.section.replace('Return to the same groove.','Double the bass octave for the requested peak.')};
 assert.ok(ctx.validateWritten({},expanded.section,expanded.style).ok);
 assert.equal(ctx.outputReviewWarnings({},expanded).length,0);
 // Bounded retries leave more headroom while retaining the original identity context.
 calls=0;diagnostics=[];
 ctx.callOpenAI=async(_key,r)=>{const input=JSON.parse(r.dynamicText);assert.equal(input.targetCharacters,[900,800,700][calls]);assert.equal(input.originalStyle,'x'.repeat(1100));calls++;return JSON.stringify({essential:'x'.repeat(1100),optional:[]});};
 assert.equal((await ctx.fitAiStyle('x'.repeat(1100),'baseline and exceptions',diagnostics)).length,1100);
 assert.equal(calls,3);assert.equal(diagnostics.length,3);
 console.log('PASS: bounded format recovery, raw diagnostics, real-output regressions and non-truncating budget.');
})().catch(e=>{console.error(e);process.exitCode=1;});
