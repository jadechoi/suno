const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({console,AbortSignal});for(const f of ['hh-data.js','reference-v2.js','reference-v3.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext("const st={narrAI:{},extraTags:[],removedPhrases:[]};getOpenAIKey=()=> 'fixture';",c);
const spec={designMode:'reference-type-beat',brief:{referenceVersion:2,referenceIdentity:{status:'identified',artist:'Example Artist'},instrumentalProfile:{mood:'cold playful',groove:'elastic bass over straight kick'},analysisEvidence:{mood:{basis:"model-knowledge",scope:"track",reason:"specific recollection"},groove:{basis:"model-knowledge",scope:"track",reason:"specific recollection"}}},bpm:124,key:null,vocal:null,structure:[{header:'[Intro]'},{header:'[Instrumental Hook 1]'}],selectionOrigins:{},limits:{section:5000}};
const plan={vocalHandling:{soundPolicy:'No voices; preserve the elastic bass groove.',roleStrategy:'leave-space',benefit:'리듬 중심 반주 공간을 유지'},identity:'차가운 베이스',identityCore:{relationship:'Elastic bass leads; clipped synth accents answer its rests.'},roles:[{part:'rubbery synth bass',function:'rhythmic identity',performance:'late bounce with rests',fitReason:'곡에 맞는 선택',sourceTreatment:'preserve',decisionBasis:{kind:'reference',field:'groove',explanation:'elastic bass over straight kick'}}],sections:spec.structure.map((s,i)=>({...s,direction:i?'Bring in the straight kick.':'Expose the bass gesture.',benefit:'대비',vocalMode:'instrumental'}))};
const output={style:'Instrumental club beat at 124 BPM. Cold playful elastic bass bounces against a straight kick, with clipped synth accents in its rests. No vocals.',sections:plan.sections,lyrics:''};
(async()=>{
 const expanded={vocalHandling:{roleStrategy:'instrumental-adaptation. Keep the piano figure underneath.',benefit:'Local melody supports the intimate arc.'}};
 c.normalizeReferenceV3Strategy(expanded);
 assert.equal(expanded.vocalHandling.roleStrategy,'instrumental-adaptation');
 assert.match(expanded.vocalHandling.benefit,/Keep the piano/);
 const ambiguous={vocalHandling:{roleStrategy:'maybe mixed or leave-space',benefit:'uncertain'}};
 c.normalizeReferenceV3Strategy(ambiguous);assert.equal(ambiguous.vocalHandling.roleStrategy,'maybe mixed or leave-space');
 const calls=[];let writers=0;
 c.callOpenAI=async(k,r)=>{if(r.staticText.includes('Propose an optional local'))return JSON.stringify({changes:[]});calls.push(r);if(r.staticText.includes('Create one coherent'))return JSON.stringify(plan);if(r.staticText.includes('Assess the actual')||r.staticText.includes('Compare output'))return JSON.stringify({issues:[]});writers++;return JSON.stringify(writers===1?{...output,style:output.style+' 설명 누출'}:output);};
 const result=await c.writeReferenceV3({spec,musicPlan:await c.buildReferenceV3({mode:'create',spec})});
 assert.equal(result.musicPlan.referenceVersion,3);assert.equal(result.style,output.style);assert.equal(writers,2);
 const shared=vm.runInContext('REFERENCE_V3_ROLE_FIT',c);
 assert.ok(calls.find(r=>r.staticText.includes('Create one coherent')).staticText.includes(shared));
 assert.ok(calls.find(r=>r.staticText.includes('Assess the actual')).staticText.includes(shared));
 const writes=calls.filter(x=>x.staticText.includes('Render the approved'));
 const input=JSON.parse(writes[0].dynamicText);assert.equal(input.design.roles[0].fitReason,undefined);assert.equal(input.design.sections[0].benefit,undefined);assert.equal(input.analysis,undefined);
 assert.match(JSON.parse(writes[1].dynamicText).candidate.style,/설명/);
 assert.equal((await c.refineMusicPlan(spec,result.musicPlan)),result.musicPlan);
 calls.length=0;await c.buildReferenceV3({mode:'edit',spec,prev:result,context:{narrAI:{hook1:'Delay final bass pickup'}}});
 const edit=JSON.parse(calls[0].dynamicText);assert.equal(edit.previous.referenceVersion,3);assert.match(edit.feedback.narrAI.hook1,/Delay/);
 assert.ok(c.referenceV3DesignIssues(null,spec).length);
 assert.ok(c.referenceV3DesignIssues({...plan,sections:{}},spec).length);
 // Real failed runs must be rejected before publication.
 for(const row of JSON.parse(fs.readFileSync('reports/reference-v3-comparison.json'))){
   assert.ok(c.referenceV3DesignIssues(row.plan,row.spec).some(x=>x.includes('placeholder')));
 }
 let designs=0;const repairInputs=[];
 c.callOpenAI=async(k,r)=>{if(r.staticText.includes('Propose an optional local'))return JSON.stringify({changes:[]});if(r.staticText.includes('Assess the actual'))return JSON.stringify({issues:[]});repairInputs.push(JSON.parse(r.dynamicText));designs++;return JSON.stringify(designs===1?{...plan,identityCore:{relationship:'English baseline relationship'}}:plan);};
 const repaired=await c.buildReferenceV3({mode:'create',spec});assert.equal(designs,2);assert.match(repairInputs[1].issues[0],/placeholder/);assert.equal(repaired.identityCore.relationship,plan.identityCore.relationship);
 designs=0;c.callOpenAI=async()=>{designs++;return JSON.stringify({...plan,identityCore:{relationship:'English baseline relationship'}});};
 await assert.rejects(()=>c.buildReferenceV3({mode:'create',spec}),e=>!!e.failedPlan&&e.diagnostics.length>0);assert.equal(designs,2);
 const mismatched={...plan,vocalHandling:{...plan.vocalHandling,roleStrategy:'retain-vocal'}};
 assert.ok(c.referenceV3DesignIssues(mismatched,spec).length);
 assert.equal(c.referenceV3DesignIssues({...plan,vocalHandling:{...plan.vocalHandling,roleStrategy:'instrumental-adaptation'}},spec).length,0);
 // A role-fit finding is delivered to the existing bounded repair without banning a lead.
 let designCalls=0;const roleRepair=[];
 const unsupported={...plan,roles:[{...plan.roles[0],fitReason:'Every instrumental needs a new lead.'}]};
 c.callOpenAI=async(k,r)=>{if(r.staticText.includes('Propose an optional local'))return JSON.stringify({changes:[]});
  if(r.staticText.includes('Assess the actual'))return JSON.stringify({issues:designCalls===1?[{quote:unsupported.roles[0].fitReason,reason:'Generic need does not explain benefit to this groove.'}]:[]});
  roleRepair.push(JSON.parse(r.dynamicText));designCalls++;return JSON.stringify(designCalls===1?unsupported:plan);
 };
 const accepted=await c.buildReferenceV3({mode:'create',spec});
 assert.equal(designCalls,2);assert.match(roleRepair[1].issues.join(' '),/Generic need/);
 assert.equal(accepted.roles[0].part,plan.roles[0].part);
 // Evidence-backed design drift triggers local rewrite; deliberate exceptions remain.
 let writeCount=0;const rewriteInputs=[];
 c.callOpenAI=async(k,r)=>{if(r.staticText.includes('Propose an optional local'))return JSON.stringify({changes:[]});
  if(r.staticText.includes('Compare output'))return JSON.stringify({issues:writeCount===1?[{quote:'Add octave doubling.',reason:'Unplanned register/texture change',designBasis:'Hook only adds straight kick.'}]:[]});
  rewriteInputs.push(JSON.parse(r.dynamicText));writeCount++;
  return JSON.stringify(writeCount===1?{...output,sections:output.sections.map((s,i)=>({...s,direction:s.direction+(i?' Add octave doubling.':'')}))}:output);
 };
 const fixed=await c.writeReferenceV3({spec,musicPlan:repaired});assert.equal(writeCount,2);assert.doesNotMatch(fixed.section,/octave doubling/);assert.match(rewriteInputs[1].candidate.section,/octave doubling/);assert.match(rewriteInputs[1].issues.join(' '),/approved design/);
 for(const version of ['v1','v2']){const m=JSON.parse(fs.readFileSync('versions/'+version+'/manifest.json'));for(const [f,h]of Object.entries(m.files))assert.equal(require('crypto').createHash('sha256').update(fs.readFileSync('versions/'+version+'/'+f)).digest('hex'),h);}
 console.log('V3: separate design/publication, cumulative repair, feedback, dispatch and version snapshots OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
