const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('hh-spotify.js','utf8'),nodes={};
const st={bpm:100,key:0},pop={bpm:100,key:0};let finish={};
const ctx=vm.createContext({console,st,VTS:{pop},KEYS:['C major','D major'],document:{getElementById:id=>nodes[id]??={value:''}},hideSpotifyDropdown(){},setRefSongFromPicker(label){nodes['hh-ref-song'].value=label;},updateFloatSummary(){},showToast(){},getRapidApiKey:()=>true,getSpotifyToken:async()=> 'fixture',resolveTrackByArtistAndTitle:async(_artist,title)=>({id:title}),getAudioFeatures:id=>new Promise(r=>finish[id]=r)});
for(const id of ['hh-ref-song','hh-bpm','hh-key','pop-ref-song','pop-bpm','pop-key'])nodes[id]={value:''};
vm.runInContext(source.slice(source.indexOf('const SP_KEY_MAP='),source.indexOf('function toggleSpPanel')),ctx);
vm.runInContext(source.slice(source.indexOf('function applyAudioTempoAndKey'),source.indexOf('// ---- RapidAPI fallback')),ctx);
for(const [start,end] of [['async function applySpotifyTrack(','// TRENDING ARTISTS'],['async function applySpotifyTrackSong(','const TREND_COLORS'],['async function applyPopHot100Song(','function setChart(']])vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start))),ctx);
const ready=()=>new Promise(setImmediate);
(async()=>{
 const a=ctx.applySpotifyTrack('a','Song A');
 const b=ctx.applySpotifyTrackSong('artist','Artist',[],'b','Song B');
 finish.b({tempo:90,key:2,mode:1});await b;
 finish.a({tempo:178,key:0,mode:1});await a;
 assert.equal(nodes['hh-ref-song'].value,'Artist - Song B');assert.equal(st.bpm,90);assert.equal(st.key,1);
 // Manual edits during fetch are respected per field; untouched key may still update.
 const c=ctx.applySpotifyTrack('c','Song C');nodes['hh-bpm'].value='125';st.bpm=125;
 finish.c({tempo:178,key:0,mode:1});await c;assert.equal(st.bpm,125);assert.equal(st.key,0);
 // Clearing/changing the reference makes its entire response stale.
 const d=ctx.applySpotifyTrack('d','Song D');nodes['hh-ref-song'].value='';finish.d({tempo:178,key:2,mode:1});await d;assert.equal(st.bpm,125);
 const e=ctx.applySpotifyTrack('e','Same');const f=ctx.applySpotifyTrack('f','Same');finish.f({tempo:88});await f;finish.e({tempo:199});await e;assert.equal(st.bpm,88);
 const pa=ctx.applyPopHot100Song({artist:'Artist',name:'a'});await ready();
 const pb=ctx.applyPopHot100Song({artist:'Artist',name:'b'});await ready();
 finish.b({tempo:91});await pb;finish.a({tempo:170});await pa;assert.equal(pop.bpm,91);
 const pc=ctx.applyPopHot100Song({artist:'Artist',name:'c'});await ready();nodes['pop-key'].value='1';pop.key=1;finish.c({tempo:95,key:0,mode:1});await pc;assert.equal(pop.key,1);assert.equal(pop.bpm,95);
 console.log('PASS: cross-picker stale responses, same-label races and manual BPM/key protection.');
})().catch(e=>{console.error(e);process.exitCode=1;});
