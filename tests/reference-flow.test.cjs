const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const nodes={};let downloads=0;
const ctx=vm.createContext({console,document:{getElementById:id=>nodes[id]??={value:'',style:{},querySelectorAll:()=>[],scrollIntoView:()=>{}}},showToast:()=>{},downloadTextFile:()=>downloads++});
const run=s=>vm.runInContext(s,ctx),app=fs.readFileSync('app.js','utf8');
for(const f of ['hh-data.js','hh-ai.js'])run(fs.readFileSync(f,'utf8'));
run(app.slice(app.indexOf('const st='),app.indexOf('let antiAI=')));
run(`const HH_TRANSITION_FX=[],HH_GROOVE=[],GENRE_AUTO=[],MELODY_ROLE={},HH_VOCAL_STYLE=[],HH_VOCAL_CHAR=[];let _lyricLangTouched=false,_lyricLangForced=false;getOpenAIKey=()=> 'fixture';`);
for(const name of ['syncInstrumentMenus','renderGenreRefSuggestions','chipGrid','setAutoHint','clearAutoHint','on808Change','onDrumsManualChange','onRhythmManualChange','recommendMelodyTexture','recommendProducerRef','recommendStructure','renderHhGenres','applyUiMode','renderProducerRef','setInstrumentMenus','renderHhChips','renderBriefActive','markPending','moodGrid','onMoodChange','onMelodyManualChange','renderMelodyRoleUI','onTextureManualChange'])ctx[name]=()=>{};
ctx.pickCompatibleTextures=x=>x;
run(app.slice(app.indexOf('function selectGenre('),app.indexOf('function suggestionChip(')));
ctx.selectGenre(run("GENRES.findIndex(g=>g.tag==='uk garage')"));
assert.equal(run('GENRES[st.genre].tag'),'uk garage');
(async()=>{
 run(`st.brief={kind:'song',text:'A',instrumentalProfile:{genre:'old'}};st.referenceSelections={genre:st.genre};`);
 ctx.callOpenAI=async()=>JSON.stringify({kind:'song',genre:'House',instrumentalProfile:{genre:'house',bass:'rubbery bass'}});
 assert.equal(await ctx.autoAnalyzeReference('B'),true);
 assert.equal(run('st.brief.text'),'B');assert.equal(run('GENRES[st.genre].tag'),'house');
 // A late A response must never overwrite the newer B analysis.
 let finish;ctx.callOpenAI=()=>new Promise(r=>finish=r);
 const old=ctx.autoAnalyzeReference('C');
 ctx.callOpenAI=async()=>JSON.stringify({kind:'song',genre:'Techno',instrumentalProfile:{genre:'techno'}});
 await ctx.autoAnalyzeReference('D');
 finish(JSON.stringify({kind:'song',genre:'House',instrumentalProfile:{genre:'house'}}));await old;
 assert.equal(run('st.brief.text'),'D');
 // The selected background must survive application without complementBg substitutions.
 run(`_briefProposal={kind:'song',text:'E',v:{lead:HH_MELODY[0],bg:HH_MELODY[1]},items:[{id:'melody',on:true},{id:'sound',on:true}],styleTags:[],cues:{},instrumentalProfile:{genre:'electroclash'}};`);
 const bg=run('_briefProposal.v.bg');ctx.complementBg=()=>{throw Error('must not run');};ctx.applyBrief();assert.equal(run('st.melody[1]'),bg);
 const spec={structure:[{header:'[Intro]'},{header:'[Hook 1]'},{header:'[Outro]'}]};
 assert.equal(ctx.validateWritten(spec,'[Intro]\nOnly intro.','Instrumental only.').ok,false);
 assert.equal(ctx.validateWritten(spec,'[Intro]\nStart.\n[Chorus: Full]\nOpen.\n[Outro]\nEnd.','Instrumental only.').ok,true);
 const start=app.indexOf('function saveHhPromptAsMd('),end=app.indexOf('\nfunction ',start+10);
 run(app.slice(start,end));run("_writeState='pending';");ctx.saveHhPromptAsMd();assert.equal(downloads,0);
 console.log('PASS: actual genre application, new references, stale analyses, exact background and export guard.');
})().catch(e=>{console.error(e);process.exitCode=1;});
