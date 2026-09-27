const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({console});for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
assert.equal(c.promptPlainText('R&amp;B &#38; pop &quot;warm&quot; &#x2014; &#x1f3b5;'),'R&B & pop "warm" — 🎵');
assert.equal(c.promptPlainText('&lt;script&gt; &#60; &#xD800; &#99999999;'),'&lt;script&gt; &#60; &#xD800; &#99999999;');
const output=c.readWrittenOutput('<style>R&amp;B</style><section>[Intro]\n(Keys &amp; bass.)</section><lyrics>A &amp; B</lyrics>',{lyrics:{provided:true}});
assert.equal(output.style,'R&B');assert.match(output.section,/Keys & bass/);assert.equal(output.lyrics,'A &amp; B');
assert.throws(()=>c.validateConcreteParts({designMode:'original-song'},{roles:[{part:'Lead Instrument (main melody)'}]}),/specific sound source/);
for(const part of ['Clean electric guitar','Soft sine-wave synth lead','Felt piano','Rubbery FM bass'])assert.doesNotThrow(()=>c.validateConcreteParts({designMode:'original-song'},{roles:[{part}]}));
assert.doesNotThrow(()=>c.validateConcreteParts({designMode:'reference-type-beat'},{roles:[{part:'Lead Instrument'}]}));
c.getOpenAIKey=()=> 'fixture';
(async()=>{
 c.callOpenAI=async(_key,r)=>{assert.match(r.staticText,/whole ensemble/);assert.match(r.staticText,/passing figure/);assert.equal(JSON.parse(r.dynamicText).identity,'Bass singing identity');return JSON.stringify({conflicts:[{part:'bass',sourceQuote:'Bass supports harmony',planQuote:'Recurring singing bass motif',reason:'Moves the removed topline to a different supporting instrument'}]});};
 await assert.rejects(()=>c.reviewReferenceRoles({referenceContract:{},sound:{bass:'Bass supports harmony'}},{identity:'Bass singing identity',roles:[{part:'bass',function:'Recurring singing bass motif'}]}),e=>e.roleConflict===true);
 const plan={roles:[],sections:[{header:'[Instrumental Hook 2]',direction:'Restore kick, bass and chords.'}]};
 c.callOpenAI=async(_key,r)=>{assert.match(r.staticText,/unchanged instrument inventories/);return JSON.stringify({returningHookDecisions:[{header:'[Instrumental Hook 2]',choice:'maintain',reason:'The preceding break already supplies contrast'}],edits:[{header:'[Instrumental Hook 2]',original:plan.sections[0].direction,direction:'Return to the established groove.',benefit:'Recognition after the break',reason:'Baseline already defines the parts'}]});};
 const refined=await c.refineMusicPlan({designMode:'original-song'},plan);
 assert.equal(refined.returningHookDecisions[0].choice,'maintain');assert.equal(refined.sections[0].direction,'Return to the established groove.');
 console.log('PASS: entity normalization, lyric preservation, concrete source choice, ensemble review and inherited section decisions (offline).');
})().catch(e=>{console.error(e);process.exitCode=1;});
