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
  const structBlock=document.getElementById('hh-struct-ai-block');
  if(structBlock)structBlock.hidden=!hasKey;
  const wopts=document.getElementById('hh-write-opts');
  if(wopts){wopts.hidden=!hasKey;wopts.style.display=hasKey?'flex':'none';}
  const tg=document.getElementById('hh-ai-write-toggle');
  if(tg){try{tg.checked=localStorage.getItem('hh_ai_write')!=='0';}catch(_){}}
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
// claude-sonnet-5는 temperature 파라미터를 거부함("deprecated for this model", 실사용 확인) — 채점 안정화는 scoringAnchor로 함.
// 대신 think:false로 숨은 추론을 끄면 리뷰 145초→23초, 작성 61초→17초(출력 토큰 1/4~1/9)로 빨라짐 — 추천·채점·분석처럼 답이 짧게 정해지는 호출용
// onText를 주면 스트리밍(SSE)으로 받아서 글자가 나오는 대로 콜백(누적 텍스트) — 채팅처럼 바로 보이게. 끝나면 전체 텍스트 반환
async function callAnthropic(key,{maxTokens,staticText,dynamicText,think,onText}){
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
    ...(think===false?{thinking:{type:'disabled'}}:{}),
    ...(onText?{stream:true}:{}),
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
  if(onText){
    const reader=res.body.getReader(),dec=new TextDecoder();
    let buf='',acc='',stop='';
    for(;;){
      const {done,value}=await reader.read();
      if(done)break;
      buf+=dec.decode(value,{stream:true});
      let i;
      while((i=buf.indexOf('\n\n'))>=0){
        const ev=buf.slice(0,i);buf=buf.slice(i+2);
        const line=ev.split('\n').find(l=>l.startsWith('data:'));
        if(!line)continue;
        let j;try{j=JSON.parse(line.slice(5));}catch(_){continue;}
        if(j.type==='content_block_delta'&&j.delta?.type==='text_delta'){acc+=j.delta.text;onText(acc);}
        else if(j.type==='message_delta'&&j.delta?.stop_reason)stop=j.delta.stop_reason;
        else if(j.type==='error')throw new Error(`API 오류 ${j.error?.message||''}`.slice(0,150));
      }
    }
    if(stop==='max_tokens')throw new Error('응답이 너무 길어서 잘렸어요 — 다시 시도해주세요');
    if(!acc.trim())throw new Error('AI가 빈 응답을 반환했습니다 — 다시 시도해주세요');
    return acc;
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
// 변환해야 해서, 그 필드 설명과 JSON 스키마를 공유 — 같은 스키마로 나와야 applyAiSuggestionCore가 출처 구분 없이 그대로 먹음
const AI_SUGGESTION_ACTION_SPEC=`중요: 조언은 참고용으로 끝나면 안 되고 실제 프롬프트에 바로 반영할 수 있어야 해. 그래서 각 조언마다 아래 필드 중 맞는 걸 정확히 하나 채워서 버튼 한 번으로 적용되게 해줘 (총평·레퍼런스 부합도처럼 평가 자체가 목적인 항목은 액션이 없어도 되고, 그 안에서도 구체적으로 적용 가능한 게 있으면 채워도 됨):
- melodyLead: 멜로디 악기가 정확히 2개 선택돼 있고, 조언이 "둘 중 어느 게 리드를 맡아야 하는지"(예: 주파수 대역이 겹쳐서 하나를 백킹으로 물려야 함)에 관한 거면 → 리드를 맡아야 할 악기 이름을 [현재 설정]의 멜로디 악기 목록에 있는 문자열 그대로 정확히 넣어. 중요: 아래 [현재 생성된 섹션 프롬프트]를 먼저 확인해서 이미 그 악기가 "lead melody"로, 다른 하나가 "layered softly beneath/background layer"로 명시돼 있으면(원하는 역할 배치가 이미 되어 있으면) 이 조언 자체를 만들지 마 — 이미 된 걸 tag로 또 추가하면 같은 얘기가 두 군데서 중복되고 뭉개짐. 역할을 바꿔야 할 때만 melodyLead를 채워.
- **먼저 판단**: 조언이 편곡·악기·에너지·믹스·텍스처·리듬 중 뭐든, **"이 곡 전체에 해당하는가" vs "특정 섹션/occurrence 하나에만 해당하는가"**부터 갈라. 특정 섹션 하나 얘기(예: "Hook 2에서 비트크러시", "브릿지에서 스테레오가 넓어짐", "두 번째 훅만 리듬 변주")면 **tag를 쓰지 마 — boostSection+boostOccurrence+boostText(편곡/에너지 톤이면) 또는 narrDir(그 외 전부: 믹스·텍스처·악기 변화도 포함)**를 써. tag는 스타일 박스는 한 번만 존재해서 "이 디테일은 Hook 2에만"이라는 정보 자체가 사라지고, 게다가 스타일 박스는 실측상 10개 안팎 넘으면 Suno가 뒤쪽부터 무시하기 시작해서 자리도 아깝다 — 섹션 전용 디테일을 정확한 섹션 텍스트 옆에 두는 게 Suno가 더 정확히 반영하고, 곡 전체에서도 더 입체적으로 들림.
- tag: **곡 전체에 걸쳐 항상 적용되는 얘기일 때만** (새 악기 추가, 전체 믹스 톤, 보컬 처리 등) → Suno 스타일 태그에 넣을 영어 소문자 **짧은 구/키워드**들의 배열, 완결된 문장 금지 (조언에서 언급한 요소마다 하나씩 따로 — 예를 들어 "콩가, 샤커, 토킹드럼"이면 하나로 뭉치지 말고 ["conga loop","shaker layer","talking drum accent"]처럼 각각 3단어 이내로 짧게. 하나만 있으면 배열에 1개만). 스타일 박스는 태그 10개 안팎이 한계라 꼭 전역이어야 하는 것만 넣어.
- boostSection: 위 판단에서 "특정 섹션 하나"이고 편곡/에너지 쪽 조언일 때 → 아래 [적용 가능한 섹션]에 있는 값 중 정확히 하나. boostOccurrence로 그 타입 중 몇 번째를 말하는 건지도 반드시 같이 정해: first(그 타입의 첫 번째) | last(마지막 — 보통 클라이맥스, 기본값). 조언이 "첫 훅"이라고 하면 first, "마지막/클라이맥스 훅"이면 last — 조언 내용이랑 실제로 일치해야 해. boostText에 Suno 섹션 프롬프트에 그대로 이어붙일 **영어 짧은 구/키워드 결합**을 써 (완결된 문장 아님, 콤마로 구분 — 예: "flute-synth call-and-response, density increasing" 처럼). 아래 [보컬 여부]가 인스트루멘탈이면 보컬·가사·노래 관련 묘사는 절대 넣지 마.
- addSection: 구조가 단조롭다/섹션을 추가하자는 조언일 때 → 추가할 섹션 타입(hook|verse|bridge)과, 그걸 어디 넣을지 addSectionPosition도 같이 정해줘: beforeFirstHook(첫 훅 앞) | afterIntro(인트로 바로 뒤) | beforeLastHook(마지막 훅 직전 — 클라이맥스 텐션 빌드용) | end(아웃트로 직전) 중 조언 내용이랑 실제로 일치하는 위치 하나
- mood: 지금 고른 무드보다 다른 무드가 더 어울린다는 조언일 때 → 정확한 무드 이름 하나
- narrDir: 위 판단에서 "특정 섹션 하나"이고 편곡/에너지가 아닌 다른 카테고리(전개·믹스·텍스처·악기 등)이거나, 여러 occurrence에 걸친 점진적 변화일 때 → 아래 [narrDir에 쓸 수 있는 섹션 키]에 있는 키만 사용해서 {"hook1":"...","verse1":"...","hook2":"...",...} 형식 객체를 만들어. 서사가 특정 구간에만 해당하면 그 키만 넣어도 되고, 전체 곡에 걸친 점진적 변화(예: 밀도가 곡 전체에서 계속 증가)라면 관련된 모든 키에 각각 다른 내용을 채워 — 같은 내용을 여러 키에 반복 복사하지 말고, 그 구간이 전체 흐름에서 몇 번째인지에 맞게 서로 다르게 써(예: hook1은 "sparse, restrained", hook2는 "denser layering, energy builds", hook3은 "full density, all elements in"). 각 값은 Suno 섹션 프롬프트에 그대로 이어붙일 **영어 짧은 구/키워드 결합**(완결된 문장 아님, 콤마 구분 — 예: "energy ramps up gradually" 대신 "gradual energy ramp, no sudden hit"). 아래 [보컬 여부]가 인스트루멘탈이면 보컬·가사·노래 관련 묘사는 절대 넣지 마.
- removeRef: tag를 추가할 때마다 아래 [프로듀서 레퍼런스]에 있는 설명을 한 번씩 대조해봐 — 장르/서브장르 자체가 달라지는 수준으로 상반되면(예: tag는 "log drum bassline"인데 레퍼런스 설명엔 "chiptune-esque synth leads"나 "disco samples, house-inflected bounce"처럼 완전히 다른 서브장르 색채가 이미 박혀있으면) 반드시 그 프로듀서의 정확한 이름을 넣어. 특히 "레퍼런스 부합도" 카테고리는 지금 레퍼런스가 타겟 곡이랑 안 맞는다는 게 핵심 지적이니, 그 안 맞는 레퍼런스를 tag만 추가하고 그대로 두면 안 돼 — 반드시 확인해서 빼
- removePhrase: [현재 생성된 섹션/스타일 프롬프트]에 **실제로 있는 구를 글자 그대로** 인용한 배열(최대 3개, 각 60자 이하). tag/narrDir/boostText를 추가하면서 그것과 모순되거나 같은 말을 되풀이하는 기존 문구(예: 새로 "restrained until bar 5"를 넣는데 기존에 "full energy"가 있음, 새 "human micro-timing"과 기존 "tight quantized grid")가 있으면 반드시 같이 지정해 삭제해 — 추가만 하고 모순을 남기면 프롬프트 일관성이 떨어지고 길이만 늘어. 2라운드부터는 새 요소를 넣기 전에 겹치는 기존 문구를 빼는 게 우선이야
- removeTag: 조언이 "지금 있는 X를 줄이자/빼자"는 뜻도 담고 있으면(예: "sidechain pump가 강하면 무드가 죽으니 줄이자") X를 가리키는 핵심 단어(예: "sidechain")를 넣어 — 그 단어를 포함하는 기존 텍스처/스타일 태그를 전부 제거해. tag(추가)랑 같이 써도 됨 — "줄이고 대신 이걸 넣자"는 조언이면 둘 다 채워
- BPM은 사용자가 직접 설정한 값이니 바꾸자는 조언이어도 액션으로 만들지 마 — 총평/레퍼런스 부합도 텍스트에 언급만 하고 그대로 둬

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해:
{"suggestions":[{"category":"총평|레퍼런스 부합도|악기|편곡|구조|믹스|보컬|무드|전개","text":"한국어 조언 (총평·레퍼런스 부합도는 2~3문장 가능)","score":"(외부 피드백 총평일 때만, 1~100 정수)","criteria":"(프로듀서 리뷰 총평일 때만, {arc,variety,genre,coherence,roles,human,reference,parse} 각 0~10 정수)","melodyLead":"(멜로디 리드/백킹 역할을 바꿔야 할 때만, 리드를 맡을 악기 이름)","tag":"(해당시, [\\"...\\",\\"...\\"] 배열)","boostSection":"(해당시)","boostOccurrence":"(boostSection일 때 필수, first|last)","boostText":"(boostSection이고 구체적 아이디어 있을 때만, 영어 짧은 구/키워드 결합)","addSection":"(해당시)","addSectionPosition":"(addSection일 때만, beforeFirstHook|afterIntro|beforeLastHook|end 중 하나)","mood":"(해당시)","narrDir":"(특정 섹션 한정 조언일 때, 위 형식 객체, 값은 영어 짧은 구/키워드 결합)","removeRef":"(tag가 기존 프로듀서 레퍼런스와 모순될 때만, 그 프로듀서 이름)","removeTag":"(기존 걸 줄이자/빼자는 조언일 때만, 그 핵심 단어)","removePhrase":"(추가하는 지시와 모순·중복되는 기존 문구를 글자 그대로 인용한 배열, 최대 3개)"}]}`;
// aiProducerReview·aiParseExternalFeedback 둘 다 이 형태로 모델 응답을 정리 — 출처가 달라도 applyAiSuggestionCore 입장에선 동일한 객체
function normalizeAiSuggestion(s,uniqueSegs,occKeys){
  // 인스트루멘탈인데 "vocal chop" 같은 보컬 요소가 tag로 들어오면 섹션마다 박힌 "ZERO vocal chops"와 정면충돌 — 프롬프트로만 막지 않고 코드로도 거름
  const vocalWord=/vocal|choir|ad-?lib|\bsung\b|singing|lyric|\bvoice/i;
  const instr=!(st.vocal&&st.vocal!=='No Vocal');
  const ok=t=>!(instr&&vocalWord.test(t));
  return{
    category:s.category||'💡',
    text:s.text,
    criteria:(s.criteria&&typeof s.criteria==='object')?s.criteria:null,
    score:rubricScore(s.criteria)??((Number.isFinite(Math.round(s.score))&&Math.round(s.score)>=1&&Math.round(s.score)<=100)?Math.round(s.score):null),
    // 멜로디 악기가 정확히 2개일 때만 의미 있음 — 1개거나 3개 이상이면 리드/백킹 개념 자체가 없음
    melodyLead:(typeof s.melodyLead==='string'&&st.melody.length===2&&st.melody.includes(s.melodyLead))?s.melodyLead:null,
    // 배열이 정상 형태지만, 모델이 가끔 문자열 하나로 줄 수도 있어서 둘 다 받아 배열로 통일
    tag:(()=>{
      const arr=Array.isArray(s.tag)?s.tag:(typeof s.tag==='string'&&s.tag.trim()?[s.tag]:[]);
      const cleaned=arr.filter(t=>typeof t==='string'&&t.trim()&&ok(t)).map(t=>t.trim());
      return cleaned.length?cleaned:null;
    })(),
    boostSection:(s.boostSection&&uniqueSegs.includes(s.boostSection))?s.boostSection:null,
    boostOccurrence:(s.boostOccurrence==='first')?'first':'last',
    boostText:(typeof s.boostText==='string'&&s.boostText.trim()&&ok(s.boostText))?s.boostText.trim().slice(0,150):null,
    addSection:(['hook','verse','bridge'].includes(s.addSection))?s.addSection:null,
    addSectionPosition:(['beforeFirstHook','afterIntro','beforeLastHook','end'].includes(s.addSectionPosition))?s.addSectionPosition:'beforeLastHook',
    mood:(s.mood&&HH_MOODS.some(m=>m.kr===s.mood))?s.mood:null,
    narrDir:(()=>{
      if(!s.narrDir||typeof s.narrDir!=='object')return null;
      const cleaned=Object.fromEntries(occKeys.filter(k=>typeof s.narrDir[k]==='string'&&s.narrDir[k].trim()&&ok(s.narrDir[k])).map(k=>[k,s.narrDir[k].trim().slice(0,150)]));
      return Object.keys(cleaned).length?cleaned:null;
    })(),
    removeRef:(s.removeRef&&st.refs.includes(s.removeRef))?s.removeRef:null,
    removeTag:(typeof s.removeTag==='string'&&s.removeTag.trim())?s.removeTag.trim().toLowerCase():null,
    removePhrase:(()=>{const arr=(Array.isArray(s.removePhrase)?s.removePhrase:(typeof s.removePhrase==='string'?[s.removePhrase]:[])).filter(p=>typeof p==='string'&&p.trim().length>=4&&p.length<=80).map(p=>p.trim()).slice(0,3);return arr.length?arr:null;})(),
    applied:false,
  };
}
// aiProducerReview·aiParseExternalFeedback가 같은 "현재 프롬프트 상태"를 보게 — 예전엔 리뷰는 드럼/808/그루브/스타일 박스를 못 보고,
// 외부 피드백 파서는 현재 프롬프트를 아예 못 봐서(스키마가 언급하는 [현재 설정]·[프로듀서 레퍼런스]도 없었음) 이미 있는 걸 또 제안하거나 removeRef/melodyLead를 못 채웠음
// 지금까지 고른 설정 요약 — 리뷰·외부 피드백·레퍼런스 추천이 같은 걸 봄. refs:false면 현재 레퍼런스는 뺌(레퍼런스를 새로 고를 땐 기존 걸 앵커로 삼으면 안 됨)
function aiSelectionCtx({refs=true,structure=true,soft=false}={}){
  const auto=soft&&st._mtAutoManaged!==false;   // soft: 자동 채워진 장르 기본값은 확정 값이 아니라 참고로만 보여줌
  const g=GENRES[st.genre];
  const mood=HH_MOODS.find(m=>m.kr===st.mood);
  const refSong=(document.getElementById('hh-ref-song')?.value||'').trim();
  // 이름 없이 설명만 주면 removeRef에 "정확한 프로듀서 이름"을 요구해도 채울 수가 없어서(normalize도 st.refs 이름과 대조) 이름을 같이 줌
  const refProducers=st.refs.length?st.refs.map(kr=>{const p=HH_REF.find(r=>r.kr===kr);return p?`${kr} (${p.en})`:kr;}).join(' / '):null;
  const hasVocal=st.vocal&&st.vocal!=='No Vocal';
  return [
    `장르: ${g.kr} (${g.sound})`,
    mood?`무드: ${mood.kr}`:null,
    st.commercial?`색깔: ${st.commercial}`:null,
    auto?`장르 기본 추천(자동으로 채워진 참고값일 뿐 — 따르지 않아도 되고, 이 곡의 의도에 맞는 악기·드럼·베이스·질감을 직접 설계해): 멜로디 ${st.melody.join(', ')||'-'} / 드럼 ${st.drums.join(', ')||'-'} / 808 ${st._808||'-'} / 그루브 ${st.groove||'-'} / 텍스처 ${st.texture.join(', ')||'-'}`:null,
    auto?null:(st.melody.length?`멜로디 악기: ${st.melody.join(', ')}`:'멜로디 악기 미선택'),
    auto?null:(st.drums.length?`드럼 패턴: ${st.drums.join(', ')}`:null),
    auto?null:(st._808?`808: ${st._808}`:null),
    auto?null:(st.groove?`그루브: ${st.groove}`:null),
    auto?null:(st.texture.length?`믹스 텍스처: ${st.texture.join(', ')}`:null),
    auto?null:(st.transitionFx&&st.transitionFx.length?`전환 효과: ${st.transitionFx.join(', ')}`:null),
    [st.era,st.region,st.density].filter(Boolean).length?`시대/지역/밀도: ${[st.era,st.region,st.density].filter(Boolean).join(' / ')}`:null,
    hasVocal?`보컬: ${st.vocal}`:'보컬 없음 (인스트루멘탈)',
    refs&&refProducers&&!auto?`프로듀서 레퍼런스: ${refProducers}`:null,
    refSong?`타겟 레퍼런스 곡: ${refSong}`:null,
    briefCtxLine(),
    st.extraTags.length?`이미 추가된 스타일 태그: ${st.extraTags.join(', ')}`:null,
    st.length?`목표 길이: ${st.length}`:null,
    structure?`구조: ${st.structSegs.join(' → ')}`:null,
    `BPM ${st.bpmSet?st.bpm:'미지정(프롬프트에 쓰지 않음)'} / Key ${st.keySet?KEYS[st.key]:'미지정(프롬프트에 쓰지 않음)'}`,
    antiAI?'Anti-AI 필터 ON — 사용자가 "AI 티 안 나고 사람이 만든 것 같은" 결과를 원함':null,
  ].filter(Boolean).join('\n');
}
function aiPromptSnapshot(){
  const styleText=(document.getElementById('hh-style-ta')?.value||'').trim();
  const ctx=aiSelectionCtx();
  const sectText=(document.getElementById('hh-sect-ta')?.value||'').trim();
  const nTags=styleText?styleText.split(', ').length:0;
  return `[현재 설정]
${ctx}

[현재 생성된 스타일 프롬프트 — 콤마로 구분된 태그 ${nTags}개, ${styleText.length}/1000자 (Suno는 태그 10개 안팎을 넘으면 뒤쪽부터 무시하니 이미 넉넉하지 않음 — tag는 꼭 필요할 때만)]
${styleText||'(아직 생성 안 됨)'}

[현재 생성된 섹션 프롬프트]
${sectText||'(아직 생성 안 됨)'}`;
}
// 라운드마다 "새로 채점"하면 같은 텍스트도 ±5~10점씩 흔들리고, 피드백을 적용할수록 지적거리가 새로 생겨 점수가 내려가 보임.
// 같은 설정에서 피드백만 적용한 재채점이면 직전 점수를 앵커로 주고, 실제로 바뀐 섹션만 근거로 올리거나 내리게 함(악화도 그대로 반영)
let _lastReview=null;   // 직전 채점 {criteria,score,fpBase,sect,style}
function noteScored(criteria,score){
  _lastReview=criteria&&Number.isFinite(score)?{criteria,score,fpBase:hhWriteFingerprints().fpBase,sect:(document.getElementById('hh-sect-ta')?.value||'').trim(),style:(document.getElementById('hh-style-ta')?.value||'').trim()}:null;
}
function scoringAnchor(){
  const p=_lastReview;
  if(!p||p.fpBase!==hhWriteFingerprints().fpBase)return '';
  const cur=(document.getElementById('hh-sect-ta')?.value||'').trim(),sty=(document.getElementById('hh-style-ta')?.value||'').trim();
  const before=new Map(parseSections(p.sect).map(x=>[x.header,x.body]));
  const changed=parseSections(cur).filter(x=>before.get(x.header)!==x.body).map(x=>x.header);
  return `

[직전 채점 — 같은 설정에서 피드백만 적용한 결과를 다시 채점하는 중]
${REVIEW_RUBRIC.map(r=>`${r.key} ${p.criteria[r.key]??'-'}`).join(', ')} (총 ${p.score})
직전 채점 이후 바뀐 곳: 섹션 ${changed.join(' | ')||'없음'} / 스타일 ${sty!==p.style?'바뀜':'그대로'}
채점 규칙: 각 항목은 직전 점수에서 출발해. 그 항목과 관련된 텍스트가 실제로 바뀐 경우에만 근거를 들어 최대 3점까지 올리거나 내려 (직전 지적이 실제로 해결됐으면 크게 올려도 되고, 새 모순·중복·태그 증가·서술문 증가 같은 악화가 확인되면 내려). 바뀌지 않은 곳에 해당하는 항목은 직전 점수 그대로 — 매번 새로 뽑기하듯 매기지 마.`;
}
async function aiProducerReview(){
  const key=getAnthropicKey();
  const btn=document.getElementById('hh-ai-arrange-btn');
  const statusEl=document.getElementById('hh-ai-arrange-status');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 Anthropic API Key를 먼저 저장하세요');return;}
  if(st.genre===null){fail('장르를 먼저 선택하세요');return;}
  if(_writePromise)await _writePromise;   // AI 작성이 진행 중이면 초안이 아니라 최종 텍스트를 리뷰하도록 대기
  const uniqueSegs=[...new Set(st.structSegs)].filter(s=>s==='hook'||s==='verse'||s==='bridge');
  const occKeys=structOccurrenceKeys();
  const appliedSoFar=(_aiSuggestions||[]).filter(s=>s.applied);

  if(btn){btn.disabled=true;btn.textContent='🤖 분석 중...';}
  if(statusEl)statusEl.hidden=true;
  try{
    const hasVocal=st.vocal&&st.vocal!=='No Vocal';
    const refSong=(document.getElementById('hh-ref-song')?.value||'').trim();
    // 지시문/규칙은 호출마다 안 바뀌니 static — 상태에 따라 달라지는 건 전부 dynamic 쪽으로 몰아서 static이 매번 완전히 동일하게(캐싱 적중)
    const staticText=`너는 경험 많은 힙합 프로듀서야. 아래 [현재 생성된 섹션 프롬프트](실제 텍스트)와 트랙 설정을 보고, 이 곡이 더 창의적이고 퀄리티 있게 나오려면 프롬프트를 어떻게 구성하면 좋을지 서로 다른 관점에서 짧게 조언해줘. 설정값만 보고 짐작하지 말고, 반드시 실제 텍스트를 읽고 거기 적힌 구체적인 단어·구절 기준으로 판단해.

"총평" 카테고리는 반드시 정확히 1개 포함해: 전문 프로듀서로서 지금 설정에서 부족한 점, 이대로 곡이 나오면 아쉬울 부분, 개선하면 확실히 더 좋아질 부분을 솔직하게 총평해줘. 잘 된 부분은 한 줄로만 짚고 실질적인 문제 위주로.
${RUBRIC_TEXT()}
나머지는 악기/편곡/구조/믹스/보컬/무드/전개 중 지금 조합에 실제로 도움될 관점으로 **첫 리뷰는 4~6개, [라운드]가 2라운드 이후면 가장 낮은 항목 위주로 최대 4개**만 채워줘 (이미 8점 이상인 항목은 지적하지 말고, 이미 적용된 주제를 반복하지 마) (뻔한 일반론 금지 — 개수를 채우려고 억지로 늘리지 말고, 진짜 다른 관점마다 실질적인 지적이 나와야 함). 사용자는 오디오를 직접 듣고 받는 외부 피드백은 Suno에서 곡을 만들어야 해서 자주 못 받고, 이 리뷰가 프롬프트 퀄리티를 끌어올릴 수 있는 사실상 유일한 반복 가능한 수단이야 — 그러니 한 번의 리뷰에서 최대한 실질적인 개선이 나오도록 꼼꼼하게 봐. 모든 카테고리에서 "전문 음악 프로듀서가 실제로 트랙을 검토하듯" 다양한 각도로 봐 — 표면적인 칭찬이나 뻔한 조언 말고, 실제 텍스트에 근거한 구체적 지적이어야 해.

중요: 이 리뷰는 악기 한두 가지만 보는 게 아니라 **곡 전체(구조, 편곡, 믹스/공간감, 보컬, 무드, 전개, 악기 전부)를 다 훑어야 해**. 아래 다섯 가지는 그중에서도 절대 빠뜨리면 안 되는 최소한의 체크리스트일 뿐이지, 이것만 보라는 뜻이 아니야 — 이 다섯 개 밖에서도 실제로 곡 퀄리티를 끌어올릴 구체적인 발견이 있으면(구조가 단조롭다, 특정 무드 뉘앙스가 안 산다, 보컬 처리가 장르랑 안 맞는다 등) 절대 빠뜨리지 말고 반드시 포함시켜 — "이 다섯 개 안에 안 들어가니까 스킵"은 안 돼. 아래는 반드시 실제 텍스트에서 확인해서, 문제가 있으면 해당 카테고리에 포함시켜:
- (악기) 지금 고른 악기 조합이 서로 주파수 대역·역할(리드/백킹/리듬)이 겹치지 않고 조화롭게 배치돼 있는지, 곡에 어울리는데 빠진 악기 요소는 없는지, 과잉되거나 서로 마스킹할 수 있는 조합은 없는지 — 악기 "구성"뿐 아니라 "배치"(어느 섹션에서 어떤 역할로 등장하는지)까지 봐. 멜로디 악기가 2개라 [현재 생성된 섹션 프롬프트]에 이미 "A lead melody, B layered softly beneath"처럼 리드/백킹이 명시돼 있으면 그 역할 배정 자체가 적절한지만 판단하고(적절하면 지적하지 말고 넘어가), 바꿔야 한다고 판단되면 melodyLead로 — tag로 "B를 백킹으로 물려라"를 또 넣으면 이미 있는 역할 문구랑 중복돼서 뭉개짐
- (리듬) [현재 설정]의 드럼 패턴·808·그루브가 장르·BPM·무드에 맞는 밀도와 추진력을 갖고 있는지(BPM에 비해 리듬이 밋밋하거나 정형화돼 있지 않은지), 훅/벌스/브릿지에서 리듬이 실제로 다른 단어로 달라지는지 — 스타일 프롬프트의 리듬 태그와 섹션 텍스트를 같이 보고, 밋밋하면 "편곡"이나 "믹스"가 아니라 리듬 관점으로 구체적으로 지적
- (믹스) 공간감·스테레오 폭·리버브 묘사가 섹션마다 다르게 진행되는지 — 인트로는 넓고, 벌스는 좁고 드라이하고, 훅은 타이트하고, 클라이맥스 훅은 가장 넓고, 아웃트로는 디케이되는 식의 아크가 실제 텍스트에 있는지. 이미 있으면 칭찬하지 말고 넘어가고, 없거나 약하면 "믹스"에서 지적
- (전개) 인트로와 아웃트로가 서로 호응하는지(같은 이미지·질감을 다시 불러오는지) — 이미 있으면 넘어가고, 그냥 일반적인 페이드아웃이면 "전개"에서 지적
- (편곡) 반복되는 섹션(훅끼리, 벌스끼리)이 리듬 패턴·필터·다이나믹 표현에서 실제로 다른 단어를 쓰는지, 아니면 같은 문구가 토씨만 바뀐 채 반복되는지 — 반복이면 "편곡"에서 구체적으로 지적
- (Anti-AI 필터 ON일 때만) 지금 텍스트가 AI가 만든 전형적인 음악처럼 뻔하고 기계적으로 들릴 위험이 있는지 확인해 — [현재 생성된 스타일 프롬프트]에 이미 장르와 리드 악기에 맞춘 불완전함 태그(예: "uneven pluck velocity")가 하나 붙어있는데, 이것만으로는 부족할 수 있어. 이 트랙 고유의 구체적인 "의도적 불완전함"(예: 타이밍이 살짝 밀림, 벨로시티 불균일, 필터 비대칭)을 짧은 구/키워드로 더 채워 — 특정 섹션 하나에만 해당하면 narrDir로 그 섹션에, 곡 전체에 걸친 톤이면 tag로. 뻔한 "organic" 반복 말고 이 곡만의 구체적인 인간적 디테일이어야 해
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
${refSong?`"${refSong}"`:(st.brief?`(곡명 없음) 사용자가 원하는 느낌: "${st.brief.text}" — ${st.brief.understood} / 소리 특징: ${(st.brief.styleTags||[]).join(' & ')}`:'없음 — "레퍼런스 부합도" 카테고리는 쓰지 마')}

${aiPromptSnapshot()}

[라운드] ${appliedSoFar.length?'2라운드 이후 — 이미 적용된 주제는 반복 금지, 8점 이상 항목은 지적 금지, 최대 4개':'첫 리뷰'}

[현재 적용돼 있는 섹션별 지시 — 이 안에서 모순되거나 과한 건 지적해도 됨]
${Object.entries(st.narrAI||{}).map(([k,v])=>`- ${k}: ${v}`).join('\n')||'(없음)'}

[글자 예산] 섹션 프롬프트 ${(document.getElementById('hh-sect-ta')?.value||'').length}/5000자, 스타일 ${(document.getElementById('hh-style-ta')?.value||'').length}/1000자${scoringAnchor()}

[이전 라운드에서 이미 적용된 조언 — 이건 이미 반영됐으니 절대 똑같이 다시 제안하지 마, 그 위에 새로 찾은 걸 더해]
${appliedSoFar.length?appliedSoFar.map((s,i)=>`${i+1}. (${s.category}) ${s.text}`).join('\n'):'(없음 — 이번이 첫 리뷰)'}`;

    // 최소 4~6개 제안 + narrDir 같은 다항목 필드를 요구하면서 출력이 꽤 길어짐 — 8000으로는 자주 잘려서 올림
    const raw=await callAnthropic(key,{maxTokens:16000,staticText,dynamicText,think:false});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const list=(parsed.suggestions||[]).filter(s=>s&&s.text);
    if(!list.length)throw new Error('AI가 제안을 반환하지 못했습니다');
    // "다시" 눌러서 재리뷰할 때 이전에 적용한 조언까지 통째로 갈아치우면 🔍 적용 검증이 추적할 이력이 사라짐 —
    // 이미 적용된 건 남기고 새로 받은 라운드만 그 뒤에 이어붙임
    _aiSuggestions=[...appliedSoFar,...list.map(s=>normalizeAiSuggestion(s,uniqueSegs,occKeys))];
    {const tot=_aiSuggestions.find(s=>s.category==='총평'&&!s.applied);recordAiScore(tot?.score,tot?.criteria);noteScored(tot?.criteria,tot?.score);}   // 리뷰 대상이던 텍스트가 아직 화면에 있을 때
    hhGenerate(false,{noScroll:true});
  }catch(e){
    fail(e.message);
    if(btn){btn.disabled=false;btn.textContent='🤖 AI 프로듀서 리뷰 받기';}
  }
}
// 섹션별 AI 지시는 (occurrence, 카테고리) 키로 교체 저장 — 같은 카테고리의 새 조언은 앞의 것을 대체(AI가 앞선 내용을 보고 다시 쓴 것), 다른 카테고리는 공존.
// 합친 문구는 구 단위로 중복을 없애고 occurrence당 200자로 자름(예전 addNarr는 이어붙이기만 해서 hook3 노트가 2라운드에 308자, 서로 모순)
function capPhrases(text,max){
  const seen=new Set(),out=[];let len=0;
  for(const p of (text||'').split(/, (?![^()]*\))/).map(s=>s.trim()).filter(Boolean)){
    const k=p.toLowerCase();
    if(seen.has(k))continue;
    if(len+p.length+(out.length?2:0)>max)break;
    seen.add(k);out.push(p);len+=p.length+(out.length>1?2:0);
  }
  return out.join(', ');
}
// 지시를 Suno가 읽기 좋은 키워드 구로 정리 — 서술 문장·명령형·긴 구 제거 ("Suno 파싱 적합" 감점 요인)
function sanitizeDirective(text){
  return (text||'').replace(/\.\s+/g,', ').replace(/\.\s*$/,'').split(/, (?![^()]*\))/).map(p=>p.replace(/^(?:please |should |must |ensure |make sure |add |use |include |try to )/i,'').replace(/\.$/,'').trim())
    .filter(p=>p&&p.replace(/\([^)]*\)/g,'').split(/\s+/).length<=9).join(', ');
}
const DIRECTIVE_CAP=k=>/^hook/.test(k)?200:/^(verse|bridge)/.test(k)?130:100;
function setDirective(occKey,category,text){
  st.narrDirs=st.narrDirs||{};
  const clean=sanitizeDirective(text);
  if(!clean)return;
  (st.narrDirs[occKey]=st.narrDirs[occKey]||{})[category||'기타']=clean;
  const joined=capPhrases(Object.values(st.narrDirs[occKey]).join(', '),DIRECTIVE_CAP(occKey));
  if(joined)st.narrAI[occKey]=joined;else delete st.narrAI[occKey];
}
const RUBRIC_TEXT=()=>`채점은 아래 8개 항목을 각각 0~10 정수로 매겨 criteria에 넣어 (합계는 내가 계산하니 네가 합산하지 마). 앵커: 5=어떤 장르에도 붙는 범용 템플릿 수준 / 7=탄탄하지만 다듬을 곳이 분명히 있음 / 9=지금 바로 Suno에 넣어 곡을 만들어도 되는 수준. 실제로 결함이 없는 항목엔 8~10을 줘도 돼 — 억지로 깎지 마.
${REVIEW_RUBRIC.map(r=>`- ${r.key}(${r.label}, 가중 ${r.w}): ${r.def}`).join('\n')}
(레퍼런스 곡이 없으면 reference는 생략)\n참고: 스타일 태그 안의 ' & '는 Suno가 세는 콤마 태그 개수를 줄이려는 의도된 결합이야 — '& 때문에 파싱이 비효율적'이라는 지적은 하지 마. 태그가 콤마 기준 12개를 넘거나 서술 문장이 섞였을 때만 parse를 깎아.`;
const aiSuggestionActionable=s=>!!(s.melodyLead||s.tag||s.boostSection||s.addSection||s.mood||s.narrDir||s.removeRef||s.removeTag||s.removePhrase);
// 조언마다 버튼을 눌러 그때그때 hhGenerate하면 클릭 수만큼 화면이 프롬프트로 튀고 히스토리도 그만큼 쌓였음 —
// 체크박스로 고른 것들을 한 번에 적용하고 재생성·히스토리 기록은 1번만
function toggleAiSuggestion(idx,checked){
  const s=(_aiSuggestions||[])[idx];
  if(s)s.selected=!!checked;
  updateAiApplyBtn();
}
function selectAllAiSuggestions(flag){
  (_aiSuggestions||[]).forEach(s=>{if(aiSuggestionActionable(s)&&!s.applied)s.selected=flag;});
  document.querySelectorAll('.hh-ai-cb').forEach(cb=>{cb.checked=flag;});
  updateAiApplyBtn();
}
function updateAiApplyBtn(){
  const btn=document.getElementById('hh-ai-apply-btn');
  if(!btn)return;
  const n=(_aiSuggestions||[]).filter(s=>s.selected&&!s.applied&&aiSuggestionActionable(s)).length;
  btn.textContent=`✅ 선택 적용 (${n})`;
  btn.disabled=!n;
  btn.style.opacity=n?'1':'.5';
  btn.style.cursor=n?'pointer':'default';
}
function applySelectedAiSuggestions(){
  const picked=(_aiSuggestions||[]).filter(s=>s.selected&&!s.applied&&aiSuggestionActionable(s));
  if(!picked.length)return;
  // 무드 변경은 멜로디·808·드럼 룰 재추천을 다시 돌리니, 같이 고른 다른 조언(멜로디 리드 등)이 덮이지 않게 가장 먼저
  picked.sort((x,y)=>!!y.mood-!!x.mood);
  picked.forEach(applyAiSuggestionCore);
  // 피드백 적용은 예외 — 적용하자마자 고쳐 쓴 프롬프트를 보는 게 목적이라 바로 재생성 (다른 AI 추천·분석은 Generate를 눌러야 반영)
  hhGenerate(`AI 리뷰 ${picked.length}개 적용: ${[...new Set(picked.map(s=>s.category))].join('·')}`,{noScroll:true});
}
function applyAiSuggestionCore(sug){
  sug.applied=true;
  sug.selected=false;
  if(sug.mood){
    st.mood=sug.mood;
    moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',onMoodChange);
    onMoodChange();
    return;
  }
  // 같은 묶음에 무드 변경이 있으면 멜로디가 재추천으로 바뀌어 지목된 악기가 이미 없을 수 있음 — 그땐 역할 조언 자체가 무의미하니 건너뜀
  if(sug.melodyLead&&st.melody.includes(sug.melodyLead)){
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
    while(st.extraTags.length>3)st.extraTags.shift();   // 스타일 지시는 최대 3개 — 새 것이 오면 가장 오래된 것 교체(라운드마다 태그가 불어나지 않게)
  }
  // 같은 occurrence에 여러 조언이 겹치면(예: 믹스 조언 + Anti-AI 조언이 둘 다 hook2) 예전엔 마지막 것만 남고 앞의 건 조용히 사라졌음 — 이어붙임
  const addNarr=(k,d)=>setDirective(k,sug.category,d);
  if(sug.boostSection&&sug.boostText){
    // boostText도 타입 전체에 하나뿐인 슬롯이라 "첫 훅"·"마지막 훅" 조언이 둘 다 있으면 뒤가 앞을 덮어썼음 — occurrence 키로 옮김
    const n=st.structSegs.filter(x=>x===sug.boostSection).length;
    addNarr(`${sug.boostSection}${sug.boostOccurrence==='first'?1:n}`,sug.boostText);
    renderHhNarr();
  } else if(sug.boostSection){
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
    Object.entries(sug.narrDir).forEach(([occKey,dir])=>addNarr(occKey,dir));
    renderHhNarr();
  }
  if(sug.removeRef){
    // 새 tag가 요구하는 방향과 기존 프로듀서 레퍼런스의 내장 설명이 상반될 때(문자열로는 안 겹쳐서 위의 태그 충돌 체크로는 못 잡음) —
    // AI가 직접 지목한 것만 제거
    st.refs=st.refs.filter(r=>r!==sug.removeRef);
    renderProducerRef();
  }
  if(sug.removePhrase){
    // 인용한 구는 생성 결과에서 빼도록 저장 (규칙 엔진 텍스트에서 제거, AI 작성기에는 "다시 쓰지 말 것"으로 전달) — 최대 12개
    const hay=((document.getElementById('hh-sect-ta')?.value||'')+' '+(document.getElementById('hh-style-ta')?.value||'')).toLowerCase();
    const real=sug.removePhrase.filter(p=>hay.includes(p.toLowerCase()));   // 현재 프롬프트에 실제로 있는 구만
    st.removedPhrases=[...new Set([...(st.removedPhrases||[]),...real])].slice(-12);
  }
  if(sug.removeTag){
    // tag(추가)와 달리 "지금 있는 걸 줄이자/빼자"는 조언은 새 문구가 없어서 위의 자동 충돌 제거가 못 잡음 — AI가 지목한 핵심 단어로 직접 제거
    st.texture=st.texture.filter(t=>!t.toLowerCase().includes(sug.removeTag));
    st.extraTags=st.extraTags.filter(t=>(sug.tag||[]).includes(t)||!t.toLowerCase().includes(sug.removeTag));   // 같은 조언이 새로 넣은 태그는 지우지 않음("brass" 제거 + "metallic synth brass hybrid" 추가가 서로 지워졌음)
  }
}
function clearAiSuggestions(){
  _aiSuggestions=null;
  hhGenerate(false,{noScroll:true});
}
// 우리 AI 리뷰는 텍스트 프롬프트만 보고 짐작하지만, 사용자가 실제로 완성된 곡을 듣고 받은 외부 피드백
// (다른 AI 청취 평가, 사람 리뷰 등)은 오디오 근거가 있어서 훨씬 신뢰도 높은 정보 — 그걸 붙여넣으면
// aiProducerReview와 같은 스키마로 파싱해서 같은 적용 파이프라인(applyAiSuggestionCore)을 그대로 태움
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

