// GPT 오디오 분석 — 같은 OpenAI 키로 MP3/WAV를 직접 듣고 레퍼런스 분석과 완성곡 평가를 처리한다.
const OPENAI_AUDIO_MODEL='gpt-audio-1.5';
const OPENAI_AUDIO_MAX_FILE=15*1024*1024;

function audioFileFormat(file){
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  if(ext==='wav'||file.type==='audio/wav'||file.type==='audio/x-wav')return'wav';
  if(ext==='mp3'||file.type==='audio/mpeg'||file.type==='audio/mp3')return'mp3';
  return'';
}
function fileToBase64(file){
  return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=()=>reject(new Error('파일을 읽지 못했어요'));r.readAsDataURL(file);});
}
function audioStatus(id,msg,kind){
  const el=document.getElementById(id);if(!el)return;
  el.hidden=!msg;el.textContent=msg||'';
  el.style.color=kind==='err'?'var(--danger)':kind==='ok'?'var(--success)':'var(--text-2)';
}
async function askOpenAIAudio(file,text){
  const key=getOpenAIKey();
  if(!key)throw new Error('상단 AI 추천에서 OpenAI API Key를 먼저 저장해주세요');
  if(!file)throw new Error('MP3 또는 WAV 파일을 먼저 골라주세요');
  if(file.size>OPENAI_AUDIO_MAX_FILE)throw new Error(`파일이 ${(file.size/1048576).toFixed(1)}MB예요 — 15MB 이하 파일을 사용해주세요`);
  const format=audioFileFormat(file);
  if(!format)throw new Error('현재 음원 분석은 MP3와 WAV 파일을 지원해요');
  const res=await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'content-type':'application/json','authorization':`Bearer ${key}`},
    body:JSON.stringify({
      model:OPENAI_AUDIO_MODEL,
      modalities:['text'],
      max_completion_tokens:4000,
      messages:[{role:'user',content:[
        {type:'text',text},
        {type:'input_audio',input_audio:{data:await fileToBase64(file),format}},
      ]}],
    }),
  });
  if(!res.ok){const body=await res.text().catch(()=>'');throw new Error(`GPT 오디오 분석 오류 (${res.status}) ${body.slice(0,140)}`);}
  const data=await res.json();
  const out=data.choices?.[0]?.message?.content||'';
  if(!out.trim())throw new Error('GPT가 빈 분석 결과를 반환했어요 — 다시 시도해주세요');
  return out;
}
async function runAudioAnalysis(btn,statusId,job){
  const label=btn.textContent;btn.disabled=true;btn.textContent='🎧 GPT가 듣는 중…';audioStatus(statusId,'음원 전체를 분석하고 있어요. 잠시 기다려주세요.');
  try{await job();}catch(e){audioStatus(statusId,'❌ '+e.message,'err');}
  finally{btn.disabled=false;btn.textContent=label;}
}
function renderOpenAiAudio(){
  const box=document.getElementById('hh-openai-audio');if(!box)return;
  const connected=!!getOpenAIKey();
  box.innerHTML=`<div style="font-size:11px;color:${connected?'var(--success)':'var(--text-3)'};margin-bottom:8px">${connected?'✅ OpenAI 연결됨 · GPT가 실제 음원을 듣고 분석합니다':'상단 AI 추천에서 OpenAI API Key를 먼저 저장하세요'}</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input id="hh-audio-file" type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" style="font-size:11px;color:var(--text-2);max-width:250px">
  <button onclick="openAiAnalyzeBrief(this)" ${connected?'':'disabled'} style="padding:7px 16px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:12px;font-weight:700;cursor:pointer;opacity:${connected?1:.5}">🎧 이 음원 분석</button></div>
  <div style="font-size:10px;color:var(--text-3);margin-top:5px">MP3/WAV · 최대 15MB · BPM과 Key는 Spotify 분석값을 우선 사용합니다.</div>`;
}
function refreshOpenAiAudioUi(){
  renderOpenAiAudio();
  const body=document.getElementById('hh-listen-body');if(body)body.innerHTML=listenHtml();
}
function openAiAudioFromMain(){
  const details=document.getElementById('hh-brief-audio');if(details)details.open=true;
  details?.scrollIntoView({behavior:'smooth',block:'center'});
  if(!getOpenAIKey())audioStatus('hh-brief-status','❌ 상단 AI 추천에서 OpenAI API Key를 먼저 저장해주세요','err');
}
async function openAiAnalyzeBrief(btn){
  const file=document.getElementById('hh-audio-file')?.files?.[0];
  await runAudioAnalysis(btn,'hh-brief-status',async()=>{
    const raw=await askOpenAIAudio(file,audioBriefRequestText());
    if(!applyBriefFromRaw(raw))throw new Error('GPT 분석 결과를 적용 가능한 형식으로 읽지 못했어요 — 다시 시도해주세요');
    audioStatus('hh-brief-status','✅ 음원 분석 완료 — 아래 추천 카드에서 적용할 항목을 확인하세요','ok');
  });
}
async function listenOpenAiRun(btn){
  const file=document.getElementById('hh-listen-file')?.files?.[0];
  await runAudioAnalysis(btn,'hh-listen-status',async()=>{
    const answer=await askOpenAIAudio(file,listenRequestText()+'\n\n첨부한 음원을 처음부터 끝까지 직접 듣고 평가해줘.');
    const ta=document.getElementById('hh-external-feedback-ta');
    _extFeedbackDraft=answer;if(ta)ta.value=answer;
    audioStatus('hh-listen-status','✅ GPT 평가 완료 — 수정 제안으로 바꾸는 중…','ok');
    await aiParseExternalFeedback();
  });
}

renderOpenAiAudio();
