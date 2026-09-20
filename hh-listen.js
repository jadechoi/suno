// 🎧 들어보고 확인하기 — 음악을 잘 몰라도 "프롬프트대로 나왔는지"를 귀로 확인할 수 있게, 프롬프트 설정에서 쉬운 말 질문을 만들고
// 답을 기존 "들어본 피드백 → 적용 가능한 제안" 파이프라인(aiParseExternalFeedback)에 넣는다. 오디오를 직접 듣는 AI에게 줄 평가 요청문도 만들어 줌.
const INSTR_PLAIN={
  'Dark synth':'어둡고 낮게 깔리는 신디사이저(전자 건반) 소리','Emotional piano':'감성적인 피아노 소리','Guitar loop':'반복되는 기타 소리',
  'Sample chop':'옛 노래를 잘라 붙인 듯한 짧은 샘플 소리','Ambient pad':'구름처럼 넓게 깔리는 잔잔한 배경음','Brass stab':'"빵!" 하고 짧게 끊어 치는 관악기 소리',
  'Strings':'바이올린 같은 현악기 소리','Psychedelic FX':'몽환적으로 일렁이는 효과음','Rhodes keys':'따뜻하고 부드러운 전자 피아노 소리',
  'Saxophone':'색소폰 소리','Supersaw synth':'넓고 화려하게 퍼지는 밝은 신디사이저 소리','Flute':'플루트(피리 같은) 소리','Harp':'하프를 튕기는 소리',
  'Music box':'오르골 소리','Organ':'오르간 소리','Vibraphone':'통통 울리는 비브라폰(금속 건반) 소리','Kalimba':'맑게 통통 튀는 칼림바(엄지 피아노) 소리',
  'Arp pluck synth':'통통 튕기며 빠르게 오르내리는 신디사이저 소리','Cello':'낮고 묵직한 첼로 소리','Sitar':'인도 전통 현악기(시타르) 소리','Vocoder synth':'로봇 목소리처럼 변조된 신디사이저 소리',
};
const DRUM_PLAIN={
  'Sub-bass punch':'가슴을 치는 낮고 묵직한 킥','Crisp hi-hats':'"칙칙" 촘촘하고 또렷한 하이햇(작은 심벌 소리)','Rolling triplets':'"따다다닥" 3연음으로 굴러가는 하이햇',
  'Trap rolls':'갈수록 빨라지는 "다다다다" 하이햇 롤','Boom Bap kick':'묵직하고 옛날 힙합 같은 킥','Glitchy breaks':'끊기고 튀는 듯한 불규칙한 드럼',
  'Four-on-the-floor kick':'"쿵-쿵-쿵-쿵" 일정하게 떨어지는 클럽 킥','Jersey bounce kick':'통통 튀는 저지 클럽식 킥','Afro log drum':'나무통을 치는 듯한 아프로 로그 드럼 소리',
  'Shaker groove':'"쉬쉬" 흔드는 셰이커 소리','Conga accents':'손으로 치는 콩가 북 소리','Rimshot snare':'"딱!" 하고 가장자리를 치는 스네어',
  'Memphis cowbell chop':'"딩동" 울리는 카우벨 소리','Live jazz drums':'재즈 밴드 같은 생 드럼 소리',
};
// 한글 받침 유무로 이/가 선택
const josaIGa=w=>{const c=(w||'').trim().slice(-1).charCodeAt(0);return c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0?'이':'가';};
let _listenAns={},_listenFor='';
// 프롬프트가 바뀌면(=다른 곡) 예전 답은 버림
function listenSync(){
  const fp=hhWriteFingerprints().fpFull+(document.getElementById('hh-sect-ta')?.value||'').length;
  if(fp!==_listenFor){_listenFor=fp;_listenAns={};}
}
// 질문 목록 — expect: 이 답이 나와야 프롬프트대로 나온 것. no: 기대와 다를 때 피드백 문장
function listenChecklist(){
  const g=GENRES[st.genre];const items=[];
  if(!g)return items;
  const hasVocal=st.vocal&&st.vocal!=='No Vocal';
  const roles=computeMelodyRoles(st.melody);const lead=roles?roles.lead:st.melody[0];
  const bpm=st.bpm;
  const tempo=bpm>=150?'아주 빠르고 숨가쁜':bpm>=130?'빠르고 몸이 들썩이는':bpm>=100?'중간 속도의':'느긋하고 여유로운';
  const mood=HH_MOODS.find(m=>m.kr===st.mood);
  const nHook=st.structSegs.filter(s=>s==='hook').length,nBridge=st.structSegs.filter(s=>s==='bridge').length;
  items.push(hasVocal
    ?{id:'vocal',q:'사람 목소리(노래·랩)가 곡에서 또렷하게 들리나요?',expect:'yes',bad:'보컬이 요청대로 또렷하게 나오지 않는다'}
    :{id:'vocal',q:'사람 목소리(노래·랩)가 들리나요? (안 들려야 정상이에요)',expect:'no',bad:'무보컬로 요청했는데 사람 목소리나 보컬 같은 소리가 나왔다'});
  items.push({id:'tempo',q:`곡이 ${tempo} 느낌인가요? (${bpm} BPM)`,expect:'yes',bad:`템포가 ${bpm} BPM(${tempo}) 느낌과 다르게 들린다`});
  if(lead)items.push({id:'lead',q:`${INSTR_PLAIN[lead]||lead}${josaIGa(INSTR_PLAIN[lead]||lead)} 곡 초반부터 또렷하게 들리나요?`,expect:'yes',bad:`리드 악기(${lead})가 잘 안 들리거나 다른 소리에 묻힌다`});
  const d0=st.drums[0];
  if(d0)items.push({id:'drum',q:`${DRUM_PLAIN[d0]||d0}${josaIGa(DRUM_PLAIN[d0]||d0)} 들리나요?`,expect:'yes',bad:`메인 드럼(${d0}) 소리가 안 들리거나 약하다`});
  if(st._808&&st._808!=='None')items.push({id:'bass',q:'낮고 묵직하게 울리는 베이스가 느껴지나요?',expect:'yes',bad:`808/베이스(${st._808})가 약하거나 안 느껴진다`});
  if(nBridge)items.push({id:'bridge',q:'곡 중간에 소리가 확 줄었다가(조용해졌다가) 다시 크게 터지는 순간이 있나요?',expect:'yes',bad:'브릿지(소리가 줄었다가 터지는 전환)가 안 느껴져서 전개가 밋밋하다'});
  if(nHook>1)items.push({id:'hooks',q:'가장 신나는 부분(후렴)이 여러 번 돌아오나요?',expect:'yes',bad:'훅(후렴)이 반복해서 돌아오는 구조가 잘 안 느껴진다'});
  if(nHook>1)items.push({id:'climax',q:'마지막 후렴이 처음보다 더 꽉 차고 세게 들리나요?',expect:'yes',bad:'마지막 훅이 처음 훅보다 커지지 않아 클라이맥스가 약하다'});
  items.push({id:'outro',q:'곡이 어색하게 뚝 끊기지 않고 자연스럽게 끝나나요?',expect:'yes',bad:'아웃트로(끝)가 어색하게 끊긴다'});
  if(mood)items.push({id:'mood',q:`전체 분위기가 "${mood.kr}" 느낌인가요?`,expect:'yes',bad:`분위기가 "${mood.kr}"이 아니라 다르게 들린다`});
  items.push({id:'genre',q:`이런 느낌인가요? — ${GENRE_FEEL[st.genre]||g.sound}`,expect:'yes',bad:`${g.kr} 장르의 느낌이 잘 안 난다`});
  items.push({id:'overall',q:'한 번 더 듣고 싶을 만큼 마음에 드나요?',expect:'yes',bad:'전체적으로 매력·임팩트가 부족하다'});
  return items;
}
function listenHtml(){
  listenSync();
  const items=listenChecklist();
  if(!items.length)return '<div style="font-size:12px;color:var(--text-3)">장르를 고르고 Generate를 누르면 확인 질문이 나와요.</div>';
  const btn=(id,val,label,on)=>`<button onclick="listenAnswer('${id}','${val}')" style="padding:4px 11px;border-radius:14px;border:1px solid ${on?'var(--accent)':'var(--border)'};background:${on?'var(--accent-dim)':'var(--surface-2)'};color:${on?'var(--accent-text)':'var(--text-2)'};font-size:11px;cursor:pointer">${label}</button>`;
  const rows=items.map(it=>{const a=_listenAns[it.id];return `<div style="padding:8px 0;border-bottom:1px solid var(--border)"><div style="font-size:12px;color:var(--text-1);margin-bottom:6px">${escHtml(it.q)}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${btn(it.id,'yes','그래요',a==='yes')}${btn(it.id,'no','아니에요',a==='no')}${btn(it.id,'skip','모르겠어요',a==='skip')}</div></div>`;}).join('');
  const answered=items.filter(it=>_listenAns[it.id]&&_listenAns[it.id]!=='skip');
  const bad=items.filter(it=>_listenAns[it.id]&&_listenAns[it.id]!=='skip'&&_listenAns[it.id]!==it.expect);
  const hasKey=!!getAnthropicKey();
  return `<div style="font-size:12px;color:var(--text-2);line-height:1.7;margin-bottom:8px">음악을 몰라도 돼요. Suno에서 만든 곡을 들으면서 아래 질문에 답해 주세요. <b>"모르겠어요"는 건너뛰어도 됩니다.</b> 프롬프트대로 안 나온 부분이 어디인지 골라내서, 프롬프트에서 고칠 곳으로 바꿔 드려요. (곡이 2개 나오면 마음에 드는 쪽으로 들어 보세요.)</div>
${rows}
<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px">
  <button onclick="listenApply()" ${bad.length&&hasKey?'':'disabled'} style="padding:7px 16px;border-radius:20px;border:1px solid var(--accent);background:var(--accent);color:#fff;font-size:12px;font-weight:700;cursor:pointer;opacity:${bad.length&&hasKey?1:.5}">🔧 안 맞은 ${bad.length}개를 프롬프트에 반영</button>
  <span style="font-size:11px;color:var(--text-3)">${!hasKey?'API Key가 필요해요':answered.length?`답한 ${answered.length}개 중 ${answered.length-bad.length}개는 프롬프트대로 나왔어요`:'아직 답한 게 없어요'}</span>
</div>
<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:11px;color:var(--text-3);line-height:1.7">
  귀로 확인하기 어렵다면: 곡 파일(mp3)을 <b>오디오를 들을 수 있는 AI</b>(예: Gemini)에 올리고 아래 평가 요청문을 붙여 넣으세요. 나온 답을 위 "들어본 피드백 붙여넣기" 칸에 넣으면 같은 방식으로 반영돼요.
  <div style="margin-top:6px"><button onclick="listenCopyAiRequest(this)" style="padding:5px 12px;border-radius:14px;border:1px solid var(--border-hi);background:var(--surface-3);color:var(--accent-text);font-size:11px;cursor:pointer">📋 AI 평가 요청문 복사</button></div>
</div>`;
}
function renderListen(){const el=document.getElementById('hh-listen-body');if(el)el.innerHTML=listenHtml();}
function listenAnswer(id,val){_listenAns[id]=_listenAns[id]===val?undefined:val;renderListen();}
// 안 맞은 답 → 피드백 문장 → 기존 외부 피드백 파이프라인
function listenApply(){
  const items=listenChecklist();
  const bad=items.filter(it=>_listenAns[it.id]&&_listenAns[it.id]!=='skip'&&_listenAns[it.id]!==it.expect);
  const good=items.filter(it=>_listenAns[it.id]===it.expect).map(it=>it.id);
  if(!bad.length)return;
  const ta=document.getElementById('hh-external-feedback-ta');
  if(!ta){showToast?.('API Key를 저장하면 반영할 수 있어요');return;}
  ta.value=`실제로 곡을 들은 초보자 체크 결과입니다. 아래 항목은 프롬프트대로 나오지 않았습니다:\n${bad.map(b=>'- '+b.bad).join('\n')}\n${good.length?`\n(나머지 ${good.length}개 항목은 프롬프트대로 나왔으니 건드리지 마세요.)`:''}\n프롬프트에서 이 문제를 고칠 수 있는 구체적인 수정만 제안해 주세요.`;
  document.querySelector('#hh-external-feedback-ta')?.closest('details')?.setAttribute('open','');
  aiParseExternalFeedback();
}
// 오디오를 듣는 AI(예: Gemini)에게 줄 평가 요청문 — 답을 "들어본 피드백"에 붙여 넣으면 됨
function listenCopyAiRequest(btn){
  const sect=document.getElementById('hh-sect-ta')?.value||'',style=document.getElementById('hh-style-ta')?.value||'';
  const txt=`첨부한 곡은 Suno AI로 아래 프롬프트를 넣어 만든 곡이야. 곡을 실제로 끝까지 듣고, 프롬프트대로 나왔는지 평가해줘. 음악을 잘 모르는 사람도 이해할 수 있게 쉬운 말로 써줘.

아래 형식으로 답해줘:
【프롬프트대로 나온 것】 실제로 들린 것 (악기, 드럼, 베이스, 보컬 유무, 분위기)
【안 나온 것】 프롬프트에는 있는데 안 들리거나 다르게 들린 것을 구체적으로 — 몇 분 몇 초 근처인지, 어느 섹션(인트로/훅/벌스/브릿지/아웃트로)인지 같이
【구조】 인트로 → 훅 → 벌스 → 브릿지 → 훅 → 아웃트로가 지시대로 나뉘는지, 각 훅이 서로 다르게 들리는지, 마지막 훅이 가장 큰지
【장르·분위기】 맞는지, 아니면 어떤 장르/분위기로 들리는지
【고칠 점 3가지】 프롬프트의 어떤 문구를 어떻게 바꾸면 좋아질지

[스타일 프롬프트]
${style}

[섹션 프롬프트]
${sect}`;
  navigator.clipboard.writeText(txt).then(()=>{const o=btn.textContent;btn.textContent='복사됨!';setTimeout(()=>{btn.textContent=o;},1800);});
}
