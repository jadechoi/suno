const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const nodes={};let downloads=0;
const ctx=vm.createContext({console,document:{getElementById:id=>nodes[id]??={value:'',style:{},querySelectorAll:()=>[],scrollIntoView:()=>{}}},showToast:()=>{},downloadTextFile:()=>downloads++});
const run=s=>vm.runInContext(s,ctx),app=fs.readFileSync('app.js','utf8');
for(const f of ['hh-data.js','reference-v2.js','reference-v3.js','hh-ai.js'])run(fs.readFileSync(f,'utf8'));
run(app.slice(app.indexOf('const st='),app.indexOf('let antiAI=')));
run(`const HH_TRANSITION_FX=[],HH_GROOVE=[],GENRE_AUTO=[],MELODY_ROLE={},HH_VOCAL_STYLE=[],HH_VOCAL_CHAR=[];let _lyricLangTouched=false,_lyricLangForced=false;getOpenAIKey=()=> 'fixture';`);
for(const name of ['renderIntentStatus','syncInstrumentMenus','renderGenreRefSuggestions','chipGrid','setAutoHint','clearAutoHint','on808Change','onDrumsManualChange','onRhythmManualChange','recommendMelodyTexture','recommendProducerRef','recommendStructure','renderHhGenres','applyUiMode','renderProducerRef','setInstrumentMenus','renderHhChips','renderBriefActive','markPending','moodGrid','onMoodChange','onMelodyManualChange','renderMelodyRoleUI','onTextureManualChange','onVocalChange','recommendVocalChar','onStructSignalChange'])ctx[name]=()=>{};
run(app.slice(app.indexOf('function rememberChoice('),app.indexOf('function renderIntentStatus(')));
ctx.pickCompatibleTextures=x=>x;
run(app.slice(app.indexOf('function selectGenre('),app.indexOf('function suggestionChip(')));
ctx.selectGenre(run("GENRES.findIndex(g=>g.tag==='uk garage')"));
assert.equal(run('GENRES[st.genre].tag'),'uk garage');
const longCue='Retain the central bass gesture. '.repeat(10)+'Then expose its final rest.';
const structured=ctx.buildBriefProposal('cold playful',{kind:'vibe',understood:true,instrumentalProfile:{bass:{role:'rhythmic focus',gesture:['short hit','long rest','late pickup']}},cues:{hook:longCue}});
assert.match(structured.instrumentalProfile.bass,/short hit; long rest; late pickup/);
assert.ok(structured.cues.hook.endsWith('Then expose its final rest.'));
assert.equal(structured.understood,'');
assert.doesNotMatch(JSON.stringify(structured),/\[object Object\]/);
// Isolate menu/application behavior from the independently tested V2 research transport.
ctx.analyzeReferenceV2=async (text,initial)=>({...initial,kind:'song',referenceVersion:2,analysisEvidence:Object.fromEntries(['genre','bass','groove','energy'].map(k=>[k,{basis:'model-knowledge',scope:'track',reason:'fixture track recollection'}])),instrumentalProfile:text==='Design first'?{genre:'house',bass:'distinctive bass gesture',groove:'steady pulse',energy:'cold playful'}:{genre:text==='D'?'techno':'house',bass:'rubbery bass'}});
(async()=>{
 run(`st.brief={kind:'song',text:'A',instrumentalProfile:{genre:'old'}};st.referenceSelections={genre:st.genre};`);
 ctx.callOpenAI=async()=>JSON.stringify({kind:'song',referenceIdentity:{status:'identified'},genre:'House',instrumentalProfile:{genre:'house',bass:'rubbery bass'}});
 assert.equal(await ctx.autoAnalyzeReference('B'),true);
 assert.equal(run('st.brief.text'),'B');assert.equal(run('GENRES[st.genre].tag'),'uk garage');
 let stages=[];
 ctx.callOpenAI=async(_key,r)=>{stages.push(r);return JSON.stringify(stages.length===1?{kind:'song',referenceIdentity:{status:'identified'},understood:'rhythm identity',instrumentalProfile:{genre:'house',bass:'distinctive bass gesture',groove:'steady pulse',energy:'cold playful'}}:{kind:'song',referenceIdentity:{status:'identified'},genre:'House',instrumentalProfile:{genre:'generic pop',bass:'supportive bass'}});};
 await ctx.autoAnalyzeReference('Design first');
 assert.equal(stages.length,1);
 assert.equal(stages[0].dynamicText,'Design first');
 assert.equal(stages[1],undefined);
 assert.equal(run('st.brief.instrumentalProfile'),undefined);
 // A late A response must never overwrite the newer B analysis.
 let finish;ctx.callOpenAI=()=>new Promise(r=>finish=r);
 const old=ctx.autoAnalyzeReference('C');
 ctx.callOpenAI=async()=>JSON.stringify({kind:'song',referenceIdentity:{status:'identified'},genre:'Techno',instrumentalProfile:{genre:'techno'}});
 await ctx.autoAnalyzeReference('D');
 finish(JSON.stringify({kind:'song',referenceIdentity:{status:'identified'},genre:'House',instrumentalProfile:{genre:'house'}}));await old;
 assert.equal(run('st.brief.text'),'D');
 // The selected background must survive application without complementBg substitutions.
 run(`_briefProposal={kind:'song',text:'E',v:{lead:HH_MELODY[0],bg:HH_MELODY[1]},items:[{id:'melody',on:true},{id:'sound',on:true}],styleTags:[],cues:{},instrumentalProfile:{genre:'electroclash'}};`);
 // Reference vocal characteristics never opt the new beat into vocals.
 const savedProposal=run('_briefProposal');
 run(`st.vocal='No Vocal';_briefProposal={kind:'song',text:'Voice reference',v:{vocal:'Full rap feature'},items:[{id:'vocal',on:true}],styleTags:[],cues:{}};`);
 ctx.applyBrief();assert.equal(run('st.vocal'),'No Vocal');
 run(`_briefProposal={kind:'song',text:'Voice reference',v:{vocal:'Full rap feature'},items:[{id:'vocal',on:false}],styleTags:[],cues:{}};`);
 ctx.toggleBriefItem(0,true);ctx.applyBrief();assert.equal(run('st.vocal'),'Full rap feature');
 ctx.savedProposal=savedProposal;run('_briefProposal=savedProposal;');
 const bg=run('_briefProposal.v.bg');ctx.complementBg=()=>{throw Error('must not run');};ctx.applyBrief();assert.equal(run('st.melody[1]'),bg);
 const spec={structure:[{header:'[Intro]'},{header:'[Hook 1]'},{header:'[Outro]'}]};
 assert.equal(ctx.validateWritten(spec,'[Intro]\nOnly intro.','Instrumental only.').ok,false);
 assert.equal(ctx.validateWritten(spec,'[Intro]\nStart.\n[Chorus: Full]\nOpen.\n[Outro]\nEnd.','Instrumental only.').ok,true);
 const start=app.indexOf('function saveHhPromptAsMd('),end=app.indexOf('\nfunction ',start+10);
 run(app.slice(start,end));run("_writeState='pending';");ctx.saveHhPromptAsMd();assert.equal(downloads,0);
 console.log('PASS: actual genre application, new references, stale analyses, exact background and export guard.');
})().catch(e=>{console.error(e);process.exitCode=1;});
