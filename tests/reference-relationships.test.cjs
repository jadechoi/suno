const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const c=vm.createContext({console});for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const relation={id:'r1',part:'guitar',role:'rhythmic accompaniment',interaction:'answers drums',evidence:[{field:'balance',quote:'Guitar supports drums'}]};
const brief={kind:'song',instrumentalProfile:{balance:'Guitar supports drums',groove:'steady',energy:'restrained'},referenceRelationships:[relation]};
assert.equal(c.filterReferenceUncertainty(brief).referenceRelationships.length,1);
assert.equal(c.filterReferenceUncertainty({...brief,uncertainFields:['instrumentalProfile.balance']}).referenceRelationships.length,0);
assert.equal(c.filterReferenceUncertainty({...brief,referenceRelationships:[{...relation,evidence:[{field:'balance',quote:'Guitar is a solo lead'}]}]}).referenceRelationships.length,0);
const spec={designMode:'reference-type-beat',brief};const contract=c.typeBeatPlan(spec).referenceContract;
assert.equal(contract.relationships[0].role,'rhythmic accompaniment');assert.equal(contract.character.energy,'restrained');
assert.equal(c.typeBeatPlan({...spec,brief:{...brief,referenceRelationships:[]}}).referenceContract.relationships.length,0);
assert.equal(brief.referenceRelationships[0].role,'rhythmic accompaniment');
console.log('PASS: quoted reference relations, excluded evidence, no invented fallback, retained character');
const selection={referenceRelationships:[relation],sound:brief.instrumentalProfile,userOverrides:{},constraints:{structure:[{header:'[Intro]'}]}};
const decision={treatment:'adapt',relationshipIds:['r1'],creativeChoice:'new offbeat chord voicing',benefit:'fresh harmony with same pocket',changeScope:'same-job'};
assert.doesNotThrow(()=>c.validateRoleChanges(selection,{roles:[{roleDecision:decision}]}));
assert.throws(()=>c.validateRoleChanges(selection,{roles:[{roleDecision:{...decision,changeScope:'different-job'}}]}),/source quote/);
assert.throws(()=>c.validateRoleChanges(selection,{roles:[{roleDecision:{...decision,changeScope:'section-exception',sectionHeaders:['[Missing]']}}]}),/sectionHeaders/);
assert.doesNotThrow(()=>c.validateRoleChanges(selection,{roles:[{roleDecision:{...decision,changeScope:'section-exception',sectionHeaders:['[Intro]']}}]}));
assert.doesNotThrow(()=>c.validateRoleChanges({...selection,userOverrides:{instruments:'Expressive guitar solo foreground'}},{roles:[{roleDecision:{...decision,changeScope:'different-job',changeEvidence:{kind:'user',field:'instruments',quote:'Expressive guitar solo foreground'}}}]}));

// Missing structured relations must not bypass grounding of retained roles.
const fallback={...selection,referenceRelationships:[],referenceContract:{unstructuredRoleEvidence:brief.instrumentalProfile}};
assert.throws(()=>c.validateRoleChanges(fallback,{roles:[{roleDecision:{...decision,relationshipIds:[]}}]}),/source quote/);
assert.doesNotThrow(()=>c.validateRoleChanges(fallback,{roles:[{roleDecision:{...decision,relationshipIds:[],changeEvidence:{kind:'reference',field:'balance',quote:'Guitar supports drums'}}}]}));
assert.doesNotThrow(()=>c.validateRoleChanges({}, {roles:[]}));

(async()=>{
 c.getOpenAIKey=()=> 'fixture';let calls=0;
 const fixed={roles:[{roleDecision:decision}]};
 c.callOpenAI=async(_key,request)=>{
  calls++;
  if(calls===1)return JSON.stringify({roles:[{roleDecision:{...decision,changeScope:'different-job'}}]});
  assert.match(request.staticText,/Correct the reported role-decision error/);
  assert.equal(JSON.parse(request.dynamicText).originalInput,'source input');
  return JSON.stringify(fixed);
 };
 const diagnostics=[];
 const result=await c.recoverAiFormat('plan',{staticText:'plan rules',dynamicText:'source input'},raw=>{const p=JSON.parse(raw);c.validateRoleChanges(selection,p);return p;},diagnostics);
 assert.equal(result.roles[0].roleDecision.changeScope,'same-job');
 assert.equal(calls,2);assert.equal(diagnostics[0].status,'failed');assert.equal(diagnostics[1].status,'repaired');
})().catch(e=>{console.error(e);process.exitCode=1;});
