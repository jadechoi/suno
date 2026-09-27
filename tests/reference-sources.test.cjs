const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({console,AbortSignal});for(const f of ['hh-data.js','hh-ai.js','archive/reference/supplement-sources.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
c.escHtml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const design={kind:'song',instrumentalProfile:{groove:'known pocket',energy:''},analysisEvidence:{groove:{basis:'model-knowledge',scope:'track',reason:'known'},energy:{basis:'unknown',scope:'unknown',reason:'unknown'}},uncertainFields:['instrumentalProfile.energy']};
(async()=>{
 let calls=0;c.fetch=async(url,options)=>{calls++;const req=JSON.parse(options.body);assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(req.max_tool_calls,2);assert.equal(req.store,false);assert.ok(!JSON.parse(req.input).missing.includes('groove'));return {ok:true,json:async()=>({status:'completed',output:[{type:'web_search_call',action:{sources:[{url:'https://review.example/track',title:'Track review'}]}},{type:'message',content:[{type:'output_text',text:JSON.stringify({fields:{activity:{support:'interpretation',description:'constantly busy',reason:'layers imply density',urls:['https://review.example/track']},groove:{description:'overwrite',reason:'no',urls:['https://review.example/track']},energy:{support:'direct',description:'cold playful',reason:'Track review describes this',urls:['https://review.example/track']},balance:{support:'direct',description:'invented lead',reason:'fake',urls:['https://not-consulted.example']}}})}]}]})};};
 const after=await c.supplementReferenceSources('exact title',design,'fixture');
 assert.equal(after.instrumentalProfile.groove,'known pocket');assert.equal(after.instrumentalProfile.energy,'cold playful');assert.equal(after.instrumentalProfile.balance,undefined);assert.equal(after.instrumentalProfile.activity,undefined);
 assert.equal(c.filterReferenceUncertainty(after).instrumentalProfile.energy,'cold playful');assert.equal(design.instrumentalProfile.energy,'');
 assert.match(c.briefAnalysisDetails(after),/https:\/\/review.example\/track/);
 assert.match(c.briefAnalysisDetails(after),/공개 자료/);
 assert.equal(c.filterReferenceUncertainty({kind:'song',instrumentalProfile:{groove:'straight kick with late bass'},analysisEvidence:{groove:{basis:'user-description',scope:'track',reason:'User describes the kick and bass'}}}).instrumentalProfile.groove,'straight kick with late bass');
 const complete={kind:'song',instrumentalProfile:{groove:'pulse',energy:'dark',instruments:'bass',balance:'bass hook'}};
 await c.supplementReferenceSources('known',complete,'fixture');assert.equal(calls,1);
 assert.equal(c.filterReferenceUncertainty({...design,analysisEvidence:{energy:{basis:'web-source',scope:'track',reason:'fake',sources:[{url:'javascript:alert(1)'}]}}}).instrumentalProfile.energy,undefined);
 c.fetch=async()=>({ok:false,status:429});await assert.rejects(()=>c.supplementReferenceSources('title',design,'fixture'),/429/);
 console.log('PASS: bounded source search, consulted-URL filter, missing-only merge, provenance UI and failure path (offline).');
})().catch(e=>{console.error(e);process.exitCode=1;});
