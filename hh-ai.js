// ============================================================
// AI PRODUCER REVIEW (Anthropic API)
// ============================================================
// API Key 없으면 눌러도 "Key부터 넣으세요" 안내만 뜨는 AI 버튼들을 아예 숨김 — Key 저장 성공 시 다시 호출해서 드러남
function updateAiButtonVisibility(){
  const hasKey=!!getAnthropicKey();
  const melodyBlock=document.getElementById('hh-melody-ai-block');
  if(melodyBlock)melodyBlock.hidden=!hasKey;
  const refBlock=document.getElementById('hh-ref-ai-block');
  if(refBlock)refBlock.hidden=!hasKey;
}


// ---- AI 추천 (Anthropic API — 고른 요소를 보고 멜로디·믹스 텍스처 추천) ----
function getAnthropicKey(){
  try{return localStorage.getItem('anthropic_api_key')||'';}catch(_){return'';}
}
// content 배열의 첫 블록이 항상 text는 아님 — extended thinking 블록이 먼저 오면 content[0].text는 undefined가 됨
function anthropicText(data){
  const block=(data.content||[]).find(b=>b.type==='text');
  return block?.text||'';
}
// staticText(지시문/규칙/옵션 목록처럼 호출마다 안 바뀌는 부분)에 prompt caching을 걸어서 반복 호출 시 input 토큰을 아낌.
// 이 모델/계정이 caching을 거부하면(400) 한 번만 감지하고, 그 세션 동안은 캐싱 없이 바로 요청 — 매번 두 번 쏘지 않도록.
let _aiCachingUnsupported=false;
// AI 버튼을 한 번이라도 눌러봐야 알 수 있음 — 캐싱 지원 여부는 콘솔에도 항상 찍히고(F12 → Console, "[AI 캐싱]" 검색),
// 여기서는 🎧 SPOTIFY 연동 패널의 AI Key 밑에 요약 한 줄로 보여줌
function reportCacheStatus(status,usage){
  const el=document.getElementById('ai-cache-status');
  if(!el)return;
  el.hidden=false;
  if(status==='rejected')el.textContent='⚠️ 이 모델은 프롬프트 캐싱 미지원 — 일반 모드로 전환됨 (기능은 정상 작동)';
  else if(status==='active')el.textContent=`🎯 캐싱 작동 중 (생성 ${usage.cache_creation_input_tokens||0} / 재사용 ${usage.cache_read_input_tokens||0} 토큰)`;
  else el.textContent='⚠️ 캐싱 요청이 거부되진 않았지만 실제 사용 흔적이 없음';
}
async function callAnthropic(key,{maxTokens,staticText,dynamicText}){
  const url='https://api.anthropic.com/v1/messages';
  const headers={
    'content-type':'application/json',
    'x-api-key':key,
    'anthropic-version':'2023-06-01',
    'anthropic-dangerous-direct-browser-access':'true',
  };
  const body=useCache=>JSON.stringify({
    model:'claude-sonnet-5',
    max_tokens:maxTokens,
    messages:[{role:'user',content:useCache
      ?[{type:'text',text:staticText,cache_control:{type:'ephemeral'}},{type:'text',text:dynamicText}]
      :staticText+dynamicText
    }],
  });
  const attemptCache=!_aiCachingUnsupported;
  let res=await fetch(url,{method:'POST',headers,body:body(attemptCache)});
  if(!res.ok&&attemptCache){
    _aiCachingUnsupported=true;
    reportCacheStatus('rejected');
    res=await fetch(url,{method:'POST',headers,body:body(false)});
  }
  if(!res.ok){
    const errText=await res.text().catch(()=>'');
    throw new Error(`API 오류 (${res.status}) ${errText.slice(0,150)}`);
  }
  const data=await res.json();
  // usage.cache_creation_input_tokens/cache_read_input_tokens가 응답에 실제로 있어야 캐싱이 "진짜" 동작한 것 —
  // 요청이 거부 안 됐다고 캐싱이 적용됐다는 보장은 없어서 (모델이 그냥 무시할 수도 있음) 직접 확인
  if(attemptCache&&!_aiCachingUnsupported){
    const u=data.usage||{};
    console.log('[AI 캐싱]',u);
    reportCacheStatus((u.cache_creation_input_tokens||u.cache_read_input_tokens)?'active':'ignored',u);
  }
  if(data.stop_reason==='max_tokens')throw new Error('응답이 너무 길어서 잘렸어요 — 다시 시도해주세요');
  const text=anthropicText(data);
  if(!text.trim())throw new Error('AI가 빈 응답을 반환했습니다 — 다시 시도해주세요');
  return text;
}
function saveAnthropicKey(){
  const el=document.getElementById('anthropic-key');
  const val=el?.value.trim()||'';
  const msgEl=document.getElementById('anthropic-key-status');
  if(val==='••••••••••••••••'){ // 패널 열 때 채워둔 마스킹 표시일 뿐, 안 건드렸으면 그대로 둠
    if(msgEl){msgEl.textContent='✅ 이미 저장된 Key 그대로 유지됨';msgEl.hidden=false;msgEl.style.color='var(--success)';}
    return;
  }
  if(!val){
    if(msgEl){msgEl.textContent='❌ Key를 입력하세요';msgEl.hidden=false;msgEl.style.color='var(--danger)';}
    return;
  }
  try{localStorage.setItem('anthropic_api_key',val);}catch(_){}
  if(msgEl){msgEl.textContent='✅ 저장됨 — MELODY 섹션의 🤖 AI 추천받기 버튼을 눌러보세요';msgEl.hidden=false;msgEl.style.color='var(--success)';}
  updateAiButtonVisibility();
}
// 룰 테이블은 정해진 옵션 중 최선을 고를 뿐, "이 조합에 뭘 더하면 좋을지"·"전체적으로 뭐가 아쉬운지" 같은
// 열린 판단은 못 함 — 그 갭을 메우기 위해 여러 관점(악기/편곡/구조/믹스/보컬/무드)에서 자유 형식 조언을 받고,
// 그중 기존 컨트롤(스타일 태그·섹션 강화)로 바로 적용 가능한 것만 원클릭 적용 버튼을 붙임
let _aiSuggestions=null;
const AI_CATEGORY_EMOJI={'총평':'🧑‍🎤','레퍼런스 부합도':'🎯','악기':'🎹','편곡':'🎼','구조':'🏗','믹스':'🎚','보컬':'🎤','무드':'😶','전개':'🎬'};
// aiProducerReview와 aiParseExternalFeedback(외부 피드백 파싱) 둘 다 "조언 → 실제 프롬프트에 적용 가능한 필드"로
// 변환해야 해서, 그 필드 설명과 JSON 스키마를 공유 — 같은 스키마로 나와야 applyAiSuggestion이 출처 구분 없이 그대로 먹음
const AI_SUGGESTION_ACTION_SPEC=`중요: 조언은 참고용으로 끝나면 안 되고 실제 프롬프트에 바로 반영할 수 있어야 해. 그래서 각 조언마다 아래 필드 중 맞는 걸 정확히 하나 채워서 버튼 한 번으로 적용되게 해줘 (총평·레퍼런스 부합도처럼 평가 자체가 목적인 항목은 액션이 없어도 되고, 그 안에서도 구체적으로 적용 가능한 게 있으면 채워도 됨):
- melodyLead: 멜로디 악기가 정확히 2개 선택돼 있고, 조언이 "둘 중 어느 게 리드를 맡아야 하는지"(예: 주파수 대역이 겹쳐서 하나를 백킹으로 물려야 함)에 관한 거면 → 리드를 맡아야 할 악기 이름을 [현재 설정]의 멜로디 악기 목록에 있는 문자열 그대로 정확히 넣어. 중요: 아래 [현재 생성된 섹션 프롬프트]를 먼저 확인해서 이미 그 악기가 "lead melody"로, 다른 하나가 "layered softly beneath/background layer"로 명시돼 있으면(원하는 역할 배치가 이미 되어 있으면) 이 조언 자체를 만들지 마 — 이미 된 걸 tag로 또 추가하면 같은 얘기가 두 군데서 중복되고 뭉개짐. 역할을 바꿔야 할 때만 melodyLead를 채워.
- **먼저 판단**: 조언이 편곡·악기·에너지·믹스·텍스처·리듬 중 뭐든, **"이 곡 전체에 해당하는가" vs "특정 섹션/occurrence 하나에만 해당하는가"**부터 갈라. 특정 섹션 하나 얘기(예: "Hook 2에서 비트크러시", "브릿지에서 스테레오가 넓어짐", "두 번째 훅만 리듬 변주")면 **tag를 쓰지 마 — boostSection+boostOccurrence+boostText(편곡/에너지 톤이면) 또는 narrDir(그 외 전부: 믹스·텍스처·악기 변화도 포함)**를 써. tag는 스타일 박스는 한 번만 존재해서 "이 디테일은 Hook 2에만"이라는 정보 자체가 사라지고, 게다가 스타일 박스는 실측상 10개 안팎 넘으면 Suno가 뒤쪽부터 무시하기 시작해서 자리도 아깝다 — 섹션 전용 디테일을 정확한 섹션 텍스트 옆에 두는 게 Suno가 더 정확히 반영하고, 곡 전체에서도 더 입체적으로 들림.
- tag: **곡 전체에 걸쳐 항상 적용되는 얘기일 때만** (새 악기 추가, 전체 믹스 톤, 보컬 처리 등) → Suno 스타일 태그에 넣을 영어 소문자 **짧은 구/키워드**들의 배열, 완결된 문장 금지 (조언에서 언급한 요소마다 하나씩 따로 — 예를 들어 "콩가, 샤커, 토킹드럼"이면 하나로 뭉치지 말고 ["conga loop","shaker layer","talking drum accent"]처럼 각각 3단어 이내로 짧게. 하나만 있으면 배열에 1개만). 스타일 박스는 태그 10개 안팎이 한계라 꼭 전역이어야 하는 것만 넣어.
- boostSection: 위 판단에서 "특정 섹션 하나"이고 편곡/에너지 쪽 조언일 때 → 아래 [적용 가능한 섹션]에 있는 값 중 정확히 하나. boostOccurrence로 그 타입 중 몇 번째를 말하는 건지도 반드시 같이 정해: first(그 타입의 첫 번째) | last(마지막 — 보통 클라이맥스, 기본값). 조언이 "첫 훅"이라고 하면 first, "마지막/클라이맥스 훅"이면 last — 조언 내용이랑 실제로 일치해야 해. boostText에 Suno 섹션 프롬프트에 그대로 이어붙일 **영어 짧은 구/키워드 결합**을 써 (완결된 문장 아님, 콤마로 구분 — 예: "flute-synth call-and-response, density increasing" 처럼). 아래 [보컬 여부]가 인스트루멘탈이면 보컬·가사·노래 관련 묘사는 절대 넣지 마.
- addSection: 구조가 단조롭다/섹션을 추가하자는 조언일 때 → 추가할 섹션 타입(hook|verse|bridge)과, 그걸 어디 넣을지 addSectionPosition도 같이 정해줘: beforeFirstHook(첫 훅 앞) | afterIntro(인트로 바로 뒤) | beforeLastHook(마지막 훅 직전 — 클라이맥스 텐션 빌드용) | end(아웃트로 직전) 중 조언 내용이랑 실제로 일치하는 위치 하나
- mood: 지금 고른 무드보다 다른 무드가 더 어울린다는 조언일 때 → 정확한 무드 이름 하나
- narrDir: 위 판단에서 "특정 섹션 하나"이고 편곡/에너지가 아닌 다른 카테고리(전개·믹스·텍스처·악기 등)이거나, 여러 occurrence에 걸친 점진적 변화일 때 → 아래 [narrDir에 쓸 수 있는 섹션 키]에 있는 키만 사용해서 {"hook1":"...","verse1":"...","hook2":"...",...} 형식 객체를 만들어. 서사가 특정 구간에만 해당하면 그 키만 넣어도 되고, 전체 곡에 걸친 점진적 변화(예: 밀도가 곡 전체에서 계속 증가)라면 관련된 모든 키에 각각 다른 내용을 채워 — 같은 내용을 여러 키에 반복 복사하지 말고, 그 구간이 전체 흐름에서 몇 번째인지에 맞게 서로 다르게 써(예: hook1은 "sparse, restrained", hook2는 "denser layering, energy builds", hook3은 "full density, all elements in"). 각 값은 Suno 섹션 프롬프트에 그대로 이어붙일 **영어 짧은 구/키워드 결합**(완결된 문장 아님, 콤마 구분 — 예: "energy ramps up gradually" 대신 "gradual energy ramp, no sudden hit"). 아래 [보컬 여부]가 인스트루멘탈이면 보컬·가사·노래 관련 묘사는 절대 넣지 마.
- removeRef: tag를 추가할 때마다 아래 [프로듀서 레퍼런스]에 있는 설명을 한 번씩 대조해봐 — 장르/서브장르 자체가 달라지는 수준으로 상반되면(예: tag는 "log drum bassline"인데 레퍼런스 설명엔 "chiptune-esque synth leads"나 "disco samples, house-inflected bounce"처럼 완전히 다른 서브장르 색채가 이미 박혀있으면) 반드시 그 프로듀서의 정확한 이름을 넣어. 특히 "레퍼런스 부합도" 카테고리는 지금 레퍼런스가 타겟 곡이랑 안 맞는다는 게 핵심 지적이니, 그 안 맞는 레퍼런스를 tag만 추가하고 그대로 두면 안 돼 — 반드시 확인해서 빼
- removeTag: 조언이 "지금 있는 X를 줄이자/빼자"는 뜻도 담고 있으면(예: "sidechain pump가 강하면 무드가 죽으니 줄이자") X를 가리키는 핵심 단어(예: "sidechain")를 넣어 — 그 단어를 포함하는 기존 텍스처/스타일 태그를 전부 제거해. tag(추가)랑 같이 써도 됨 — "줄이고 대신 이걸 넣자"는 조언이면 둘 다 채워
- BPM은 사용자가 직접 설정한 값이니 바꾸자는 조언이어도 액션으로 만들지 마 — 총평/레퍼런스 부합도 텍스트에 언급만 하고 그대로 둬

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해:
{"suggestions":[{"category":"총평|레퍼런스 부합도|악기|편곡|구조|믹스|보컬|무드|전개","text":"한국어 조언 (총평·레퍼런스 부합도는 2~3문장 가능)","score":"(총평일 때만, 1~100 정수)","melodyLead":"(멜로디 리드/백킹 역할을 바꿔야 할 때만, 리드를 맡을 악기 이름)","tag":"(해당시, [\\"...\\",\\"...\\"] 배열)","boostSection":"(해당시)","boostOccurrence":"(boostSection일 때 필수, first|last)","boostText":"(boostSection이고 구체적 아이디어 있을 때만, 영어 짧은 구/키워드 결합)","addSection":"(해당시)","addSectionPosition":"(addSection일 때만, beforeFirstHook|afterIntro|beforeLastHook|end 중 하나)","mood":"(해당시)","narrDir":"(특정 섹션 한정 조언일 때, 위 형식 객체, 값은 영어 짧은 구/키워드 결합)","removeRef":"(tag가 기존 프로듀서 레퍼런스와 모순될 때만, 그 프로듀서 이름)","removeTag":"(기존 걸 줄이자/빼자는 조언일 때만, 그 핵심 단어)"}]}`;
// aiProducerReview·aiParseExternalFeedback 둘 다 이 형태로 모델 응답을 정리 — 출처가 달라도 applyAiSuggestion 입장에선 동일한 객체
function normalizeAiSuggestion(s,uniqueSegs,occKeys){
  return{
    category:s.category||'💡',
    text:s.text,
    score:(Number.isFinite(Math.round(s.score))&&Math.round(s.score)>=1&&Math.round(s.score)<=100)?Math.round(s.score):null,
    // 멜로디 악기가 정확히 2개일 때만 의미 있음 — 1개거나 3개 이상이면 리드/백킹 개념 자체가 없음
    melodyLead:(typeof s.melodyLead==='string'&&st.melody.length===2&&st.melody.includes(s.melodyLead))?s.melodyLead:null,
    // 배열이 정상 형태지만, 모델이 가끔 문자열 하나로 줄 수도 있어서 둘 다 받아 배열로 통일
    tag:(()=>{
      const arr=Array.isArray(s.tag)?s.tag:(typeof s.tag==='string'&&s.tag.trim()?[s.tag]:[]);
      const cleaned=arr.filter(t=>typeof t==='string'&&t.trim()).map(t=>t.trim());
      return cleaned.length?cleaned:null;
    })(),
    boostSection:(s.boostSection&&uniqueSegs.includes(s.boostSection))?s.boostSection:null,
    boostOccurrence:(s.boostOccurrence==='first')?'first':'last',
    boostText:(typeof s.boostText==='string'&&s.boostText.trim())?s.boostText.trim().slice(0,150):null,
    addSection:(['hook','verse','bridge'].includes(s.addSection))?s.addSection:null,
    addSectionPosition:(['beforeFirstHook','afterIntro','beforeLastHook','end'].includes(s.addSectionPosition))?s.addSectionPosition:'beforeLastHook',
    mood:(s.mood&&HH_MOODS.some(m=>m.kr===s.mood))?s.mood:null,
    narrDir:(()=>{
      if(!s.narrDir||typeof s.narrDir!=='object')return null;
      const cleaned=Object.fromEntries(occKeys.filter(k=>typeof s.narrDir[k]==='string'&&s.narrDir[k].trim()).map(k=>[k,s.narrDir[k].trim().slice(0,150)]));
      return Object.keys(cleaned).length?cleaned:null;
    })(),
    removeRef:(s.removeRef&&st.refs.includes(s.removeRef))?s.removeRef:null,
    removeTag:(typeof s.removeTag==='string'&&s.removeTag.trim())?s.removeTag.trim().toLowerCase():null,
    applied:false,
  };
}
async function aiProducerReview(){
  const key=getAnthropicKey();
  const btn=document.getElementById('hh-ai-arrange-btn');
  const statusEl=document.getElementById('hh-ai-arrange-status');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 Anthropic API Key를 먼저 저장하세요');return;}
  if(st.genre===null){fail('장르를 먼저 선택하세요');return;}
  const uniqueSegs=[...new Set(st.structSegs)].filter(s=>s==='hook'||s==='verse'||s==='bridge');
  const occKeys=structOccurrenceKeys();
  const appliedSoFar=(_aiSuggestions||[]).filter(s=>s.applied);

  if(btn){btn.disabled=true;btn.textContent='🤖 분석 중...';}
  if(statusEl)statusEl.hidden=true;
  try{
    const g=GENRES[st.genre];
    const mood=HH_MOODS.find(m=>m.kr===st.mood);
    const refSong=(document.getElementById('hh-ref-song')?.value||'').trim();
    const refProducers=st.refs.length?st.refs.map(kr=>{const p=HH_REF.find(r=>r.kr===kr);return p?p.en:kr;}).join(', '):null;
    const sectText=(document.getElementById('hh-sect-ta')?.value||'').trim();
    const ctx=[
      `장르: ${g.kr} (${g.sound})`,
      mood?`무드: ${mood.kr}`:null,
      st.melody.length?`멜로디 악기: ${st.melody.join(', ')}`:'멜로디 악기 미선택',
      st.texture.length?`믹스 텍스처: ${st.texture.join(', ')}`:null,
      st.vocal&&st.vocal!=='No Vocal'?`보컬: ${st.vocal}`:'보컬 없음 (인스트루멘탈)',
      refProducers?`프로듀서 레퍼런스: ${refProducers}`:null,
      refSong?`타겟 레퍼런스 곡: ${refSong}`:null,
      st.extraTags.length?`이미 추가된 스타일 태그: ${st.extraTags.join(', ')}`:null,
      `구조: ${st.structSegs.join(' → ')}`,
      `BPM ${st.bpm} / Key ${KEYS[st.key]}`,
      antiAI?'Anti-AI 필터 ON — 사용자가 "AI 티 안 나고 사람이 만든 것 같은" 결과를 원함':null,
    ].filter(Boolean).join('\n');
    const hasVocal=st.vocal&&st.vocal!=='No Vocal';
    // 지시문/규칙은 호출마다 안 바뀌니 static — 상태에 따라 달라지는 건 전부 dynamic 쪽으로 몰아서 static이 매번 완전히 동일하게(캐싱 적중)
    const staticText=`너는 경험 많은 힙합 프로듀서야. 아래 [현재 생성된 섹션 프롬프트](실제 텍스트)와 트랙 설정을 보고, 이 곡이 더 창의적이고 퀄리티 있게 나오려면 프롬프트를 어떻게 구성하면 좋을지 서로 다른 관점에서 짧게 조언해줘. 설정값만 보고 짐작하지 말고, 반드시 실제 텍스트를 읽고 거기 적힌 구체적인 단어·구절 기준으로 판단해.

"총평" 카테고리는 반드시 정확히 1개 포함해: 전문 프로듀서로서 지금 설정에서 부족한 점, 이대로 곡이 나오면 아쉬울 부분, 개선하면 확실히 더 좋아질 부분을 솔직하게 총평해줘. 칭찬 말고 실질적인 약점 위주로. 그리고 지금 프롬프트 구성 전체를 100점 만점으로 냉정하게 채점해서 score 필드에 정수로 넣어 — 후하게 주지 말고, 진짜 완성도 있는 트랙과 비교했을 때 기준으로.
나머지는 악기/편곡/구조/믹스/보컬/무드/전개 중 지금 조합에 실제로 도움될 관점으로 **최소 4개, 가능하면 6개까지** 채워줘 (뻔한 일반론 금지 — 개수를 채우려고 억지로 늘리지 말고, 진짜 다른 관점마다 실질적인 지적이 나와야 함). 사용자는 오디오를 직접 듣고 받는 외부 피드백은 Suno에서 곡을 만들어야 해서 자주 못 받고, 이 리뷰가 프롬프트 퀄리티를 끌어올릴 수 있는 사실상 유일한 반복 가능한 수단이야 — 그러니 한 번의 리뷰에서 최대한 실질적인 개선이 나오도록 꼼꼼하게 봐. 모든 카테고리에서 "전문 음악 프로듀서가 실제로 트랙을 검토하듯" 다양한 각도로 봐 — 표면적인 칭찬이나 뻔한 조언 말고, 실제 텍스트에 근거한 구체적 지적이어야 해.

중요: 이 리뷰는 악기 한두 가지만 보는 게 아니라 **곡 전체(구조, 편곡, 믹스/공간감, 보컬, 무드, 전개, 악기 전부)를 다 훑어야 해**. 아래 다섯 가지는 그중에서도 절대 빠뜨리면 안 되는 최소한의 체크리스트일 뿐이지, 이것만 보라는 뜻이 아니야 — 이 다섯 개 밖에서도 실제로 곡 퀄리티를 끌어올릴 구체적인 발견이 있으면(구조가 단조롭다, 특정 무드 뉘앙스가 안 산다, 보컬 처리가 장르랑 안 맞는다 등) 절대 빠뜨리지 말고 반드시 포함시켜 — "이 다섯 개 안에 안 들어가니까 스킵"은 안 돼. 아래는 반드시 실제 텍스트에서 확인해서, 문제가 있으면 해당 카테고리에 포함시켜:
- (악기) 지금 고른 악기 조합이 서로 주파수 대역·역할(리드/백킹/리듬)이 겹치지 않고 조화롭게 배치돼 있는지, 곡에 어울리는데 빠진 악기 요소는 없는지, 과잉되거나 서로 마스킹할 수 있는 조합은 없는지 — 악기 "구성"뿐 아니라 "배치"(어느 섹션에서 어떤 역할로 등장하는지)까지 봐. 멜로디 악기가 2개라 [현재 생성된 섹션 프롬프트]에 이미 "A lead melody, B layered softly beneath"처럼 리드/백킹이 명시돼 있으면 그 역할 배정 자체가 적절한지만 판단하고(적절하면 지적하지 말고 넘어가), 바꿔야 한다고 판단되면 melodyLead로 — tag로 "B를 백킹으로 물려라"를 또 넣으면 이미 있는 역할 문구랑 중복돼서 뭉개짐
- (믹스) 공간감·스테레오 폭·리버브 묘사가 섹션마다 다르게 진행되는지 — 인트로는 넓고, 벌스는 좁고 드라이하고, 훅은 타이트하고, 클라이맥스 훅은 가장 넓고, 아웃트로는 디케이되는 식의 아크가 실제 텍스트에 있는지. 이미 있으면 칭찬하지 말고 넘어가고, 없거나 약하면 "믹스"에서 지적
- (전개) 인트로와 아웃트로가 서로 호응하는지(같은 이미지·질감을 다시 불러오는지) — 이미 있으면 넘어가고, 그냥 일반적인 페이드아웃이면 "전개"에서 지적
- (편곡) 반복되는 섹션(훅끼리, 벌스끼리)이 리듬 패턴·필터·다이나믹 표현에서 실제로 다른 단어를 쓰는지, 아니면 같은 문구가 토씨만 바뀐 채 반복되는지 — 반복이면 "편곡"에서 구체적으로 지적
- (Anti-AI 필터 ON일 때만) 지금 텍스트가 AI가 만든 전형적인 음악처럼 뻔하고 기계적으로 들릴 위험이 있는지 확인해 — [현재 설정]에 이미 "organic, warm, human-feel, analog imperfections, natural dynamics" 같은 범용 태그가 항상 붙어있는데, 이것만으로는 부족해. 이 트랙 고유의 구체적인 "의도적 불완전함"(예: 타이밍이 살짝 밀림, 벨로시티 불균일, 필터 비대칭)을 짧은 구/키워드로 더 채워 — 특정 섹션 하나에만 해당하면 narrDir로 그 섹션에, 곡 전체에 걸친 톤이면 tag로. 뻔한 "organic" 반복 말고 이 곡만의 구체적인 인간적 디테일이어야 해
"전개"는 인트로→벌스·훅→클라이맥스(마지막 드롭)→아웃트로가 하나의 서사로 이어지는지, 밋밋한 구간은 없는지 보는 관점이야. 아래 [레퍼런스 곡]이 주어지면 "레퍼런스 부합도" 카테고리도 반드시 정확히 1개 포함해서, 그 곡의 타입비트(type beat)라고 부를 수 있을지 냉정하게 평가해 (부합 정도, 구체적 근거, 더 가깝게 만들 방법까지).

${AI_SUGGESTION_ACTION_SPEC}`;
    const dynamicText=`

[적용 가능한 섹션 — boostSection에 쓸 수 있는 값]
${uniqueSegs.length?uniqueSegs.join('|'):'(현재 구조에 hook/verse/bridge 없음 — boostSection 쓰지 마)'}

[narrDir에 쓸 수 있는 섹션 키 — 실제 곡 구조 순서 그대로]
${occKeys.join(' → ')}

[보컬 여부]
${hasVocal?'보컬 있음: '+st.vocal:'인스트루멘탈 (보컬 없음)'}

[레퍼런스 곡]
${refSong?`"${refSong}"`:'없음 — "레퍼런스 부합도" 카테고리는 쓰지 마'}

[현재 설정]
${ctx}

[현재 생성된 섹션 프롬프트]
${sectText||'(아직 생성 안 됨)'}

[이전 라운드에서 이미 적용된 조언 — 이건 이미 반영됐으니 절대 똑같이 다시 제안하지 마, 그 위에 새로 찾은 걸 더해]
${appliedSoFar.length?appliedSoFar.map((s,i)=>`${i+1}. (${s.category}) ${s.text}`).join('\n'):'(없음 — 이번이 첫 리뷰)'}`;

    // 최소 4~6개 제안 + narrDir 같은 다항목 필드를 요구하면서 출력이 꽤 길어짐 — 8000으로는 자주 잘려서 올림
    const raw=await callAnthropic(key,{maxTokens:16000,staticText,dynamicText});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const list=(parsed.suggestions||[]).filter(s=>s&&s.text);
    if(!list.length)throw new Error('AI가 제안을 반환하지 못했습니다');
    // "다시" 눌러서 재리뷰할 때 이전에 적용한 조언까지 통째로 갈아치우면 🔍 적용 검증이 추적할 이력이 사라짐 —
    // 이미 적용된 건 남기고 새로 받은 라운드만 그 뒤에 이어붙임
    _aiSuggestions=[...appliedSoFar,...list.map(s=>normalizeAiSuggestion(s,uniqueSegs,occKeys))];
    hhGenerate(false);
  }catch(e){
    fail(e.message);
    if(btn){btn.disabled=false;btn.textContent='🤖 AI 프로듀서 리뷰 받기';}
  }
}
function applyAiSuggestion(idx){
  const sug=(_aiSuggestions||[])[idx];
  if(!sug||sug.applied)return;
  sug.applied=true;
  if(sug.mood){applyAdvMood(sug.mood);return;}   // 자체적으로 hhGenerate까지 처리함
  if(sug.melodyLead){
    // melodyLeadIdx는 "뒤집을지 말지" 플래그지 직접 인덱스가 아니라서, computeMelodyRoles로 원하는 악기가
    // 실제로 lead가 될 때까지 토글 — MELODY_ROLE 테이블 내부 규칙을 여기서 또 계산할 필요 없음
    st.melodyLeadIdx=0;
    if(computeMelodyRoles(st.melody)?.lead!==sug.melodyLead)st.melodyLeadIdx=1;
    renderMelodyRoleUI();
  }
  if(sug.tag){
    // 태그가 여러 개일 수 있어서 하나씩 순서대로 처리 (예: 콩가/샤커/토킹드럼처럼 조언 하나가 여러 요소를 언급하는 경우)
    sug.tag.forEach(t=>{
      if(st.extraTags.includes(t))return;
      // 새 태그가 기존 텍스처/태그를 문구째로 포함하면("sidechain pump" 안에 "sidechain pump") 그건 "추가"가 아니라 "교체" 의도 —
      // 그대로 두면 "항상 강하게"(기존) vs "808에만 느리게"(신규) 같은 모순 지시가 동시에 남음
      const tagLower=t.toLowerCase();
      st.texture=st.texture.filter(x=>!tagLower.includes(x.toLowerCase()));
      st.extraTags=st.extraTags.filter(x=>!tagLower.includes(x.toLowerCase()));
      st.extraTags.push(t);
    });
  }
  if(sug.boostSection){
    st.sectionArrangeExtras=st.sectionArrangeExtras||{};
    // boostText(AI가 직접 쓴 구체적 문장)가 있으면 그걸 저장, 없으면 기존처럼 true만 저장해서 장르 기본 편곡 문구가 대신 들어가게 함
    st.sectionArrangeExtras[sug.boostSection]=sug.boostText||true;
    // "마지막 훅"으로 고정하면 조언이 "첫 훅"을 말해도 무시되는 문제라, AI가 정한 occurrence를 그대로 따름
    st.sectionArrangeOccurrence=st.sectionArrangeOccurrence||{};
    st.sectionArrangeOccurrence[sug.boostSection]=sug.boostOccurrence;
  }
  if(sug.addSection){
    // 항상 같은 자리(맨 끝 직전)에 끼워넣으면 조언 텍스트가 말하는 위치("인트로 뒤에", "첫 훅 앞에" 등)랑 실제 결과가 어긋날 수 있어서,
    // AI가 정한 addSectionPosition을 그대로 따름 (기본값은 기존처럼 클라이맥스 직전)
    const firstHookIdx=st.structSegs.indexOf('hook');
    const lastHookIdx=st.structSegs.lastIndexOf('hook');
    const introIdx=st.structSegs.indexOf('intro');
    const positions={
      beforeFirstHook:firstHookIdx>=0?firstHookIdx:0,
      afterIntro:introIdx>=0?introIdx+1:0,
      beforeLastHook:lastHookIdx>=0?lastHookIdx:Math.max(st.structSegs.length-1,0),
      end:Math.max(st.structSegs.length-1,0),
    };
    const insertAt=positions[sug.addSectionPosition]??positions.beforeLastHook;
    st.structSegs.splice(insertAt,0,sug.addSection);
    st._structAutoManaged=false;
    renderStructBuilder('hh',HH_STRUCT_PRESETS,HH_SEG_PALETTE,st);
  }
  if(sug.narrDir){
    Object.entries(sug.narrDir).forEach(([occKey,dir])=>{st.narrAI[occKey]=dir;});
    renderHhNarr();
  }
  if(sug.removeRef){
    // 새 tag가 요구하는 방향과 기존 프로듀서 레퍼런스의 내장 설명이 상반될 때(문자열로는 안 겹쳐서 위의 태그 충돌 체크로는 못 잡음) —
    // AI가 직접 지목한 것만 제거
    st.refs=st.refs.filter(r=>r!==sug.removeRef);
    renderProducerRef();
  }
  if(sug.removeTag){
    // tag(추가)와 달리 "지금 있는 걸 줄이자/빼자"는 조언은 새 문구가 없어서 위의 자동 충돌 제거가 못 잡음 — AI가 지목한 핵심 단어로 직접 제거
    st.texture=st.texture.filter(t=>!t.toLowerCase().includes(sug.removeTag));
    st.extraTags=st.extraTags.filter(t=>!t.toLowerCase().includes(sug.removeTag));
  }
  hhGenerate(`AI 리뷰 적용: ${sug.category}`);
}
function clearAiSuggestions(){
  _aiSuggestions=null;
  hhGenerate(false);
}
// 우리 AI 리뷰는 텍스트 프롬프트만 보고 짐작하지만, 사용자가 실제로 완성된 곡을 듣고 받은 외부 피드백
// (다른 AI 청취 평가, 사람 리뷰 등)은 오디오 근거가 있어서 훨씬 신뢰도 높은 정보 — 그걸 붙여넣으면
// aiProducerReview와 같은 스키마로 파싱해서 같은 적용 파이프라인(applyAiSuggestion)을 그대로 태움
async function aiParseExternalFeedback(){
  const key=getAnthropicKey();
  const btn=document.getElementById('hh-ai-external-btn');
  const statusEl=document.getElementById('hh-ai-arrange-status');
  const ta=document.getElementById('hh-external-feedback-ta');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 Anthropic API Key를 먼저 저장하세요');return;}
  if(st.genre===null){fail('장르를 먼저 선택하세요');return;}
  const feedback=(ta?.value||'').trim();
  if(!feedback){fail('피드백 텍스트를 먼저 붙여넣으세요');return;}
  const uniqueSegs=[...new Set(st.structSegs)].filter(s=>s==='hook'||s==='verse'||s==='bridge');
  const occKeys=structOccurrenceKeys();

  if(btn){btn.disabled=true;btn.textContent='🤖 분석 중...';}
  if(statusEl)statusEl.hidden=true;
  try{
    const hasVocal=st.vocal&&st.vocal!=='No Vocal';
    const staticText=`너는 경험 많은 힙합 프로듀서야. 사용자가 이 프롬프트로 실제 생성된 곡(오디오)을 듣고 받은 외부 피드백을 아래에 붙여넣었어. 텍스트 프롬프트만 보고 짐작하는 것보다 실제로 들어본 평가가 훨씬 신뢰도 높은 정보니까, 이 피드백을 곡의 진단서로 삼아서 프롬프트를 여러 방면(악기/편곡/구조/믹스/보컬/무드/전개)으로 더 디테일하고 발전시켜줘. 목표는 피드백 문장을 그대로 옮기는 게 아니라, 그 진단이 가리키는 약점을 실제로 해결하려면 프로듀서로서 구체적으로 뭘 더해야 하는지 여러 각도에서 제안하는 거야 — 완성도를 좌우하는 편곡·구조·훅 전개(반복·변화·텐션-릴리즈)를 표면적인 텍스처 추가보다 우선하되, 거기서 그치지 말고 그 문제를 뒷받침할 수 있는 다른 방면의 디테일(믹스 공간감, 악기 텍스처, 무드 뉘앙스 등)도 같이 채워줘.

최소 3~5개의 구체적 제안을 만들어줘 (뻔한 일반론 금지, 카테고리가 겹쳐도 됨). 피드백에 문자 그대로 안 적혀 있어도 그 진단을 해결하는 데 실제로 필요한 조치면 프로듀서 판단으로 제안해도 되지만, 피드백의 핵심 방향과 모순되는 얘기는 하지 마. 피드백이 이미 점수를 언급했으면(예: "26점") "총평" 카테고리 하나에 그 점수를 score에 그대로 넣고, 피드백의 핵심(강점·약점·다음에 뭘 바꿔야 하는지)을 한국어 2~3문장으로 요약해서 text에 적어.

${AI_SUGGESTION_ACTION_SPEC}`;
    const dynamicText=`

[적용 가능한 섹션 — boostSection에 쓸 수 있는 값]
${uniqueSegs.length?uniqueSegs.join('|'):'(현재 구조에 hook/verse/bridge 없음 — boostSection 쓰지 마)'}

[narrDir에 쓸 수 있는 섹션 키 — 실제 곡 구조 순서 그대로]
${occKeys.join(' → ')}

[보컬 여부]
${hasVocal?'보컬 있음: '+st.vocal:'인스트루멘탈 (보컬 없음)'}

[외부 피드백]
${feedback}`;

    // aiProducerReview와 같은 이유(최소 3~5개 다항목 제안 요구)로 출력이 길어질 수 있어서 같은 한도로 맞춤
    const raw=await callAnthropic(key,{maxTokens:16000,staticText,dynamicText});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const list=(parsed.suggestions||[]).filter(s=>s&&s.text);
    if(!list.length)throw new Error('피드백에서 반영할 내용을 찾지 못했습니다');
    const added=list.map(s=>normalizeAiSuggestion(s,uniqueSegs,occKeys));
    _aiSuggestions=[...(_aiSuggestions||[]),...added];
    if(ta)ta.value='';
    hhGenerate(false);
  }catch(e){
    fail(e.message);
  }finally{
    if(btn){btn.disabled=false;btn.textContent='🎧 반영 제안 받기';}
  }
}
// 룰 기반 모순 제거(태그 겹침, 반복 등)는 적용 순간 코드가 이미 처리하지만, 그건 "우리가 미리 안 패턴"만 잡음 —
// 조언이 실제로 "의도한 대로" 반영됐는지(위치·대상·뉘앙스까지)는 판단이 필요한 영역이라 AI로 한 번 더 대조
async function aiVerifyAppliedSuggestions(){
  const key=getAnthropicKey();
  const btn=document.getElementById('hh-ai-verify-btn');
  const statusEl=document.getElementById('hh-ai-arrange-status');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 Anthropic API Key를 먼저 저장하세요');return;}
  const applied=(_aiSuggestions||[]).filter(s=>s.applied);
  if(!applied.length){fail('적용된 조언이 없습니다');return;}

  if(btn){btn.disabled=true;btn.textContent='🔍 검증 중...';}
  if(statusEl)statusEl.hidden=true;
  try{
    const sectText=document.getElementById('hh-sect-ta')?.value||'';
    const styleText=document.getElementById('hh-style-ta')?.value||'';
    const oldScore=(_aiSuggestions||[]).find(s=>s.category==='총평')?.score;
    const staticText=`너는 힙합 프로듀서 QA 담당이야. 아래 [적용된 조언 목록]과 [최종 프롬프트]를 비교해서, 각 조언이 실제로 프롬프트에 "의도한 대로" 반영됐는지 확인해줘. 단순히 비슷한 단어가 있는지가 아니라, 조언이 말하는 위치·대상·뉘앙스까지 실제로 맞는지 꼼꼼히 봐 (예: "마지막 훅 앞에 브릿지"라고 했는데 실제로 다른 위치에 있으면 fail).

각 조언마다 정확히 이 순서로 판정해: pass(의도한 대로 정확히 반영됨) | partial(반영되긴 했는데 의도랑 다르거나 일부만 됨) | fail(반영 안 됨). partial·fail이면 왜 그런지 한국어 한 문장으로 이유를 적어.

그리고 지금 [최종 프롬프트] 상태 전체를 100점 만점으로 다시 냉정하게 채점해서 updatedScore에 정수로 넣어 — 조언 적용 전 점수에 얽매이지 말고 지금 상태 자체를 기준으로.

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해 (checks 배열 순서는 조언 목록 순서와 정확히 같아야 해):
{"checks":[{"status":"pass|partial|fail","note":"(partial·fail일 때만) 한국어 이유"}],"updatedScore":(1~100 정수)}`;
    const dynamicText=`

[적용된 조언 목록]
${applied.map((s,i)=>`${i+1}. (${s.category}) ${s.text}`).join('\n')}
${oldScore!=null?`\n[적용 전 총평 점수] ${oldScore}/100 (참고용 — 지금 상태 기준으로 새로 채점해)`:''}

[최종 섹션 프롬프트]
${sectText}

[최종 스타일 프롬프트]
${styleText}`;

    const raw=await callAnthropic(key,{maxTokens:2000,staticText,dynamicText});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const checks=parsed.checks||[];
    let matched=0;
    applied.forEach((s,i)=>{
      const c=checks[i];
      if(!c||!['pass','partial','fail'].includes(c.status))return;
      s.verify={status:c.status,note:(c.note||'').slice(0,150)};
      matched++;
    });
    if(!matched)throw new Error('AI가 검증 결과를 반환하지 못했습니다');
    const newScore=Math.round(parsed.updatedScore);
    if(Number.isFinite(newScore)&&newScore>=1&&newScore<=100){
      const totalRow=(_aiSuggestions||[]).find(s=>s.category==='총평');
      if(totalRow){
        totalRow.prevScore=oldScore??null;
        totalRow.score=newScore;
      }
    }
    hhGenerate(false);
  }catch(e){
    fail(e.message);
    if(btn){btn.disabled=false;btn.textContent='🔍 적용 검증';}
  }
}
let _polishOriginal=null;
async function aiPolishSectionPrompt(){
  const key=getAnthropicKey();
  const btn=document.getElementById('hh-ai-polish-btn');
  const statusEl=document.getElementById('hh-ai-polish-status');
  const ta=document.getElementById('hh-sect-ta');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 Anthropic API Key를 먼저 저장하세요');return;}

  if(btn.dataset.state==='polished'){
    ta.value=_polishOriginal;
    btn.textContent='🤖 AI로 다듬기';
    btn.dataset.state='original';
    if(statusEl)statusEl.hidden=true;
    return;
  }

  const original=ta.value;
  btn.disabled=true;btn.textContent='🤖 다듬는 중...';
  if(statusEl)statusEl.hidden=true;
  try{
    const staticText=`너는 Suno AI(텍스트를 실제 음악으로 변환하는 모델)에 넣을 섹션별 편곡 프롬프트를 다듬는 힙합 프로듀서야. 주어지는 텍스트는 규칙 기반으로 조합돼서 어휘와 문장 구조가 반복적이고 표현이 납작해.

Suno는 추상적이거나 문학적인 표현("슬픔이 밀려오는 느낌")보다, 실제로 들리는 소리를 구체적인 프로덕션/오디오 엔지니어링 용어로 지시할 때 훨씬 더 잘 알아듣고 반영해. **그리고 서술형 완결 문장보다 짧은 구/키워드를 콤마로 나열하는 형식을 훨씬 정확하게 읽어** — 실측 확인된 사실이야. 예를 들어 "distorted gritty matching tonal palette chord echoing with delay throws" 같은 늘어진 서술 대신 "Gritty synth arpeggio, Delay throw, Filter sweep"처럼 짧은 구 나열로 다듬어줘. 원본이 이미 이 스타일로 압축돼 있는 부분은 다시 늘어진 문장으로 되돌리지 마 — 다듬는다고 문장을 길게 만드는 게 아니라, 여전히 짧은 구 형태를 유지한 채로 표현만 다양화하는 거야.

반복에는 두 종류가 있으니 구분해서 다뤄:
(1) 다양화할 것 — 드롭/에너지 묘사, 전환·다이나믹 표현처럼 섹션마다 다른 순간을 그리는 구절. 이런 게 여러 섹션에서 토씨까지 똑같으면 Suno가 "이 구간들은 같은 걸 반복하라는 뜻"으로 읽어서 오디오도 비슷하게 나올 수 있어 — 매번 다른 짧은 구로 바꿔줘 (완결된 문장으로 늘리지 말고).
(2) 그대로 둘 것 — ZERO vocal chops/completely instrumental/no vocals 같은 보컬 억제 지시(반복 자체가 확실성을 위한 의도적 장치), 리드 악기를 가리키는 톤/음색 묘사(예: soft mellow, warm), 808 강도 라벨(예: Dominant 808 bass) 같이 곡 전체에서 안 변하는 고정 설정값. 전부 곡 내내 동일해야 하는 실제 값이라 다르게 바꾸면 다양성이 아니라 모순이 됨. 이런 건 동의어로도 바꾸지 말고 원문 그대로 둬.
그 위에서 악기·이펙트·다이나믹·공간감처럼 실제로 소리로 구현되는 구체적 프로덕션 용어로 디테일을 더해줘 — Suno가 못 알아들을 모호하거나 시적인 비유로 흐르면 안 돼.

[반드시 지킬 것]
- [Intro], [Instrumental Hook 1: ...] 같은 대괄호 헤더는 절대 수정하지 마 (줄 순서도 그대로)
- 괄호 안 "8 Bars:" 같은 마디 수 숫자는 절대 바꾸지 마
- BPM, Key, 악기 이름, ZERO/instrumental 같은 보컬 관련 지시는 단어 그대로 유지 (동의어 교체도 금지)
- 줄 개수와 대략적인 문장 길이는 비슷하게 유지 — 다듬으면서 문장을 더 길게 늘리지 마, 오히려 짧아지는 방향
- "Cold open — X, then Y" / "drops out first, then... before silence"처럼 순서·인과를 나타내는 연결어(then, before, first)는 실제 정보라 유지해도 되지만, 그 외 묘사는 접속사로 문장을 잇지 말고 콤마로 구분된 구 단위 유지

다른 설명 없이 다듬어진 전체 텍스트만 답해.`;
    const dynamicText=`

[원본]
${original}`;
    const polished=(await callAnthropic(key,{maxTokens:10000,staticText,dynamicText})).trim();
    if(!polished)throw new Error('빈 응답을 받았습니다');
    _polishOriginal=original;
    ta.value=polished;
    btn.textContent='↩ 원본으로';
    btn.dataset.state='polished';
    if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--success)';statusEl.textContent='✅ 다듬기 완료 — 다시 누르면 원본으로 되돌아갑니다';}
  }catch(e){
    fail(e.message);
  }finally{
    btn.disabled=false;
    if(btn.dataset.state!=='polished')btn.textContent='🤖 AI로 다듬기';
  }
}
async function aiRecommendMelodyTexture(){
  const key=getAnthropicKey();
  const statusEl=document.getElementById('ai-reco-status');
  const btn=document.getElementById('ai-reco-btn');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 Anthropic API Key를 먼저 저장하세요');return;}
  if(st.genre===null){fail('장르를 먼저 선택하세요');return;}

  btn.disabled=true;btn.textContent='🤖 추천 중...';
  if(statusEl)statusEl.hidden=true;
  try{
    const g=GENRES[st.genre];
    const mood=HH_MOODS.find(m=>m.kr===st.mood);
    const ctx=[
      `장르: ${g.kr} (${g.sound}, 에너지 ${g.energy})`,
      mood?`무드: ${mood.kr}`:null,
      `808: ${st._808}`,
      st.drums.length?`드럼: ${st.drums.join(', ')}`:null,
      st.era?`시대감: ${st.era}`:null,
      st.region?`지역색: ${st.region}`:null,
      st.density?`밀도: ${st.density}`:null,
      `BPM ${st.bpm} / Key ${KEYS[st.key]}`,
    ].filter(Boolean).join('\n');
    const staticText=`너는 힙합 비트 프로듀서야. 아래 선택된 요소들을 보고, 이 비트에 가장 잘 어울리는 멜로디 리드 악기 1개, 배경 악기 1개, 믹스 텍스처 2개, 악기 톤/음색 1개, 전환효과 1~2개, 스윙/그루브 1개를 추천해줘. 리드와 배경은 서로 다른 역할이니 각각 그 역할에 맞는 걸로 따로 판단해줘 — 리드는 곡을 이끄는 전면 멜로디, 배경은 리드를 받쳐주는 후면 텍스처. 어떤 악기가 리드에 어울리고 어떤 게 배경에 어울릴지는 정해진 규칙이 없으니 이 조합의 맥락(장르·무드)을 보고 네가 직접 판단해. 목표는 다양성이 아니라 이 조합에 대한 최적의 선택이야 — 이 조합에 정말 그 게 최선이라고 판단되면 이전과 같은 결과를 다시 줘도 상관없어, 억지로 다르게 고르지 마. 단, 아래 목록에 있는 이름만 정확히 그대로 사용해.

[멜로디 악기 목록]
${HH_MELODY.join(', ')}

[믹스 텍스처 목록]
${HH_TEXTURE.join(', ')}

[악기 톤/음색 목록 — 리드 악기 자체의 질감]
${HH_MELODY_TONE.join(', ')}

[전환효과 목록 — 섹션 전환 시 쓰는 효과음, 1~2개]
${HH_TRANSITION_FX.join(', ')}

[스윙/그루브 목록 — 리듬감]
${HH_GROOVE.join(', ')}

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해:
{"melodyLead":"...","melodyBackground":"...","texture":["...","..."],"melodyTone":"...","transitionFx":["...","..."],"groove":"...","reason":"한 문장 한국어 이유"}`;
    const dynamicText=`

[현재 선택]
${ctx}`;

    const raw=await callAnthropic(key,{maxTokens:1500,staticText,dynamicText});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const lead=parsed.melodyLead,bg=parsed.melodyBackground;
    if(!HH_MELODY.includes(lead)||!HH_MELODY.includes(bg)||lead===bg)throw new Error('AI가 목록에 없는 멜로디를 반환했습니다');
    const tex=(parsed.texture||[]).filter(t=>HH_TEXTURE.includes(t)).slice(0,2);
    if(!tex.length)throw new Error('AI가 목록에 없는 텍스처를 반환했습니다');
    const tone=HH_MELODY_TONE.includes(parsed.melodyTone)?parsed.melodyTone:null;
    const fx=(parsed.transitionFx||[]).filter(f=>HH_TRANSITION_FX.includes(f)).slice(0,2);
    const groove=HH_GROOVE.includes(parsed.groove)?parsed.groove:null;

    st.melody=[lead,bg];
    // computeMelodyRoles가 내부적으로 같은 조건식을 한번 더 걸어서 뒤집기 때문에, 이 값을 그 조건식과 동일하게 주면
    // 최종적으로 항상 arr[0](AI가 lead라고 답한 악기)이 리드로 확정됨 — AI의 판단을 고정 역할표가 덮어쓰지 않게 하는 장치
    st.melodyLeadIdx=(MELODY_ROLE[lead]!=='lead'&&MELODY_ROLE[bg]==='lead')?1:0;
    st.texture=tex;
    st._mtAutoManaged=true;
    chipGrid(document.getElementById('hh-melody'),HH_MELODY,st,'melody',2,onMelodyManualChange);
    renderMelodyRoleUI();
    chipGrid(document.getElementById('hh-texture'),HH_TEXTURE,st,'texture',2,onTextureManualChange);
    clearAutoHint('hh-melody-hint');
    clearAutoHint('hh-texture-hint');
    if(tone){
      st.melodyTone=tone;
      chipGrid(document.getElementById('hh-melody-tone'),HH_MELODY_TONE,st,'melodyTone',1,null);
      clearAutoHint('hh-melody-tone-hint');
    }
    if(fx.length){
      st.transitionFx=fx;
      chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,null);
      clearAutoHint('hh-fx-hint');
    }
    if(groove){
      st.groove=groove;
      chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,null);
      clearAutoHint('hh-groove-hint');
    }
    if(document.getElementById('hh-out-blocks')?.style.display==='flex')hhGenerate('AI 악기 추천 적용');

    if(statusEl){
      statusEl.hidden=false;statusEl.style.color='var(--success)';
      statusEl.textContent='✅ '+(parsed.reason||'추천 완료');
    }
  }catch(e){
    fail(e.message);
  }finally{
    btn.disabled=false;btn.textContent='🤖 AI 추천받기';
  }
}