${aiPromptSnapshot()}

[이미 적용된 조언 — 같은 걸 다시 제안하지 마]
${(_aiSuggestions||[]).filter(s=>s.applied).map((s,i)=>`${i+1}. (${s.category}) ${s.text}`).join('\n')||'(없음)'}

[외부 피드백]
${feedback}`;

    // aiProducerReview와 같은 이유(최소 3~5개 다항목 제안 요구)로 출력이 길어질 수 있어서 같은 한도로 맞춤
    const raw=await callAnthropic(key,{maxTokens:16000,staticText,dynamicText,think:false});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const list=(parsed.suggestions||[]).filter(s=>s&&s.text);
    if(!list.length)throw new Error('피드백에서 반영할 내용을 찾지 못했습니다');
    const added=list.map(s=>normalizeAiSuggestion(s,uniqueSegs,occKeys));
    _aiSuggestions=[...(_aiSuggestions||[]),...added];
    if(ta)ta.value='';
    hhGenerate(false,{noScroll:true});
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

그리고 지금 [최종 프롬프트] 상태 전체를 아래 루브릭으로 다시 채점해. [직전 채점]이 주어지면 거기 적힌 채점 규칙을 따르고, 없으면 지금 상태 자체를 기준으로 채점해.
${RUBRIC_TEXT()}

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해 (checks 배열 순서는 조언 목록 순서와 정확히 같아야 해):
{"checks":[{"status":"pass|partial|fail","note":"(partial·fail일 때만) 한국어 이유"}],"criteria":{"arc":0,"variety":0,"genre":0,"coherence":0,"roles":0,"human":0,"reference":0,"parse":0}}`;
    const dynamicText=`

[적용된 조언 목록]
${applied.map((s,i)=>`${i+1}. (${s.category}) ${s.text}`).join('\n')}
${oldScore!=null?`\n[적용 전 총평 점수] ${oldScore}/100 (참고용)`:''}${scoringAnchor()}

[최종 섹션 프롬프트]
${sectText}

[최종 스타일 프롬프트]
${styleText}`;

    const raw=await callAnthropic(key,{maxTokens:2000,staticText,dynamicText,think:false});
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
    const newCriteria=parsed.criteria;
    const newScore=rubricScore(newCriteria)??Math.round(parsed.updatedScore);
    if(Number.isFinite(newScore)&&newScore>=1&&newScore<=100){
      const totalRow=(_aiSuggestions||[]).find(s=>s.category==='총평');
      if(totalRow){
        totalRow.prevScore=oldScore??null;
        totalRow.score=newScore;
        if(newCriteria&&rubricScore(newCriteria)!=null)totalRow.criteria=newCriteria;
        recordAiScore(newScore,newCriteria);
        noteScored(totalRow.criteria,newScore);
      }
    }
    hhGenerate(false,{noScroll:true});
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
      st.era?`시대감: ${st.era}`:null,
      st.region?`지역색: ${st.region}`:null,
      (document.getElementById('hh-ref-song')?.value||'').trim()?`타겟 레퍼런스 곡: ${(document.getElementById('hh-ref-song').value||'').trim()}`:null,
      briefCtxLine(),
      st.vocal&&st.vocal!=='No Vocal'?`보컬: ${st.vocal}`:'보컬 없음 (인스트루멘탈)',
      st.commercial?`색깔: ${st.commercial}`:null,
      st.density?`밀도: ${st.density}`:null,
      st.length?`목표 길이: ${st.length}`:null,
      `BPM ${st.bpmSet?st.bpm:'미지정(프롬프트에 쓰지 않음)'} / Key ${st.keySet?KEYS[st.key]:'미지정(프롬프트에 쓰지 않음)'}`,
    ].filter(Boolean).join('\n');
    const staticText=`너는 힙합 비트 프로듀서야. 아래 선택된 요소들을 보고, 이 비트에 가장 잘 어울리는 멜로디 리드 악기 1개, 배경 악기 1개, 믹스 텍스처 2개, 악기 톤/음색 1개, 전환효과 1~2개, 스윙/그루브 1개, 808 강도 1개, 드럼 패턴 1~3개, 편곡 밀도 1개, 곡 구조 1개를 추천해줘. 곡 구조는 아래 [구조 프리셋] 중에서 장르·무드·보컬 유무·목표 길이·색깔(커머셜/언더그라운드)과 타겟 레퍼런스 곡의 실제 곡 구성(네가 아는 대로)을 종합해 골라 — 예를 들어 루프 하나로 미니멀하게 가는 곡이면 Minimal/Loop Evolve, 벌스로 쌓다가 훅에서 터지는 곡이면 Slow Burn, 훅이 자주 돌아오는 곡이면 Hook Heavy. [현재 선택]에 타겟 레퍼런스 곡이 있으면, 그 곡의 실제 편곡 성격(로그드럼 같은 루프 하나로 밀고 가는 미니멀한 곡인지, 라이저·크래시로 빌드업하는 곡인지, 드롭이 폭발적인 곡인지, 레이어가 촘촘한 곡인지)을 네가 아는 대로 판단해서 밀도·전환효과·드럼 선택에 반영해 — 미니멀한 곡이면 밀도는 Minimalist/Sparse, 전환효과는 필터 스윕다운·순간 정적·테이프 스탑처럼 절제된 것을, 빌드업이 강한 곡이면 라이저·스네어 롤·임팩트 쪽을 골라. 레퍼런스가 미니멀 루프형이어도 멜로디는 반드시 리드+배경 2개를 골라 — 대신 배경은 존재감이 작은 것으로. 리드와 배경은 대역이 겹치지 않게(둘 다 Dark synth·Ambient pad·Strings 같은 저역 지속음이면 808과 함께 로우~로우미드가 뭉쳐서 마스킹) 한쪽은 플럭·벨·아르페지오 같은 짧은 트랜지언트 악기로 골라 (Supersaw + Ambient pad처럼 둘 다 넓게 깔리는 지속음이면 중고역이 서로 마스킹). 곡을 모르면 무리해서 추측하지 말고 장르·무드 기준으로만 골라. 808·드럼·그루브는 장르 정체성을 지키면서 무드에 맞게 골라(예: 808을 원래 안 쓰는 장르는 None, 드릴은 그리드가 타이트한 쪽, 어두운 무드면 808을 더 무겁게, 슬프거나 내성적이면 가볍게). 리드와 배경은 서로 다른 역할이니 각각 그 역할에 맞는 걸로 따로 판단해줘 — 리드는 곡을 이끄는 전면 멜로디, 배경은 리드를 받쳐주는 후면 텍스처. 어떤 악기가 리드에 어울리고 어떤 게 배경에 어울릴지는 정해진 규칙이 없으니 이 조합의 맥락(장르·무드)을 보고 네가 직접 판단해. 목표는 다양성이 아니라 이 조합에 대한 최적의 선택이야 — 이 조합에 정말 그 게 최선이라고 판단되면 이전과 같은 결과를 다시 줘도 상관없어, 억지로 다르게 고르지 마. 단, 아래 목록에 있는 이름만 정확히 그대로 사용해.

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

[808 강도 목록]
${HH_808.join(', ')}

[편곡 밀도 목록 — 레이어가 얼마나 촘촘한지]
${HH_DENSITY.join(', ')}

[구조 프리셋 — 이름 그대로 사용, 괄호는 섹션 수 × 약 26초로 추정한 예상 길이]
${HH_STRUCT_PRESETS.map(p=>`${p.name}: ${p.desc} (${p.segs.join('→')}, 약 ${fmtDur(structDurationSec(p.segs))})`).join('\n')}

[드럼 패턴 목록 — 장르마다 쓰는 리듬 어휘가 다르니 이 장르에 맞는 것만 1~3개]
${HH_DRUMS.join(', ')}

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해:
{"melodyLead":"...","melodyBackground":"...","texture":["...","..."],"melodyTone":"...","transitionFx":["...","..."],"groove":"...","808":"...","drums":["..."],"density":"...","structure":"...","reason":"한 문장 한국어 이유"}`;
    const dynamicText=`

[현재 선택]
${ctx}`;

    const raw=await callAnthropic(key,{maxTokens:1500,staticText,dynamicText,think:false});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const lead=parsed.melodyLead;
    let bg=parsed.melodyBackground;
    if(!HH_MELODY.includes(lead)||(bg!=null&&!HH_MELODY.includes(bg))||lead===bg)throw new Error('AI가 목록에 없는 멜로디를 반환했습니다');
    const tex=pickCompatibleTextures((parsed.texture||[]).filter(t=>HH_TEXTURE.includes(t)));
    if(!tex.length)throw new Error('AI가 목록에 없는 텍스처를 반환했습니다');
    const tone=HH_MELODY_TONE.includes(parsed.melodyTone)?parsed.melodyTone:null;
    const fx=(parsed.transitionFx||[]).filter(f=>HH_TRANSITION_FX.includes(f)).slice(0,2);
    const groove=HH_GROOVE.includes(parsed.groove)?parsed.groove:null;
    const lvl808=HH_808.includes(parsed['808'])?parsed['808']:null;
    const density=HH_DENSITY.includes(parsed.density)?parsed.density:null;
    const structIdx=HH_STRUCT_PRESETS.findIndex(p=>p.name===parsed.structure);
    const drums=(parsed.drums||[]).filter(d=>HH_DRUMS.includes(d)).slice(0,3);

    if(bg&&HH_MELODY.includes(bg)&&lead!==bg)bg=complementBg(lead,bg,scorePick(HH_MELODY,GENRE_MELODY_TIPS,MOOD_MELODY_FIT,st.genre,st.mood,null));   // AI가 둘 다 지속음을 골라도 마스킹 방지
    st.melody=bg?[lead,bg]:[lead];
    // computeMelodyRoles가 내부적으로 같은 조건식을 한번 더 걸어서 뒤집기 때문에, 이 값을 그 조건식과 동일하게 주면
    // 최종적으로 항상 arr[0](AI가 lead라고 답한 악기)이 리드로 확정됨 — AI의 판단을 고정 역할표가 덮어쓰지 않게 하는 장치
    st.melodyLeadIdx=(bg&&MELODY_ROLE[lead]!=='lead'&&MELODY_ROLE[bg]==='lead')?1:0;
    st.texture=tex;
    // AI가 고른 걸 이후 무드 변경(룰 재추천)이 조용히 덮어쓰지 않게 — 그 순간 수동 확정 상태로 둠
    st._mtAutoManaged=false;
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
      chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,onRhythmManualChange);
      clearAutoHint('hh-groove-hint');
    }
    if(structIdx>=0){
      // AI가 고른 구조는 이후 무드·길이 변경이 조용히 덮어쓰지 않게 수동 확정 상태로 (다른 AI 추천값과 같은 원칙)
      st.structSegs=[...HH_STRUCT_PRESETS[structIdx].segs];
      st.structIdx=structIdx;
      st._structAutoManaged=false;
      renderStructBuilder('hh',HH_STRUCT_PRESETS,HH_SEG_PALETTE,st);
      clearAutoHint('hh-struct-hint');
    }
    if(density){
      st.density=density;
      chipGrid(document.getElementById('hh-density'),HH_DENSITY,st,'density',1,null);
    }
    if(lvl808){
      st._808=lvl808;
      chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,onRhythmManualChange);
      clearAutoHint('hh-808-hint');
    }
    if(drums.length){
      st.drums=drums;
      chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,onDrumsManualChange);
      clearAutoHint('hh-drums-hint');
    }
    // 레퍼런스 곡·악기·드럼이 정해진 뒤 프로듀서 레퍼런스도 같은 클릭에서 — 장르 기본 프로듀서(예: Afro Trap의 Pharrell)가 MHD 같은 미니멀 레퍼런스 곡과
    // 어긋나는데도 그대로 남는다는 리뷰 지적 때문. 재생성·기록은 이 함수가 한 번만
    let refNote='';
    try{
      await aiRecommendProducerRef({regen:false});
      refNote=st.refs[0]?` · 프로듀서 레퍼런스: ${st.refs[0]}`:'';
    }catch(_){}
    markPending('AI 추천 적용 (악기·808·드럼·프로듀서)');

    if(statusEl){
      statusEl.hidden=false;statusEl.style.color='var(--success)';
      statusEl.textContent='✅ '+(parsed.reason||'추천 완료')+refNote+' — Generate를 눌러 프롬프트에 반영하세요';
    }
  }catch(e){
    fail(e.message);
  }finally{
    btn.disabled=false;btn.textContent='🤖 AI 추천받기';
  }
}

