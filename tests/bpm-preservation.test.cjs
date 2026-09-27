const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c=vm.createContext({console});
for(const f of ['hh-data.js','hh-ai.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
c.getOpenAIKey=()=> 'fixture';
(async()=>{
 const musicalText='Warm guitar with a relaxed drum pocket.';
 assert.equal(c.preserveSelectedBpm(musicalText,92),'92 BPM. '+musicalText);
 assert.equal(c.preserveSelectedBpm(musicalText,null),musicalText);
 assert.equal(c.preserveSelectedBpm('At 92 BPM. '+musicalText,92),'At 92 BPM. '+musicalText);
 assert.equal(c.preserveSelectedBpm('At 92.5 bpm.',92.5),'At 92.5 bpm.');
 assert.throws(()=>c.preserveSelectedBpm('At 105 BPM.',92),/다른 템포/);
 // Reproduce the live failure: compression drops an originally supplied tempo.
 let calls=0;c.callOpenAI=async()=>{calls++;return '<style>'+musicalText+'</style>';};
 const compressed=await c.fitAiStyle('92 BPM. '+musicalText.repeat(35),'',[],92);
 assert.equal(calls,1);assert.equal(compressed,'92 BPM. '+musicalText);assert(compressed.length<=1000);
 // A compressor changing tempo must not replace the valid original.
 c.callOpenAI=async()=>'<style>At 105 BPM. Fast drums.</style>';
 const original='92 BPM. '+musicalText.repeat(35),diagnostics=[];
 assert.equal(await c.fitAiStyle(original,'',diagnostics,92),original);
 assert.equal(diagnostics.filter(x=>x.stage==='compression-tempo').length,3);
 const section='[Intro]\n(Dry drums.)',spec={bpm:92,structure:[{header:'[Intro]'}]};
 assert(c.validateWritten(spec,section,compressed).ok);
 assert(!c.validateWritten(spec,section,original).ok); // Never truncate to force a pass.
 assert.equal(c.preserveSelectedKey(musicalText,'A# minor'),'In A# minor. '+musicalText);
 for(const equivalent of ['A# minor','A♯ minor','B-flat minor','Bb minor','B♭ minor'])
   assert.equal(c.preserveSelectedKey('In '+equivalent+'.','A# minor'),'In '+equivalent+'.');
 assert.throws(()=>c.preserveSelectedKey('In A# major.','A# minor'),/다른 키/);
 assert.throws(()=>c.preserveSelectedKey('In C minor.','A# minor'),/다른 키/);
 assert.equal(c.preserveSelectedKey('In A minor with a C major chord.','A minor'),'In A minor with a C major chord.');
 c.callOpenAI=async()=>'<style>'+musicalText+'</style>';
 const both=await c.fitAiStyle(original,'',[],92,'D minor');
 assert.equal(both,'In D minor. 92 BPM. '+musicalText);
 assert(c.validateWritten({...spec,key:'D minor'},section,both).ok);
 assert(!c.validateWritten({...spec,key:'D minor'},section,'92 BPM. In D major.').ok);
 console.log('BPM omission restored, compression protected, conflicting tempos rejected, no numeric invention or truncation');
})().catch(e=>{console.error(e);process.exitCode=1;});
