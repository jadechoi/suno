const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const nodes={'hh-style-ta':{value:'Instrumental only.'},'hh-sect-ta':{value:'[Intro]\nQuiet motif.'},'hh-editor-status':{textContent:''}};
let copied='',url='',closed=false,opens=0;
const ctx=vm.createContext({document:{getElementById:id=>nodes[id]},navigator:{clipboard:{writeText:async t=>{copied=t;}}},window:{open:()=>{opens++;return {opener:{},location:{replace:u=>url=u},close:()=>closed=true};}},aiSelectionCtx:()=> '130 BPM / C major',st:{narrAI:{hook:'Keep the motif'},extraTags:[],removedPhrases:[]},_writeState:'ok',popStylePending:false});
vm.runInContext(fs.readFileSync('prompt-export.js','utf8'),ctx);
(async()=>{
 const button={disabled:false};await ctx.openFinalEditor('hh',button);
 assert.match(copied,/130 BPM/);assert.match(copied,/Instrumental only/);assert.match(copied,/Quiet motif/);assert.match(copied,/Keep the motif/);assert.match(url,/g-699a/);assert.equal(button.disabled,false);
 ctx._writeState='pending';await ctx.openFinalEditor('hh',button);assert.equal(opens,1);
 ctx._writeState='ok';ctx.navigator.clipboard.writeText=async()=>{throw new Error('Denied');};await ctx.openFinalEditor('hh',button);assert.equal(closed,true);assert.match(nodes['hh-editor-status'].textContent,/실패/);
 ctx.navigator.clipboard.writeText=async t=>copied=t;ctx.window.open=()=>null;await ctx.openFinalEditor('hh',button);assert.match(nodes['hh-editor-status'].textContent,/복사 완료/);
 console.log('PASS: export contents, pending guard, clipboard rejection and blocked popup.');
})().catch(e=>{console.error(e);process.exitCode=1;});