// GENRE_REF는 장르 하나만 보고 고정 2명을 주는 룰 테이블이라, 같은 장르에서도 무드·멜로디·텍스처가 다르면
// 더 어울리는 다른 프로듀서가 있을 수 있음 — 그 판단은 룰로 못 담아서 AI로
// 구조만 따로 AI 추천 — 다른 요소(장르·무드·보컬·밀도·색깔·길이·레퍼런스 곡)를 다 고른 뒤에 눌러서 그걸 전부 보고 구조 프리셋 1개를 고름
async function aiRecommendStructure(){
  const key=getAnthropicKey();
  const statusEl=document.getElementById('hh-ai-struct-status');
  const btn=document.getElementById('hh-ai-struct-btn');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 Anthropic API Key를 먼저 저장하세요');return;}
  if(st.genre===null){fail('장르를 먼저 선택하세요');return;}
  btn.disabled=true;btn.textContent='🤖 추천 중...';
  if(statusEl)statusEl.hidden=true;
  try{
    const list=HH_STRUCT_PRESETS.map(p=>`${p.name}: ${p.desc} (${p.segs.join('→')}, 약 ${fmtDur(structDurationSec(p.segs))})`).join('\n');
    const staticText=`너는 힙합 비트 프로듀서야. 아래 선택된 요소들을 보고 이 곡에 가장 어울리는 곡 구조 프리셋을 아래 목록에서 1개만 이름 그대로 골라줘. 장르·무드·보컬 유무·밀도·색깔(커머셜/언더그라운드)·목표 길이(있으면 예상 길이와 비교)와, 타겟 레퍼런스 곡이 있으면 그 곡의 실제 곡 구성(루프 하나로 가는 미니멀한 곡인지, 벌스로 쌓다가 훅에서 터지는지, 훅이 자주 돌아오는지 — 네가 아는 대로)을 종합해서 판단해. 특별히 다른 구조가 더 어울린다는 근거가 없으면 정석(Standard)이 무난한 기본값이야 — 억지로 독특한 구조를 고르지 마.

[구조 프리셋 — 괄호는 섹션 수 × 약 26초로 추정한 예상 길이(Suno는 마디 수를 거의 무시하고 섹션 수로 곡 길이가 정해짐)]
${list}

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해:
{"structure":"...","reason":"한 문장 한국어 이유"}`;
    const dynamicText=`

[현재 선택]
${aiSelectionCtx({structure:false})}`;
    const raw=await callAnthropic(key,{maxTokens:600,staticText,dynamicText,think:false});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const idx=HH_STRUCT_PRESETS.findIndex(p=>p.name===parsed.structure);
    if(idx<0)throw new Error('AI가 목록에 없는 구조를 반환했습니다');
    st.structSegs=[...HH_STRUCT_PRESETS[idx].segs];
    st.structIdx=idx;
    st._structAutoManaged=false;   // AI가 고른 걸 이후 무드·길이 변경이 조용히 덮어쓰지 않게
    renderStructBuilder('hh',HH_STRUCT_PRESETS,HH_SEG_PALETTE,st);
    clearAutoHint('hh-struct-hint');
    markPending(`AI 구조 추천 적용: ${parsed.structure}`);
    if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--success)';statusEl.textContent='✅ '+parsed.structure+' — '+(parsed.reason||'추천 완료');}
  }catch(e){
    fail(e.message);
  }finally{
    btn.disabled=false;btn.textContent='🤖 AI로 구조 추천';
  }
}
async function aiRecommendProducerRef(opts){
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
    const staticText=`너는 힙합 비트 프로듀서야. 아래 선택된 요소들을 보고, 이 비트에 가장 잘 어울리는 프로듀서 레퍼런스 **딱 1명**을 아래 목록에서만 정확히 그대로 골라줘. 장르만 보지 말고 지금까지 고른 무드·멜로디·드럼·808·그루브·텍스처·보컬·시대/지역까지 전부 종합해서 판단해 — 이미 고른 요소들과 사운드 방향이 충돌하지 않고, 그 요소들이 안 다루는 사운드 디자인 색채를 보태주는 사람이 좋아 — 같은 장르라도 무드가 다르면 다른 프로듀서가 더 어울릴 수 있어.

중요: 아래 [이미 적용된 스타일 태그]가 있으면(AI 프로듀서 리뷰에서 이미 적용된 조언들이야) 후보 프로듀서의 설명(괄호 안 영어)이 그 태그랑 서브장르 자체가 달라질 만큼 상반되지 않는지 먼저 걸러 — 예를 들어 적용된 태그가 "log drum bassline"인데 후보 설명이 "chiptune-esque synth leads, minimal spacey drums"면 그 프로듀서는 제외해.

여러 프로듀서가 이 조합에 비슷하게 잘 어울릴 수 있으면, 매번 제일 유명하고 뻔한 조합(예: 트랩이면 항상 Metro Boomin·Wheezy)만 고르지 말고 무드·멜로디·텍스처 뉘앙스 차이를 살려서 다른 후보도 고려해 — 단, 억지로 안 맞는 걸 다양성 때문에 고르지는 마, 진짜 비슷하게 맞을 때만.

[프로듀서 목록]
${refList}

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해:
{"refs":["..."],"reason":"한 문장 한국어 이유"}`;
    const ctx=aiSelectionCtx({refs:false});
    const dynamicText=`

[현재 선택]
${ctx}

[이미 적용된 스타일 태그 — 이거랑 상반되는 프로듀서는 제외]
${st.extraTags.length?st.extraTags.join(', '):'(없음)'}`;

    const raw=await callAnthropic(key,{maxTokens:600,staticText,dynamicText,think:false});
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const refs=(parsed.refs||[]).filter(r=>HH_REF.some(p=>p.kr===r)).slice(0,1);
    if(!refs.length)throw new Error('AI가 목록에 없는 프로듀서를 반환했습니다');

    st.refs=refs;
    renderProducerRef();
    clearAutoHint('hh-ref-hint');
    if(opts?.regen!==false)markPending('AI 레퍼런스 추천 적용');

    if(statusEl){
      statusEl.hidden=false;statusEl.style.color='var(--success)';
      statusEl.textContent='✅ '+(parsed.reason||'추천 완료')+' — Generate를 눌러 프롬프트에 반영하세요';
    }
  }catch(e){
    fail(e.message);
  }finally{
    btn.disabled=false;btn.textContent='🤖 AI로 다시 추천';
  }
}


