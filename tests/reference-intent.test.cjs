const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({console});const run=s=>vm.runInContext(s,ctx);
for(const f of ['hh-data.js','hh-ai.js'])run(fs.readFileSync(f,'utf8'));
run(`const HH_VOCAL_STYLE=[],HH_VOCAL_CHAR=[];const st={genre:null,melody:['Dark synth'],vocal:'No Vocal',brief:{kind:'song',styleTags:['pulsing bass beneath whispered vocals'],cues:{hook:'driving bass and vocals'},instrumentalProfile:{genre:'electroclash',groove:'steady club pulse'}}};setInstrumentMenus=()=>{};pickCompatibleTextures=x=>x;`);
assert.doesNotMatch(run('BRIEF_STATIC'),/가장 좋은 힙합 장르|아래 힙합 장르/);
assert.match(run('briefOptionsText()'),/UK Garage/);
const p=ctx.buildBriefProposal('Reference',{kind:'song',genre:'UK Garage',instrumentalProfile:{genre:'electroclash',bass:'gritty repeating bass'}});
assert.equal(run(`GENRES[${p.v.genre}].tag`),'uk garage');
assert.equal(p.instrumentalProfile.genre,'electroclash');
const unknown=ctx.buildBriefProposal('Reference',{kind:'song',genre:null,instrumentalProfile:{genre:'electroclash'}});
assert.equal(unknown.v.genre,-1);assert.equal(unknown.items[0].id,'sound');
assert.match(ctx.effectiveBrief().cues.hook,/driving bass/);
run(`st.referenceSelections={melody:['Dark synth']};`);
assert.equal(ctx.referenceSelectionOrigins().melody,'ai-reference');
run(`st.melody=['Piano'];`);assert.equal(ctx.referenceSelectionOrigins().melody,'current-selection');
const app=fs.readFileSync('app.js','utf8');
run(app.match(/function onVocalChange\(\)\{[^}]*\}/)[0]);
let structures=0;ctx.recommendVocalChar=()=>{};ctx.syncLyricBox=()=>{};ctx.onStructSignalChange=()=>structures++;
ctx.onVocalChange();assert.equal(structures,0);
assert.match(run('WRITE_STATIC'),/ai-reference/);
console.log('PASS: independent reference profile, non-hiphop mapping, provenance and vocal-only changes.');

const uncertain={kind:'song',genre:'Reggaeton',melodyBackground:'Strings',instrumentalProfile:{groove:'steady dembow',instruments:'guessed strings'},cues:{bridge:'orchestral rise'},uncertainFields:['melodyBackground','instrumentalProfile.instruments','cues.bridge','__proto__.bad']};
const filtered=ctx.filterReferenceUncertainty(uncertain);
assert.equal(filtered.melodyBackground,null);
assert.equal(filtered.instrumentalProfile.instruments,undefined);
assert.equal(filtered.instrumentalProfile.groove,'steady dembow');
assert.equal(filtered.cues.bridge,undefined);
assert.equal(filtered.uncertainFields.length,3);
assert.equal(uncertain.melodyBackground,'Strings');
assert.equal(ctx.filterReferenceUncertainty({...uncertain,kind:'vibe'}).melodyBackground,'Strings');
const proposal=ctx.buildBriefProposal('Reference',uncertain);
assert.equal(proposal.v.bg,null);
assert.equal(proposal.uncertainFields.length,3);

const balance=ctx.buildBriefProposal('Reference',{kind:'song',genre:'Reggaeton',instrumentalProfile:{balance:'guitar behind drums',activity:'sparse',timbreSpace:'dry',vocalSpace:'open center'},uncertainFields:['instrumentalProfile.timbreSpace']});
assert.equal(balance.instrumentalProfile.balance,'guitar behind drums');
assert.equal(balance.instrumentalProfile.activity,'sparse');
assert.equal(balance.instrumentalProfile.vocalSpace,'open center');
assert.equal(balance.instrumentalProfile.timbreSpace,undefined);

