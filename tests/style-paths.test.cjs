// Synthetic declared intentions, not claims about recordings. No paid API requests.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({console,document:{getElementById:()=>null}});
for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
vm.runInContext("const st={melody:[],extraTags:[],narrAI:{},removedPhrases:[]};getOpenAIKey=()=> 'fixture';aiSelectionCtx=()=> 'original intention';",ctx);
ctx.buildMusicPlan=async({spec})=>({identity:'fixture identity',roles:[],sections:spec.structure.map(x=>({header:x.header,direction:'Maintain the established groove.'}))});
const base=JSON.parse(fs.readFileSync('tests/fixtures/despacito-type-beat.json','utf8')).spec;
const cases=[
  {name:'rhythm-led club',genre:'minimal club',mood:'cold, playful',groove:'straight kick with late elastic bass',balance:'bass foreground, sparse stabs'},
  {name:'dark trap',genre:'dark trap',mood:'dark, tense',groove:'half-time drums with rolling hats',balance:'heavy low end, restrained melodic layer'},
  {name:'sparse R&B',genre:'alternative R&B',mood:'intimate, subdued',groove:'laid-back pocket with rests',balance:'soft electric keys, open center'}
];
(async()=>{
 for(const c of cases){
  for(const mode of ['reference-type-beat','original-song']){
   const spec={...base,designMode:mode,genre:c.genre,mood:c.mood,referenceSong:mode==='reference-type-beat'?c.name:null,brief:mode==='reference-type-beat'?{instrumentalProfile:{genre:c.genre,groove:c.groove,balance:c.balance},uncertainFields:['instrumentalProfile.instruments'],cues:{hook:'unfounded guitar solo',verse:'retain the pocket'},cueBasis:{hook:['instruments'],verse:['groove']}}:null};
   let request;
   ctx.callOpenAI=async(_key,r)=>{request=r;return '<style>Instrumental '+c.genre+', '+c.mood+'. No vocals.</style><section>[Intro]\n(Enter sparsely.)\n[Outro]\n(Fade.)</section>';};
   await ctx.writeOnce({mode:'create',spec});
   assert.match(request.dynamicText,new RegExp(c.genre));
   assert.match(request.staticText,/지시 개수는 고정하지 마/);
   if(mode==='reference-type-beat'){
    assert.ok(request.dynamicText.includes(c.balance));
    assert.ok(!request.dynamicText.includes('unfounded guitar solo'));
    assert.ok(request.dynamicText.includes('retain the pocket'));
   }else assert.ok(!request.dynamicText.includes(c.balance));
  }
 }
 const source={kind:'song',instrumentalProfile:{balance:'guitar solo',groove:'steady'},uncertainFields:['instrumentalProfile.balance'],styleTags:['guitar-dominant'],cues:{hook:'guitar solo'}};
 const filtered=ctx.filterReferenceUncertainty(source);
 assert.equal(filtered.cues.hook,undefined);assert.equal(filtered.styleTags.length,0);
 assert.equal(source.cues.hook,'guitar solo');
 assert.equal(ctx.filterReferenceUncertainty({...source,kind:'vibe'}).cues.hook,'guitar solo');
 const review=ctx.normalizeAiSuggestion({category:'총평',text:'근거',criteria:{reference:9,genre:8},evidence:{preserved:['steady groove'],risks:['too bright'],unknown:['original balance']}},[],[]);
 assert.equal(review.criteria.reference,undefined);assert.equal(review.evidence.unknown[0],'original balance');
 console.log('PASS: three fixed styles × both writing paths, uncertainty propagation and evidence-based review (mock transport).');
})().catch(e=>{console.error(e);process.exitCode=1;});
