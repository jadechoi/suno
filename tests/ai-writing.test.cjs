// Run: node tests/ai-writing.test.cjs. Local fixtures; no API calls or saved user data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ctx = vm.createContext({console,document:{getElementById:()=>null}});
for (const file of ['hh-data.js', 'hh-ai.js', 'hh-openai-audio.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), ctx, {filename:file});
}
vm.runInContext(`const st={extraTags:[],vocal:'No Vocal',melody:['Muted guitar','Synth pluck'],refs:[]};`,ctx);
const run = code => vm.runInContext(code,ctx);
const appSource=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
vm.runInContext(appSource.slice(appSource.indexOf('const GENRE_AUTO='),appSource.indexOf('// 전환 효과(브릿지/드롭 전환)')),ctx);
const spotifySource=fs.readFileSync(path.join(__dirname,'..','hh-spotify.js'),'utf8');
assert.doesNotMatch(appSource,/refAf/);
assert.doesNotMatch(spotifySource,/af\.(?:energy|valence|danceability)|spMoodFromFeatures|sp808FromEnergy|spDrumsFromFeatures/);
assert.match(run('WRITE_STATIC'),/referenceSong이 있으면 곡 제목과 아티스트를 보고/);
assert.match(run('WRITE_STATIC'),/BPM과 Key는 referenceSong에서 추측하지 말고/);
run(`Object.assign(st,{genre:null,mood:null,commercial:null,_mtAutoManaged:false,drums:[],_808:'Balanced',b808Set:false,groove:null,texture:[],transitionFx:[],era:null,region:null,density:null,brief:null,length:null,structSegs:['intro','hook','outro'],bpmSet:false,keySet:false,narrAI:{},removedPhrases:[]}); globalThis.antiAI=true;`);
assert.match(run('aiSelectionCtx()'),/장르: 미선택/);
assert.equal(run(`briefAutoApply('genre',{genre:null})`),true);
assert.equal(run(`briefAutoApply('mood',{mood:null})`),true);
assert.equal(run(`briefAutoApply('mood',{mood:'칠·그루비'})`),false);
assert.equal(run(`briefAutoApply('vocal',{vocal:null})`),false); // 레퍼런스 원곡에 보컬이 있어도 힙합 탭 기본 무보컬 유지
assert.equal(run(`audioFileFormat({name:'track.mp3',type:'audio/mpeg'})`),'mp3');
assert.equal(run(`audioFileFormat({name:'track.wav',type:'audio/wav'})`),'wav');
assert.equal(run(`audioFileFormat({name:'track.m4a',type:'audio/mp4'})`),'');
const intro = 'In the intro, tease only its final three notes with a distant plucked synth.';
const direction = 'Reintroduce it gradually in the rebuild, then transform it at the final peak with octave jumps, stronger accents, and a soaring counter-melody while preserving its original rhythm.';
ctx.direction = direction;
assert.equal(ctx.sanitizeDirective(intro), intro);
const suggestion=ctx.normalizeAiSuggestion({category:'전개',text:'모티프 유지',boostSection:'hook',boostText:direction,narrDir:{hook2:direction}},['hook'],['hook2']);
assert.equal(suggestion.boostText,direction);
assert.equal(suggestion.narrDir.hook2,direction);
ctx.setDirective('hook2','전개',direction);
assert.equal(run('st.narrAI.hook2'),direction);
ctx.setDirective('hook2','전개',intro);
assert.equal(run('st.narrAI.hook2'),intro); // category replacement, not accumulation
ctx.setDirective('hook2','공간',direction);
assert.equal(run('st.narrAI.hook2'),intro+' '+direction);

// Prose, intentional repetition, instrument names in every section, many commas,
// and explicit exclusions are all valid within the existing app output envelope.
const body='Muted guitar plays three syncopated notes, then rests. Synth pluck answers above it. Keep the same rhythm. Let the kick enter after the answer. ZERO vocal chops.';
const section=`[Intro]\n(${body})\n[Instrumental Hook 1]\n(8 Bars: ${body})\n[Instrumental Hook 2]\n(8 Bars: ${body})`;
const style='[Instrumental] night-pop at 110 BPM, no vocals, ZERO vocal chops, no vocal samples. Open with Muted guitar, then Synth pluck. Keep the kick straight, the bass late, the motif short, the harmony simple, the rests exposed, the accents light, the tone elastic, the response brief, the register low, the phrase intact, the ending short. Instrumental only. Avoid brass, choir-like pads and busy melodies.';
// Do not mention a choir even as an exclusion: the existing no-vocal guard intentionally rejects it.
const instrumentalStyle=style.replace('choir-like pads','lush pads');
const spec={structure:ctx.parseSections(section).map(s=>({...s,bars:s.bars?+s.bars:null,maxChars:1000})),lead:'Muted guitar',background:'Synth pluck',drums:['kick'],vocal:null,bpm:110,key:null,fixedStyleTags:['[Instrumental]','no vocals','110 BPM','night-pop'],limits:{sectionTotal:4900,style:950},removedPhrases:[]};
const validate=(sec=section,sty=instrumentalStyle,sp=spec)=>ctx.validateWritten(sp,sec,sty,{strict:true});
assert.equal(validate().ok,true,JSON.stringify(validate().errors));
assert.equal(validate(section,instrumentalStyle+' Use short dry female whisper chops.').ok,false);
assert.equal(validate(section,instrumentalStyle+' Add humming.').ok,false);
assert.equal(validate(section,instrumentalStyle+' Add sung vocals.').ok,false);
assert.equal(validate(section.replaceAll('Muted guitar','Other instrument')).ok,false);
assert.equal(validate(section.replace('[Intro]','[Outro]')).ok,false);
const renamed=section.replace('[Instrumental Hook 1]','[Instrumental Hook 1: New subtitle]');
assert.equal(ctx.restoreSectionHeaders(renamed,spec.structure),section);
const reordered=section.replace('[Intro]','[Outro]');
assert.equal(ctx.restoreSectionHeaders(reordered,spec.structure),reordered);
assert.equal(ctx.hasSelectedDrum('Use punchy sub-bass under the motif.','Sub-bass punch'),true);
assert.equal(ctx.hasSelectedDrum('Keep crisp hi hats in the groove.','Crisp hi-hats'),true);
assert.equal(ctx.hasSelectedDrum('Avoid crisp hi-hats.','Crisp hi-hats'),false);
assert.equal(ctx.hasSelectedDrum('A soft pad floats.','Sub-bass punch'),false);
assert.equal(validate(section,instrumentalStyle+' Punchy sub-bass and crisp hi hats.',{...spec,drums:['Sub-bass punch','Crisp hi-hats']}).ok,true);
for(const genre of [6,8,11,12,14,17]){
  run(`st.genre=${genre};st.b808Set=false;`);
  assert.equal(run('use808()'),false);
  assert.doesNotMatch(run('genreLowEnd(st.genre,"None")'),/808/);
}
run('st.genre=0;st.b808Set=false;');
assert.equal(run('use808()'),true);
assert.doesNotMatch(run('genreLowEnd(0,"None")'),/\b808 bass/);
run('st.genre=null;');
assert.equal(validate(section.replace('8 Bars:','16 Bars:')).ok,false);
assert.equal(validate(section,instrumentalStyle+'x'.repeat(950)).ok,false);
assert.equal(validate(section,instrumentalStyle.replace('110 BPM','120 BPM')).ok,false);
// Supply Drake as reference since not every artist is in the producer list.
assert.equal(validate(section,instrumentalStyle+' Drake-inspired.',{...spec,referenceSong:'Drake - Example'}).ok,false);
const restricted={...spec,mutableHeaders:['[Instrumental Hook 2]'],prevSections:ctx.parseSections(section)};
assert.equal(validate(section.replace('plays three','plays four'),instrumentalStyle,restricted).ok,false);

// Vocal songs still work without compulsory belting or a different delivery per section.
const vocalSection='[Hook 1]\n(8 Bars: Muted guitar plays first. A breathy female vocal echoes its rhythm. A gentle male vocal answers, then both voices finish together.)';
const vocalSpec={...spec,vocal:'Sung lead vocal',background:null,drums:[],structure:ctx.parseSections(vocalSection).map(s=>({...s,bars:8,maxChars:1000})),fixedStyleTags:['110 BPM']};
assert.equal(validate(vocalSection,'A summer pop duet at 110 BPM with breathy female vocals and gentle male vocals.',vocalSpec).ok,true);
assert.equal(validate(vocalSection,'[Instrumental] no vocals at 110 BPM.',vocalSpec).ok,false);

// Section prose reaches the actual Lyrics-box merge intact, without changing sung words.
const lyricDirection='[Verse 1]\n(8 Bars: Keep the guitar motif beneath a breathy vocal. Let the synth answer after each phrase.)\n[Hook 1]\n(8 Bars: Let the guitar play first, then have the vocal echo its rhythm. Preserve the rests.)\n[Hook 2]\n(8 Bars: Bring back the same rhythm. Double the guitar only on the final phrase while the vocal stays intimate.)';
const suppliedLyrics='[Verse 1]\nThe streetlight waits\n[Chorus 1]\nStay with me\n[Chorus 2]\nStay with me';
const merged=ctx.mergeLyricsAndDirection(suppliedLyrics,lyricDirection);
assert.equal(merged,'[Verse 1]\n(8 Bars: Keep the guitar motif beneath a breathy vocal. Let the synth answer after each phrase.)\nThe streetlight waits\n\n[Chorus 1]\n(8 Bars: Let the guitar play first, then have the vocal echo its rhythm. Preserve the rests.)\nStay with me\n\n[Chorus 2]\n(8 Bars: Bring back the same rhythm. Double the guitar only on the final phrase while the vocal stays intimate.)\nStay with me');

// Inline events survive validation + Lyrics merge, without counting as sung words.
const eventSection='[Hook 1]\n(8 Bars: A breathy vocal leaves space for the synth.)\n[Hook 2]\n(8 Bars: Keep the breathy vocal rhythm; let the guitar answer.)';
const eventSpec={...vocalSpec,lead:null,structure:ctx.parseSections(eventSection).map(s=>({...s,bars:8,maxChars:1000})),lyrics:{headers:['[Chorus 1]','[Chorus 2]'],lang:'English',provided:false}};
const eventLyrics='[Chorus 1]\nStay with me tonight [synth stab]\nWe can take it slow\nLet the daylight wait\nHere is where we go\n[Chorus 2]\nStay with me tonight [guitar riff]\nWe can take it slow\nLet the daylight wait\nHere is where we go';
const eventStyle='Pop at 110 BPM with breathy vocals, guitar and synth.';
const checkEvents=(lyrics,style=eventStyle,extra={})=>ctx.validateWritten({...eventSpec,...extra},eventSection,style,{strict:true,lyrics});
assert.equal(checkEvents(eventLyrics).ok,true,JSON.stringify(checkEvents(eventLyrics).errors));
assert.match(ctx.mergeLyricsAndDirection(eventLyrics,eventSection),/Stay with me tonight \[synth stab\]/);
assert.equal(checkEvents(eventLyrics.replace('tonight [synth stab]','[synth stab] tonight')).ok,false);
assert.equal(checkEvents(eventLyrics.replace('[synth stab]','[synth stab] [guitar riff]')).ok,false);
assert.equal(checkEvents(eventLyrics.replace('[synth stab]','[drums drop out]')).ok,false);
assert.equal(checkEvents(eventLyrics.replace('We can take it slow','We can take it slow [synth stab]')).ok,false);
assert.equal(checkEvents(eventLyrics,'Pop at 110 BPM with breathy vocals and guitar. Avoid synth.').ok,false);
assert.equal(checkEvents(eventLyrics.replace('[synth stab]','[brass stabs]')).ok,false);
assert.equal(checkEvents(eventLyrics,eventStyle,{prevLyrics:eventLyrics,lyrics:{...eventSpec.lyrics,provided:true}}).ok,true);
assert.equal(checkEvents(eventLyrics.replace('tonight','today'),eventStyle,{prevLyrics:eventLyrics,lyrics:{...eventSpec.lyrics,provided:true}}).ok,false);
const koreanLyrics='[Chorus 1]\n오늘도 여기서 널 기다려 [synth stab]\n조금만 천천히 걸어줘\n아침이 올 때까지\n우리 둘 여기 있어\n[Chorus 2]\n오늘도 여기서 널 기다려 [guitar riff]\n조금만 천천히 걸어줘\n아침이 올 때까지\n우리 둘 여기 있어';
assert.equal(checkEvents(koreanLyrics,eventStyle,{lyrics:{...eventSpec.lyrics,lang:'한국어'}}).ok,true);

// Exercise real request assembly / XML extraction with a fake transport, never a real key.
ctx.fixture={section,style:instrumentalStyle};
run(`aiSelectionCtx=()=>JSON.stringify({genre: "night-pop", bpm:110, vocal:null}); getOpenAIKey=()=> 'fixture-only'; callOpenAI=async(key,request)=>{globalThis.request=request; return '<section>'+fixture.section+'</section><style>'+fixture.style+'</style>';};`);
(async()=>{
  ctx.nodes={'hh-brief':{value:'Artist - Reference Song'},'hh-brief-btn':{disabled:false,textContent:''},'hh-brief-status':{hidden:false,style:{},textContent:''}};
  run(`document.getElementById=id=>nodes[id]||null;
    getOpenAIKey=()=> 'fixture-only'; setInstrumentMenus=()=>{}; pickCompatibleTextures=x=>x; globalThis.HH_VOCAL_STYLE=[]; globalThis.HH_VOCAL_CHAR=[];
    Object.assign(st,{genre:null,mood:null,drums:[],melody:[],texture:[],density:null,b808Set:false});
    callOpenAI=async()=>JSON.stringify({kind:'song',understood:'reference',genre:GENRES[0].en,mood:HH_MOODS[0].kr,drums:[],bass808:null,melodyLead:null,melodyBackground:null,texture:[],density:null,vocal:'Sung lead vocal',vocalStyle:null,vocalChar:null,styleTags:['short syncopated motif'],cues:{hook:'wider hook'}});
    applyBrief=()=>{globalThis.autoApplyIds=_briefProposal.items.filter(x=>x.on).map(x=>x.id);_briefProposal=null;};`);
  assert.equal(await ctx.aiAnalyzeBrief({autoApply:true,expectedText:'Artist - Reference Song'}),true);
  assert.deepEqual(Array.from(ctx.autoApplyIds),['mood','genre','sound']);
  assert.equal(ctx.autoApplyIds.includes('vocal'),false);
  run(`document.getElementById=()=>null; callOpenAI=async(key,request)=>{globalThis.request=request; return '<section>'+fixture.section+'</section><style>'+fixture.style+'</style>';};`);

  const result=await ctx.writeOnce({mode:'create',spec});
  assert.equal(result.style,instrumentalStyle);
  assert.equal(result.section,section);
  assert.match(ctx.request.staticText,/자연어 한 문단/);
  assert.match(ctx.request.staticText,/라틴 팝/);
  assert.match(ctx.request.staticText,/위스퍼/);
  assert.match(ctx.request.staticText,/\[섹션 디렉팅\]/);
  assert.match(ctx.request.staticText,/필요한 디테일만 간결한 영어 자연어/);
  assert.doesNotMatch(ctx.request.staticText,/완결된 서술 문장은 금지|태그는 12개 이하|2,800~3,800/);
  assert.doesNotMatch(run('RUBRIC_TEXT()'),/서술 문장 없음|구당 8단어 이하/);
  assert.equal(validate(result.section,result.style).ok,true);
  console.log('PASS: natural-language writing, intact feedback, constraints and request assembly (offline fixtures).');
})().catch(e=>{console.error(e);process.exitCode=1;});
