const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8'),c=vm.createContext({});
vm.runInContext(app.slice(app.indexOf('function rememberChoice('),app.indexOf('function renderIntentStatus(')),c);
const state={melody:['Guitar loop'],drums:[],genreDefaults:{},referenceSelections:{}};
c.rememberChoice(state,'melody');c.rememberChoice(state,'drums');
state.melody=['Piano'];state.drums=['Trap rolls'];state.texture=['Dry intimate'];state.referenceSelections.melody=['Piano'];
c.preserveChoices(state);assert.equal(state.melody[0],'Guitar loop');assert.equal(state.drums.length,0);assert.equal(state.texture[0],'Dry intimate');assert.equal(state.referenceSelections.melody,undefined);assert.equal(state.recommendationConflicts.length,2);
state.manualChoices={};state.melody=['Piano'];c.preserveChoices(state);assert.equal(state.melody[0],'Piano');assert.equal(state.recommendationConflicts.length,0);
console.log('PASS: explicit values and empty choices preserved, conflict visibility, provenance and unlock');
