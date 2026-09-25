const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const nodes={};const ctx=vm.createContext({console,setInterval:()=>{},document:{getElementById:id=>nodes[id]??={value:'',style:{}}}});
const run=s=>vm.runInContext(s,ctx),app=fs.readFileSync('app.js','utf8');
for(const f of ['hh-data.js','hh-ai.js'])run(fs.readFileSync(f,'utf8'));
run(app.slice(0,app.indexOf("document.querySelectorAll('.tab-btn')")));
for(const name of ['chipGrid','renderMelodyRoleUI','setAutoHint','clearAutoHint','recommendVocalChar','markPending','renderStructBuilder'])ctx[name]=()=>{};
for(const profile of run('CLUB_PROFILES')){
 ctx.profile=profile;
 run("st.genre=profile.index;setInstrumentMenus('elec');st.mood='차갑고·도발적';st.b808Set=false;recommendMelodyTexture();");
 assert.equal(run('st.melody[0]'),profile.melody[0]);
 assert.equal(ctx.use808(),false);
 assert.ok(run('st.drums.every(d=>HH_DRUMS.includes(d))'));
 assert.ok(run('st.texture.every(t=>HH_TEXTURE.includes(t))'));
 assert.ok(run('st.melody.every(m=>MELODY_ARTICULATION[m]&&MELODY_REGISTER[m])'));
 assert.ok(run('ELEC_GENRES.some(g=>g.tag===profile.tag)'));
 assert.equal(run('buildWriteSpec().genreTag'),profile.tag);
}
run("st.genre=GENRES.findIndex(g=>g.tag==='electroclash');st.mood='차갑고·도발적';st.melody=['Distorted mono synth bass'];st._mtAutoManaged=false;st._808='None';st.b808Set=true;st.bpm=130;st.key=0;st.bpmSet=true;st.keySet=true;");
const spec=ctx.buildWriteSpec();assert.equal(spec.lead,'Distorted mono synth bass');assert.equal(spec.background,null);assert.equal(spec.bass,spec.lead);assert.equal(spec.vocal,null);assert.equal(spec.bpm,130);assert.equal(spec.key,'C major');
const p=ctx.buildBriefProposal('Guess',{genre:'Electroclash',melodyLead:'Distorted mono synth bass',melodyBackground:null,drums:['Four-on-the-floor kick','Dry drum-machine clap'],mood:'차갑고·도발적',bass808:'None'});
assert.equal(p.v.lead,spec.lead);assert.equal(p.v.bg,null);assert.equal(p.v.drums.length,2);
let request;ctx.getOpenAIKey=()=> 'fixture';ctx.callOpenAI=async(k,r)=>{request=r;return JSON.stringify({melodyLead:'Distorted mono synth bass',melodyBackground:null,texture:['Saturated bass / clean drums'],drums:['Four-on-the-floor kick'],'808':'None'});};
(async()=>{
 await ctx.aiRecommendMelodyTexture();
 assert.equal(run('st.melody.length'),1);assert.equal(run('st.melody[0]'),'Distorted mono synth bass');assert.doesNotMatch(request.staticText,/반드시 리드\+배경 2개/);
 assert.equal(run('st.vocal'),'No Vocal');
 console.log('PASS: club presets, single bass-hook recommendation, precise reference mapping and unchanged BPM/key/no-vocal intent.');
})().catch(e=>{console.error(e);process.exitCode=1;});
