const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c=vm.createContext({console,AbortSignal});
for(const f of ['hh-data.js','archive/reference/reference-v2.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
c.getOpenAIKey=()=> 'fixture';
(async()=>{
 for(const version of ['feat. Guest — Remix','Live Acoustic','unfamiliar version']){
  const text=`Artist - Track (${version}). 원곡의 차가움은 유지하고 무보컬로 만들어줘.`;
  const identity={title:'Track',artist:'Artist',version,status:version==='unfamiliar version'?'unknown':'identified',reason:'provisional'};
  const requests=[];let searches=0;
  c.callOpenAI=async(key,r)=>{requests.push(r);if(requests.length===1){assert.equal(r.dynamicText,text);assert.match(r.staticText,/return ONLY/);return JSON.stringify({kind:'song',referenceIdentity:identity});}
   const payload=JSON.parse(r.dynamicText);assert.equal(payload.title,text);assert.deepEqual(payload.provisionalIdentity,identity);assert.equal(payload.evidenceItems[0].statement,'Published track description');assert.equal(payload.research,undefined);assert.doesNotMatch(r.staticText,/Design a new composition/);
   return JSON.stringify({referenceIdentity:identity,features:[{dimension:'mood',description:'cold',basis:'model-knowledge',scope:'track',reason:'remembered'},{dimension:'groove',description:'pulse',basis:'web-source',scope:'track',reason:'linked',evidenceIds:['E1'],sources:[{url:'https://example.org/track'}]},{dimension:'bass',description:'invented',basis:'web-source',scope:'track',reason:'unmatched',evidenceIds:['E999'],sources:[{url:'https://example.org/track'}]}]});};
  c.fetch=async(url,options)=>{searches++;const b=JSON.parse(options.body),input=JSON.parse(b.input);assert.equal(input.originalInput,text);assert.deepEqual(input.provisionalIdentity,identity);return {ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({items:[{statement:'Published track description',scope:'track',subject:'Track',urls:['https://example.org/track']}]}),annotations:[{url:'https://example.org/track',title:'Track'}]}]}]})};};
  const result=await c.analyzeSoundDesign(text);assert.equal(requests.length,1);assert.equal(searches,0);assert.equal(result.referenceIdentity.version,version);assert.equal(result.instrumentalProfile,undefined);
 }
 let calls=0;c.fetch=async()=>{throw Error('Vibe must not search');};c.callOpenAI=async()=>{calls++;return JSON.stringify({kind:'vibe',understood:'선율 중심',instrumentalProfile:{mood:'wistful',groove:'relaxed',instruments:'expressive guitar'}});};
 const vibe=await c.analyzeSoundDesign('쓸쓸한 기타 선율 중심의 새 곡');assert.equal(calls,1);assert.equal(vibe.kind,'vibe');assert.equal(vibe.instrumentalProfile.instruments,'expressive guitar');
 console.log('PASS: identification only, one post-search analysis, exact original/version handoff, unknown retained, vibe single-call route');
})().catch(e=>{console.error(e);process.exitCode=1;});