// ============================================================
// AI 작성기 — 규칙 엔진은 "명세(고정 정보) + 참고 초안"을 만들고, AI가 그 안에서 섹션·스타일 프롬프트를 직접 씀.
// 검사기(결정적)가 고정 정보를 확인해서 통과할 때만 채택, 실패하면 사유를 붙여 1회 재시도 → 그래도 실패면 규칙 초안 사용.
// 피드백 적용도 같은 작성기의 "고쳐쓰기" 모드 — 조언을 이어붙이지 않고 매번 예산 안에서 통째로 다시 씀 (5000자 초과·모순 누적 방지)
// ============================================================
let _hhWritten=null;      // 마지막 작성 결과 {fpFull,fpBase,section,style,meta}
let _hhDraft=null;        // 이번 Generate의 규칙 엔진 초안 {sect,style,fpFull,fpBase}
let _writeToken=0;        // 오래된 응답 무시용
let _writePromise=null;   // 진행 중 작성(리뷰가 초안 대신 최종 텍스트를 보게 대기)
let _writeState='off';    // off | pending | ok | fallback
let _writeErr='';

function aiWriteEnabled(){
  try{return !!getAnthropicKey()&&localStorage.getItem('hh_ai_write')!=='0';}catch(_){return false;}
}
// 상태 지문 — 초안 텍스트는 매번 무작위 문구가 섞여 달라지므로 텍스트가 아니라 "입력 상태"로 캐시 키를 만듦.
// fpBase = 지시(directive)를 뺀 나머지 → 같으면 고쳐쓰기, 다르면 새로 쓰기
function hhWriteFingerprints(){
  const clean=o=>JSON.stringify(o,(k,v)=>k.startsWith('_')?undefined:v);
  const extra=[...['hh-bar-hook','hh-bar-verse','hh-bar-bridge','hh-ref-song'].map(id=>document.getElementById(id)?.value||''),antiAI];
  const {narrAI,narrDirs,extraTags,removedPhrases,...rest}=st;
  return {fpBase:clean([rest,extra]),fpFull:clean([rest,extra,narrAI,extraTags,removedPhrases])};
}
function parseSections(text){
  const secs=[];
  (text||'').split('\n').forEach(line=>{
    if(/^\[.*\]$/.test(line.trim()))secs.push({header:line.trim(),body:''});
    else if(secs.length&&line.trim())secs[secs.length-1].body+=(secs[secs.length-1].body?' ':'')+line.trim();
  });
  secs.forEach(s=>{
    s.type=(s.header.match(/^\[(?:Instrumental )?(Intro|Hook|Verse|Bridge|Outro)/i)||[])[1]?.toLowerCase()||'other';
    s.bars=(s.body.match(/^\((\d+) Bars:/)||[])[1]||null;
  });
  return secs;
}
function splitPhrases(body){return (body||'').replace(/^\(\d+ Bars: /,'').replace(/\)$/,'').split(/, (?![^()]*\))/).map(x=>x.trim().toLowerCase()).filter(Boolean);}
// 명세: 고정 정보 + 힌트 — 검사기의 기준이기도 함
// 고쳐쓰기에서 바뀌어도 되는 섹션 — 지시가 바뀐 섹션, 새로 삭제 확정된 구가 들어 있던 섹션만. 나머지는 이전 결과를 글자 그대로 유지해야 함
// (AI가 전체를 다시 쓰면 지시와 무관한 섹션까지 조금씩 흔들려 라운드마다 일관성·파싱 적합이 깎이던 문제 — 수정 범위를 지시가 닿은 곳으로 제한)
function editScopeFor(prev,headers){
  const keys=structOccurrenceKeys();
  const old=prev.dirSnap||{narrAI:{},removedPhrases:[]};
  const mutable=new Set();
  keys.forEach((k,i)=>{if((st.narrAI||{})[k]!==(old.narrAI||{})[k])mutable.add(headers[i]);});
  const newRemoved=(st.removedPhrases||[]).filter(p=>!(old.removedPhrases||[]).includes(p));
  if(newRemoved.length){
    parseSections(prev.section).forEach(s=>{if(newRemoved.some(p=>s.body.toLowerCase().includes(p.toLowerCase())))mutable.add(s.header);});
  }
  return [...mutable];
}
function buildWriteSpec(draftSect,draftStyle,prev){
  const g=GENRES[st.genre];
  const roles=computeMelodyRoles(st.melody);
  const hasVocal=st.vocal&&st.vocal!=='No Vocal';
  const auto=st._mtAutoManaged!==false;   // 장르를 고르면 808·드럼·멜로디·텍스처·프로듀서가 장르 기본값으로 자동 채워짐 — 사용자가 고른 게 아니므로 확정 값이 아니라 참고
  const secs=parseSections(draftSect);
  const w={intro:1,hook:1.3,verse:1.1,bridge:0.9,outro:1};
  const wsum=secs.reduce((s,x)=>s+(w[x.type]||1),0)||1;
  const budget=Math.floor(WRITE_LIMITS.section*0.92);
  const structure=secs.map(s=>({header:s.header,type:s.type,bars:s.bars?+s.bars:null,maxChars:Math.floor(budget*(w[s.type]||1)/wsum*1.25)}));
  const styleTags=(draftStyle||'').split(', ');
  const fixedStyle=[hasVocal?null:'[Instrumental]',hasVocal?null:'no vocals',st.keySet?`Key of ${KEYS[st.key]}`:null,st.bpmSet?`${st.bpm} BPM`:null,(g?g.tag:null)].filter(Boolean);
  return {
    genre:g?g.en:null,genreTag:g?g.tag:null,mood:st.mood,key:st.keySet?KEYS[st.key]:null,bpm:st.bpmSet?st.bpm:null,
    lead:auto?null:(roles?roles.lead:(st.melody[0]||null)),background:auto?null:(roles?roles.bg:null),
    drums:auto?[]:[...st.drums],bass808:auto?null:st._808,vocal:hasVocal?st.vocal:null,
    transitionFx:auto?[]:[...(st.transitionFx||[])],groove:auto?null:st.groove,texture:auto?[]:[...st.texture],
    producerReference:auto?null:(st.refs[0]||null),
    producerSound:(!auto&&st.refs[0])?refFit(HH_REF.find(r=>r.kr===st.refs[0])?.en||'',', '):null,   // 이름은 못 쓰니 이 소리 특징을 스타일에 반영해야 함
    referenceSong:(document.getElementById('hh-ref-song')?.value||'').trim()||null,
    brief:effectiveBrief()?{understood:st.brief.understood,styleTags:effectiveBrief().styleTags||[],cues:effectiveBrief().cues||{}}:null,
    commercial:st.commercial||null,density:st.density||null,antiAI:!!antiAI,
    structure,fixedStyleTags:fixedStyle,styleTagsInDraft:styleTags.length,
    limits:{sectionTotal:WRITE_LIMITS.section,style:WRITE_LIMITS.style,styleTags:WRITE_LIMITS.tags},
    removedPhrases:[...(st.removedPhrases||[])],
    hookRhythm:(()=>{const hs=secs.filter(s=>s.type==='hook');const R=['정박 위주의 안정된 메인 패턴(변주 없이 그루브를 각인)','오프비트 싱코페이션·고스트 노트로 리듬 결이 달라짐','매 마디 필인·롤 가속으로 가장 촘촘하고 꽉 참'];return hs.map((s,i)=>({header:s.header,role:hs.length===1?R[0]:(i===hs.length-1?R[2]:R[Math.min(i,1)])}));})(),
    prevLength:prev?prev.section.length:null,
    mutableHeaders:prev?editScopeFor(prev,structure.map(s=>s.header)):null,   // null이면 새로 쓰기(전체 자유)
    prevSections:prev?parseSections(prev.section).map(s=>({header:s.header,body:s.body})):null,
  };
}
// 검사기 — 규칙 엔진이 만든 명세를 정답으로 AI 결과의 고정 정보를 확인
function validateWritten(spec,section,style){
  const errors=[];
  const secs=parseSections(section);
  const wantHeaders=spec.structure.map(s=>s.header);
  if(secs.length!==wantHeaders.length||secs.some((s,i)=>s.header!==wantHeaders[i]))
    errors.push(`섹션 헤더/순서가 명세와 다름. 정확히 이 순서·문구여야 함: ${wantHeaders.join(' | ')}`);
  else secs.forEach((s,i)=>{
    const sp=spec.structure[i];
    if(!/^\(.*\)$/.test(s.body))errors.push(`${s.header} 본문이 한 덩어리 괄호 "( … )"가 아님`);
    if(sp.bars&&!s.body.startsWith(`(${sp.bars} Bars: `))errors.push(`${s.header} 본문은 "(${sp.bars} Bars: "로 시작해야 함`);
    if(s.body.length>sp.maxChars*1.4)errors.push(`${s.header} 너무 김(${s.body.length}자, 권장 ≤${sp.maxChars}자)`);
  });
  if(section.length>spec.limits.sectionTotal)errors.push(`섹션 프롬프트 총 ${section.length}자 — ${WRITE_LIMITS.section}자 이하여야 함`);
  // 고쳐쓰기에서 조언을 반영할 때 이전보다 길어지면 라운드마다 부풀어서 'Suno 파싱 적합'이 깎임 — 낡은/겹치는 문구를 빼서 총량을 유지
  if(spec.prevLength&&section.length>spec.prevLength*1.08+60)errors.push(`이전 결과(${spec.prevLength}자)보다 8% 넘게 길어짐(${section.length}자) — 지시를 반영하면서 겹치거나 낡은 문구를 삭제해 총량을 유지할 것`);
  if(spec.mutableHeaders&&spec.prevSections&&secs.length===spec.prevSections.length){
    const norm=s=>s.replace(/\s+/g,' ').trim();
    secs.forEach((s,i)=>{
      const p=spec.prevSections[i];
      if(p&&p.header===s.header&&!spec.mutableHeaders.includes(s.header)&&norm(p.body)!==norm(s.body))
        errors.push(`${s.header}는 이번 지시의 대상이 아니라서 이전 결과를 글자 그대로 유지해야 함 (바뀌면 안 됨)`);
    });
  }
  (spec.removedPhrases||[]).forEach(p=>{if((section+' '+style).toLowerCase().includes(p.toLowerCase()))errors.push(`삭제하기로 확정한 문구 "${p}"가 다시 들어감`);});
  const low=section.toLowerCase();
  const hooks=secs.filter(s=>s.type==='hook');
  if(spec.lead){
    const l=spec.lead.toLowerCase();
    const leadSecs=[secs.find(s=>s.type==='intro'),hooks[0],hooks[hooks.length-1]].filter(Boolean);
    if(!leadSecs.every(s=>s.body.toLowerCase().includes(l)))errors.push(`리드 악기 "${spec.lead}"가 인트로와 첫·마지막 훅에 이름으로 들어가야 함`);
  }
  if(spec.background&&hooks.length&&!hooks.some(s=>s.body.toLowerCase().includes(spec.background.toLowerCase())))errors.push(`배경 악기 "${spec.background}"가 훅에 최소 한 번은 등장해야 함`);
  spec.drums.forEach(d=>{if(!low.includes(d.toLowerCase()))errors.push(`고른 드럼 "${d}"가 섹션 어디에도 없음`);});
  if(spec.drums[0]&&hooks[0]&&!hooks[0].body.toLowerCase().includes(spec.drums[0].toLowerCase()))errors.push(`메인 드럼 "${spec.drums[0]}"가 첫 훅에 들어가야 함`);
  // 실존 아티스트·프로듀서 이름 금지 (Suno 임퍼스네이션 정책) — 소리 묘사로 풀어 써야 함
  {
    const names=[...HH_REF.map(r=>r.kr),...(spec.referenceSong||'').split(' - ')[0].split(/\s+(?:feat\.?|featuring|ft\.?|x|&)\s+|,\s*/i)].map(n=>n.trim().toLowerCase()).filter(n=>n.length>=4);
    const hay=(section+' '+style).toLowerCase();
    const hit=[...new Set(names)].find(n=>hay.includes(n));
    if(hit)errors.push(`실존 아티스트/프로듀서 이름 "${hit}"이 들어감 — 이름 대신 그 소리의 특징을 묘사하는 키워드로 바꿀 것`);
  }
  // 프로듀서 레퍼런스는 이름 대신 소리 특징으로 남아야 함 — 빠지면 리뷰의 "레퍼런스 부합"이 바닥(실사용에서 2점)
  if(spec.producerSound){
    const hay=_toks(section+' '+style);
    const ok=spec.producerSound.split(', ').some(p=>{const tt=[..._toks(p)];return tt.length&&tt.filter(w=>hay.has(w)).length/tt.length>=0.6;});
    if(!ok)errors.push(`프로듀서 레퍼런스의 소리 특징(${spec.producerSound}) 중 하나 이상을 스타일에 소리 키워드로 반영해야 함 (이름은 쓰지 말 것)`);
  }
  // brief(곡명/느낌 분석)의 스타일 태그 중 최소 하나는 스타일에 반영돼야 함
  if(spec.brief?.styleTags?.length){
    const sty=_toks(style);
    const ok=spec.brief.styleTags.some(t=>{const tt=[..._toks(t)];return tt.length&&tt.filter(w=>sty.has(w)).length/tt.length>=0.6;});
    if(!ok)errors.push(`brief 스타일 태그(${spec.brief.styleTags.join(' / ')}) 중 하나 이상이 스타일 프롬프트에 그대로 반영돼야 함`);
  }
  // 보컬 규칙
  if(!spec.vocal){
    const stripped=(section+' '+style).replace(/vocal-?less|without (?:any )?vocals?|non-vocal|no vocals|no vocal samples|zero vocal chops|vocal chops? (?:are )?(?:absent|excluded)|completely instrumental|purely instrumental|\[instrumental\]|instrumental/gi,'');
    if(/\bvocals?\b|\bsing(?:ing|er)?\b|\blyrics?\b|\bchoir\b|\bvoices?\b|\bchant(?:s|ing|ed)\b|\bad-?libs?\b|\boohs?\b|\bchoral\b/i.test(stripped))errors.push('무보컬 곡인데 보컬을 떠올리게 하는 단어(vocal/voice/sing/lyrics/choir/humming/chant/ad-lib)가 있음 — "no vocals", "ZERO vocal chops"만 허용');
    // 보컬 없음을 고르면 "보컬찹 없음"이 무엇보다 우선 — 스타일과 첫·마지막 훅에 반드시 명시
    if(!/zero vocal chops/i.test(style))errors.push('무보컬 곡의 스타일에 "ZERO vocal chops"가 반드시 있어야 함');
    [hooks[0],hooks[hooks.length-1]].filter(Boolean).forEach(s=>{if(!/zero vocal chops/i.test(s.body))errors.push(`${s.header}에 "ZERO vocal chops"가 반드시 있어야 함`);});
  }else{
    // 보컬이 있는 곡: 무보컬 신호가 하나라도 있으면 Suno가 보컬을 끄거나 결과가 엉킴 (예시 프롬프트가 전부 무보컬이라 AI가 [Instrumental]을 따라 쓰는 경우가 있었음)
    const noVoc=(style+' '+section).match(/\[instrumental\]|\bno vocals?\b|zero vocal chops|no vocal samples|(?:purely|completely) instrumental|\bvocal chops?\b/i);
    const label=(style+' '+section).match(/\b(heavy hooks|light ad-libs|full rap feature)\b/i);   // 우리 메뉴 이름이지 Suno가 아는 표현이 아님
    if(label)errors.push(`메뉴 이름 "${label[0]}"이 그대로 들어감 — 실제로 들리는 보컬 소리(톤·마이크 거리·후크 라인 등)로 묘사할 것`);
    if(noVoc)errors.push(`보컬이 있는 곡인데 무보컬 신호 "${noVoc[0]}"가 들어감 — 스타일·섹션에서 모두 빼고 보컬을 소리로 묘사할 것`);
    if(hooks.some(s=>!/vocal|voice|sung|sing|rap|whisper|ad-?lib|chant|heavy hooks|full rap/i.test(s.body)))errors.push(`보컬(${spec.vocal})이 모든 훅에 소리로 묘사돼야 함`);
    // "Instrumental"이라고 표시한 섹션(예: 브릿지)에 보컬 묘사가 있으면 헤더와 본문이 모순
    const vocRe=/\b(vocals?|voices?|sing(?:ing|er)?|sung|whisper\w*|ad-?libs?|murmur\w*|humming|choir|lyrics?)\b/i;
    secs.filter(s=>/instrumental/i.test(s.header)&&vocRe.test(s.body)).forEach(s=>errors.push(`${s.header}는 Instrumental 섹션인데 본문에 보컬 묘사(${s.body.match(vocRe)[0]})가 있음 — 보컬 없이 쓸 것`));
  }
  // 스타일 박스
  spec.fixedStyleTags.forEach(t=>{if(!style.toLowerCase().includes(t.toLowerCase()))errors.push(`스타일 프롬프트에 고정 태그 "${t}"가 없음`);});
  if(style.length>spec.limits.style)errors.push(`스타일 프롬프트 ${style.length}자 — ${WRITE_LIMITS.style}자 이하여야 함`);
  if(style.split(', ').length>spec.limits.styleTags)errors.push(`스타일 태그가 ${style.split(', ').length}개 — ${WRITE_LIMITS.tags}개 이하여야 함(관련 요소는 " & "로 융합)`);
  (st.extraTags||[]).forEach(t=>{if(!style.toLowerCase().includes(t.toLowerCase().split(' ')[0]))errors.push(`확정된 스타일 지시 "${t}"가 스타일 프롬프트에 빠짐`);});
  // 스타일은 기준 톤만 — 섹션마다 달라지는 절대 표현이 있으면 섹션과 모순이 됨
  {const abs=(style.match(/\b(always|only|never|widest|maximum|silent|absent)\b/gi)||[])[0];if(abs)errors.push(`스타일 프롬프트에 섹션마다 달라지는 절대 표현 "${abs}"가 있음 — 곡 전체의 기준 톤만 쓸 것`);}
  // 형식: 서술형 문장 도배 금지
  const sentences=(section.match(/[a-z]{3,}\. [A-Z]/g)||[]).length;
  if(sentences>2)errors.push('완결된 서술형 문장이 많음 — 콤마로 구분한 짧은 키워드 구로만 쓸 것');
  // 같은 타입 섹션끼리 문구 반복
  ['hook','verse','bridge'].forEach(type=>{
    const sets=secs.filter(s=>s.type===type).map(s=>new Set(splitPhrases(s.body)));
    let sum=0,c=0;
    for(let i=0;i<sets.length;i++)for(let j=i+1;j<sets.length;j++){const inter=[...sets[i]].filter(x=>sets[j].has(x)).length;sum+=inter/Math.max(1,Math.min(sets[i].size,sets[j].size));c++;}
    if(c&&sum/c>0.5)errors.push(`${type} 섹션들이 서로 문구를 ${Math.round(100*sum/c)}% 반복 — 회차마다 다른 표현으로`);
  });
  return {ok:!errors.length,errors};
}
const WRITE_STATIC=`너는 힙합·클럽 음악 프로듀서이자 Suno AI 프롬프트 작가야. 사용자의 [의도]와 [명세]를 받아서, Suno에 그대로 붙여 넣을 **섹션 프롬프트**와 **스타일 프롬프트**를 처음부터 직접 써. 템플릿이나 장르의 평균적인 기본 문구로 채우지 말고, 이 곡의 의도(원하는 분위기·장르·레퍼런스 곡의 소리)에 맞는 구체적인 소리와 전개를 네가 직접 설계해.

[좋은 프롬프트의 패턴 — 실제로 Suno에서 잘 나온 프롬프트에서 뽑은 것. 우리 프로그램의 질감·디테일과 합쳐서 써]
- 스타일: 이 곡이 어떤 장르들의 만남인지 잘 드러나게(필요하면 "A meets B" 같은 크로스오버 표현), 귀에 붙는 매력 어휘는 의도에 맞는 것으로(밝고 신나는 곡은 catchy·bright·danceable, 어둡거나 몽환적인 곡은 hypnotic·menacing·shimmering처럼 — 항상 같은 단어를 쓰지 마). 금지어 묶음("no vocals & ZERO vocal chops & no vocal samples", 필요하면 "NO guitars")은 스타일에 한 번, 섹션에는 첫 훅·마지막 훅에만.
- 헤더: 명세의 헤더는 그대로 두되, 본문이 헤더의 성격(예: "UK Drill Drop", "Full Club Energy", "Maximum Bounce", "Stripped & Spacious")과 정확히 맞게 써.
- 훅: 에너지 단어 + 리드가 얼마나 캐치한지("catchy bright synth lead") + 핵심 리듬·베이스를 앞에. 그 뒤에 질감·그루브 결·인간적 불완전함을 얹어.
- 무보컬 벌스: 랩/멜로디가 들어올 자리를 남기는 표현("wide open pocket for rhythmic rap", "leaving space for a top-line melody", "leaving maximum space for the artist") — 단, 'vocal' 단어는 쓰지 마.
- 스타일과 섹션 모두 "상업적 매력"과 "질감·디테일" 중 하나만 있으면 안 돼 — 둘을 같이.

[편곡·디테일 원칙 — 장르 관습이나 템플릿 문구가 아니라, 이 곡의 의도(무드·레퍼런스·고른 악기)에서 구체적으로 뽑아 써. 초안이 없으니 이 디테일은 전부 네가 설계해야 해]
- 분량: 섹션마다 소리 요소를 6~10개 안팎으로 풍부하게, 섹션 프롬프트 전체는 2,800~3,800자 안팎(5,000자 한도 안). 뻔한 일반어로 채우지 말고 그 섹션에서 실제로 달라지는 소리를 써.
- 공간·믹스 흐름(섹션 텍스트에만, 스타일 태그엔 쓰지 마): 인트로→벌스→훅→클라이맥스→아웃트로에서 스테레오 폭·리버브·드라이함이 어떻게 달라지는지 섹션마다 다르게. 클라이맥스 훅이 가장 넓고 꽉 차고, 아웃트로는 디케이/수축.
- 편곡 변화: 벌스는 드럼·베이스·멜로디 중 무엇을 덜어내는지, 브릿지는 어떤 필터·리듬·효과로 긴장을 만드는지, 훅은 회차마다 무엇이 더해지는지를 구체적으로. 같은 타입 섹션끼리 문구를 반복하지 마.
- 전환: 브릿지·훅 직전 마지막 마디의 전환 장치(라이저, 스네어 롤, 리버스, 필터 스윕, 순간 정적, 테이프 스탑 등)를 의도에 맞게 골라 매번 다르게. 사용자가 전환 효과를 확정했으면 그것을 써.
- 회수: 아웃트로는 인트로의 소리·이미지를 다시 불러와 끝맺고(콜백) 마지막에 남는 소리를 명시.
- 인간미(antiAI가 true일 때): 이 곡의 실제 악기·드럼마다 구체적인 불완전함(타이밍 밀림, 벨로시티 불균일, 피치 흔들림, 필터 비대칭 등)을 섹션에 나눠서 몇 군데.
- 믹스 분리: 리드·배경·베이스가 겹칠 수 있는 구간에서는 분리 방법(하이패스, 사이드체인, 옥타브 분리)을 훅에 한두 번 명시.

[무보컬 곡 — 다른 어떤 디테일보다 우선]
- 명세의 vocal이 null이면 보컬찹·보컬 샘플·허밍·애드립·챈트·합창은 **절대 금지**야. 장르 관습이더라도(저지 클럽·하이퍼팝의 보컬찹 등) 넣지 마. 스타일에 "no vocals & ZERO vocal chops & no vocal samples" 묶음을 넣고, 첫 훅과 마지막 훅 본문에도 "ZERO vocal chops"를 넣어. 샘플 초핑 악기를 쓰면 "instrumental sample chops"처럼 보컬 샘플이 아님을 분명히 해.

[보컬 곡]
- 예시는 전부 무보컬이라 [Instrumental]·"no vocals & ZERO vocal chops…" 묶음이 있어. **명세의 vocal이 null이 아니면(보컬 곡) 이건 절대 쓰지 마.** 스타일에 [Instrumental]도, 섹션에 "purely/completely instrumental"이나 "vocal chops"도 금지. 보컬은 메뉴 이름(Heavy hooks, Light ad-libs, Full rap feature)을 그대로 쓰지 말고 실제로 들리는 소리(속삭임, 클로즈 마이크, 짧은 후크 라인, 톤, 처리)로 묘사해. 헤더가 "Instrumental"인 섹션(브릿지 등)에는 보컬 묘사를 넣지 마.
- vocal이 "Light ad-libs"면 리드 보컬 없이 짧은 애드립·후크 조각만 가끔 들어가는 곡이야. 이때도 "no vocals"라고 쓰면 Suno가 보컬을 통째로 끄니 절대 쓰지 말고, "sparse short ad-lib fragments, minimal vocal presence"처럼 있는 그대로 묘사해. "Full rap feature"는 랩 벌스가 곡의 중심인 곡, "Heavy hooks"는 노래하는 후크가 중심인 곡이야.

[BPM·Key]
- 명세의 bpm·key가 null이면 사용자가 정하지 않은 거야 — 스타일과 섹션 어디에도 BPM 숫자나 Key("in A minor" 등)를 쓰지 마. 값이 있으면 그대로 정확히 써.

[출력 형식 — 예시 프롬프트의 모양보다 이 규칙이 우선]
- <section>…</section><style>…</style> 두 블록만. 섹션은 명세 structure의 순서·헤더를 글자 그대로 쓰고, 각 헤더 바로 다음 줄에 본문을 괄호로 감싼 한 줄로: 마디 수(bars)가 있는 섹션은 "(N Bars: 키워드, 키워드, …)", 마디 수가 없는 인트로/아웃트로는 "(키워드, …)".
- 리드 악기 이름은 인트로와 첫·마지막 훅에, 메인 드럼(drums[0]) 이름은 첫 훅에, 고른 드럼은 곡 전체에 걸쳐 전부, 배경 악기는 훅에 한 번 이상 — 이름 그대로.
- 스타일은 콤마 태그 12개 안팎, 최대 15개(관련 요소는 " & "로 융합), fixedStyleTags 전부 포함, 프로듀서가 있으면 producerSound 키워드 포함.

[모범 예시 — 실제로 Suno에서 잘 나온 프롬프트 4개. 장르가 달라도 상관없어: Suno가 잘 읽는 형식(짧은 키워드 구, 콤마 구분, 한 줄 본문)과 밀도만 참고하고, 표현과 소리는 이 곡의 의도에서 새로 만들어. 예시의 문구를 다른 곡에 그대로 쓸 수 있다면 그건 템플릿이니 쓰지 마. 예시는 무보컬이라 'vocal' 단어가 들어간 부분은 따라 쓰지 마]
${PROMPT_EXAMPLES.map((e,i)=>`예시${i+1}\n스타일: ${e.style}\n${e.section}`).join('\n\n')}

[일관성 규칙 — 리뷰에서 반복해서 감점된 부분]
- 스타일 태그는 곡 전체의 "기준 톤"만 써. 섹션에 따라 달라지는 절대 표현(always, only, never, widest, maximum, silent, absent)과 dry/tight/wide 같은 공간 절대값을 스타일에 넣지 마 — 섹션이 그 값에서 벗어나는 순간 모순이 돼(예: 스타일 "dry intimate" vs 훅3 "widest stereo"). 스타일과 섹션이 충돌하면 스타일을 기준 톤으로 낮춰.
- 훅 리듬은 명세의 hookRhythm 역할대로 서로 다르게: 각 훅이 그 역할의 리듬 단어를 반드시 가져야 하고, 같은 드럼 조합 문구를 세 훅에 복붙하지 마.
- 같은 악기는 곡 전체에서 같은 역할을 유지해(예: 브라스는 계속 카운터 액센트). 섹션마다 바뀌는 건 볼륨·밀도·등장 여부뿐이고, 안 나오는 섹션에서 "silent/absent"라고 쓰면 스타일의 "항상 나온다"는 뜻과 모순되니 그냥 언급하지 마.
- 인트로의 진입 방식과 브릿지의 빌드업이 서로 모순되지 않게(인트로가 "no build-up"이면 브릿지 빌드업은 "이 곡에서 처음 나오는 빌드업"으로 표현).

[프로듀서 레퍼런스]
- 명세의 producerSound는 고른 프로듀서의 소리 특징이야. 이름은 쓰지 말고 이 키워드를 스타일(필요하면 훅)에 살려 써. 곡의 무드·에너지와 정반대(예: 미니멀 소리 vs 맥시멈 밀도)라면 억지로 섞지 말고 그 소리 특징을 리듬/베이스 한두 군데에만 짧게 반영해.

[brief · 이름 규칙]
- 명세에 brief가 있으면 사용자가 원하는 곡/느낌의 소리 특징이야. brief.styleTags는 스타일 프롬프트에 그대로(또는 거의 그대로) 넣고, brief.cues는 해당 섹션 문구에 녹여. 장르의 평균적인 관습과 brief가 다르면 brief 쪽을 따라.
- 실존 아티스트·프로듀서·곡 이름을 출력에 절대 쓰지 마(Suno 정책 — 명세의 producerReference·referenceSong도 소리 특징으로만 풀어 써). "OO-inspired" 같은 표현도 금지.

[Suno 사실]
- 스타일 박스는 1000자, 섹션(가사) 박스는 5000자 한도이고 넘으면 뒤가 잘림. 스타일 태그는 10개 안팎을 넘으면 뒤쪽이 무시됨(관련 요소는 " & "로 융합해서 태그 1개로).
- Suno는 문학적 비유가 아니라 실제로 들리는 소리(악기·이펙트·다이내믹·공간감·타이밍)를 콤마로 끊은 짧은 키워드 구로 지시할 때 가장 잘 반영함. 완결된 서술 문장은 금지.

[반드시 지킬 것 — 검사기가 확인함]
- 섹션 헤더 줄([Intro], [Instrumental Hook 1: …] 등)은 [명세]의 structure 순서·문구 그대로, 각 헤더 다음 줄에 본문 한 덩어리를 괄호 "( … )"로 씀. 마디 수가 있는 섹션은 "(8 Bars: "로 시작.
- 리드 악기는 인트로와 모든 훅에 이름으로 명시, 배경 악기는 훅에 최소 한 번, 고른 드럼은 전부 등장(메인 드럼은 모든 훅). 악기 이름·BPM·Key·보컬 유무 지시는 동의어로 바꾸지 마. 808 강도 라벨(예: Balanced 808)은 곡 전체에서 인트로 등 1~2곳에만 그대로 쓰고, 나머지 섹션에선 808의 질감·역할을 섹션마다 다른 단어로 묘사해 (라벨 복붙은 '설정값 나열'로 읽혀 감점).
- 무보컬이면 "no vocals", "ZERO vocal chops" 외에 보컬을 떠올리게 하는 단어(vocal/voice/sing/lyrics/choir)를 쓰지 마. 보컬이 있으면 모든 훅에 그 보컬을 명시.
- 스타일: fixedStyleTags를 그대로 포함, 총 950자 이하, 태그 13개 이하, 첫 태그들은 [Instrumental]/no vocals → 장르 순. 섹션 총합은 4900자 이하이고 각 섹션은 maxChars 안팎.
- [지시]에 적힌 것은 사용자·리뷰어가 확정한 요구사항이니 해당 섹션에 반드시 구체적인 소리 표현으로 반영해(스타일 지시는 스타일 프롬프트에).

[퀄리티 원칙]
- 같은 타입 섹션(훅끼리, 벌스끼리, 브릿지끼리)은 리듬·필터·공간·악기 역할에서 실제로 다른 단어를 써서 회차마다 무엇이 달라지는지 드러내. 문구를 복사하지 마.
- 에너지 곡선: 첫 훅은 강하되 여유를 남기고, "maximum/peak/every element maxed" 같은 절대 최대치는 마지막 훅에서만. 중간 훅은 단계적으로 밀도를 올려.
- 벌스는 무드에 맞게 에너지를 낮추거나 눌러 두고(공격적 무드면 억눌린 긴장), 브릿지·벌스 끝에는 고른 전환효과로 다음 드롭을 준비하는 2마디 빌드를 넣어. 브릿지가 없는 구조면 벌스 끝에서 빌드.
- 공간감(스테레오·리버브) 아크는 인트로→벌스→훅→클라이맥스→아웃트로로 이어지고 브릿지에도 공간 정보가 있어야 하며, 고른 텍스처(dry/reverb/wide/tape 등)와 모순되면 안 돼. 스타일 태그와 섹션 문구가 서로 충돌(예: dense 대 stripped, quantized 대 human-feel)하지 않게 정리해.
- 리드·배경 악기가 808과 중저역에서 겹치지 않게 분리(하이패스·사이드체인·필터) 지시를 훅에 넣어. 인간미(Anti-AI)는 범용어 대신 실제 악기·드럼의 구체적인 불완전함(타이밍 밀림, 벨로시티 불균일, 피치 흔들림)으로.
- **총량을 관리해**: 새로 쓸 때는 3000~3800자 안팎을 목표로, 고쳐쓸 때는 지시를 반영하면서 겹치거나 낡거나 서로 모순되는 문구를 삭제해서 이전 결과보다 길어지지 않게(±5%). 서술을 늘리지 말고 같은 뜻이면 더 짧은 구로. 한 섹션에 지시가 과밀하면(약 800자 초과) 덜 중요한 것부터 뺀다.
- 무드의 다이내믹(진입 방식, 훅 어택, 벌스 거동, 브릿지 긴장, 끝맺음)과 장르 특유의 기법은 이 곡의 의도에 맞을 때만 네 판단으로 살려. 의도와 어긋나는 장르 관습은 따르지 마.

[출력 형식 — 이 두 태그만, 설명 없이]
<section>
섹션 프롬프트 전체
</section>
<style>
스타일 프롬프트 한 줄
</style>`;
async function writeOnce({mode,spec,prev,errors,onPartial}){
  const key=getAnthropicKey();
  const directives=Object.entries(st.narrAI||{}).map(([k,v])=>`- ${k}: ${v}`).join('\n')||'(없음)';
  const dynamicText=`

[모드] ${mode==='edit'?`고쳐쓰기 — 아래 [이전 결과]를 바탕으로 [지시]를 반영해. **수정 가능한 섹션은 다음뿐이야: ${(spec.mutableHeaders||[]).join(' | ')||'(없음 — 섹션은 전부 그대로)'}**. 그 외 섹션은 [이전 결과]의 본문을 한 글자도 바꾸지 말고 그대로 복사해(바꾸면 검사에서 실패). 수정 가능한 섹션 안에서는 중복·모순을 정리하고 총량이 늘지 않게 써, 스타일 프롬프트는 확정 스타일 지시·삭제 확정 문구를 반영해 정리해도 돼`:'새로 쓰기 — [의도]와 [명세]에 맞게 처음부터 써'}

[명세]
${JSON.stringify(spec,null,1)}

[지시 — 섹션 키별, 스타일 지시는 아래 확정 태그]
${directives}
확정 스타일 지시: ${(st.extraTags||[]).join(' & ')||'(없음)'}
삭제 확정 문구(어떤 형태로도 다시 쓰지 말 것): ${(st.removedPhrases||[]).join(' | ')||'(없음)'}

[의도 — 사용자가 고르거나 곡 분석으로 정해진 것. 장르 기본값이 아니라 이 의도를 따라 써. "장르 기본 추천"으로 표시된 건 자동으로 채워진 참고값일 뿐이고, 그 외에 적힌 값(BPM·Key·보컬, 그리고 확정된 악기·드럼)은 사용자가 정한 것이니 그대로 지켜]
${aiSelectionCtx({soft:true})}
${spec.brief?`곡 분석에서 나온 소리 특징(반드시 반영): ${spec.brief.understood}\n섹션별 특징: ${JSON.stringify(spec.brief.cues)}`:''}
${mode==='edit'&&prev?`\n[이전 결과 — 섹션]\n${prev.section}\n\n[이전 결과 — 스타일]\n${prev.style}\n`:''}${errors&&errors.length?`\n[직전 시도가 검사에서 실패한 사유 — 반드시 고쳐서 다시 써]\n${errors.map(e=>'- '+e).join('\n')}\n`:''}`;
  // 숨은 추론을 끄면 작성이 61초→약 18초(4곡 모두 첫 시도에 검증 통과), 스트리밍으로 나오는 대로 화면에 보여줌
  const raw=await callAnthropic(key,{maxTokens:16000,staticText:WRITE_STATIC,dynamicText,think:false,onText:onPartial});
  const sec=raw.match(/<section>([\s\S]*?)<\/section>/i),sty=raw.match(/<style>([\s\S]*?)<\/style>/i);
  if(!sec||!sty)throw new Error('AI 응답에서 <section>/<style>을 찾지 못했습니다');
  return {section:sec[1].trim(),style:sty[1].trim().replace(/\s*\n\s*/g,' ')};
}
function renderWriteBadge(){
  const b=document.getElementById('hh-write-badge');
  if(!b)return;
  const map={
    off:['📝 규칙 초안',''],
    pending:['✍️ AI 작성 중…','작성이 끝나면 아래 텍스트가 교체돼요 (그 사이 복사하면 규칙 초안이 복사됨)'],
    ok:['✍️ AI 작성 · 검증 통과','헤더·마디 수·악기·보컬·길이 검사를 통과한 AI 작성본'],
    fallback:['📝 규칙 초안 (AI 작성 검증 실패)',_writeErr||''],
  };
  const [t,title]=map[_writeState]||map.off;
  b.textContent=t;b.title=title;
}
function updateWriteCounters(){
  const sect=document.getElementById('hh-sect-ta')?.value||'',style=document.getElementById('hh-style-ta')?.value||'';
  const a=document.getElementById('hh-sect-count'),b=document.getElementById('hh-style-count');
  if(a){a.textContent=`${sect.length}/5000자`;a.style.color=sect.length>5000?'var(--danger)':sect.length>4200?'#F59E0B':'var(--success)';}
  if(b){b.textContent=`${style.length}/1000자`;b.style.color=style.length>1000?'var(--danger)':style.length>800?'#F59E0B':'var(--success)';}
}
function updatePromptHistoryTexts(id,section,style){
  if(!id)return;
  const list=loadPromptHistory();const e=list.find(x=>x.id===id);
  if(!e)return;
  e.section=section;e.style=style;e.aiWritten=true;
  try{localStorage.setItem(PROMPT_HISTORY_KEY,JSON.stringify(list));}catch(_){}
  renderPromptHistory();
}
async function hhAiWrite(entryId){
  if(!aiWriteEnabled()||!_hhDraft)return;
  const token=++_writeToken;
  const draft=_hhDraft;
  _writeState='pending';_writeErr='';renderWriteBadge();
  const run=(async()=>{
    try{
      const mode=(_hhWritten&&_hhWritten.meta?.ok&&_hhWritten.fpBase===draft.fpBase)?'edit':'create';
      const spec=buildWriteSpec(draft.sect,draft.style,mode==='edit'?_hhWritten:null);
      let errors=null,result=null,lastErrors=null;
      for(let attempt=0;attempt<3;attempt++){   // 실패 사유를 붙여 최대 2번 재시도 — 폴백(규칙 초안)은 의도 반영이 약하니 마지막 수단
        const out=await writeOnce({mode,spec,prev:mode==='edit'?_hhWritten:null,errors,onPartial:txt=>{
          if(token!==_writeToken)return;
          const sm=txt.match(/<section>([\s\S]*?)(?:<\/section>|$)/i),tm=txt.match(/<style>([\s\S]*?)(?:<\/style>|$)/i);
          const ta=document.getElementById('hh-sect-ta'),sa=document.getElementById('hh-style-ta');
          if(sm&&ta)ta.value=sm[1].trim();
          if(tm&&sa)sa.value=tm[1].trim().replace(/\s*\n\s*/g,' ');
          updateWriteCounters();
        }});
        if(token!==_writeToken)return;
        const v=validateWritten(spec,out.section,out.style);
        if(v.ok){result=out;break;}
        errors=v.errors;lastErrors=v.errors;
      }
      if(token!==_writeToken)return;
      if(result){
        _hhWritten={fpFull:draft.fpFull,fpBase:draft.fpBase,section:result.section,style:result.style,meta:{ok:true,mode},dirSnap:{narrAI:{...(st.narrAI||{})},removedPhrases:[...(st.removedPhrases||[])]}};
        _writeState='ok';
        const ta=document.getElementById('hh-sect-ta'),sa=document.getElementById('hh-style-ta');
        if(ta)ta.value=result.section;
        if(sa)sa.value=result.style;
        updateWriteCounters();
        updatePromptHistoryTexts(entryId,result.section,result.style);
      }else{
        _hhWritten={fpFull:draft.fpFull,fpBase:draft.fpBase,section:draft.sect,style:draft.style,meta:{ok:false,errors:lastErrors}};
        _writeState='fallback';_writeErr=(lastErrors||[]).slice(0,3).join(' / ');
        restoreDraftText(draft);
      }
    }catch(e){
      if(token!==_writeToken)return;
      _hhWritten={fpFull:draft.fpFull,fpBase:draft.fpBase,section:draft.sect,style:draft.style,meta:{ok:false,errors:[e.message]}};
      _writeState='fallback';_writeErr=e.message;
      restoreDraftText(draft);
    }finally{
      if(token===_writeToken){renderWriteBadge();_writePromise=null;}
    }
  })();
  _writePromise=run;
  return run;
}
// 스트리밍 중 화면에 보이던 미완성 AI 텍스트를 규칙 초안으로 되돌림
function restoreDraftText(draft){
  const ta=document.getElementById('hh-sect-ta'),sa=document.getElementById('hh-style-ta');
  if(ta)ta.value=draft.sect;
  if(sa&&draft.style)sa.value=draft.style;
  updateWriteCounters();
}
// 같은 설정으로 강제 재작성 ("✍️ 다시 쓰기")
function hhAiRewrite(){
  _hhWritten=null;
  hhGenerate();
}

// ============================================================
// BRIEF — 곡명 또는 "이런 느낌의 곡" 한 줄을 선택 항목으로 번역 (장르·음악을 잘 몰라도 시작할 수 있게)
// ============================================================
let _briefProposal=null;
// 무보컬을 골랐는데 브리프 문구에 보컬 묘사("whispered vocals")가 있으면 Suno가 보컬을 넣을 수 있어서 그런 문구는 뺌
function effectiveBrief(){
  const b=st.brief;
  if(!b||(st.vocal&&st.vocal!=='No Vocal'))return b;
  const bad=/\b(vocals?|voices?|sing(?:ing|er)?|lyrics?|choir|whisper\w*|ad-?libs?|chant\w*|rap\w*|hushed|breathy)\b/i;
  return {...b,styleTags:(b.styleTags||[]).filter(t=>!bad.test(t)),cues:Object.fromEntries(Object.entries(b.cues||{}).filter(([,c])=>!bad.test(c)))};
}
function briefCtxLine(){return st.brief?`원하는 곡의 느낌: "${st.brief.text}" — ${st.brief.understood} / 소리 특징: ${(st.brief.styleTags||[]).join(' & ')}`:null;}
const BRIEF_STATIC=`너는 음악을 잘 모르는 사람의 말도 알아듣는 프로듀서야. 사용자는 Suno AI로 곡을 만들려고 하고, (a) 참고할 곡명("아티스트 - 제목") 또는 (b) 만들고 싶은 느낌·상황("신나고 춤추고 싶어지는 곡")을 한 줄로 적었어. 이걸 프롬프트 빌더의 선택 항목으로 번역해줘.

규칙:
- 곡명이면 kind="song": 그 곡의 실제 사운드(템포, 드럼, 베이스, 신스/악기, 보컬 처리, 믹스 공간감, 에너지 흐름)를 아는 대로 반영해. 잘 모르는 곡이면 kind="vibe"로 두고 understood에 "이 곡은 잘 몰라서 이름만으로는 판단하지 않았다"고 적은 뒤, 입력의 다른 단서로만 골라.
- 느낌 설명이면 kind="vibe": 무드·에너지·상황(춤, 드라이브, 공부, 이별 등)에서 어울리는 장르·BPM·악기를 골라.
- genre/mood/drums/bass808/melodyLead/melodyBackground/texture/density/vocal/vocalStyle/key는 아래 [선택지]에서 글자 그대로 골라 (장르는 en 이름). 이 프로그램은 힙합 계열 장르만 있으니 팝·EDM 곡이면 소리가 가장 가까운 장르를 고르고, 안 맞는 부분은 styleTags·cues로 보완해.
- styleTags(1~2개)와 cues는 영어 소리 묘사 키워드 구야. 콤마 없이 4~9단어 구 하나씩. 실존 아티스트·프로듀서·곡·앨범 이름은 절대 쓰지 마 (Suno 정책). [선택지]에 없는 악기를 새로 주장하지 마.
- cues: intro/hook/verse/bridge/outro 각각 그 곡(느낌)의 그 부분 특징을 서로 다른 단어로 (예: "sparse verse with a low pulsing sub and close dry vocals"). 같은 단어를 여러 섹션에 반복하지 마.
- producer: [선택지]의 프로듀서 레퍼런스 중 이 곡/느낌의 소리에 실제로 어울리는 1명 — 어울리는 사람이 없으면(예: 팝·클럽 곡) 억지로 고르지 말고 null. 이 필드만 목록의 이름을 그대로 쓰고, cues·styleTags에는 이름 금지.
- vocalChar: 보컬 녹음 질감 목록 중 하나(속삭임·친밀한 곡은 드라이/클로즈 계열).
- vocal: 보컬이 거의 없으면 "No Vocal", 있으면 목록 중 가장 가까운 것. vocalStyle은 목록 중 하나 또는 null.
- bpm·key: 곡명(kind="song")일 때만 그 곡의 실제 BPM과 Key를 써 (정확히 모르면 bpm은 0, key는 빈 문자열). 느낌 설명(kind="vibe")이면 bpm은 0, key는 빈 문자열 — 사용자가 직접 정해.
- 응답은 설명 없이 '{'로 시작하는 JSON 하나만.
{"kind":"song|vibe","understood":"한국어 1~2문장: 어떤 곡/느낌으로 이해했는지","genre":"","mood":"","bpm":0,"key":"","drums":["",""],"bass808":"","melodyLead":"","melodyBackground":"","texture":["",""],"density":"","vocal":"","vocalStyle":null,"vocalChar":"","producer":null,"styleTags":[""],"cues":{"intro":"","hook":"","verse":"","bridge":"","outro":""},"reason":"한국어 한 문장"}`;
// 분석 프롬프트에 붙는 선택지 목록 (AI 분석·Gemini 요청문 공용)
function briefOptionsText(){
  return `[선택지]
장르(en — 느낌):
${GENRES.map((g,i)=>`- ${g.en} — ${GENRE_FEEL[i]||g.sound}`).join('\n')}
무드: ${HH_MOODS.map(m=>m.kr).join(' | ')}
드럼: ${HH_DRUMS.join(' | ')}
808: ${HH_808.join(' | ')}
멜로디 악기: ${HH_MELODY.join(' | ')}
텍스처: ${HH_TEXTURE.join(' | ')}
밀도: ${HH_DENSITY.join(' | ')}
보컬: ${HH_VOCAL.join(' | ')}
보컬 스타일: ${HH_VOCAL_STYLE.join(' | ')}
보컬 질감(vocalChar): ${HH_VOCAL_CHAR.join(' | ')}
프로듀서 레퍼런스(producer): ${HH_REF.map(r=>`${r.kr} (${r.vibes})`).join(' | ')}
Key: ${KEYS.join(' | ')}`;
}
async function aiAnalyzeBrief(){
  const key=getAnthropicKey();
  const text=(document.getElementById('hh-brief')?.value||'').trim();
  const btn=document.getElementById('hh-brief-btn');
  const statusEl=document.getElementById('hh-brief-status');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 Anthropic API Key를 먼저 저장하세요');return;}
  if(!text){fail('곡명이나 만들고 싶은 느낌을 한 줄 적어주세요');return;}
  btn.disabled=true;btn.textContent='🤖 분석 중...';
  if(statusEl)statusEl.hidden=true;
  try{
    const dynamicText=`

[사용자 입력]
${text}

${briefOptionsText()}`;

    const raw=await callAnthropic(key,{maxTokens:3000,staticText:BRIEF_STATIC,dynamicText,think:false});
    const p=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    _briefProposal=buildBriefProposal(text,p);
    renderBriefResult();
  }catch(e){
    fail(e.message);
  }finally{
    btn.disabled=false;btn.textContent='🤖 AI로 분석·추천';
  }
}
// AI 응답을 메뉴 값으로 검증 — 목록에 없는 값은 버리고, 이름이 섞인 소리 키워드는 걸러냄
function buildBriefProposal(text,p){
  const names=HH_REF.map(r=>r.kr.toLowerCase());
  const clean=(s,max)=>{const t=String(s||'').replace(/[,\n]+/g,' ').replace(/\s+/g,' ').trim().slice(0,max);return t&&!names.some(n=>t.toLowerCase().includes(n))?t:'';};
  const v={};
  v.genre=GENRES.findIndex(g=>g.en===p.genre||g.tag===p.genre);
  v.mood=HH_MOODS.find(m=>m.kr===p.mood)?.kr||null;
  v.bpm=Math.min(220,Math.max(60,Math.round(Number(p.bpm)||0)))||null;
  v.key=KEYS.indexOf(p.key);
  v.drums=(p.drums||[]).filter(d=>HH_DRUMS.includes(d)).slice(0,3);
  v.bass808=HH_808.includes(p.bass808)?p.bass808:null;
  v.lead=HH_MELODY.includes(p.melodyLead)?p.melodyLead:null;
  v.bg=HH_MELODY.includes(p.melodyBackground)&&p.melodyBackground!==v.lead?p.melodyBackground:null;
  v.texture=pickCompatibleTextures((p.texture||[]).filter(t=>HH_TEXTURE.includes(t)));
  v.density=HH_DENSITY.includes(p.density)?p.density:null;
  v.vocal=HH_VOCAL.includes(p.vocal)?p.vocal:null;
  v.vocalStyle=HH_VOCAL_STYLE.includes(p.vocalStyle)?p.vocalStyle:null;
  v.vocalChar=HH_VOCAL_CHAR.includes(p.vocalChar)?p.vocalChar:null;
  v.producer=HH_REF.find(r=>r.kr===p.producer)?.kr||null;
  const styleTags=(Array.isArray(p.styleTags)?p.styleTags:[]).map(t=>clean(t,70)).filter(Boolean).slice(0,2);
  const cues={};
  ['intro','hook','verse','bridge','outro'].forEach(k=>{const c=clean(p.cues?.[k],110);if(c)cues[k]=c;});
  const items=[];
  const add=(id,label,val,show)=>{if(val)items.push({id,label,text:show,on:true});};
  add('mood','무드',v.mood,v.mood);
  add('genre','장르',v.genre>=0,v.genre>=0?`${GENRES[v.genre].kr} — ${GENRE_FEEL[v.genre]||''}`:'');
  // BPM·Key는 곡명(song)일 때만 그 곡의 실제 값으로 제안 — 느낌 설명(vibe)이면 사용자가 직접 정함
  if(p.kind==='song'){
    add('bpm','BPM (곡에서)',v.bpm,`${v.bpm} BPM — 곡의 실제 값과 다르면 체크를 빼고 직접 입력하세요`);
    add('key','Key (곡에서)',v.key>=0,v.key>=0?`${KEYS[v.key]} — 곡의 실제 값과 다르면 체크를 빼고 직접 고르세요`:'');
  }
  add('drums','드럼',v.drums.length,v.drums.join(', '));
  add('808','808',v.bass808,v.bass808);
  add('melody','멜로디',v.lead,[v.lead,v.bg].filter(Boolean).join(' + '));
  add('texture','믹스 텍스처',v.texture.length,v.texture.join(', '));
  add('density','밀도',v.density,v.density);
  add('vocal','보컬',v.vocal,[v.vocal,v.vocalStyle,v.vocalChar].filter(Boolean).join(' · '));
  if('producer' in p)add('producer','프로듀서',true,v.producer||'없음 — 어울리는 프로듀서가 없어 소리 특징 키워드로 대신해요');
  add('sound','소리 특징',styleTags.length||Object.keys(cues).length,[...styleTags,...Object.values(cues)].join(' / '));
  if(!items.length)throw new Error('AI가 목록에 있는 값을 반환하지 못했습니다');
  return {text,kind:p.kind==='song'?'song':'vibe',understood:String(p.understood||'').slice(0,300),reason:String(p.reason||'').slice(0,200),v,styleTags,cues,items};
}
function renderBriefResult(){
  const box=document.getElementById('hh-brief-result');
  const P=_briefProposal;
  if(!box)return;
  if(!P){box.hidden=true;return;}
  box.hidden=false;
  const rows=P.items.map((it,i)=>`<label style="display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer"><input type="checkbox" ${it.on?'checked':''} onchange="toggleBriefItem(${i},this.checked)" style="margin-top:2px"><span style="width:84px;color:var(--text-3);flex-shrink:0">${it.label}</span><span style="color:var(--text-1)">${escHtml(it.text)}</span></label>`).join('');
  box.innerHTML=`<div style="font-size:12px;color:var(--text-1);margin-bottom:8px">🧠 ${escHtml(P.understood)}${P.reason?` <span style="color:var(--text-3)">· ${escHtml(P.reason)}</span>`:''}</div>${rows}<div style="display:flex;justify-content:flex-end;margin-top:10px"><button id="hh-brief-apply" onclick="applyBrief()" style="padding:7px 16px;border-radius:20px;border:1px solid var(--accent);background:var(--accent);color:#fff;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;cursor:pointer"></button></div>`;
  updateBriefApplyBtn();
}
function toggleBriefItem(i,on){if(_briefProposal?.items[i])_briefProposal.items[i].on=!!on;updateBriefApplyBtn();}
function updateBriefApplyBtn(){
  const b=document.getElementById('hh-brief-apply');
  if(b&&_briefProposal){const n=_briefProposal.items.filter(i=>i.on).length;b.textContent=`✅ 선택 적용 (${n})`;b.disabled=!n;b.style.opacity=n?'1':'.5';}
}
// 적용 순서: 무드 → 장르(selectGenre가 808·드럼·멜로디를 장르 기본값으로 자동 추천하므로 먼저) → 곡에서 뽑은 값으로 덮어쓰기
function applyBrief(){
  const P=_briefProposal;
  if(!P)return;
  const on=id=>P.items.some(i=>i.id===id&&i.on);
  const v=P.v;
  _aiSuggestions=null;
  if(on('mood')){st.mood=v.mood;moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',onMoodChange);}
  if(on('genre')&&st.genre!==v.genre)selectGenre(v.genre);
  else if(on('mood'))onMoodChange();
  if(on('bpm')){st.bpm=v.bpm;st.bpmSet=true;document.getElementById('hh-bpm').value=v.bpm;}
  if(on('key')){st.key=v.key;st.keySet=true;document.getElementById('hh-key').value=v.key;}
  if(on('drums')){st.drums=[...v.drums];chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,onDrumsManualChange);clearAutoHint('hh-drums-hint');}
  if(on('808')){st._808=v.bass808;chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,onRhythmManualChange);clearAutoHint('hh-808-hint');}
  if(on('melody')){
    let bg=v.bg;
    if(bg&&v.lead!==bg)bg=complementBg(v.lead,bg,scorePick(HH_MELODY,GENRE_MELODY_TIPS,MOOD_MELODY_FIT,st.genre,st.mood,null));
    st.melody=bg?[v.lead,bg]:[v.lead];
    st.melodyLeadIdx=(bg&&MELODY_ROLE[v.lead]!=='lead'&&MELODY_ROLE[bg]==='lead')?1:0;
    st._mtAutoManaged=false;
    chipGrid(document.getElementById('hh-melody'),HH_MELODY,st,'melody',2,onMelodyManualChange);
    renderMelodyRoleUI();
    clearAutoHint('hh-melody-hint');
  }
  if(on('texture')){
    st.texture=[...v.texture];st._mtAutoManaged=false;
    chipGrid(document.getElementById('hh-texture'),HH_TEXTURE,st,'texture',2,onTextureManualChange);
    clearAutoHint('hh-texture-hint');
  }
  if(on('density')){st.density=v.density;chipGrid(document.getElementById('hh-density'),HH_DENSITY,st,'density',1,null);}
  if(on('vocal')){
    st.vocal=v.vocal;
    chipGrid(document.getElementById('hh-vocal'),HH_VOCAL,st,'vocal',1,()=>{recommendVocalChar();onStructSignalChange();});
    recommendVocalChar();
    if(v.vocalChar&&st.vocal!=='No Vocal'){st.vocalChar=v.vocalChar;chipGrid(document.getElementById('hh-vocal-char'),HH_VOCAL_CHAR,st,'vocalChar',1,null);}
    if(v.vocalStyle&&st.vocal!=='No Vocal'){st.vocalStyle=v.vocalStyle;chipGrid(document.getElementById('hh-vocal-style'),HH_VOCAL_STYLE,st,'vocalStyle',1,null);}
    onStructSignalChange();
  }
  if(on('producer')){st.refs=v.producer?[v.producer]:[];renderProducerRef();clearAutoHint('hh-ref-hint');}
  st.brief=on('sound')?{text:P.text,kind:P.kind,understood:P.understood,styleTags:P.styleTags,cues:P.cues,source:P.source||'ai'}:null;
  if(P.kind==='song'){const r=document.getElementById('hh-ref-song');if(r)r.value=P.text;}
  _briefProposal=null;
  const box=document.getElementById('hh-brief-result');if(box)box.hidden=true;
  renderHhGenres();
  renderBriefActive();
  const statusEl=document.getElementById('hh-brief-status');
  if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--success)';statusEl.textContent='✅ 적용했어요 — 아래 항목에서 바꾸고 싶은 것만 고친 뒤 Generate를 눌러 프롬프트를 만드세요';}
  markPending('곡/느낌 분석 적용');
}
// 반영 중인 소리 특징 표시 + 해제
function renderBriefActive(){
  const el=document.getElementById('hh-brief-active');
  if(!el)return;
  if(!st.brief){el.hidden=true;return;}
  el.hidden=false;
  el.innerHTML=`🧬 <b>반영 중인 소리 특징</b> — ${escHtml([...(st.brief.styleTags||[]),...Object.values(st.brief.cues||{})].join(' / '))} <button onclick="clearBrief()" style="margin-left:8px;padding:2px 10px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2);color:var(--text-2);font-size:10px;cursor:pointer">해제</button>`;
}
function clearBrief(){
  st.brief=null;
  renderBriefActive();
  markPending('소리 특징 해제');
}

