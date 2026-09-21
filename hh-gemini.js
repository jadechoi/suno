// 🎧 Gemini 직접 연결 — 곡 파일(mp3)·유튜브 링크·곡 제목을 앱에서 바로 Gemini API에 보내 분석시키고, 답을 받아 자동 처리한다 (복사·붙여넣기 없이)
// 키는 사용자가 직접 입력해 이 브라우저(localStorage)에만 저장. 키가 없으면 기존 복사·붙여넣기 방식이 그대로 동작.
const GEMINI_DEFAULT_MODEL='gemini-flash-latest';   // 최신 flash로 자동 연결되는 별칭 — 안 되면 키 입력줄의 모델 칸에서 직접 바꿈
const GEMINI_MAX_FILE=14*1024*1024;                  // base64로 부풀면 요청 20MB 한도 안에 들어오는 크기
function getGeminiKey(){try{return localStorage.getItem('gemini_api_key')||'';}catch(_){return'';}}
function getGeminiModel(){try{return localStorage.getItem('gemini_model')||GEMINI_DEFAULT_MODEL;}catch(_){return GEMINI_DEFAULT_MODEL;}}
function saveGeminiKey(inputId){
  const val=(document.getElementById(inputId)?.value||'').trim();
  if(!val)return;
  try{
    localStorage.setItem('gemini_api_key',val);
    const m=(document.getElementById(inputId+'-model')?.value||'').trim();
    if(m&&m!==GEMINI_DEFAULT_MODEL)localStorage.setItem('gemini_model',m);else localStorage.removeItem('gemini_model');
  }catch(_){}
  refreshGeminiUi();
}
function clearGeminiKey(){
  try{localStorage.removeItem('gemini_api_key');}catch(_){}
  refreshGeminiUi();
}
// 키 입력줄 / 연결됨 표시 — 두 흐름(참고 곡 분석, 들어보고 확인)이 같이 씀
function geminiKeyHtml(id){
  if(getGeminiKey())return `<div style="font-size:11px;color:var(--success)">✅ Gemini 연결됨 <span style="color:var(--text-3)">(모델 ${escHtml(getGeminiModel())})</span> <a href="#" onclick="clearGeminiKey();return false" style="color:var(--text-3);margin-left:6px">키 지우기</a></div>`;
  return `<div style="font-size:11px;color:var(--text-2);line-height:1.7;margin-bottom:6px">앱에서 바로 분석하려면 <a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--accent-text)">Google AI Studio</a>에서 Gemini API Key를 발급해 한 번만 넣어두세요 (무료 등급 있음). 키는 이 브라우저에만 저장돼요.</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap"><input id="${id}" type="password" placeholder="Gemini API Key" autocomplete="off" style="flex:1;min-width:160px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-1);font-size:12px;padding:6px 8px">
  <input id="${id}-model" placeholder="모델 (기본 ${GEMINI_DEFAULT_MODEL})" autocomplete="off" style="width:170px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-1);font-size:11px;padding:6px 8px">
  <button onclick="saveGeminiKey('${id}')" style="padding:6px 14px;border-radius:var(--r-sm);border:none;background:var(--accent-dim);color:var(--accent-text);font-size:12px;font-weight:700;cursor:pointer">저장</button></div>`;
}
function fileToBase64(file){
  return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=()=>rej(new Error('파일을 읽지 못했어요'));r.readAsDataURL(file);});
}
function audioMime(file){
  if(file.type&&file.type.startsWith('audio/'))return file.type;
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  return {mp3:'audio/mp3',wav:'audio/wav',m4a:'audio/m4a',aac:'audio/aac',ogg:'audio/ogg',flac:'audio/flac',webm:'audio/webm'}[ext]||'audio/mp3';
}
// 혼잡(503)·일시 오류(500)면 잠깐 뒤 한 번 더, 그래도 안 되면 다음 모델로 — 모델마다 처리 용량이 따로라 하나가 붐빌 때 다른 모델은 되는 경우가 많음
// 사용자가 고른 모델이 맨 앞, 나머지는 대체 후보 (품질이 떨어지는 lite 계열은 뺌)
const GEMINI_FALLBACKS=['gemini-flash-latest','gemini-2.5-flash','gemini-pro-latest'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function geminiPost(model,key,body){
  const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),180000);
  try{
    const resp=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body),signal:ctl.signal});
    return {status:resp.status,ok:resp.ok,data:await resp.json().catch(()=>({}))};
  }catch(e){throw new Error(e.name==='AbortError'?'Gemini 응답이 너무 오래 걸려 중단했어요 — 다시 시도해주세요':'Gemini에 연결하지 못했어요 (네트워크를 확인해주세요)');}
  finally{clearTimeout(to);}
}
// 429(한도) 응답을 사람이 알아볼 문장으로 — 하루 한도인지 분당 한도인지, 얼마 뒤에 되는지, 어느 모델인지
function geminiQuotaText(e){
  const det=e.data?.error?.details||[];
  const v=det.find(x=>x.violations)?.violations?.[0]||{};
  const delay=det.find(x=>x.retryDelay)?.retryDelay;
  const secs=delay?Math.ceil(parseFloat(delay)):0;
  const who=` (모델 ${v.quotaDimensions?.model||e.model})`;
  if(/PerDay/i.test(v.quotaId||''))return '오늘 Gemini 무료 사용량을 다 썼어요 — 내일 다시 하거나, Google AI Studio에서 결제를 연결하면 풀려요'+who;
  if(secs)return `Gemini 요청이 너무 잦아요 — 약 ${secs}초 뒤에 다시 눌러주세요`+who;
  return 'Gemini 사용량 한도에 걸렸어요 — '+String(e.msg||'').slice(0,90)+who;
}
// Gemini에게 묻기 — file(오디오)·youtube(링크)가 있으면 그걸 듣게 하고, 둘 다 없으면 search가 곡명 웹 검색으로 대신. note(msg)는 재시도 안내용
async function geminiAsk({text,file,youtube,search,note}){
  const key=getGeminiKey();
  if(!key)throw new Error('Gemini API Key를 먼저 저장해주세요');
  if(file&&file.size>GEMINI_MAX_FILE)throw new Error(`파일이 ${(file.size/1048576).toFixed(1)}MB예요 — ${Math.round(GEMINI_MAX_FILE/1048576)}MB 이하로 줄이거나, 복사·붙여넣기 방식을 써주세요`);
  const parts=[];
  if(file)parts.push({inlineData:{mimeType:audioMime(file),data:await fileToBase64(file)}});
  if(youtube)parts.push({fileData:{fileUri:youtube,mimeType:'video/mp4'}});
  parts.push({text});
  const body={contents:[{parts}]};
  if(search&&!file&&!youtube)body.tools=[{google_search:{}}];
  const models=[getGeminiModel(),...GEMINI_FALLBACKS.filter(m=>m!==getGeminiModel())];
  let last=null,first=null;   // first = 사용자가 고른(맨 앞) 모델의 실패 — 대체 모델(Pro는 무료 한도가 없을 수 있음)의 실패 사유로 덮어쓰면 오해를 부름
  for(let mi=0;mi<models.length;mi++){
    for(let attempt=0;attempt<2;attempt++){
      if(mi>0&&attempt===0)note&&note(`Gemini가 혼잡해서 다른 모델(${models[mi]})로 다시 시도하는 중…`);
      if(attempt>0){note&&note('Gemini가 혼잡해서 잠깐 뒤 다시 시도하는 중…');await sleep(3000);}
      const r=await geminiPost(models[mi],key,body);
      if(r.ok){
        const out=(r.data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim();
        if(!out)throw new Error(r.data.promptFeedback?.blockReason?`Gemini가 요청을 막았어요 (${r.data.promptFeedback.blockReason})`:'Gemini가 빈 답을 줬어요 — 다시 시도해주세요');
        return out;
      }
      const msg=r.data.error?.message||`HTTP ${r.status}`;
      if(r.status===400&&/API key/i.test(msg))throw new Error('Gemini API Key가 올바르지 않아요');
      last={status:r.status,msg,data:r.data,model:models[mi]};if(!first)first=last;
      // 검색 도구(google_search)는 별도 한도가 있거나 지원이 안 되는 모델이 있어서, 도구 때문에 막힌 거면 검색 없이 같은 모델로 한 번 더
      if(body.tools&&(r.status===429||r.status===400)){delete body.tools;note&&note('검색 기능 없이 다시 시도하는 중…');attempt--;continue;}
      if(r.status===503||r.status===500)continue;   // 혼잡·일시 오류 — 같은 모델로 한 번 더, 그다음 다음 모델
      break;                                        // 404(없는 모델)·429(한도) 등은 같은 모델 재시도가 의미 없음 — 바로 다음 모델
    }
  }
  const e=first||last;
  if(e.status===429)throw new Error(geminiQuotaText(e));
  if(last.status===404)throw new Error(`쓸 수 있는 모델을 못 찾았어요 — 키 입력줄의 모델 칸에 다른 이름을 넣어보세요 (${last.msg})`);
  if(last.status===503)throw new Error('Gemini가 계속 혼잡해요(모델 여러 개를 시도했어요) — 몇 분 뒤에 다시 눌러주세요');
  throw new Error('Gemini 오류: '+last.msg);
}
function geminiStatus(id,msg,kind){
  const el=document.getElementById(id);if(!el)return;
  el.hidden=!msg;el.textContent=msg||'';
  el.style.color=kind==='err'?'var(--danger)':kind==='ok'?'var(--success)':'var(--text-2)';
}
// 버튼을 잠그고 진행 표시 → job 실행 → 실패하면 상태 줄에 사유
async function geminiRun(btn,statusId,job){
  const orig=btn.textContent;btn.disabled=true;btn.textContent='🎧 분석 중… (보통 20~60초)';geminiStatus(statusId,'');
  try{await job();}
  catch(e){geminiStatus(statusId,'❌ '+e.message,'err');}
  finally{btn.disabled=false;btn.textContent=orig;}
}
function refreshGeminiUi(){
  renderGeminiDirect();
  const lb=document.getElementById('hh-listen-body');if(lb)lb.innerHTML=listenHtml();
}

// ── 흐름 1: 참고 곡 분석 (✨ 박스의 Gemini 칸) — 곡 제목만 / 유튜브 링크 / mp3 중 하나면 됨 ──
function renderGeminiDirect(){
  const box=document.getElementById('hh-gem-direct');if(!box)return;
  box.innerHTML=`<div style="margin-bottom:8px">${geminiKeyHtml('hh-gem-key')}</div>`+(getGeminiKey()?`
  <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
    <input id="hh-gem-file" type="file" accept="audio/*" style="font-size:11px;color:var(--text-2);max-width:230px">
    <input id="hh-gem-yt" placeholder="또는 유튜브 링크" style="flex:1;min-width:150px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-1);font-size:12px;padding:6px 8px">
    <button onclick="geminiAnalyzeBrief(this)" style="padding:6px 14px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:12px;font-weight:700;cursor:pointer">🎧 Gemini로 바로 분석</button>
  </div>
  <div style="font-size:11px;color:var(--text-3);margin-top:4px;line-height:1.6"><b>곡 제목만</b> 넣어도 돼요(위 참고 곡 칸) — 이때는 소리를 듣는 게 아니라 웹 검색으로 분석해서 덜 정확할 수 있어요. mp3나 유튜브 링크를 주면 실제 소리로 분석해요. 끝나면 아래에 추천 카드가 바로 나와요.</div>
`:'');
}
// 메인 줄의 "🎧 Gemini로 분석" 버튼 — 키가 없으면 키 입력칸을 열어 안내, 있으면 바로 분석 (진행·오류는 눈에 보이는 hh-brief-status에 표시)
function geminiFromMain(btn){
  document.getElementById('hh-brief-section')?.scrollIntoView({behavior:'smooth',block:'start'});
  if(!getGeminiKey()){
    const d=document.getElementById('hh-brief-gemini');if(d)d.open=true;
    geminiStatus('hh-brief-status','🎧 Gemini API Key를 먼저 저장해주세요 — 아래 칸에서 한 번만 넣으면 돼요','err');
    document.getElementById('hh-gem-key')?.focus();
    return;
  }
  return geminiAnalyzeBrief(btn);
}
async function geminiAnalyzeBrief(btn){
  const file=document.getElementById('hh-gem-file')?.files?.[0]||null;
  const yt=(document.getElementById('hh-gem-yt')?.value||'').trim();
  const title=(document.getElementById('hh-ref-song')?.value||document.getElementById('hh-brief')?.value||'').trim();
  if(!file&&!yt&&!title){geminiStatus('hh-brief-status','❌ 위 참고 곡 칸에 곡 제목을 넣거나, mp3·유튜브 링크를 넣어주세요','err');return;}
  await geminiRun(btn,'hh-brief-status',async()=>{
    const ans=await geminiAsk({text:geminiBriefRequestText(),file,youtube:yt||null,search:true,note:m=>geminiStatus('hh-brief-status',m)});
    if(!applyBriefFromRaw(ans))throw new Error('Gemini 답에서 JSON을 못 찾았어요 — 다시 시도하거나 복사·붙여넣기 방식을 써주세요');
    geminiStatus('hh-brief-status','✅ 분석 완료 — 아래 추천 카드에서 적용할 항목을 확인하세요','ok');
  });
}

// ── 흐름 2: 만든 곡 듣고 평가 (결과 화면의 🎧 카드) — mp3 하나로 평가 → 제안까지 자동 ──
async function listenGeminiRun(btn){
  const file=document.getElementById('hh-listen-file')?.files?.[0];
  if(!file){geminiStatus('hh-listen-status','❌ Suno에서 받은 곡 파일(mp3)을 먼저 골라주세요','err');return;}
  await geminiRun(btn,'hh-listen-status',async()=>{
    const ans=await geminiAsk({text:listenRequestText()+'\n\n(첨부된 오디오를 끝까지 들으면서 위 형식으로 답해줘)',file,note:m=>geminiStatus('hh-listen-status',m)});
    const ta=document.getElementById('hh-external-feedback-ta');
    _extFeedbackDraft=ans;if(ta)ta.value=ans;
    if(getAnthropicKey()){
      geminiStatus('hh-listen-status','✅ Gemini 평가를 받았어요 — 제안으로 바꾸는 중…','ok');
      await aiParseExternalFeedback();
    }else geminiStatus('hh-listen-status','✅ Gemini 평가를 아래 칸에 넣었어요. 제안으로 바꾸려면 Anthropic API Key가 필요해요','ok');
  });
}
renderGeminiDirect();
