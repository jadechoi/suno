const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c=vm.createContext({console,AbortSignal});for(const f of ['hh-data.js','archive/reference/reference-v2.js','archive/reference/reference-v3.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);c.getOpenAIKey=()=> 'fixture';
const spec={designMode:'reference-type-beat',vocal:null,bpm:100,key:'D minor',mood:'intimate',bass808:'None',selectionOrigins:{mood:'current-selection',_808:'current-selection',texture:'ai-reference'},texture:['Wide'],structure:[{header:'[Intro]'},{header:'[Instrumental Bridge 1]'}],limits:{section:5000}};
const plan={referenceVersion:3,identityCore:{relationship:'Bass and drums lead the intimate groove; guitar answers briefly.'},vocalHandling:{soundPolicy:'No voices',roleStrategy:'leave-space',benefit:'space'},roles:[{part:'guitar',function:'short replies',performance:'clipped plucks',fitReason:'Original has a choir, removed here.',sourceTreatment:'new'}],sections:[{header:'[Intro]',direction:'Begin with bass and short guitar replies.',vocalMode:'instrumental'},{header:'[Instrumental Bridge 1]',direction:'Guitar briefly leads with sustained notes while drums recede.',vocalMode:'instrumental'}],parameters:{bpm:100,key:'D minor'},referenceAnalysis:{instrumentalProfile:{vocalSpace:'add a choir'}}};
const good={style:'Instrumental intimate beat at 100 BPM in D minor. Bass and drums lead; guitar answers in clipped plucks, briefly sustaining in the bridge. No vocals or 808.',sections:plan.sections,lyrics:''};
(async()=>{
 let writes=0;const seen=[];
 c.callOpenAI=async(_key,r)=>{const input=JSON.parse(r.dynamicText);seen.push(input);
  if(r.staticText.includes('Render the approved')){writes++;assert.equal(input.intent.mood,'intimate');assert.equal(input.intent.instrumental,true);assert.equal(input.userChoices.mood,'intimate');assert.equal(input.userChoices.bass808,'None');assert.equal(input.userChoices.texture,undefined);assert.equal(input.design.baseline,plan.identityCore.relationship);assert.ok(!JSON.stringify(input.design).includes('choir'));if(writes===2)assert.match(input.candidate.style,/guitar solo leads throughout/);return JSON.stringify(writes===1?{...good,style:good.style+' A guitar solo leads throughout.'}:good);}
  if(r.staticText.includes('Compare output')){assert.equal(input.userChoices.mood,'intimate');return JSON.stringify({issues:writes===1?[{quote:'A guitar solo leads throughout.',reason:'Changes the global foreground',designBasis:plan.identityCore.relationship}]:[]});}
  assert.equal(input.content.referenceAnalysis,undefined);assert.equal(input.content.roles[0].fitReason,undefined);return JSON.stringify({violations:[]});
 };
 const out=await c.writeReferenceV3({spec,musicPlan:plan});assert.equal(writes,2);assert.equal(out.style,good.style);assert.match(out.section,/Guitar briefly leads/);assert.equal(out.musicPlan,plan);
 assert.equal((await c.checkMusicConditions(spec,c.referenceV3Publication(plan))).length,0);
 const sourceMood={...plan,referenceAnalysis:{instrumentalProfile:{mood:'bittersweet sadness'}}};
 const withoutOverride={...spec,selectionOrigins:{}};let count=0;
 c.callOpenAI=async(_key,r)=>{
  const input=JSON.parse(r.dynamicText);assert.equal(input.intent.mood,'bittersweet sadness');
  if(r.staticText.includes('Render the approved')){count++;if(count===2)assert.match(input.issues.join(' '),/emotional character/);return JSON.stringify({...good,style:count===1?'A restrained piano ballad at 100 BPM in D minor.':'Instrumental only. Bittersweet, sorrowful piano at 100 BPM in D minor.'});}
  return JSON.stringify({issues:count===1?[{quote:'A restrained piano ballad at 100 BPM in D minor.',reason:'Missing specific emotional character and explicit instrumental exclusion',designBasis:'intent.mood and intent.instrumental'}]:[]});
 };
 await c.writeReferenceV3({spec:withoutOverride,musicPlan:sourceMood});assert.equal(count,2);

 // A genuinely requested voice in performance still reaches the condition checker.
 const bad={...plan,roles:[{...plan.roles[0],performance:'add a choir'}]};c.callOpenAI=async(_key,r)=>{assert.equal(JSON.parse(r.dynamicText).content.roles[0].performance,'add a choir');return JSON.stringify({violations:[{condition:'instrumental',quote:'add a choir',reason:'actual voice requested'}]});};assert.equal((await c.checkMusicConditions(spec,c.referenceV3Publication(bad))).length,1);
 console.log('PASS: priority/explicit choices survive repair, planned bridge exception allowed, source vocals excluded, actual voice instruction checked');
})().catch(e=>{console.error(e);process.exitCode=1;});