const fixed=JSON.parse(fs.readFileSync('tests/fixtures/despacito-type-beat.json','utf8'));
const plan=ctx.typeBeatPlan(fixed.spec);
assert.equal(plan.constraints.bpm,178);
assert.equal(plan.constraints.key,'D major');
assert.equal(plan.userOverrides.instruments,undefined);
assert.equal(plan.genrePalette,undefined);
assert.equal(plan.lead,undefined);
assert.equal(JSON.stringify(plan).includes('Generic pad'),false);
assert.equal(JSON.stringify(plan).includes('Do not duplicate'),false);
assert.equal(ctx.typeBeatPlan({...fixed.spec,selectionOrigins:{melody:'current-selection'}}).userOverrides.instruments[0],'Nylon-string guitar');
// The same projection supports any reference; no genre-specific branching.
const club=ctx.typeBeatPlan({...fixed.spec,referenceSong:'Another reference',lead:'Synth bass',background:null,brief:{instrumentalProfile:{balance:'Bass riff foreground, stabs sparse'}}});
assert.equal(club.sound.balance,'Bass riff foreground, stabs sparse');

const evidenceInput={kind:'song',instrumentalProfile:{groove:'dembow',balance:'loud guitar'},analysisEvidence:{groove:{basis:'model-knowledge',reason:'recognizable dembow pulse'},balance:{basis:'inference',reason:'assumed from instrument name'}},cues:{hook:'loud guitar solo',verse:'steady pulse'},cueBasis:{hook:['balance'],verse:['groove']}};
const grounded=ctx.filterReferenceUncertainty(evidenceInput);
assert.equal(grounded.instrumentalProfile.balance,undefined);
assert.equal(grounded.cues.hook,undefined);
assert.equal(grounded.cues.verse,'steady pulse');
assert.equal(grounded.analysisEvidence.balance.basis,'inference');
assert.equal(ctx.filterReferenceUncertainty({...evidenceInput,kind:'vibe'}).instrumentalProfile.balance,'loud guitar');
assert.equal(evidenceInput.instrumentalProfile.balance,'loud guitar');
ctx.escHtml=s=>String(s).replaceAll('<','&lt;');
const detail=ctx.briefAnalysisDetails(evidenceInput);
assert.match(detail,/추정 · 작성에서 제외/);
assert.match(detail,/모델 지식 · 음원 미검증/);
assert.doesNotMatch(detail,/loud guitar/);

// Missing or malformed evidence is not explicit uncertainty; repeated filtering is stable.
for(const analysisEvidence of [{},{genre:{basis:'unexpected'}},{genre:{basis:'model-knowledge'}}]){
 const input={kind:'song',genre:'Reggaeton',drums:['Dembow kick & snare'],instrumentalProfile:{genre:'reggaeton',groove:'dembow'},analysisEvidence,cues:{hook:'steady dembow'}};
 const once=ctx.filterReferenceUncertainty(input),twice=ctx.filterReferenceUncertainty(once);
 assert.equal(twice.genre,'Reggaeton');assert.equal(twice.instrumentalProfile.groove,'dembow');
 assert.equal(twice.analysisEvidence.genre.basis,'unrecorded');assert.equal(twice.cues.hook,'steady dembow');
 assert.equal(twice.uncertainFields.length,0);
}
const explicitlyUnknown=ctx.filterReferenceUncertainty({kind:'song',genre:'Reggaeton',instrumentalProfile:{genre:'reggaeton'},analysisEvidence:{genre:{basis:'unknown',reason:'not known'}}});
assert.equal(explicitlyUnknown.genre,null);
assert.equal(explicitlyUnknown.instrumentalProfile.genre,undefined);
const sparsePlan=ctx.typeBeatPlan({...fixed.spec,brief:{instrumentalProfile:{genre:'reggaeton',groove:'dembow'},analysisEvidence:{}}});
assert.equal(sparsePlan.roleEvidenceMissing,true);
assert.ok(sparsePlan.missingSoundFields.includes('instruments'));
assert.match(ctx.writingInstructions({designMode:'reference-type-beat'}),/정보가 부족한 타입비트의 작성 경계/);
assert.doesNotMatch(ctx.writingInstructions({designMode:'original-song'}),/정보가 부족한 타입비트의 작성 경계/);

// Type-beat writing no longer inherits title re-analysis or menu lead enforcement.
const typeInstructions=ctx.writingInstructions({designMode:'reference-type-beat'});
assert.doesNotMatch(typeInstructions,/referenceSong이 있으면 곡 제목과 아티스트를 보고/);
assert.doesNotMatch(typeInstructions,/명세의 lead\/background는 스타일 또는 섹션에서/);
assert.match(typeInstructions,/Hook은 구조상의 구간 이름/);
assert.match(typeInstructions,/\[무보컬과 보컬 — 사용자 선택 최우선\]/);
assert.match(typeInstructions,/\[출력 계약/);
assert.match(ctx.writingInstructions({designMode:'original-song'}),/명세의 lead\/background는 스타일 또는 섹션에서/);