// GENRE_REF는 장르 하나만 보고 고정 2명을 주는 룰 테이블이라, 같은 장르에서도 무드·멜로디·텍스처가 다르면
// 더 어울리는 다른 프로듀서가 있을 수 있음 — 그 판단은 룰로 못 담아서 AI로
async function aiRecommendProducerRef(){
  const key=getAnthropicKey();
  const statusEl=document.getElementById('hh-ai-ref-status');
  const btn=document.getElementById('hh-ai-ref-btn');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 Anthropic API Key를 먼저 저장하세요');return;}
  if(st.genre===null){fail('장르를 먼저 선택하세요');return;}

  btn.disabled=true;btn.textContent='🤖 추천 중...';
  if(statusEl)statusEl.hidden=true;
  try{
    const refList=HH_REF.map(p=>`${p.kr} (${p.vibes} — ${p.en})`).join('\n');
    const staticText=`너는 힙합 비트 프로듀서야. 아래 선택된 요소들을 보고, 이 비트에 가장 잘 어울리는 프로듀서 레퍼런스 1~2명을 아래 목록에서만 정확히 그대로 골라줘. 장르만 보지 말고 무드·멜로디·텍스처까지 종합해서 판단해 — 같은 장르라도 무드가 다르면 다른 프로듀서가 더 어울릴 수 있어.

[프로듀서 목록]
${refList}

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해:
{"refs":["...","..."],"reason":"한 문장 한국어 이유"}`;
    const g=GENRES[st.genre];
    const mood=HH_MOODS.find(m=>m.kr===st.mood);
    const refSong=(document.getElementById('hh-ref-song')?.value||'').trim();
    const ctx=[
      `장르: ${g.kr} (${g.sound}, 에너지 ${g.energy})`,
      mood?`무드: ${mood.kr}`:null,
      st.melody.length?`멜로디 악기: ${st.melody.join(', ')}`:null,
      st.texture.length?`믹스 텍스처: ${st.texture.join(', ')}`:null,
      refSong?`레퍼런스 곡: ${refSong}`:null,
      `BPM ${st.bpm} / Key ${KEYS[st.key]}`,
    ].filter(Boolean).join('\n');
    const dynamicText=`

[현재 선택]
${ctx}`;

    const raw=await callAnthropic(key,{maxTokens:600,staticText,dynamicText});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const refs=(parsed.refs||[]).filter(r=>HH_REF.some(p=>p.kr===r)).slice(0,2);
    if(!refs.length)throw new Error('AI가 목록에 없는 프로듀서를 반환했습니다');

    st.refs=refs;
    renderProducerRef();
    clearAutoHint('hh-ref-hint');
    if(document.getElementById('hh-out-blocks')?.style.display==='flex')hhGenerate('AI 레퍼런스 추천 적용');

    if(statusEl){
      statusEl.hidden=false;statusEl.style.color='var(--success)';
      statusEl.textContent='✅ '+(parsed.reason||'추천 완료');
    }
  }catch(e){
    fail(e.message);
  }finally{
    btn.disabled=false;btn.textContent='🤖 AI로 다시 추천';
  }
}

