// Frozen V1 pipeline regression; V2 behavior is covered by reference-v2.test.cjs.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({console});
for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync('versions/v1/'+f,'utf8'),ctx);
vm.runInContext("const st={narrAI:{hook1:'Keep guitar behind the drums.'},extraTags:[],removedPhrases:[]}; getOpenAIKey=()=> 'fixture'; aiSelectionCtx=()=> 'sensual';",ctx);
// Role-review transport is tested separately; this fixture tests plan/render handoff.
ctx.reviewReferenceRoles=async()=>{};
const spec={designMode:'reference-type-beat',structure:[{header:'[Intro]'},{header:'[Instrumental Hook 1]'}],brief:{instrumentalProfile:{groove:'relaxed dembow',energy:'sensual restrained',balance:'rhythmic guitar supporting drums'}}};
const core={signature:{cycle:'2 bars',focus:'drum and bass pocket',audibleGesture:'Late bass answer after a clear rest',supportRelationship:'Guitar punctuates the empty beat',preserveAcrossSections:'Keep the rest and late answer recognizable',variationSpace:'Change supporting percussion to expose the same late answer'},anchors:[{feature:'Sensual relaxed pulse',basis:'Supplied relaxed dembow groove'}],relationship:'Drums and bass drive; guitar supports, per supplied balance clue.',openChoices:'New notes and phrasing; no claim to reconstruct the recording.',driftRisks:['Explosive festival climax']};
const design={identityChoice:{alternatives:['melody-led'],selected:'groove-led',reason:'Keeps the relaxed pocket central'},identityCore:core,identity:'Sensual relaxed dembow; drums and bass lead the groove.',roles:[{part:'guitar',function:'Rhythmic accompaniment with space, never a solo lead.',performance:'Muted offbeat strums.',fitReason:'Supports the supplied relaxed dembow pulse.'}],sections:spec.structure.map(x=>({header:x.header,direction:'Maintain the same groove and roles.'}))};
design.roles[0].roleDecision={treatment:'preserve',relationshipIds:[],changeScope:'same-job',creativeChoice:'New offbeat chord voicings',benefit:'Fresh harmony retaining the relaxed pocket',changeEvidence:{kind:'reference',field:'balance',quote:'rhythmic guitar supporting drums'}};
(async()=>{
 const requests=[];
 ctx.callOpenAI=async(_key,r)=>{requests.push(r);return requests.length===1?JSON.stringify(design):'<style>Instrumental sensual dembow. Guitar supports drums.</style><section>[Intro]\n(Sparse entry.)\n[Instrumental Hook 1]\n(Maintain the established groove.)</section>';};
 const result=await ctx.writeOnce({mode:'create',spec});
 assert.equal(requests.length,2);
 assert.equal(result.musicPlan.parameters.bpm,null);
 assert.equal(result.musicPlan.parameters.key,null);
 assert.ok(requests[0].staticText.includes('identityCore BEFORE'));
 assert.ok(requests[1].dynamicText.includes(core.relationship));
 assert.equal(JSON.stringify(result.musicPlan.identityCore),JSON.stringify(core));
 assert.ok(requests[1].dynamicText.includes(design.identity));
 assert.ok(requests[1].dynamicText.includes(design.roles[0].function));
 assert.ok(requests[1].staticText.includes('neither independently recomposes'));
 assert.ok(requests[1].staticText.includes('Do not generalize a baseline technique'));
 assert.ok(requests[0].staticText.includes('later hooks need no automatic escalation'));
 assert.ok(fs.readFileSync('hh-ai.js','utf8').includes('이 곡에서 기대하는 구체적 이득'));
 // Every stage consumes exactly one copy of the same musical contract.
 const contract=vm.runInContext('MUSIC_DESIGN_CONTRACT',ctx);
 for(const name of ['MUSIC_PLAN_GUIDE','WRITE_STATIC','TYPE_BEAT_WRITE_STATIC','STYLE_COMPRESSION_GUIDE']){
   const prompt=vm.runInContext(name,ctx);
   assert.equal(prompt.split(contract).length-1,1,name);
 }
 // A bridge exception survives both writing modes and style-only compression context.
 const exceptionPlan={...design,sections:design.sections.map((x,i)=>({...x,direction:i?'Use legato guitar here for a suspended contrast; short chords remain the baseline elsewhere.':x.direction}))};
 for(const designMode of ['reference-type-beat','original-song']){
   const captured=[];
   ctx.callOpenAI=async(_key,r)=>{captured.push(r);return captured.length===1?'<section>[Intro]\n(Short chords.)\n[Instrumental Hook 1]\n(Legato guitar for suspended contrast.)</section><style>'+ 'Long description. '.repeat(100)+'</style>':JSON.stringify({essential:'Instrumental dembow with short guitar chords, turning legato for suspended contrast in the hook.',optional:[]});};
   const rendered=await ctx.writeOnce({mode:'create',spec:{...spec,designMode},musicPlan:exceptionPlan});
   assert.ok(captured[0].dynamicText.includes(exceptionPlan.sections[1].direction));
   assert.ok(JSON.parse(captured[1].dynamicText).context.includes('Use legato guitar here'));
   assert.match(rendered.section,/Legato guitar/);
   assert.match(rendered.style,/turning legato/);
 }
 ctx.callOpenAI=async(_key,r)=>{requests.push(r);return '<style>Instrumental sensual dembow.</style><section>[Intro]\n(Sparse entry.)\n[Instrumental Hook 1]\n(Maintain the groove.)</section>';};
 // Retry uses the same design, rather than making another composition.
 await ctx.writeOnce({mode:'create',spec,musicPlan:result.musicPlan,errors:['format'],failed:result});
 assert.equal(requests.length,3);
 assert.ok(requests[2].dynamicText.includes(design.identity));
 ctx.callOpenAI=async(_key,r)=>{const input=JSON.parse(r.dynamicText);assert.equal(input.previous.musicPlan.identity,design.identity);assert.equal(input.feedback.hook1,'Keep guitar behind the drums.');return JSON.stringify(design);};
 await ctx.buildMusicPlan({mode:'edit',spec,prev:result});
 ctx.callOpenAI=async()=>JSON.stringify({...design,sections:design.sections.slice(0,1)});
 await assert.rejects(()=>ctx.buildMusicPlan({mode:'create',spec}),/음악 설계/);
 ctx.callOpenAI=async()=>JSON.stringify({...design,identityCore:null});
 await assert.rejects(()=>ctx.buildMusicPlan({mode:'create',spec}),/곡 정체성/);
 ctx.callOpenAI=async(_key,r)=>{assert.equal(JSON.parse(r.dynamicText).selection.designMode,'original-song');return JSON.stringify(design);};
 assert.equal((await ctx.buildMusicPlan({mode:'create',spec:{...spec,designMode:'original-song'}})).identityCore.relationship,core.relationship);
 for(const field of ['function','performance','fitReason']){
   ctx.callOpenAI=async()=>JSON.stringify({...design,roles:[{...design.roles[0],[field]:''}]});
   await assert.rejects(()=>ctx.buildMusicPlan({mode:'create',spec}),/악기 역할/);
 }
 // Different musical jobs retain different playing techniques; no genre lookup replaces them.
 for(const role of [
   {part:'guitar',function:'Rhythmic support',performance:'Muted offbeat strokes beneath the bass',fitReason:'Short decay leaves the groove space to breathe'},
   {part:'guitar',function:'Expressive foreground',performance:'Sustained bending notes in the hook; light chords in verses',fitReason:'Long notes carry the requested yearning while verses retain intimacy'},
   {part:'synth bass',function:'Primary rhythmic identity',performance:'Dry clipped syncopations with rests',fitReason:'The rests emphasize the playful elastic groove'}
 ]){
   ctx.callOpenAI=async()=>JSON.stringify({...design,roles:[role]});
   assert.equal((await ctx.buildMusicPlan({mode:'create',spec:{...spec,designMode:'original-song'}})).roles[0].performance,role.performance);
 }
 let tries=0;
 ctx.callOpenAI=async(_key,r)=>{tries++;if(tries===1)throw Object.assign(new Error('truncated'),{code:'output_truncated'});assert.equal(r.maxTokens,8000);return JSON.stringify(design);};
 assert.equal((await ctx.buildMusicPlan({mode:'create',spec})).identity,design.identity);
 assert.equal(tries,2);
 ctx.callOpenAI=async()=>JSON.stringify(design);
 const fixed=await ctx.buildMusicPlan({mode:'create',spec:{...spec,bpm:138,key:'A minor'}});
 assert.equal(fixed.parameters.bpm,138);
 assert.equal(fixed.parameters.key,'A minor');
 assert.equal(fixed.identityCore.signature.cycle,'2 bars');
 const directPlan={...design,directSectionRendering:true};
 ctx.callOpenAI=async(_key,r)=>{assert.match(r.staticText,/application assembles those exact directions/);return '<style>Instrumental sensual dembow.</style><section>[Intro]\n(Add an unrelated solo.)</section>';};
 const direct=await ctx.writeOnce({mode:'create',spec,musicPlan:directPlan});
 assert.equal(direct.section.replace(/\n\n/g,'\n'),ctx.designedSectionText(directPlan).replace(/\n\n/g,'\n'));
 assert.doesNotMatch(direct.section,/unrelated solo/);
 const styleRetry=await ctx.writeOnce({mode:'create',spec,musicPlan:directPlan,errors:['스타일에 지정 템포를 명시해주세요']});
 assert.equal(styleRetry.section,direct.section);
 console.log('PASS: shared musical plan, renderer handoff, retry reuse, feedback context and missing section rejection.');
})().catch(e=>{console.error(e);process.exitCode=1;});
