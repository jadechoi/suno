const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const c=vm.createContext({});vm.runInContext(fs.readFileSync('reference-v2.js','utf8'),c);
// Actual failure text is retained; only the evidence-item response is a synthetic fixture.
const rows=JSON.parse(fs.readFileSync('reports/analysis-steps-live.json'));
for(const r of rows){const search=r.analysis.analysisDiagnostics.find(x=>x.stage==='reference-v2-research');const e=r.analysis.analysisEvidence.groove;assert.equal(e.supportMatched,false);assert.ok(e.supportQuote);const sources=search.sources;assert.ok(sources.length);
 const items=c.referenceResearchItems(JSON.stringify({items:[{statement:e.supportQuote,scope:'track',subject:r.input.title,urls:[sources[0].url]},{statement:'Producer generally uses acoustic guitars',scope:'artist-genre',subject:'producer catalog',urls:[sources[0].url]}]}),sources);
 const linked=c.linkReferenceEvidence({...e,evidenceIds:['E1']},items,'');assert.equal(linked.supportMatched,true);assert.equal(c.classifyReferenceEvidence({instrumentalProfile:{groove:'pulse'},analysisEvidence:{groove:linked}}).groove.status,'source-linked');
 assert.equal(c.linkReferenceEvidence({...e,evidenceIds:['E1','missing']},items,'').supportMatched,false);
 const general=c.linkReferenceEvidence({...e,evidenceIds:['E2']},items,'');assert.equal(general.scope,'artist-genre');assert.equal(c.classifyReferenceEvidence({instrumentalProfile:{groove:'pulse'},analysisEvidence:{groove:general}}).groove.status,'general-context');
 assert.equal(c.linkReferenceEvidence({...e,evidenceIds:['E1','E2']},items,'').supportMatched,false);
 const bad=c.referenceResearchItems(JSON.stringify({items:[{statement:'made up URL',scope:'track',urls:['https://not-consulted.example']}]}),sources);assert.equal(c.linkReferenceEvidence({...e,evidenceIds:['E1']},bad,'').supportMatched,false);
}
assert.throws(()=>c.referenceResearchItems('old prose summary',[]));
assert.equal(c.linkReferenceEvidence({basis:'user-description',supportQuote:'차갑다'},[],'이 곡은 차갑다').supportMatched,true);
console.log('PASS: recorded quote failures linked by IDs in synthetic ledger; mixed/general/unknown IDs and unconsulted URLs rejected. No live model rerun.');
