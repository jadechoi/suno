const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c=vm.createContext({console});for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const brief={kind:'song',referenceIdentity:{title:'Track',version:'Remix',status:'ambiguous',reason:'Two remixes share this title'},instrumentalProfile:{groove:'dry syncopation',energy:'restrained',bass:'rhythmic bass',mood:'cold, playful'},analysisEvidence:{mood:{basis:'model-knowledge',scope:'track',reason:'specific emotional color'},balance:{basis:'unknown',scope:'unknown',reason:'unknown'}}};
assert.throws(()=>c.assertReferenceReady({designMode:'reference-type-beat',brief}),e=>e.code==='reference_incomplete'&&e.missing[0]==='곡·버전');
assert.doesNotThrow(()=>c.assertReferenceReady({designMode:'original-song',brief}));
const status=c.referenceFieldStatus(brief);assert.equal(status.groove,'evidence-missing');assert.equal(status.balance,'unknown');assert.equal(status.mood,'retained');assert.equal(status.instruments,'missing');
const plan=c.typeBeatPlan({brief:{...brief,referenceIdentity:{...brief.referenceIdentity,status:'identified'}},selectionOrigins:{},instruments:[]});
assert.equal(plan.referenceIdentity.version,'Remix');assert.equal(plan.referenceContract.character.mood,'cold, playful');assert.equal(plan.sound.groove,'dry syncopation');
c.getOpenAIKey=()=> 'fixture';let calls=0;c.callOpenAI=async()=>{calls++;return JSON.stringify(brief);};
// Identity preservation at the analysis boundary; V2 research has separate coverage.
c.analyzeReferenceV2=async (_text,initial)=>initial;
(async()=>{const r=await c.analyzeSoundDesign('Track remix');assert.equal(calls,1);assert.equal(r.referenceIdentity.status,'ambiguous');console.log('PASS: version ambiguity, mood contract, missing evidence vs unknown, no speculative recheck');})().catch(e=>{console.error(e);process.exitCode=1;});
