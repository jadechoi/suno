const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('app.js','utf8');let copied=[];const c=vm.createContext({_writeState:'pending',popStylePending:false,document:{getElementById:()=>({value:'draft'})},navigator:{clipboard:{writeText:async t=>copied.push(t)}},setTimeout:()=>{}});
vm.runInContext(src.slice(src.indexOf('function copyOutput('),src.indexOf('// Explicit choices')),c);
const btn={textContent:'Copy',classList:{add(){},remove(){}}};
c.copyOutput('hh-style-ta',btn);assert.equal(copied.length,0);assert.match(btn.textContent,/완료/);
c._writeState='ok';c.copyOutput('hh-style-ta',btn);assert.deepEqual(copied,['draft']);
c.popStylePending=true;c.copyOutput('pop-style-ta',btn);assert.equal(copied.length,1);
console.log('PASS: pending drafts cannot be copied; completed output can');

// Exercise the actual beat-tab button, not only the common helper.
const node=()=>({style:{},children:[],classList:{add(){},remove(){}},appendChild(x){this.children.push(x);}});
c.document.createElement=node;
vm.runInContext(src.slice(src.indexOf('function makeOutBlock('),src.indexOf('function makeOutBlock(')+src.slice(src.indexOf('function makeOutBlock(')).indexOf('\n}')+2),c);
c._writeState='pending';const box=c.makeOutBlock('section','','hh-sect-ta','red');box.children[0].children[1].onclick();assert.equal(copied.length,1);
c._writeState='ok';box.children[0].children[1].onclick();assert.equal(copied.length,2);
