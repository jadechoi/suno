// Frozen V1 pipeline regression; V2 behavior is covered by reference-v2.test.cjs.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console});for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync('versions/v1/'+f,'utf8'),ctx);ctx.getOpenAIKey=()=> 'fixture';
(async()=>{
 let calls=0;
 ctx.callOpenAI=async(_key,r)=>{calls++;if(calls===1)return '{broken';assert.match(r.staticText,/valid JSON/);return JSON.stringify({kind:'vibe',instrumentalProfile:{groove:'elastic'}});};
 const repaired=await ctx.analyzeSoundDesign('cold bass');assert.equal(calls,2);assert.equal(repaired.instrumentalProfile.groove,'elastic');assert.equal(repaired.analysisDiagnostics[0].raw,'{broken');
 calls=0;
 const original={kind:'song',instrumentalProfile:{groove:'specific pulse',bass:'root bass'},analysisEvidence:{groove:{basis:'model-knowledge',scope:'track',reason:'track pulse'},bass:{basis:'model-knowledge',scope:'track',reason:'track bass'}}};
 ctx.callOpenAI=async(_key,r)=>{calls++;if(calls===1)return JSON.stringify(original);assert.deepEqual(JSON.parse(r.dynamicText).missing,['energy']);return JSON.stringify({instrumentalProfile:{energy:'restrained',groove:'overwrite forbidden'},analysisEvidence:{energy:{basis:'inference',scope:'track',anchors:['groove'],reason:'the supplied pulse is restrained'}}});};
 const checked=await ctx.analyzeSoundDesign('track');assert.equal(calls,2);assert.equal(checked.instrumentalProfile.groove,'specific pulse');assert.equal(ctx.filterReferenceUncertainty(checked).instrumentalProfile.energy,'restrained');
 console.log('PASS: bounded analysis repair, diagnostic preservation and missing-only grounded recheck');
})().catch(e=>{console.error(e);process.exitCode=1;});
const supplied={kind:'song',instrumentalProfile:{groove:'rigid kick'},analysisEvidence:{groove:{basis:'user-description',scope:'track',reason:'User said rigid kick'}}};
assert.equal(ctx.filterReferenceUncertainty(supplied).analysisEvidence.groove.basis,'user-description');
assert.equal(ctx.filterReferenceUncertainty(supplied).instrumentalProfile.groove,'rigid kick');
const wrapped=ctx.readWrittenOutput('<section>[Intro]\n(Soft chords.</section><style>Instrumental.</style>',{});
assert.equal(wrapped.section,'[Intro]\n(Soft chords.)');