// ============================================================
// 곡을 실제로 듣는 AI(예: Gemini)에게 분석시키기 — AI가 곡을 기억으로 분석하면 매번 결과가 달라서(같은 곡이 하이퍼팝 / 저지클럽으로 갈림), 오디오를 듣는 쪽에 맡기고 결과 JSON만 받는다
// ============================================================
function geminiBriefRequestText(){
  const title=(document.getElementById('hh-ref-song')?.value||document.getElementById('hh-brief')?.value||'').trim();
  return `내가 Suno AI로 비슷한 느낌의 곡을 만들고 싶어서 고른 참고 곡을 분석해줘.${title?`\n참고 곡: ${title}`:''}
- 오디오 파일이나 유튜브 링크가 함께 있으면 그걸 직접 듣고 실제로 들리는 소리만 근거로 분석해줘.
- 없으면 곡 제목으로 웹 검색(BPM·키 정보 사이트, 리뷰, 프로덕션 설명)과 네가 아는 정보를 활용해서 분석해줘. 정확히 모르는 값은 지어내지 말고 가장 가까운 선택지를 고르되 understood에 "확실하지 않음"이라고 적어.
kind는 항상 "song"으로 써.

${BRIEF_STATIC}

${briefOptionsText()}`;
}
function copyGeminiBriefRequest(btn){
  navigator.clipboard.writeText(geminiBriefRequestText()).then(()=>{const o=btn.textContent;btn.textContent='복사됨!';setTimeout(()=>{btn.textContent=o;},1800);});
}
// Gemini가 돌려준 JSON을 붙여넣으면 AI 분석과 같은 추천 카드로
function applyBriefJson(){
  const statusEl=document.getElementById('hh-brief-status');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  const raw=(document.getElementById('hh-brief-json')?.value||'').trim();
  if(!raw){fail('Gemini가 준 JSON을 붙여넣어 주세요');return;}
  try{
    const p=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const label=(document.getElementById('hh-ref-song')?.value||document.getElementById('hh-brief')?.value||'').trim()||'(오디오 분석)';
    _briefProposal=buildBriefProposal(label,{...p,kind:'song'});_briefProposal.source='audio';
    if(statusEl)statusEl.hidden=true;
    renderBriefResult();
  }catch(e){fail('JSON을 읽지 못했어요 — Gemini 답변에서 { 로 시작해서 } 로 끝나는 부분을 통째로 붙여넣어 주세요');}
}
// 레퍼런스 곡 칸에 곡명만 있고 분석이 안 된 상태를 알려줌 (곡이 프롬프트에 전혀 반영되지 않기 때문)
function refSongNeedsDna(){
  const s=(document.getElementById('hh-ref-song')?.value||'').trim();
  return !!s&&!(st.brief&&st.brief.kind==='song'&&(st.brief.text===s||st.brief.source==='audio'));
}
function analyzeRefSongFromBanner(){
  const s=(document.getElementById('hh-ref-song')?.value||'').trim();
  const b=document.getElementById('hh-brief');if(b)b.value=s;
  document.getElementById('hh-brief-section')?.scrollIntoView({behavior:'smooth',block:'start'});
  if(getAnthropicKey())aiAnalyzeBrief();
}
function openGeminiBrief(){
  const d=document.getElementById('hh-brief-gemini');if(d)d.open=true;
  document.getElementById('hh-brief-section')?.scrollIntoView({behavior:'smooth',block:'start'});
}

