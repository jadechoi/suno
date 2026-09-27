const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const fn=source.slice(source.indexOf('function saveHhPromptAsMd(){'),source.indexOf('// PROMPT HISTORY'));
let exported='';
const st={genre:0,key:0,bpm:138,bpmSet:false,keySet:false,melody:[],texture:[],refs:[],structSegs:['intro']};
const ctx=vm.createContext({st,GENRES:[{kr:'베이스라인',en:'bassline'}],KEYS:['A minor'],Date,
 document:{getElementById:()=>({value:''})},_writeState:'ok',_refAutoPromise:null,_aiSuggestions:[],_writeNote:'',_writeErr:'',_writeWarn:[],
 referenceSelectionOrigins:()=>({}),downloadTextFile:(_name,text)=>exported=text,showToast:()=>{}});
vm.runInContext(fn,ctx);
ctx.saveHhPromptAsMd();
assert.match(exported,/\*\*BPM\*\*: 미지정/);
assert.match(exported,/\*\*Key\*\*: 미지정/);
assert.ok(!exported.includes('138'));
st.bpmSet=st.keySet=true;
ctx.saveHhPromptAsMd();
assert.match(exported,/\*\*BPM\*\*: 138/);
assert.match(exported,/\*\*Key\*\*: A minor/);
console.log('PASS: export distinguishes confirmed parameters from internal defaults');
