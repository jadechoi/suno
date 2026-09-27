const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({console});
for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
ctx.getOpenAIKey=()=> 'fixture';
(async()=>{
 const spec={vocal:null,bass808:'None',selectionOrigins:{_808:'ai-reference'}};
 assert.equal(ctx.musicConditions(spec).no808,undefined);
 assert.ok(ctx.musicConditions({...spec,selectionOrigins:{_808:'current-selection'}}).no808);
 assert.deepEqual(Object.keys(ctx.musicConditions({vocal:'Sung lead vocal'})),[]);
 ctx.callOpenAI=async()=>JSON.stringify({violations:[{condition:'instrumental',quote:'wordless vocal-like chop (ah/oh vowel)',reason:'무보컬과 충돌'}]});
 const content={roles:[{performance:'occasional wordless vocal-like chop (ah/oh vowel) on downbeats'}]};
 assert.equal((await ctx.checkMusicConditions(spec,content)).length,1);
 await assert.rejects(()=>ctx.checkMusicConditions(spec,{style:'No vocals; guitar leaves vocal-ready space.'}),/음악 조건 검사/);
 ctx.callOpenAI=async()=>JSON.stringify({violations:[]});
 assert.equal((await ctx.checkMusicConditions(spec,{style:'No vocals or vocal chops. Singable guitar with round sub bass.'})).length,0);
 ctx.callOpenAI=async()=>JSON.stringify({ok:true});
 await assert.rejects(()=>ctx.checkMusicConditions(spec,content),/음악 조건 검사/);
 let calls=0;
 ctx.callOpenAI=async(_key,r)=>{calls++;if(calls===1)return '{broken';assert.equal(JSON.parse(r.dynamicText).responseRepair,'JSON 형식 오류');return JSON.stringify({violations:[]});};
 assert.equal((await ctx.checkMusicConditions(spec,content)).length,0);
 assert.equal(calls,2);
 ctx.callOpenAI=async()=>JSON.stringify({violations:[{condition:'instrumental',quote:'wordless vocal-like chop (ah/oh vowel)',reason:'충돌'}]});
 assert.equal((await ctx.checkMusicConditions(spec,{style:'wordless  vocal-like chop (ah/oh vowel)'})).length,1);
 // Recorded v23 false positives must repair the audit, not rewrite the music.
 for(const bad of [
   {quote:'noise FX without becoming melodic or voice-like',reason:'보컬 사용 위험'},
   {quote:'absolutely no vocals or voice-like elements',reason:'보컬 금지 조건을 이미 만족하도록 명시하고 있어 제약을 위반하지 않습니다.'},
   {quote:'guitar lead that sings vocal-style melodies',reason:'보컬 느낌이므로 위반 가능'}
 ]){
   let checks=0;ctx.callOpenAI=async(_key,r)=>{checks++;if(checks===1)return JSON.stringify({violations:[{condition:'instrumental',...bad}]});assert.ok(JSON.parse(r.dynamicText).responseRepair);return JSON.stringify({violations:[]});};
   assert.equal((await ctx.checkMusicConditions(spec,{style:bad.quote})).length,0);assert.equal(checks,2);
 }
 let checks=0;ctx.callOpenAI=async()=>JSON.stringify({violations:checks++?[]:[{condition:'instrumental',quote:'avoid a singable top-line',reason:'보컬 암시'}]});
 assert.equal((await ctx.checkMusicConditions({...spec,designMode:'reference-type-beat'},{style:'avoid a singable top-line'})).length,0);
 // A real positive vocal instruction still fails even if another clause says no vocals.
 ctx.callOpenAI=async()=>JSON.stringify({violations:[{condition:'instrumental',quote:'add a choir',reason:'합창 추가는 무보컬과 충돌'}]});
 assert.equal((await ctx.checkMusicConditions(spec,{style:'No vocals, but add a choir.'})).length,1);
 console.log('PASS: explicit conditions vs recommendations, grounded violation quotes and fail-closed audit parsing. Semantic judgments are mocked.');
})().catch(e=>{console.error(e);process.exitCode=1;});
