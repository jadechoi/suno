const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({console});
for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
vm.runInContext("const st={narrAI:{hook1:'Keep guitar behind the drums.'},extraTags:[],removedPhrases:[]}; getOpenAIKey=()=> 'fixture'; aiSelectionCtx=()=> 'sensual';",ctx);
const spec={designMode:'reference-type-beat',structure:[{header:'[Intro]'},{header:'[Instrumental Hook 1]'}],brief:{instrumentalProfile:{groove:'relaxed dembow',balance:'rhythmic guitar supporting drums'}}};
const design={identity:'Sensual relaxed dembow; drums and bass lead the groove.',roles:[{part:'guitar',function:'Rhythmic accompaniment with space, never a solo lead.',performance:'Muted offbeat strums.',fitReason:'Supports the supplied relaxed dembow pulse.'}],sections:spec.structure.map(x=>({header:x.header,direction:'Maintain the same groove and roles.'}))};
(async()=>{
 const requests=[];
 ctx.callOpenAI=async(_key,r)=>{requests.push(r);return requests.length===1?JSON.stringify(design):'<style>Instrumental sensual dembow. Guitar supports drums.</style><section>[Intro]\n(Sparse entry.)\n[Instrumental Hook 1]\n(Maintain the established groove.)</section>';};
 const result=await ctx.writeOnce({mode:'create',spec});
 assert.equal(requests.length,2);
 assert.equal(JSON.stringify(result.musicPlan),JSON.stringify(design));
 assert.ok(requests[1].dynamicText.includes(design.identity));
 assert.ok(requests[1].dynamicText.includes(design.roles[0].function));
 assert.ok(requests[1].staticText.includes('두 출력에서 별도로 작곡하지 마'));
 // Retry uses the same design, rather than making another composition.
 await ctx.writeOnce({mode:'create',spec,musicPlan:result.musicPlan,errors:['format'],failed:result});
 assert.equal(requests.length,3);
 assert.ok(requests[2].dynamicText.includes(design.identity));
 ctx.callOpenAI=async(_key,r)=>{const input=JSON.parse(r.dynamicText);assert.equal(input.previous.musicPlan.identity,design.identity);assert.equal(input.feedback.hook1,'Keep guitar behind the drums.');return JSON.stringify(design);};
 await ctx.buildMusicPlan({mode:'edit',spec,prev:result});
 ctx.callOpenAI=async()=>JSON.stringify({...design,sections:design.sections.slice(0,1)});
 await assert.rejects(()=>ctx.buildMusicPlan({mode:'create',spec}),/음악 설계/);
 console.log('PASS: shared musical plan, renderer handoff, retry reuse, feedback context and missing section rejection.');
})().catch(e=>{console.error(e);process.exitCode=1;});