// ============================================================
// 아티스트·핫한 곡 선택기 → 입력칸 (예전 "아티스트 타입비트" 탭을 ✨ 박스 안으로 합침)
// ============================================================
let _refCandidate=null;
function setRefSongFromPicker(label,cand){
  if(!label)return;
  const r=document.getElementById('hh-ref-song');if(r)r.value=label;
  const b=document.getElementById('hh-brief');if(b)b.value=label;
  if(cand&&cand.genre!==undefined&&cand.genre!==null&&st.genre!==cand.genre)selectGenre(cand.genre);   // 곡 데이터에 달린 장르 태그만 반영
  _refCandidate=(cand&&(cand.bpm||cand.key!==undefined&&cand.key!==null))?{bpm:cand.bpm||null,key:(cand.key!==undefined&&cand.key!==null)?cand.key:null}:null;
  const s=document.getElementById('hh-brief-status');
  if(s){
    s.hidden=false;s.style.color='var(--text-1)';
    s.innerHTML=`🎵 <b>${escHtml(label)}</b>을(를) 넣었어요. 이제 <b>AI로 분석·추천</b>이나 <b>Gemini로 정확하게 분석</b>을 눌러 이 곡의 소리를 가져오세요.${_refCandidate?`<div style="margin-top:6px;color:var(--text-2)">곡 데이터의 BPM·Key 참고값: ${[_refCandidate.bpm?_refCandidate.bpm+' BPM':'',_refCandidate.key!==null?KEYS[_refCandidate.key]:''].filter(Boolean).join(' · ')} (정확하지 않을 수 있어요) <button onclick="applyRefCandidate()" style="margin-left:6px;padding:2px 10px;border-radius:12px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:11px;cursor:pointer">참고값 적용</button></div>`:''}`;
  }
  document.getElementById('hh-brief-section')?.scrollIntoView({behavior:'smooth',block:'start'});
  markPending('참고 곡 선택');
}
function applyRefCandidate(){
  const c=_refCandidate;if(!c)return;
  if(c.bpm){st.bpm=c.bpm;st.bpmSet=true;document.getElementById('hh-bpm').value=c.bpm;}
  if(c.key!==null){st.key=c.key;st.keySet=true;document.getElementById('hh-key').value=c.key;}
  const s=document.getElementById('hh-brief-status');if(s){s.hidden=false;s.textContent='✅ 참고값을 BPM·Key에 넣었어요 — 곡과 다르면 02 KEY & BPM에서 고치세요';s.style.color='var(--success)';}
  markPending('참고 곡 BPM·Key');
}
