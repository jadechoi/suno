// V3 reuses V2 source research; composition decisions and publication are separate.
const REFERENCE_V3_ROLE_FIT="Evaluate role changes against the retained reference relationship and explicit user intention, not the new design's self-description. For every adapted or new role, fitReason states the supported original job (or unknown), proposed job and section scope, and the concrete audible benefit compared with retaining the job or leaving its space available. Explain how mood, felt groove and energy survive. A source naming an instrument supports its presence, not a new leadership role. Treat invented role changes as creative adaptations. Needing a memorable instrumental hook, replacing the singer, making the final hook bigger or adding emotional depth alone are generic purposes, not song-specific benefits. A new lead, expressive piano melody or fuller hook is valid when this particular intention benefits. Judge the combined changes across roles and sections: individually modest additions can collectively displace the intended center. Neither sparseness nor rhythm over melody is a universal goal.";
const REFERENCE_V3_DESIGN=`Create one coherent musical design, not finished prompts. Retain supported reference mood, felt groove, timbres and energy while composing new music. Choose sounds, musical jobs and techniques for this song. User choices take precedence over automatic menus.
Return a JSON object with identity (Korean summary), identityCore (relationship, openChoices, anchors and driftRisks), vocalHandling (soundPolicy, roleStrategy, benefit), roles and sections. Write actual musical decisions in every field, never schema labels or language instructions. identityCore.relationship must first identify what drives the intended experience and how other parts participate, distinguishing timbral identity from musical leadership. A recognizable sound need not lead continuously; a melody-led intention may require it upfront. Shared leadership is valid. Infer priority from intention and supported relationships, not genre defaults, instrument list order or mandatory drum/bass leadership. Scope foreground exceptions to their sections. identityCore.relationship must explain this song's audible interaction between its concrete parts, their prominence, groove and emotional character. anchors and driftRisks are arrays of English strings; openChoices explains what may vary while preserving that relationship.
Each role has part, function, performance, fitReason, and sourceTreatment (preserve, adapt or new). fitReason explains the source evidence or uncertainty, and the concrete benefit of a creative decision. ${REFERENCE_V3_ROLE_FIT} Each role also has decisionBasis:{kind:"reference|user|creative",field:"contract feature or explicit user choice key, empty for creative",explanation:"why this evidence supports this musical job"}. Use reference only for a retained field in evidenceContract.features; its evidence status remains binding (interpretation/recollection is not a verified observation). Use user only for evidenceContract.userChoices, never automatic menu values. Use creative for your own instrument, articulation or role choice, even if inspired by the reference. Creative choices use sourceTreatment new or adapt, not preserve. A reference-linked choice does not make invented performance details facts about the recording. Each section has the exact supplied header, direction, benefit and vocalMode (instrumental or lyrics). Musical decisions are English; identity, fitReason and benefit are Korean explanations.
For an instrumental type beat, decide soundPolicy separately from roleStrategy: remove actual voices and voice-like sounds while preserving suitable accompaniment relationships and available performer space. roleStrategy chooses leave-space, instrumental-adaptation or mixed; benefit explains why this choice fits the intention. Do not automatically transfer the removed singer's melodic prominence to guitar, synth or any other part. An established instrumental hook may remain prominent. An intentional instrumental adaptation is allowed when its benefit serves this particular beat, beyond replacing the missing singer. For a vocal song use roleStrategy retain-vocal and preserve its intended vocal function. Neither lead presence nor absence is a quality target.
Use evidenceContract as the provenance boundary. Its unresolved entries are missing knowledge, not an instruction to add or remove an instrument. Do not reconstruct excluded claims from summaries or prior plans. Keep supported mood and groove while making honest creative decisions where the source is incomplete. In feedback edits re-evaluate changed decisions against current evidence and userChoices. Establish the intro, then state only necessary changes or purposeful returns from the baseline. A scoped technique exception is allowed. Choose expansion, reduction, variation or continuation for a musical benefit, not a mandatory climax. Preserve supplied BPM/key and explicit choices. Do not write style or lyrics. In edits change requested decisions and their consequences only.`;
function normalizeReferenceV3Strategy(plan){
  const handling=plan?.vocalHandling;
  const match=typeof handling?.roleStrategy==='string'&&handling.roleStrategy.match(/^(leave-space|instrumental-adaptation|mixed|retain-vocal)\.\s+([\s\S]+)$/);
  if(match&&typeof handling.benefit==='string'){
    handling.roleStrategy=match[1];
    handling.benefit+='\n'+match[2];
  }
  return plan;
}
function referenceV3DesignIssues(plan,spec){
  const issues=[];
  const text=v=>typeof v==='string'&&v.trim();
  if(!text(plan?.identityCore?.relationship)||/^(?:English baseline relationship|baseline relationship|English creative freedom)$/i.test(plan.identityCore.relationship.trim()))issues.push('identityCore.relationship must contain the actual audible relationship, not a schema placeholder.');
  if(!Array.isArray(plan?.roles)||!plan.roles.length||plan.roles.some(r=>!r||!['part','function','performance','fitReason'].every(k=>text(r[k]))||!['preserve','adapt','new'].includes(r.sourceTreatment)))issues.push('Supply complete concrete roles with sourceTreatment and song-specific fitReason.');
  if(!Array.isArray(plan?.sections)||JSON.stringify(plan.sections.map(s=>s?.header))!==JSON.stringify(spec.structure.map(s=>s.header))||plan.sections.some(s=>!text(s?.direction)||!['instrumental','lyrics'].includes(s.vocalMode)))issues.push('Supply the requested section order, directions and vocalMode.');
  const instrumental=!spec.vocal||spec.vocal==='No Vocal';
  if(!text(plan?.vocalHandling?.soundPolicy)||!text(plan?.vocalHandling?.benefit)||!(instrumental?['leave-space','instrumental-adaptation','mixed']:['retain-vocal']).includes(plan?.vocalHandling?.roleStrategy))issues.push('Decide vocal sound policy and musical role strategy separately for the requested vocal mode.');
  if(instrumental&&Array.isArray(plan?.sections)&&plan.sections.some(s=>s?.vocalMode!=='instrumental'))issues.push('Instrumental output requires instrumental section modes.');
  return issues;
}
function referenceV3EvidenceContract(analysis,spec){
  const selection=typeBeatPlan({...spec,brief:analysis});
  return {
    features:Object.fromEntries(Object.entries(analysis.instrumentalProfile||{}).map(([field,description])=>[field,{description,...analysis.analysisEvidence?.[field]}])),
    unresolved:Object.fromEntries(Object.entries(analysis.analysisEvidence||{}).filter(([field])=>!analysis.instrumentalProfile?.[field]).map(([field,e])=>[field,e.status||'evidence-missing'])),
    userChoices:selection.userOverrides
  };
}
function referenceV3ProvenanceIssues(plan,contract){
  return (Array.isArray(plan?.roles)?plan.roles:[]).flatMap(role=>{
    const b=role.decisionBasis;
    if(!b||!['reference','user','creative'].includes(b.kind)||typeof b.explanation!=='string'||!b.explanation.trim())return ['Role '+role.part+': specify decisionBasis and its explanation.'];
    if(b.kind==='reference'&&!Object.hasOwn(contract.features,b.field))return ['Role '+role.part+': reference field is not retained; use a justified creative decision instead of claiming a source fact.'];
    if(b.kind==='user'&&!Object.hasOwn(contract.userChoices,b.field))return ['Role '+role.part+': this is not an explicit user choice.'];
    if(b.kind==='creative'&&role.sourceTreatment==='preserve')return ['Role '+role.part+': a creative choice cannot claim preservation of an established source role.'];
    return [];
  });
}
async function reviewReferenceV3Design(plan,spec,analysis,diagnostics){
  const evidenceContract=referenceV3EvidenceContract(analysis,spec);
  const issues=[...referenceV3DesignIssues(plan,spec),...referenceV3ProvenanceIssues(plan,evidenceContract)];if(issues.length)return issues;
  const audit=await referenceV2Json('reference-v3-design-review',`Assess the actual musical decisions, not prose polish. Return {issues:[{quote,reason}]}; quote must be an exact substring of the design. Check whether the baseline is a real, coherent interaction of concrete roles, mood and groove rather than a generic label. Compare roles and section exceptions to that relationship and user conditions. ${REFERENCE_V3_ROLE_FIT} Compare original and proposed jobs and the stated benefit against evidenceContract before deciding. Flag generic-only justifications with the exact design quote and the retained relationship at risk. Check decisionBasis against evidenceContract: a cited feature must support the claimed role, not merely name the instrument. A user citation must come from explicit choices; a creative choice must not be described as a source fact. Interpretation and model recollection remain uncertain. Do not treat missing knowledge as a ban on creative parts. Distinguish source vocals from new instrumental roles. Flag an automatic promotion of accompaniment or replacement of singers only when its stated justification is merely their absence or conflicts with the intended beat; allow a reasoned creative adaptation, prominent original instrumental hook, and normal expressive instrumental phrasing. Do not demand removal of guitar, fewer instruments, a lead, or a final climax. Source uncertainty is not proof of an incorrect role. Give no speculative improvements. Empty issues means no evidenced conflict.`,{design:plan,evidenceContract,conditions:musicConditions(spec)},diagnostics);
  if(!Array.isArray(audit?.issues)||audit.issues.some(x=>typeof x?.quote!=='string'||!x.quote.trim()||!JSON.stringify(plan).includes(JSON.stringify(x.quote).slice(1,-1))||typeof x.reason!=='string'||!x.reason.trim()))throw new Error('V3 설계 검토 형식 오류 — 설계 원문은 진단에 보존했습니다.');
  return audit.issues.map(x=>x.quote+': '+x.reason);
}
// Each entry names an existing role and section; the change set never replaces the baseline.
function applyReferenceV3Change(base,change){
  const keys=['roleIndex','sectionIndex','direction','benefit'];
  if(!change||Object.keys(change).some(k=>!keys.includes(k))||!keys.every(k=>Object.hasOwn(change,k))||
    !Number.isInteger(change.roleIndex)||!base.roles[change.roleIndex]||
    !Number.isInteger(change.sectionIndex)||!base.sections[change.sectionIndex]||
    !['direction','benefit'].every(k=>typeof change[k]==='string'&&change[k].trim()))throw new Error('V3 구간 후보 범위 오류 — 기존 악기·구간 하나의 변경만 허용합니다.');
  const next=JSON.parse(JSON.stringify(base));
  const section=next.sections[change.sectionIndex];
  section.direction+='\nLocal exception for '+base.roles[change.roleIndex].part+': '+change.direction;
  section.benefit=(section.benefit||'')+'\n'+change.benefit;
  return next;
}
function applyReferenceV3Changes(base,changes){
  if(!Array.isArray(changes))throw new Error('V3 변경 목록 형식 오류');
  const seen=new Set();
  return changes.reduce((plan,change)=>{
    const id=change?.roleIndex+':'+change?.sectionIndex;
    if(seen.has(id))throw new Error('V3 동일 파트·구간의 변경은 하나로 합쳐주세요.');
    seen.add(id);
    return applyReferenceV3Change(plan,change);
  },base);
}
async function selectReferenceV3Change(base,spec,analysis,diagnostics){
  const proposal=await referenceV2Json('reference-v3-local-candidate',`Propose an optional local role variation within an approved shared musical design. Return {changes:[]} if its existing development already serves the intention. Otherwise return {changes:[{roleIndex,sectionIndex,direction,benefit}]} only. Propose one coherent set of necessary coordinated changes, with no fixed count. Each entry names an existing role and section; combine repeated changes to the same role/section into one entry. Indices refer to the supplied existing arrays. Never return a new baseline, roles, instruments or sections. Change only the explicitly listed roles in their listed sections; state the scope and return to baseline. Multiple instruments may interact and multiple sections may change when that serves the musical intention. Describe each part's contribution in its own entry, without silently changing unlisted parts. Preserve mood, felt groove, timbre, energy, harmony, other parts and explicit conditions. English direction, Korean concrete benefit compared with leaving the section as it is. Do not require a melody or climax because vocals are absent. Do not restate the section inventory. The purpose is an appropriate instrumental listening result, not obligatory space for a future singer.`,{sharedDesign:base,conditions:musicConditions(spec)},diagnostics);
  if(!proposal||Object.keys(proposal).length!==1||!Object.hasOwn(proposal,'changes'))throw new Error('V3 구간 후보 형식 오류');
  if(Array.isArray(proposal.changes)&&proposal.changes.length===0){diagnostics.push({stage:'reference-v3-local-selection',accepted:false,reason:'No change proposed'});return base;}
  const candidate=applyReferenceV3Changes(base,proposal.changes);
  const audit=await referenceV2Json('reference-v3-local-comparison',`Compare the unchanged approved design with the complete coordinated change set. Evaluate the combined effect and interactions across sections, not just each entry separately. Return {scopeValid:boolean,decision:"keep|apply",reason:"concrete musical gain/cost or uncertainty"}. First check the actual direction: only explicitly listed existing roles in their listed sections may change. Coordinated changes to multiple parts are valid; do not impose a part or section count. Reject hidden additions of instruments, unlisted parts' changes, shifts of overall mood/groove/timbre/energy, permanent leadership changes, or conflicting instructions. A deliberate scoped role exception is allowed. Compare with retained reference evidence and explicit choices. Do not believe a candidate's claimed benefit without examining audible instructions. Neither a melody nor fewer instruments is better by default. Keep when benefit is unclear or scope invalid. No listening claims.`,{sharedDesign:base,changes:proposal.changes.map(x=>({part:base.roles[x.roleIndex].part,header:base.sections[x.sectionIndex].header,direction:x.direction})),combinedDesign:referenceV3Publication(candidate),evidenceContract:referenceV3EvidenceContract(analysis,spec),conditions:musicConditions(spec)},diagnostics);
  if(typeof audit?.scopeValid!=='boolean'||!['keep','apply'].includes(audit.decision)||typeof audit.reason!=='string'||!audit.reason.trim())throw new Error('V3 구간 후보 비교 형식 오류');
  const accepted=audit.scopeValid&&audit.decision==='apply';
  diagnostics.push({stage:'reference-v3-local-selection',accepted,changes:proposal.changes,reason:audit.reason});
  return accepted?candidate:base;
}
async function buildReferenceV3({mode,spec,prev,repair,diagnostics=[],context}){
  let analysis=spec.brief;
  if(![2,3].includes(analysis?.referenceVersion))analysis=await analyzeReferenceV2(spec.referenceSong||'',analysis,getOpenAIKey(),diagnostics);
  if(analysis.referenceIdentity?.status!=='identified')throw Object.assign(new Error('레퍼런스의 정확한 곡·버전을 확인해주세요.'),{code:'reference_incomplete'});
  analysis=filterReferenceV2(analysis);
  if(!analysis.instrumentalProfile.mood||!analysis.instrumentalProfile.groove)throw Object.assign(new Error('레퍼런스 무드·그루브를 확인할 정보가 부족합니다.'),{code:'reference_incomplete'});
  const request={referenceIdentity:analysis.referenceIdentity,evidenceContract:referenceV3EvidenceContract(analysis,spec),conditions:musicConditions(spec),structure:spec.structure,mode,previous:mode==='edit'?prev?.musicPlan:null,feedback:context||{narrAI:st.narrAI,extraTags:st.extraTags,removedPhrases:st.removedPhrases},repair};
  let plan,issues=[];
  for(let attempt=0;attempt<2;attempt++){
    plan=await referenceV2Json('reference-v3-design',REFERENCE_V3_DESIGN,attempt?{...request,failedPlan:plan,issues,instruction:'Repair only reported decisions and their consequences; retain valid choices.'}:request,diagnostics);
    plan=normalizeReferenceV3Strategy(plan);
    issues=await reviewReferenceV3Design(plan,spec,analysis,diagnostics);
    diagnostics.push({stage:'reference-v3-design-validation',attempt,plan,issues});
    if(!issues.length)break;
  }
  if(issues.length)throw Object.assign(new Error('V3 음악 관계를 확정하지 못했습니다: '+issues.join(' / ')),{diagnostics,failedPlan:plan});
  if(mode==='create'&&!repair)plan=await selectReferenceV3Change(plan,spec,analysis,diagnostics);
  return {...plan,referenceVersion:3,referenceAnalysis:analysis,parameters:{bpm:spec.bpm,key:spec.key},directSectionRendering:true};
}
function referenceV3Publication(plan){
  return {baseline:plan.identityCore.relationship,roles:plan.roles.map(({part,function:job,performance})=>({part,job,performance})),sections:plan.sections.map(({header,direction,vocalMode})=>({header,direction,vocalMode})),parameters:plan.parameters};
}
async function writeReferenceV3({spec,musicPlan,errors=[],failed,diagnostics=[]}){
  const planIssues=referenceV3DesignIssues(musicPlan,spec);
  if(planIssues.length)throw Object.assign(new Error('V3 미확정 설계는 작성할 수 없습니다: '+planIssues.join(' / ')),{diagnostics,failedPlan:musicPlan});
  const design=referenceV3Publication(musicPlan);
  const userChoices=typeBeatPlan(spec).userOverrides;
  const intent={mood:userChoices.mood||musicPlan.referenceAnalysis?.instrumentalProfile?.mood||null,instrumental:!spec.vocal||spec.vocal==='No Vocal'};
  let candidate=failed?.style?{style:failed.style,section:failed.section,lyrics:failed.lyrics||''}:null;
  let issues=[...errors];
  for(let attempt=0;attempt<3;attempt++){
    const out=await referenceV2Json('reference-v3-write',`Render the approved musical design as natural English Suno instructions. Return {style,sections:[{header,direction}],lyrics}. Style states the shared mood, felt groove, central audible behavior and supporting relationships. Preserve intent.mood's specific emotional character, not just generic intimacy, restraint or polish; natural synonyms are welcome and explicit user mood overrides the reference. If intent.instrumental is true, state an unambiguous instrumental-only or no-vocals instruction in style; a piano-only inventory alone is insufficient. Express the baseline leadership relationship early, preserving which parts drive the experience and which color or answer it. Describing a timbre vividly does not authorize promoting its role. Preserve this priority during compression and feedback edits unless the approved design changes it. Section directions inherit it and state only the entry, meaningful change or return, including intentional technique exceptions. Express an existing decision with natural musical synonyms, but do not add instruments, techniques, register changes, density increases, doubling, fills or effects absent from the approved baseline and that section. Carry forward unchanged roles implicitly; a section is not a restatement of the baseline inventory. State the distinctive musical action and only the context needed to interpret it; do not repeat assurances about restraint, unchanged groove or unchanged inventory in every section. Keep necessary details and local exceptions. Distinguish piano sustain-pedal resonance from room/hall ambience or reverb: pedaling changes string sustain and resonance, not the acoustic room or reverb processor. Do not invent an effects prohibition when the design allows natural reverb. Explanations and source observations are not performance instructions. No artist names or internal analysis labels. Keep style within 1000 characters and joined sections (headers and parentheses included) within sectionBudget. Prioritize musical identity, not instrument checklists; no character cutting. Include supplied BPM and key in style; omit unset values entirely rather than printing null or discussing missing metadata. When BPM is subdivision-counted, preserve the approved felt groove. Preserve supplied lyrics exactly. Otherwise generate lyrics only when lyricsRequested, following lyricPlan; leave lyrics empty when not requested. Explicit userChoices remain binding during rendering and repair; automatic menu suggestions are not user requests. Express their audible effect naturally, not as a checklist. Resolve reported issues locally in the current candidate, maintaining valid choices.`,{design,intent,userChoices,conditions:musicConditions(spec),sectionBudget:spec.limits?.section||5000,lyricPlan:spec.lyricPlan,lyricsRequested:!!spec.lyrics,previousLyrics:spec.prevLyrics||'',candidate,issues},diagnostics);
    if(typeof out.style!=='string'||!Array.isArray(out.sections)||JSON.stringify(out.sections.map(s=>s.header))!==JSON.stringify(design.sections.map(s=>s.header))||out.sections.some(s=>typeof s.direction!=='string'))throw new Error('V3 작성 형식 오류 — 원문은 진단에 보존했습니다.');
    candidate={style:promptPlainText(out.style),section:promptPlainText(out.sections.map(s=>s.header+'\n('+s.direction.trim().replace(/^\(([\s\S]*)\)$/,'$1')+')').join('\n\n')),lyrics:spec.prevLyrics||out.lyrics||''};
    diagnostics.push({stage:'reference-v3-candidate',attempt,output:candidate});
    issues=[...validateWritten(spec,candidate.section,candidate.style,{lyrics:candidate.lyrics}).errors];
    if(/[가-힣]/.test(candidate.style+'\n'+candidate.section))issues.push('Translate performance instructions into English; remove explanations rather than translating them into extra directions.');
    const audit=await referenceV2Json('reference-v3-coherence','Compare output with approved design and explicit constraints only. Return {issues:[{quote,reason,designBasis}]}. For each output section compare against the baseline PLUS its matching section direction, not every direction in the song. Report additions or contradictions in instrument role, playing technique, register, rhythmic activity, density, doubling and effects. quote is an exact output substring; designBasis states the relevant approved decision, or explicitly says no decision authorizes the addition. Natural paraphrases, implied continuation and explicitly planned local exceptions are valid. Report repeated unchanged inventories only when they introduce ambiguity or obscure the planned change; do not enforce a detail count. Check that userChoices are preserved semantically, allowing natural paraphrases; do not require literal option labels. Check technical meaning: sustain-pedal resonance is not room/hall reverb; flag their conflation and invented effects bans. Flag redundant repeated assurances only when they obscure actual changes, without enforcing brevity or a detail count. Also check intent: the style must retain the specific emotional character of intent.mood, allowing natural synonyms rather than exact words. Generic texture/energy adjectives alone do not preserve sadness, sensuality, playfulness or another supplied emotion. For intent.instrumental require a clear instrumental-only or no-vocals statement in style, not just an instrument inventory. For an omission quote the closest existing style sentence and cite intent as designBasis; repair the omission without changing roles or section exceptions. Do not invent a missing mood when intent.mood is null. Also check positive vocal requests, names and leaked explanations. No-vocal exclusions and singing-like instrumental phrasing are valid; forbidding expressive phrasing solely because the beat is instrumental is not authorized. Do not redesign or request extra detail. Empty issues means no evidenced mismatch.',{design,intent,userChoices,conditions:musicConditions(spec),artist:musicPlan.referenceAnalysis?.referenceIdentity?.artist,output:candidate},diagnostics);
    if(!Array.isArray(audit?.issues)||audit.issues.some(x=>typeof x?.quote!=='string'||!x.quote.trim()||!(candidate.style+'\n'+candidate.section).includes(x.quote)||typeof x.reason!=='string'||typeof x.designBasis!=='string'||!x.designBasis.trim()))throw new Error('V3 일관성 검토 형식 오류 — 후보 출력은 진단에 보존했습니다.');
    issues.push(...audit.issues.map(x=>x.quote+': '+x.reason+' (approved design: '+x.designBasis+')'));
    if(!issues.length)return {...candidate,musicPlan};
  }
  throw Object.assign(new Error('V3 출력 검토: '+issues.join(' / ')),{diagnostics,failedOutput:candidate});
}
