// ============================================================
// AI PRODUCER REVIEW (OpenAI API)
// ============================================================
// API Key 없으면 눌러도 "Key부터 넣으세요" 안내만 뜨는 AI 버튼들을 아예 숨김 — Key 저장 성공 시 다시 호출해서 드러남
function updateAiButtonVisibility(){
  const hasKey=!!getOpenAIKey();
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


// ---- AI 추천 (GPT — 고른 요소를 보고 멜로디·믹스 텍스처 추천) ----
const OPENAI_TEXT_MODEL='gpt-5.1';
function getOpenAIKey(){
  try{return localStorage.getItem('openai_api_key')||'';}catch(_){return'';}
}
// onText를 주면 스트리밍(SSE)으로 받아서 글자가 나오는 대로 콜백(누적 텍스트) — 채팅처럼 바로 보이게. 끝나면 전체 텍스트 반환
async function callOpenAI(key,{maxTokens,staticText,dynamicText,onText}){
  const res=await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'content-type':'application/json','authorization':`Bearer ${key}`},
    body:JSON.stringify({
      model:OPENAI_TEXT_MODEL,
      max_completion_tokens:maxTokens,
      stream:!!onText,
      messages:[{role:'developer',content:staticText},{role:'user',content:dynamicText}],
    }),
  });
  if(!res.ok){
    const errText=await res.text().catch(()=>'');
    throw new Error(`API 오류 (${res.status}) ${errText.slice(0,150)}`);
  }
  if(onText){
    const reader=res.body.getReader(),dec=new TextDecoder();
    let buf='',acc='',finish='';
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
        const ch=j.choices?.[0];
        if(ch?.delta?.content){acc+=ch.delta.content;onText(acc);}
        if(ch?.finish_reason)finish=ch.finish_reason;
      }
    }
    if(finish==='length')throw new Error('응답이 너무 길어서 잘렸어요 — 다시 시도해주세요');
    if(!acc.trim())throw new Error('AI가 빈 응답을 반환했습니다 — 다시 시도해주세요');
    return acc;
  }
  const data=await res.json();
  if(data.choices?.[0]?.finish_reason==='length')throw new Error('응답이 너무 길어서 잘렸어요 — 다시 시도해주세요');
  const text=data.choices?.[0]?.message?.content||'';
  if(!text.trim())throw new Error('AI가 빈 응답을 반환했습니다 — 다시 시도해주세요');
  return text;
}
function saveOpenAIKey(){
  const el=document.getElementById('openai-key');
  const val=el?.value.trim()||'';
  const msgEl=document.getElementById('openai-key-status');
  if(val==='••••••••••••••••'){ // 패널 열 때 채워둔 마스킹 표시일 뿐, 안 건드렸으면 그대로 둠
    if(msgEl){msgEl.textContent='✅ 이미 저장된 Key 그대로 유지됨';msgEl.hidden=false;msgEl.style.color='var(--success)';}
    return;
  }
  if(!val){
    if(msgEl){msgEl.textContent='❌ Key를 입력하세요';msgEl.hidden=false;msgEl.style.color='var(--danger)';}
    return;
  }
  try{localStorage.setItem('openai_api_key',val);}catch(_){}
  if(msgEl){msgEl.textContent='✅ 저장됨 — MELODY 섹션의 🤖 AI 추천받기 버튼을 눌러보세요';msgEl.hidden=false;msgEl.style.color='var(--success)';}
  updateAiButtonVisibility();
  if(typeof refreshOpenAiAudioUi==='function')refreshOpenAiAudioUi();
}
// 룰 테이블은 정해진 옵션 중 최선을 고를 뿐, "이 조합에 뭘 더하면 좋을지"·"전체적으로 뭐가 아쉬운지" 같은
// 열린 판단은 못 함 — 그 갭을 메우기 위해 여러 관점(악기/편곡/구조/믹스/보컬/무드)에서 자유 형식 조언을 받고,
// 그중 기존 컨트롤(스타일 태그·섹션 강화)로 바로 적용 가능한 것만 원클릭 적용 버튼을 붙임
let _aiSuggestions=null;
// AI 프로듀서의 전문 분야 — "힙합 프로듀서" 고정이면 팝·일렉 곡도 힙합 관점으로 평가함. 곡의 장르 계열에 맞춤
function producerRole(){
  const g=st.genre===null?null:GENRES[st.genre];
  const field={hiphop:'힙합·트랩',pop:'팝·R&B(송라이팅·프로덕션)',elec:'일렉트로닉·클럽'}[g?.family]||'힙합·클럽 음악';
  return `경험 많은 ${field} 전문 프로듀서${g?`(지금 곡의 장르는 ${g.kr} — 그 장르의 전문가 관점으로 판단)`:''}`;
}
const AI_CATEGORY_EMOJI={'총평':'🧑‍🎤','레퍼런스 부합도':'🎯','악기':'🎹','편곡':'🎼','구조':'🏗','믹스':'🎚','보컬':'🎤','무드':'😶','전개':'🎬'};
// aiProducerReview와 aiParseExternalFeedback(외부 피드백 파싱) 둘 다 "조언 → 실제 프롬프트에 적용 가능한 필드"로
// 변환해야 해서, 그 필드 설명과 JSON 스키마를 공유 — 같은 스키마로 나와야 applyAiSuggestionCore가 출처 구분 없이 그대로 먹음
const AI_SUGGESTION_ACTION_SPEC=`중요: 조언은 참고용으로 끝나면 안 되고 실제 프롬프트에 바로 반영할 수 있어야 해. 그래서 각 조언마다 아래 필드 중 맞는 걸 정확히 하나 채워서 버튼 한 번으로 적용되게 해줘 (총평·레퍼런스 부합도처럼 평가 자체가 목적인 항목은 액션이 없어도 되고, 그 안에서도 구체적으로 적용 가능한 게 있으면 채워도 됨):
- melodyLead: 멜로디 악기가 정확히 2개 선택돼 있고, 조언이 "둘 중 어느 게 리드를 맡아야 하는지"(예: 주파수 대역이 겹쳐서 하나를 백킹으로 물려야 함)에 관한 거면 → 리드를 맡아야 할 악기 이름을 [현재 설정]의 멜로디 악기 목록에 있는 문자열 그대로 정확히 넣어. 중요: 아래 [현재 생성된 섹션 프롬프트]를 먼저 확인해서 이미 그 악기가 "lead melody"로, 다른 하나가 "layered softly beneath/background layer"로 명시돼 있으면(원하는 역할 배치가 이미 되어 있으면) 이 조언 자체를 만들지 마 — 이미 된 걸 tag로 또 추가하면 같은 얘기가 두 군데서 중복되고 뭉개짐. 역할을 바꿔야 할 때만 melodyLead를 채워.
- 먼저 판단: 스타일은 곡의 정체성·핵심 패턴·전체 전개를 요약하고, 섹션은 정확한 구간의 연주를 설명해. 한 구간에만 해당하는 변경은 boostText 또는 narrDir로 보내. 스타일의 개요와 상세 섹션이 같은 변화를 설명하는 것은 모순이 아니야.
- tag: 곡 전체 정체성·악기 팔레트·그루브에 관한 영어 지시 배열. 간결한 자연어 문장도 허용해. 쉼표 개수를 줄이려고 &로 억지로 합치지 마.
- boostSection: 특정 구간의 편곡 변경이면 적용 가능한 섹션 이름을 써. boostOccurrence는 first 또는 last. boostText에는 어떤 악기가 언제 어떻게 연주하고 무엇을 유지할지 영어로 써. 자연어 문장과 명령형 모두 가능해. 무보컬 선택이면 보컬 요소는 넣지 마.
- addSection: 구조가 단조롭다/섹션을 추가하자는 조언일 때 → 추가할 섹션 타입(hook|verse|bridge)과, 그걸 어디 넣을지 addSectionPosition도 같이 정해줘: beforeFirstHook(첫 훅 앞) | afterIntro(인트로 바로 뒤) | beforeLastHook(마지막 훅 직전 — 클라이맥스 텐션 빌드용) | end(아웃트로 직전) 중 조언 내용이랑 실제로 일치하는 위치 하나
- mood: 지금 고른 무드보다 다른 무드가 더 어울린다는 조언일 때 → 정확한 무드 이름 하나
- narrDir: 구간별 지시는 제공된 키만 사용한 {"hook1":"...","verse1":"..."} 객체로 써. 각각 간결한 영어 자연어 디렉팅으로 대상·행동·시점·유지 조건을 전달해. 같은 모티프를 계속 유지해도 되고, 모든 훅의 리듬을 바꿀 필요는 없어. 무보컬이면 악기로만 설계해.
- removeRef: tag를 추가할 때마다 아래 [프로듀서 레퍼런스]에 있는 설명을 한 번씩 대조해봐 — 장르/서브장르 자체가 달라지는 수준으로 상반되면(예: tag는 "log drum bassline"인데 레퍼런스 설명엔 "chiptune-esque synth leads"나 "disco samples, house-inflected bounce"처럼 완전히 다른 서브장르 색채가 이미 박혀있으면) 반드시 그 프로듀서의 정확한 이름을 넣어. 특히 "레퍼런스 부합도" 카테고리는 지금 레퍼런스가 타겟 곡이랑 안 맞는다는 게 핵심 지적이니, 그 안 맞는 레퍼런스를 tag만 추가하고 그대로 두면 안 돼 — 반드시 확인해서 빼
- removePhrase: [현재 생성된 섹션/스타일 프롬프트]에 **실제로 있는 구를 글자 그대로** 인용한 배열(최대 3개, 각 60자 이하). tag/narrDir/boostText를 추가하면서 그것과 모순되거나 같은 말을 되풀이하는 기존 문구(예: 새로 "restrained until bar 5"를 넣는데 기존에 "full energy"가 있음, 새 "human micro-timing"과 기존 "tight quantized grid")가 있으면 반드시 같이 지정해 삭제해 — 추가만 하고 모순을 남기면 프롬프트 일관성이 떨어지고 길이만 늘어. 2라운드부터는 새 요소를 넣기 전에 겹치는 기존 문구를 빼는 게 우선이야
- removeTag: 조언이 "지금 있는 X를 줄이자/빼자"는 뜻도 담고 있으면(예: "sidechain pump가 강하면 무드가 죽으니 줄이자") X를 가리키는 핵심 단어(예: "sidechain")를 넣어 — 그 단어를 포함하는 기존 텍스처/스타일 태그를 전부 제거해. tag(추가)랑 같이 써도 됨 — "줄이고 대신 이걸 넣자"는 조언이면 둘 다 채워
- BPM은 사용자가 직접 설정한 값이니 바꾸자는 조언이어도 액션으로 만들지 마 — 총평/레퍼런스 부합도 텍스트에 언급만 하고 그대로 둬

구체적인 디렉팅: Add an octave double in the final hook while preserving the motif's rhythm처럼 동사와 시점·유지 조건을 명확히 써. warm/wide/punchy 같은 형용사는 선택사항이고 주법·처리·편성으로 뒷받침해. 무드의 대비는 모순이 아니야: 반주는 밝게, 멜로디는 그리움을 담게 할 수 있어. 의도적인 반복과 침묵을 결함으로 보지 마.
관점: 이 곡의 장르([현재 설정]의 장르) 전문가로서 그 장르 청자가 기대하는 소리 기준으로 판단해 — 다른 장르의 관습(예: 팝 곡에 트랩 하이햇 롤, 클럽 곡에 붐뱁 샘플)을 요구하지 마.

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해:
{"suggestions":[{"category":"총평|레퍼런스 부합도|악기|편곡|구조|믹스|보컬|무드|전개","text":"한국어 조언 (총평·레퍼런스 부합도는 2~3문장 가능)","score":"(외부 피드백 총평일 때만, 1~100 정수)","criteria":"(프로듀서 리뷰 총평일 때만, {arc,variety,genre,coherence,roles,human,reference,parse} 각 0~10 정수)","melodyLead":"(멜로디 리드/백킹 역할을 바꿔야 할 때만, 리드를 맡을 악기 이름)","tag":"(해당시, [\\"...\\",\\"...\\"] 배열)","boostSection":"(해당시)","boostOccurrence":"(boostSection일 때 필수, first|last)","boostText":"(boostSection이고 구체적 아이디어 있을 때만, 간결한 영어 연주 지시)","addSection":"(해당시)","addSectionPosition":"(addSection일 때만, beforeFirstHook|afterIntro|beforeLastHook|end 중 하나)","mood":"(해당시)","narrDir":"(특정 섹션 한정 조언일 때, 위 형식 객체, 값은 간결한 영어 연주 지시)","removeRef":"(tag가 기존 프로듀서 레퍼런스와 모순될 때만, 그 프로듀서 이름)","removeTag":"(기존 걸 줄이자/빼자는 조언일 때만, 그 핵심 단어)","removePhrase":"(추가하는 지시와 모순·중복되는 기존 문구를 글자 그대로 인용한 배열, 최대 3개)"}]}`;
// aiProducerReview·aiParseExternalFeedback 둘 다 이 형태로 모델 응답을 정리 — 출처가 달라도 applyAiSuggestionCore 입장에선 동일한 객체
function normalizeAiSuggestion(s,uniqueSegs,occKeys){
  // 인스트루멘탈인데 "vocal chop" 같은 보컬 요소가 tag로 들어오면 섹션마다 박힌 "ZERO vocal chops"와 정면충돌 — 프롬프트로만 막지 않고 코드로도 거름
  const vocalWord=/vocal|choir|ad-?lib|\bsung\b|singing|lyric|\bvoice/i;
  const instr=!(st.vocal&&st.vocal!=='No Vocal');
  const ok=t=>!(instr&&vocalWord.test(t))&&!/[\uAC00-\uD7A3\u3040-\u30FF\u4E00-\u9FFF]/.test(t);   // 프롬프트에 들어가는 tag·boostText·narrDir는 영어만 — 한국어 피드백을 붙여넣어도 한글이 스타일·섹션에 섞이지 않게
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
    boostText:(typeof s.boostText==='string'&&s.boostText.trim()&&ok(s.boostText))?s.boostText.trim():null,
    addSection:(['hook','verse','bridge'].includes(s.addSection))?s.addSection:null,
    addSectionPosition:(['beforeFirstHook','afterIntro','beforeLastHook','end'].includes(s.addSectionPosition))?s.addSectionPosition:'beforeLastHook',
    mood:(s.mood&&HH_MOODS.some(m=>m.kr===s.mood))?s.mood:null,
    narrDir:(()=>{
      if(!s.narrDir||typeof s.narrDir!=='object')return null;
      const cleaned=Object.fromEntries(occKeys.filter(k=>typeof s.narrDir[k]==='string'&&s.narrDir[k].trim()&&ok(s.narrDir[k])).map(k=>[k,s.narrDir[k].trim()]));
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
// 같은 힙합 안에서도 붐뱁·로파이·컨셔스·아프로트랩 등은 808 대신 장르 고유 베이스를 쓴다.
function use808(){return !!st.b808Set||!!(GENRE_AUTO[st.genre]&&GENRE_AUTO[st.genre].a808!=='None');}
function aiSelectionCtx({refs=true,structure=true,soft=false}={}){
  const auto=soft&&st._mtAutoManaged!==false;   // soft: 자동 채워진 장르 기본값은 확정 값이 아니라 참고로만 보여줌
  const g=GENRES[st.genre];
  const mood=HH_MOODS.find(m=>m.kr===st.mood);
  const refSong=(document.getElementById('hh-ref-song')?.value||'').trim();
  // 이름 없이 설명만 주면 removeRef에 "정확한 프로듀서 이름"을 요구해도 채울 수가 없어서(normalize도 st.refs 이름과 대조) 이름을 같이 줌
  const refProducers=(st.refs.length&&producerRefActive())?st.refs.map(kr=>{const p=HH_REF.find(r=>r.kr===kr);return p?`${kr} (${p.en})`:kr;}).join(' / '):null;
  const hasVocal=st.vocal&&st.vocal!=='No Vocal';
  return [
    REFERENCE_DEVELOPMENT_GUIDE,
    st.brief?.instrumentalProfile?`레퍼런스 반주 분석: ${JSON.stringify(st.brief.instrumentalProfile)}`:null,
    st.referenceSelections?`출처: ${JSON.stringify(referenceSelectionOrigins())}. ai-reference는 AI가 추천한 참고값이며 사용자 확정 조건이 아님. 실제 레퍼런스 반주 특징을 우선하고 메뉴와 맞지 않으면 자유롭게 표현.`:null,
    g?`장르: ${g.kr} (${g.sound})`:'장르: 미선택 — 레퍼런스 곡과 나머지 설정에서 가장 가까운 사운드를 판단',
    mood?`무드: ${mood.kr}`:null,
    st.commercial?`색깔: ${st.commercial}`:null,
    auto?`장르 기본 추천(자동으로 채워진 참고값일 뿐 — 따르지 않아도 되고, 이 곡의 의도에 맞는 악기·드럼·베이스·질감을 직접 설계해): 멜로디 ${st.melody.join(', ')||'-'} / 드럼 ${st.drums.join(', ')||'-'} / 808 ${use808()?(st._808||'-'):'-'} / 그루브 ${st.groove||'-'} / 텍스처 ${st.texture.join(', ')||'-'}`:null,
    auto?null:(st.melody.length?`멜로디 악기: ${st.melody.join(', ')}`:'멜로디 악기 미선택'),
    auto?null:(st.drums.length?`드럼 패턴: ${st.drums.join(', ')}`:null),
    auto?null:((st._808&&use808())?`808: ${st._808}`:null),
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
  return `[현재 설정]
${ctx}

[현재 생성된 스타일 프롬프트 — ${styleText.length}/1000자 — 자연어 디렉팅의 명확성과 일관성을 평가]
${styleText||'(아직 생성 안 됨)'}

[현재 생성된 섹션 프롬프트]
${sectText||'(아직 생성 안 됨)'}${(_hhWritten?.lyrics||'').trim()?`

[현재 가사]
${_hhWritten.lyrics.trim()}`:''}`;
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
채점 규칙: 각 항목은 직전 점수에서 출발해. 그 항목과 관련된 텍스트가 실제로 바뀐 경우에만 근거를 들어 최대 3점까지 올리거나 내려 (직전 지적이 실제로 해결됐으면 크게 올려도 되고, 새 모순·중복·중복·모순·불필요한 분량 증가 같은 악화가 확인되면 내려). 바뀌지 않은 곳에 해당하는 항목은 직전 점수 그대로 — 매번 새로 뽑기하듯 매기지 마.`;
}
// 설정·출력이 바뀌거나 새 평가를 시작하면 이전 응답을 버린다.
let _reviewToken=0;
function reviewGuard(){
  const token=++_reviewToken,writeToken=_writeToken;
  const snapshot=()=>JSON.stringify([hhWriteFingerprints().fpFull,...['hh-style-ta','hh-sect-ta','hh-lyrics-ta'].map(id=>document.getElementById(id)?.value||'')]);
  const before=snapshot();
  return ()=>token===_reviewToken&&writeToken===_writeToken&&before===snapshot();
}
function promptBudgetWarnings(section,style,lyrics){
  const total=lyrics?(mergeLyricsAndDirection(lyrics,section)||lyrics):section;
  const warnings=[];
  if((style||'').length>1000)warnings.push('스타일 프롬프트가 1000자를 넘어요');
  if((total||'').length>5000)warnings.push('가사·섹션 프롬프트가 5000자를 넘어요');
  return warnings.length?warnings:null;
}
async function aiProducerReview(){
  const key=getOpenAIKey();
  const btn=document.getElementById('hh-ai-arrange-btn');
  const statusEl=document.getElementById('hh-ai-arrange-status');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 OpenAI API Key를 먼저 저장하세요');return;}
  if(st.genre===null){fail('장르를 먼저 선택하세요');return;}
  if(_writePromise)await _writePromise;   // AI 작성이 진행 중이면 초안이 아니라 최종 텍스트를 리뷰하도록 대기
  const uniqueSegs=[...new Set(st.structSegs)].filter(s=>s==='hook'||s==='verse'||s==='bridge');
  const occKeys=structOccurrenceKeys();
  const appliedSoFar=(_aiSuggestions||[]).filter(s=>s.applied);

  const isCurrent=reviewGuard();
  if(btn){btn.disabled=true;btn.textContent='🤖 분석 중...';}
  if(statusEl)statusEl.hidden=true;
  try{
    const hasVocal=st.vocal&&st.vocal!=='No Vocal';
    const refSong=(document.getElementById('hh-ref-song')?.value||'').trim();
    // 지시문/규칙은 호출마다 안 바뀌니 static — 상태에 따라 달라지는 건 전부 dynamic 쪽으로 몰아서 static이 매번 완전히 동일하게(캐싱 적중)
    const staticText=`너는 ${producerRole()}야. 아래 [현재 생성된 섹션 프롬프트](실제 텍스트)와 트랙 설정을 보고, 레퍼런스 또는 선택한 무드·스타일을 더 잘 실현하는 데 실제로 필요한 보완이 있는지 판단해줘. 보완할 근거가 없으면 총평만 반환해. 설정값만 보고 짐작하지 말고, 반드시 실제 텍스트를 읽고 거기 적힌 구체적인 단어·구절 기준으로 판단해.

"총평" 카테고리는 반드시 정확히 1개 포함해: 현재 설계의 핵심 의도가 전달되는지 짧게 판단해. 중요한 문제가 없으면 그대로 생성해볼 것을 권해. 오디오를 듣지 않고 결과가 확실히 좋아진다고 단정하거나 억지로 약점을 찾지 마.
${RUBRIC_TEXT()}
총평 외에 실행할 개선은 중요도 순으로 0~5개만 제안해. 최소 개수는 없어. 한 가지 문제면 한 가지만, 충분히 잘 설계됐다면 총평에 "추가 수정 없이 생성·청취해볼 단계"라고 말하고 액션을 만들지 마. 낮은 점수를 채우기 위해 지적을 만들거나 모든 카테고리를 하나씩 다루지 마.
킥·베이스·악기 교체를 상투적으로 권하지 마. 예를 들어 킥과 베이스가 같은 자리를 과하게 차지한다는 지시 충돌이나 사용자의 실제 청취 피드백이 있을 때만 그루브 의도를 살리는 최소 보완을 제안해. 음원을 듣지 않고 킥이 약하다거나 저역이 뭉친다고 단정하지 마. 의도에 맞는 발전 방향이 명확하면 제안하되 변화 자체를 목적으로 삼지 마.
선정 기준은 사용자의 의도 위반, 실제 지시 충돌, 핵심 훅·그루브를 흐리는 과밀함, 곡의 정체성이나 필요한 대비가 없는 경우야. 취향 차이·단어 다듬기·추측성 믹싱 문제는 필수 개선으로 제시하지 마. 각 조언은 현재 텍스트의 근거와 바꿀 대상, 기대하는 효과를 짧게 연결하고 가장 작은 수정 하나로 해결해. 한 조언에 여러 악기·효과·구조 변경을 묶지 마. 추가보다 삭제·단순화·현 상태 유지가 더 나으면 그쪽을 택해.
적용 후에도 연결된 자연어 디렉팅과 기존 중심 패턴을 유지해. 모든 박자·악기·공간감을 세세하게 통제하려 하지 말고, 수정 대상 밖의 좋은 부분과 여백을 보존해.

곡 전체를 읽고 실제 문제가 있는 부분만 제안해. 정해진 지적 개수를 채우려고 변화를 만들지 마.
- 중심 모티프·베이스·리듬의 정체성이 선명하고 반복과 변주가 연결되는가? 다른 악기로 모티프를 넘기거나, 같은 리듬을 유지하며 음역·강세만 바꾸는 것도 유효해.
- 악기의 연주 순서·응답 관계·쉼·등장 시점이 구체적인가? 밝은 반주와 쓸쓸한 멜로디처럼 역할이 나뉜 감정은 모순이 아니야.
- 스타일의 전체 전개와 섹션의 상세 전개가 양립하는가? 스타일의 악기 팔레트가 모든 구간의 상시 연주를 뜻하지는 않아. only/avoid 같은 단어를 일괄 금지하지 마.
- 작은 벌스와 훅의 대비, 필요한 곳의 변화가 있는가? 모든 구간에 새로운 필인·공간 변화·최대 밀도를 요구하지 마. 반복적인 클럽 그루브는 그대로 유지할 수 있어.
- 선택한 무보컬 조건·악기·BPM·Key·구조가 지켜졌는가? 실제 충돌이나 선택 위반을 우선 지적해. 메뉴 이름·고정 태그와 단어가 다르다는 이유로 누락이라고 하지 마. 보컬 제외 문장, 동의어, 구간별 의도적인 생략은 전체 문맥으로 판단해.
- Anti-AI가 켜져도 피치·타이밍 흔들림을 강요하지 마. 시그니처 시작·침묵·특정 순간의 변형으로 개성을 평가해.
레퍼런스는 제공된 분석 근거로 비교하고 제목만으로 들은 것처럼 말하지 마. 음악을 듣지 않은 평가는 텍스트 설계 평가야.

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

[라운드] ${appliedSoFar.length?'2라운드 이후 — 이미 적용된 주제는 반복 금지, 8점 이상 항목은 지적 금지, 개선 최대 5개':'첫 리뷰 — 개선 최대 5개'}

[현재 적용돼 있는 섹션별 지시 — 이 안에서 모순되거나 과한 건 지적해도 됨]
${Object.entries(st.narrAI||{}).map(([k,v])=>`- ${k}: ${v}`).join('\n')||'(없음)'}

[글자 예산] 섹션 프롬프트 ${(document.getElementById('hh-sect-ta')?.value||'').length}/5000자, 스타일 ${(document.getElementById('hh-style-ta')?.value||'').length}/1000자${scoringAnchor()}

[이전 라운드에서 이미 적용된 조언 — 이건 이미 반영됐으니 다시 제안하지 마. 새로 해결할 중요한 문제가 없으면 여기서 멈춰]
${appliedSoFar.length?appliedSoFar.map((s,i)=>`${i+1}. (${s.category}) ${s.text}`).join('\n'):'(없음 — 이번이 첫 리뷰)'}`;

    // 총평과 필요한 핵심 개선만 반환한다. 기존 응답 형식은 유지한다.
    const raw=await callOpenAI(key,{maxTokens:16000,staticText,dynamicText,think:false});
    if(!isCurrent())return;
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const rawList=(parsed.suggestions||[]).filter(s=>s&&s.text);
    const total=rawList.find(s=>s.category==='총평');
    const list=total?[total,...rawList.filter(s=>s!==total).slice(0,5)]:rawList.slice(0,5); // 총평 1개 + 개선 최대 5개
    if(!list.length)throw new Error('AI가 제안을 반환하지 못했습니다');
    // "다시" 눌러서 재리뷰할 때 이전에 적용한 조언까지 통째로 갈아치우면 🔍 적용 검증이 추적할 이력이 사라짐 —
    // 이미 적용된 건 남기고 새로 받은 라운드만 그 뒤에 이어붙임
    _aiSuggestions=[...appliedSoFar,...list.map(s=>normalizeAiSuggestion(s,uniqueSegs,occKeys))];
    {const tot=_aiSuggestions.find(s=>s.category==='총평'&&!s.applied);recordAiScore(tot?.score,tot?.criteria);noteScored(tot?.criteria,tot?.score);}   // 리뷰 대상이던 텍스트가 아직 화면에 있을 때
    hhGenerate(false,{noScroll:true});
  }catch(e){
    if(isCurrent())fail(e.message);
    if(btn){btn.disabled=false;btn.textContent='🤖 AI 프로듀서 리뷰 받기';}
  }finally{
    if(btn){btn.disabled=false;btn.textContent="🤖 AI 프로듀서 리뷰 받기";}
  }
}
// 조언의 대상·시점·유지 조건을 보존한다. 같은 구간·카테고리의 새 조언만 교체한다.
function sanitizeDirective(text){return (text||'').replace(/\s+/g,' ').trim();}
function setDirective(occKey,category,text){
  st.narrDirs=st.narrDirs||{};
  const clean=sanitizeDirective(text);
  if(!clean)return;
  (st.narrDirs[occKey]=st.narrDirs[occKey]||{})[category||'기타']=clean;
  st.narrAI=st.narrAI||{};
  st.narrAI[occKey]=[...new Set(Object.values(st.narrDirs[occKey]))].join(' ');
}
const RUBRIC_TEXT=()=>`${REFERENCE_DEVELOPMENT_GUIDE}
채점은 아래 8개 항목을 각각 0~10 정수로 매겨 criteria에 넣어 (합계는 내가 계산하니 네가 합산하지 마). 앵커: 5=어떤 장르에도 붙는 범용 템플릿 수준 / 7=탄탄하지만 다듬을 곳이 분명히 있음 / 9=지금 바로 Suno에 넣어 곡을 만들어도 되는 수준. 실제로 결함이 없는 항목엔 8~10을 줘도 돼 — 억지로 깎지 마.
악기의 역할·응답·여백이 명확하면 박자 좌표나 레이어를 더 붙이라고 하지 마. 같은 중심 리듬을 유지한 채 훅의 공간이나 저음만 바꾸는 것도 유효한 전개야. 모든 악기의 동시 타격을 무조건 금지하지 마. 충분히 설계됐으면 생성·청취 단계로 안내해. 사용자가 실제 결과의 약점을 알려줬다면 그 약점과 직접 관련된 최소 수정만 우선하고, 프롬프트만 보고 들리지 않은 문제를 단정하지 마.
${REVIEW_RUBRIC.map(r=>`- ${r.key}(${r.label}, 가중 ${r.w}): ${r.def}`).join('\n')}
(레퍼런스 곡이 없으면 reference는 생략)\n자연어 문장·명령형·쉼표 수·같은 악기의 반복 자체로 감점하지 마. 중심 패턴의 유지와 의미 있는 변화, 명확한 연주 관계를 평가해. 형용사 유무를 점수 조건으로 삼지 마. &로 합쳐도 정보량이 줄지는 않아. 실제 오디오 없이 음악 품질을 보장한다고 말하지 마.`;
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
  const n=(_aiSuggestions||[]).filter(s=>s.selected&&!s.applied&&!s.pending&&aiSuggestionActionable(s)).length;
  btn.textContent=`✅ 선택 적용 (${n})`;
  btn.disabled=!n||_writeState==='pending';
  btn.style.opacity=n?'1':'.5';
  btn.style.cursor=n?'pointer':'default';
}
async function applySelectedAiSuggestions(){
  if(_writeState==='pending')return;
  const picked=(_aiSuggestions||[]).filter(s=>s.selected&&!s.applied&&!s.pending&&aiSuggestionActionable(s));
  if(!picked.length)return;
  // 무드 변경은 멜로디·808·드럼 룰 재추천을 다시 돌리니, 같이 고른 다른 조언(멜로디 리드 등)이 덮이지 않게 가장 먼저
  picked.sort((x,y)=>!!y.mood-!!x.mood);
  picked.forEach(s=>{if(!s.settingsUpdated){applyAiSuggestionCore(s);s.settingsUpdated=true;}s.pending=true;});
  // 피드백 적용은 예외 — 적용하자마자 고쳐 쓴 프롬프트를 보는 게 목적이라 바로 재생성 (다른 AI 추천·분석은 Generate를 눌러야 반영)
  await hhGenerate(`AI 리뷰 ${picked.length}개 적용: ${[...new Set(picked.map(s=>s.category))].join('·')}`,{noScroll:true});
  const fp=hhWriteFingerprints().fpFull;
  if(_writePromise)await _writePromise;
  const success=!!(_hhWritten?.meta?.ok&&_hhWritten.fpFull===fp);
  picked.forEach(s=>{s.pending=false;s.applied=success;s.selected=!success;});
  if(hhWriteFingerprints().fpFull===fp){
    hhGenerate(false,{noScroll:true});
    if(!success)showToast('피드백 작성이 완료되지 않았어요 — 선택 적용으로 다시 시도하세요');
  }

}
function applyAiSuggestionCore(sug){
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
  const key=getOpenAIKey();
  const btn=document.getElementById('hh-ai-external-btn');
  const statusEl=document.getElementById('hh-ai-arrange-status');
  const ta=document.getElementById('hh-external-feedback-ta');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 OpenAI API Key를 먼저 저장하세요');return;}
  if(st.genre===null){fail('장르를 먼저 선택하세요');return;}
  const feedback=(ta?.value||'').trim();
  if(!feedback){fail('피드백 텍스트를 먼저 붙여넣으세요');return;}
  const uniqueSegs=[...new Set(st.structSegs)].filter(s=>s==='hook'||s==='verse'||s==='bridge');
  const occKeys=structOccurrenceKeys();

  const isCurrent=reviewGuard();
  if(btn){btn.disabled=true;btn.textContent='🤖 분석 중...';}
  if(statusEl)statusEl.hidden=true;
  try{
    const hasVocal=st.vocal&&st.vocal!=='No Vocal';
    const staticText=`너는 ${producerRole()}야. 아래 외부 청취 피드백과 현재 프롬프트를 대조해, 지적된 핵심 문제를 해결하는 데 꼭 필요한 수정만 제안해. 관련 없는 믹스·악기·무드 디테일까지 확장하지 마.
총평은 한 개, 실행할 개선은 중요도 순으로 0~5개만. 최소 개수는 없어. 반영할 중요한 문제가 없거나 이미 해결됐으면 총평만 반환하고 액션을 만들지 마. 같은 원인의 지적은 합치되 한 조언에 여러 독립적인 변경을 묶지 마. 각 제안은 근거·대상·기대 효과를 짧게 설명하고 가장 작은 수정으로 해결해. 추가보다 삭제·단순화가 적절하면 그쪽을 택해. 피드백에 점수가 있으면 총평의 score로 보존하고 없으면 만들어내지 마.
적용해도 자연어 디렉팅 스타일·핵심 패턴·기존 가사와 수정 대상 밖의 구간은 유지해. 모든 소리를 통제하려 하지 말고 연주와 여백을 남겨. 텍스트만 보고 소리의 문제를 확정하지 마.

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

    // 외부 피드백도 추가할 내용이 없으면 액션 없는 총평만 허용한다.
    const raw=await callOpenAI(key,{maxTokens:16000,staticText,dynamicText,think:false});
    if(!isCurrent())return;
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const rawList=(parsed.suggestions||[]).filter(s=>s&&s.text);
    const total=rawList.find(s=>s.category==='총평');
    const list=total?[total,...rawList.filter(s=>s!==total).slice(0,5)]:rawList.slice(0,5); // 총평 1개 + 개선 최대 5개
    if(!list.length)throw new Error('피드백에서 반영할 내용을 찾지 못했습니다');
    const added=list.map(s=>normalizeAiSuggestion(s,uniqueSegs,occKeys));
    _aiSuggestions=[...(_aiSuggestions||[]),...added];
    if(ta)ta.value='';
    _extFeedbackDraft='';   // 다시 그려도 방금 처리한 피드백이 칸에 되살아나지 않게
    hhGenerate(false,{noScroll:true});
  }catch(e){
    if(isCurrent())fail(e.message);
  }finally{
    if(btn){btn.disabled=false;btn.textContent='🎧 반영 제안 받기';}
  }
}
// 룰 기반 모순 제거(태그 겹침, 반복 등)는 적용 순간 코드가 이미 처리하지만, 그건 "우리가 미리 안 패턴"만 잡음 —
// 조언이 실제로 "의도한 대로" 반영됐는지(위치·대상·뉘앙스까지)는 판단이 필요한 영역이라 AI로 한 번 더 대조
async function aiVerifyAppliedSuggestions(){
  const key=getOpenAIKey();
  const btn=document.getElementById('hh-ai-verify-btn');
  const statusEl=document.getElementById('hh-ai-arrange-status');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 OpenAI API Key를 먼저 저장하세요');return;}
  const applied=(_aiSuggestions||[]).filter(s=>s.applied);
  if(!applied.length){fail('적용된 조언이 없습니다');return;}

  const isCurrent=reviewGuard();
  if(btn){btn.disabled=true;btn.textContent='🔍 검증 중...';}
  if(statusEl)statusEl.hidden=true;
  try{
    const sectText=document.getElementById('hh-sect-ta')?.value||'';
    const styleText=document.getElementById('hh-style-ta')?.value||'';
    const oldScore=(_aiSuggestions||[]).find(s=>s.category==='총평')?.score;
    const staticText=`너는 ${producerRole()} 겸 QA 담당이야. 아래 [적용된 조언 목록]과 [최종 프롬프트]를 비교해서, 각 조언이 실제로 프롬프트에 "의도한 대로" 반영됐는지 확인해줘. 단순히 비슷한 단어가 있는지가 아니라, 조언이 말하는 위치·대상·뉘앙스까지 실제로 맞는지 꼼꼼히 봐 (예: "마지막 훅 앞에 브릿지"라고 했는데 실제로 다른 위치에 있으면 fail).

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

    const raw=await callOpenAI(key,{maxTokens:2000,staticText,dynamicText,think:false});
    if(!isCurrent())return;
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
    if(isCurrent())fail(e.message);
    if(btn){btn.disabled=false;btn.textContent='🔍 적용 검증';}
  }finally{
    if(btn){btn.disabled=false;btn.textContent="🔍 적용 검증";}
  }
}
let _polishOriginal=null;
async function aiPolishSectionPrompt(){
  const key=getOpenAIKey();
  const btn=document.getElementById('hh-ai-polish-btn');
  const statusEl=document.getElementById('hh-ai-polish-status');
  const ta=document.getElementById('hh-sect-ta');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 OpenAI API Key를 먼저 저장하세요');return;}

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
    const staticText=`너는 Suno AI(텍스트를 실제 음악으로 변환하는 모델)에 넣을 섹션별 편곡 프롬프트를 다듬는 ${producerRole()}야. 주어지는 텍스트는 규칙 기반으로 조합돼서 어휘와 문장 구조가 반복적이고 표현이 납작해.

${PROMPT_ROLE_GUIDE}

간결한 영어 자연어로 악기·주법·처리·시점·유지 조건을 명확히 해. 완결 문장과 명령형을 허용하고 단어 목록으로 강제 변환하지 마. 중심 패턴과 의도적인 반복·침묵을 보존해. 같은 악기가 다시 나온다는 이유로 바꾸지 마. 형용사만 있는 곳은 구체적인 소리 원인으로 뒷받침하되 새 효과나 레이어를 억지로 더하지 마. 원문의 무보컬 조건과 사용자가 정한 값은 지켜.

[반드시 지킬 것]
- [Intro], [Instrumental Hook 1: ...] 같은 대괄호 헤더는 절대 수정하지 마 (줄 순서도 그대로)
- 괄호 안 "8 Bars:" 같은 마디 수 숫자는 절대 바꾸지 마
- BPM, Key, 악기 이름, ZERO/instrumental 같은 보컬 관련 지시는 단어 그대로 유지 (동의어 교체도 금지)
- 줄 개수와 대략적인 문장 길이는 비슷하게 유지 — 다듬으면서 문장을 더 길게 늘리지 마, 오히려 짧아지는 방향
- then, before, while preserving 같은 순서·대비·유지 조건과 연주 동사는 보존해. 더 짧다는 이유로 실제 지시를 빼지 마.

다른 설명 없이 다듬어진 전체 텍스트만 답해.`;
    const dynamicText=`

[원본]
${original}`;
    const polished=(await callOpenAI(key,{maxTokens:10000,staticText,dynamicText})).trim();
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
  const key=getOpenAIKey();
  const statusEl=document.getElementById('ai-reco-status');
  const btn=document.getElementById('ai-reco-btn');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 OpenAI API Key를 먼저 저장하세요');return;}
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
      `장르 기본 저음: ${genreLowEnd(st.genre,GENRE_AUTO[st.genre]?.a808||'None')}`,
      `BPM ${st.bpmSet?st.bpm:'미지정(프롬프트에 쓰지 않음)'} / Key ${st.keySet?KEYS[st.key]:'미지정(프롬프트에 쓰지 않음)'}`,
    ].filter(Boolean).join('\n');
    const staticText=`너는 ${producerRole()}야. 아래 선택된 요소들을 보고, 이 곡에 가장 잘 어울리는 중심 악기 1개(베이스 훅도 가능), 필요한 경우에만 배경 악기 1개, 믹스 텍스처 2개, 악기 톤/음색 1개, 전환효과 1~2개, 스윙/그루브 1개, 저음 설계, 드럼 패턴 1~3개, 편곡 밀도 1개, 곡 구조 1개를 추천해줘. 사용자가 직접 확정한 설정을 우선하고, 그 다음 확실히 아는 레퍼런스 특징, 마지막으로 장르 기본값을 참고해. 808 사용 여부를 장르 이름만으로 금지하거나 강제하지 마. 레퍼런스에 맞으면 808을 쓰고, 아니면 None을 선택해. 곡 구조는 아래 [구조 프리셋] 중에서 장르·무드·보컬 유무·목표 길이·색깔(커머셜/언더그라운드)과 타겟 레퍼런스 곡의 실제 곡 구성(네가 아는 대로)을 종합해 골라 — 예를 들어 루프 하나로 미니멀하게 가는 곡이면 Minimal/Loop Evolve, 벌스로 쌓다가 훅에서 터지는 곡이면 Slow Burn, 훅이 자주 돌아오는 곡이면 Hook Heavy. [현재 선택]에 타겟 레퍼런스 곡이 있으면, 그 곡의 실제 편곡 성격(로그드럼 같은 루프 하나로 밀고 가는 미니멀한 곡인지, 라이저·크래시로 빌드업하는 곡인지, 드롭이 폭발적인 곡인지, 레이어가 촘촘한 곡인지)을 네가 아는 대로 판단해서 밀도·전환효과·드럼 선택에 반영해 — 미니멀한 곡이면 밀도는 Minimalist/Sparse, 전환효과는 필터 스윕다운·순간 정적·테이프 스탑처럼 절제된 것을, 빌드업이 강한 곡이면 라이저·스네어 롤·임팩트 쪽을 골라. 베이스 리프 하나가 중심인 미니멀 곡이면 melodyLead에 그 베이스를 고르고 melodyBackground는 null로 둘 수 있어. 없는 기타·패드를 추가해서 두 칸을 채우지 마. 리드와 배경은 대역이 겹치지 않게(둘 다 Dark synth·Ambient pad·Strings 같은 저역 지속음이면 저음 악기와 함께 로우~로우미드가 뭉쳐서 마스킹) 한쪽은 플럭·벨·아르페지오 같은 짧은 트랜지언트 악기로 골라 (Supersaw + Ambient pad처럼 둘 다 넓게 깔리는 지속음이면 중고역이 서로 마스킹). 곡을 모르면 무리해서 추측하지 말고 장르·무드 기준으로만 골라. 드럼·그루브는 장르 정체성을 지키면서 무드에 맞게 골라. 리드와 배경은 서로 다른 역할이니 각각 그 역할에 맞는 걸로 따로 판단해줘 — 리드는 곡을 이끄는 전면 멜로디, 배경은 리드를 받쳐주는 후면 텍스처. 어떤 악기가 리드에 어울리고 어떤 게 배경에 어울릴지는 정해진 규칙이 없으니 이 조합의 맥락(장르·무드)을 보고 네가 직접 판단해. 목표는 다양성이 아니라 이 조합에 대한 최적의 선택이야 — 이 조합에 정말 그 게 최선이라고 판단되면 이전과 같은 결과를 다시 줘도 상관없어, 억지로 다르게 고르지 마. 단, 아래 목록에 있는 이름만 정확히 그대로 사용해.

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

    const raw=await callOpenAI(key,{maxTokens:1500,staticText,dynamicText,think:false});
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
      st._808=lvl808;st.b808Set=true;
      chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,on808Change);
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
      if(producerRefActive())await aiRecommendProducerRef({regen:false});
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
  const key=getOpenAIKey();
  const statusEl=document.getElementById('hh-ai-struct-status');
  const btn=document.getElementById('hh-ai-struct-btn');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 OpenAI API Key를 먼저 저장하세요');return;}
  if(st.genre===null){fail('장르를 먼저 선택하세요');return;}
  btn.disabled=true;btn.textContent='🤖 추천 중...';
  if(statusEl)statusEl.hidden=true;
  try{
    const list=HH_STRUCT_PRESETS.map(p=>`${p.name}: ${p.desc} (${p.segs.join('→')}, 약 ${fmtDur(structDurationSec(p.segs))})`).join('\n');
    const staticText=`너는 ${producerRole()}야. 아래 선택된 요소들을 보고 이 곡에 가장 어울리는 곡 구조 프리셋을 아래 목록에서 1개만 이름 그대로 골라줘. 장르·무드·보컬 유무·밀도·색깔(커머셜/언더그라운드)·목표 길이(있으면 예상 길이와 비교)와, 타겟 레퍼런스 곡이 있으면 그 곡의 실제 곡 구성(루프 하나로 가는 미니멀한 곡인지, 벌스로 쌓다가 훅에서 터지는지, 훅이 자주 돌아오는지 — 네가 아는 대로)을 종합해서 판단해. 특별히 다른 구조가 더 어울린다는 근거가 없으면 정석(Standard)이 무난한 기본값이야 — 억지로 독특한 구조를 고르지 마.

[구조 프리셋 — 괄호는 섹션 수 × 약 26초로 추정한 예상 길이(Suno는 마디 수를 거의 무시하고 섹션 수로 곡 길이가 정해짐)]
${list}

설명·인사말 없이, 응답의 첫 글자는 반드시 '{'여야 해. 아래 JSON 형식으로만 답해:
{"structure":"...","reason":"한 문장 한국어 이유"}`;
    const dynamicText=`

[현재 선택]
${aiSelectionCtx({structure:false})}`;
    const raw=await callOpenAI(key,{maxTokens:600,staticText,dynamicText,think:false});
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
  const key=getOpenAIKey();
  const statusEl=document.getElementById('hh-ai-ref-status');
  const btn=document.getElementById('hh-ai-ref-btn');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 OpenAI API Key를 먼저 저장하세요');return;}
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

    const raw=await callOpenAI(key,{maxTokens:600,staticText,dynamicText,think:false});
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
// "개선 권장" 항목을 반영해서 다시 쓰기 — 지적 목록을 [개선 요청]으로 붙여 고쳐쓰기 모드로 돌림. 더 나아지지 않으면 이전 결과를 그대로 둠
let _writeFix=null;      // 진행 중인 개선 요청(지적 목록)
let _writeNote='';       // 개선 결과 안내(예: 이전 결과 유지)
let _writeEntryId=null;
function reviseWithWarnings(btn){
  if(!_writeWarn||!_writeWarn.length||!_hhWritten?.meta?.ok||!_hhDraft||_hhWritten.fpBase!==_hhDraft.fpBase){
    _writeNote='설정이 바뀌어서 지금 결과와 맞지 않아요 — 먼저 Generate를 눌러 새로 작성한 뒤 시도해주세요';renderWriteBadge();return;
  }
  _writeFix=[..._writeWarn];_writeNote='';
  if(btn)btn.disabled=true;
  hhAiWrite(_writeEntryId);
}
let _writeWarn=null;   // 핵심 검사는 통과했지만 추가 개선 검사 일부를 못 넘은 AI 결과의 사유

// 복원·초기화 이후에는 이전 요청의 스트리밍·완료 콜백을 무시한다.
function invalidateAiWrite(){
  ++_writeToken;
  ++_briefToken;
  _refAutoPromise=null;_refAutoText='';
  _writePromise=null;_writeFix=null;_writeNote='';_writeWarn=null;_writeErr='';_writeState='off';
}
function aiWriteEnabled(){
  try{return !!getOpenAIKey()&&localStorage.getItem('hh_ai_write')!=='0';}catch(_){return false;}
}
// 상태 지문 — 초안 텍스트는 매번 무작위 문구가 섞여 달라지므로 텍스트가 아니라 "입력 상태"로 캐시 키를 만듦.
// fpBase = 지시(directive)를 뺀 나머지 → 같으면 고쳐쓰기, 다르면 새로 쓰기
function hhWriteFingerprints(){
  const clean=o=>JSON.stringify(o,(k,v)=>k.startsWith('_')?undefined:v);
  const extra=[...['hh-bar-hook','hh-bar-verse','hh-bar-bridge','hh-ref-song'].map(id=>document.getElementById(id)?.value||''),antiAI,st._808];   // _808은 '_'로 시작해 변경 감지에서 빠져 있었음
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
// 부제만 달라진 헤더는 복원하되 구간 종류·번호·순서가 바뀐 결과는 검증에서 거절한다.
// Some responses wrap each song part separately. Preserve every block, including streaming parts.
function readAiSections(text,partial=false){
  const pattern=partial?/<section\s*>([\s\S]*?)(?:<\/section\s*>|$)/gi:/<section\s*>([\s\S]*?)<\/section\s*>/gi;
  return Array.from(text.matchAll(pattern),m=>m[1].trim()).filter(Boolean).join('\n\n');
}
function restoreSectionHeaders(text,structure,instrumental=false){
  // Markdown 강조·같은 줄 본문은 표시 차이일 뿐이다. 구간 종류·번호는 그대로 검사한다.
  text=text.replace(/^\s*(?:\*\*|#{1,6}\s*)?(\[(?:Instrumental\s+)?(?:Intro|Hook|Chorus|Verse|Bridge|Outro)\b[^\]\n]*\])(?:\*\*)?\s*/gim,'$1\n');
  const identities=headers=>{
    const counts={};
    return headers.map(h=>{
      const m=h.match(/^\[(Instrumental\s+)?(Intro|Hook|Chorus|Verse|Bridge|Outro)(?:\s+(\d+))?(?=\s*(?::|[-–—]|\]))/i);
      if(!m)return null;
      const type=m[2].toLowerCase().replace('chorus','hook');
      const n=counts[type]=(counts[type]||0)+1;
      return [instrumental?'':(m[1]||'').trim().toLowerCase(),type,m[3]||n].join('|');
    });
  };
  const secs=parseSections(text);
  const got=identities(secs.map(s=>s.header)),want=identities(structure.map(s=>s.header));
  if(secs.length!==structure.length||got.some((s,i)=>!s||s!==want[i]))return text;
  let i=0;
  return text.split('\n').map(line=>/^\[.*\]$/.test(line.trim())?structure[i++].header:line).join('\n');
}
function hasSelectedInstrument(text,name){
  const positive=text.toLowerCase().split(/[.!?;,\n]|\b(?:with|but)\b/).filter(s=>! /\b(no|without|avoid|remove|omit|exclude)\b/.test(s));
  return positive.some(s=>s.includes(name.toLowerCase())||(name==='Sample chop'&&/\b(?:chopped (?:instrumental )?samples?|(?:instrumental )?sample[ -]chops?|sample[ -]chopping)\b/.test(s)));
}
const NO_VOCAL_CHOPS=/\b(?:zero|no) vocal[ -]chops?\b|\bwithout (?:any )?vocal[ -]chops?\b|\bvocal[ -]chops? (?:are )?(?:absent|excluded)\b/i;
// 제외 대상만 제거한다. 뒤에 오는 add vocals 같은 긍정 지시는 검사에 남긴다.
function stripVocalExclusions(text){
  const source='(?:vocal(?:[ -](?:chops?|samples?|textures?|layers?|phrases?))?|vocals|voices?|singing|singers?|lyrics?|choirs?|chants?|humming|ad[ -]?libs?)';
  const item='(?:(?:any|all|human|sung|spoken|lead|backing|sampled)\\s+)*'+source;
  return text.replace(new RegExp(NO_VOCAL_CHOPS.source,'gi'),'')
    .replace(new RegExp('\\b(?:no|without|avoid|exclude|omit|zero)\\s+'+item+'(?:\\s*(?:,\\s*(?:or\\s+|and\\s+)?|or\\s+|and\\s+)'+item+')*\\b','gi'),'')
    .replace(/\bvocal[ -]?less\b|\bnon-vocal\b/gi,'');
}
function hasSelectedDrum(text,name){
  const normalized=text.toLowerCase().replace(/[‐‑–—]/g,'-');
  const positive=normalized.split(/[.!?;,\n]|\b(?:with|but)\b/).filter(s=>! /\b(no|without|avoid|remove|omit|exclude)\b/.test(s)).join(' ');
  if(positive.includes(name.toLowerCase()))return true;
  const aliases={
    'Sub-bass punch':/\b(?:punchy|punching|hard-hitting|percussive)\s+(?:\w+\s+){0,2}(?:sub|bass|808|low[ -]end)\b|\b(?:sub|bass|808|low[ -]end)\s+(?:\w+\s+){0,3}(?:punch|punchy|impact|attack|hits?|weight)\b|\b(?:punchy|punching|tight|percussive|hard-hitting)\s+(?:\w+\s+){0,2}sub[ -]?bass\b|\bsub[ -]?bass\s+(?:\w+\s+){0,2}(?:punch|impact|attack)\b/,
    'Crisp hi-hats':/\b(?:crisp|tight|sharp|crystalline)\s+(?:\w+\s+){0,2}(?:hi[ -]?hats|hats)\b|\bhi[ -]?hats\s+(?:stay|remain|sound|are)\s+crisp\b/,
  };
  return !!aliases[name]?.test(positive);
}
function splitPhrases(body){return (body||'').replace(/^\(\d+ Bars: /,'').replace(/\)$/,'').split(/, (?![^()]*\))/).map(x=>x.trim().toLowerCase()).filter(Boolean);}
// 명세: 고정 정보 + 힌트 — 검사기의 기준이기도 함
// 고쳐쓰기의 주요 수정 대상. 다른 구간의 음악적 의도와 작성 스타일은 보존한다.
// (AI가 전체를 다시 쓰면 지시와 무관한 섹션까지 조금씩 흔들려 라운드마다 일관성·파싱 적합이 깎이던 문제 — 수정 범위를 지시가 닿은 곳으로 제한)
function editScopeFor(prev,headers){
  if(_writeFix)return headers.slice();   // "개선 권장 반영" 다시 쓰기 — 어느 섹션이 지적됐는지는 AI가 판단하니 전 섹션을 열어 둠(안 걸린 섹션은 그대로 두라고 지시)
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
// 가사 칸(Lyrics box)에 쓸 섹션 헤더 — 연출 설명의 헤더에서 파생: Hook→Chorus, Instrumental 구간→[Instrumental], 이름 뒤 부제 제거
// 가사 텍스트 → [{header,lines}] (+ 헤더 앞에 붙은 줄 수)
function parseLyricSections(ly){
  const secs=[];let stray=0;
  (ly||'').split('\n').forEach(l=>{const t=l.trim();if(!t)return;if(/^\[[^\]]+\]$/.test(t))secs.push({header:t,lines:[]});else if(secs.length)secs[secs.length-1].lines.push(t);else stray++;});
  return {secs,stray};
}
// 짧은 순간 이벤트만 허용한다. 지속 편성·믹스 지시는 섹션 연출에 남긴다.
const LYRIC_EVENTS={
  'guitar riff':/\bguitars?\b/i,
  'brass stabs':/\bbrass\b/i,
  'drum fill':/\b(drums?|percussion)\b/i,
  'bass slide':/\b(bass|808)\b/i,
  'strings enter':/\bstrings?\b/i,
  'piano fill':/\b(piano|rhodes|keys)\b/i,
  'synth stab':/\bsynths?\b/i,
  'cymbal crash':/\b(cymbals?|drums?)\b/i,
};
function lyricWords(line){return line.replace(/\s*\[[^\[\]]+\]\s*$/,'').trimEnd();}
function validateLyricEvents(sections,style){
  const errors=[];
  // 제외 지시를 악기 팔레트로 착각하지 않는다. 애매하면 태그 대신 섹션 연출로 쓴다.
  const palette=style.replace(/\b(?:avoid|exclude|without|no|never)\b[^.!?;]*/gi,'');
  sections.forEach(s=>{
    let count=0,previous=-2;
    s.lines.forEach((line,i)=>{
      if(!/[\[\]]/.test(line))return;
      const m=line.match(/^([^\[\]]+?)\s+\[([^\[\]]+)\]$/);
      if(!m){errors.push(`${s.header}: 악기 태그는 가사 줄 끝에 하나만 붙일 것`);return;}
      count++;
      const instrument=LYRIC_EVENTS[m[2].toLowerCase()];
      if(!instrument)errors.push(`${s.header}: [${m[2]}]는 허용된 순간 이벤트가 아님 — 구간 상태는 섹션 연출에`);
      else if(!instrument.test(palette))errors.push(`${s.header}: [${m[2]}] 악기가 스타일의 긍정 팔레트에 없음`);
      if(i===previous+1)errors.push(`${s.header}: 연속된 가사 줄에 이벤트를 넣지 말 것`);
      previous=i;
    });
    if(count>Math.min(2,Math.floor(s.lines.length/2)))errors.push(`${s.header}: 이벤트는 두 줄당 하나 이하, 구간당 최대 두 개`);
  });
  return errors;
}
// Suno의 Lyrics 칸에 그대로 넣는 텍스트: 섹션마다 [헤더] → (연출 설명) → 가사 줄. 가사와 연출 설명의 섹션 수가 다르면 빈 문자열
function mergeLyricsAndDirection(lyrics,section){
  const ly=parseLyricSections(lyrics).secs,se=parseSections(section);
  if(!ly.length||!se.length)return '';
  // 섹션 개수가 달라도(예: 가사에서 한 섹션이 빠짐) 통째로 포기하지 않고, 연출 섹션을 가사 헤더로 바꿔 순서대로 같은 헤더끼리 짝지음
  const dh=lyricHeaders(se);
  let from=0,hit=0;
  const out=ly.map(l=>{
    let k=-1;for(let x=from;x<se.length;x++)if(dh[x]===l.header){k=x;break;}
    if(k<0)return [l.header,...l.lines].join('\n');
    from=k+1;hit++;
    return [l.header,se[k].body,...l.lines].join('\n');
  });
  return hit?out.join('\n\n'):'';
}
// ── 내 가사 붙여넣기 — 사용자가 직접 쓴 가사를 곡 구조의 가사 헤더에 배치. 표시([Verse]·[Chorus]·후렴 등)가 있으면 그대로, 없으면 빈 줄로 나눈 문단을 순서대로(같은 문단이 반복되면 후렴)
function fitUserLyrics(raw,headers){
  const typeOf=t=>/instrumental|인스트/i.test(t)?'inst':/pre-?chorus|프리\s*코러스|프리/i.test(t)?'pre':/chorus|hook|후렴|코러스|サビ/i.test(t)?'chorus':/verse|벌스|\d\s*절|[AB]メロ/i.test(t)?'verse':/bridge|브릿지|간주|solo|솔로/i.test(t)?'bridge':/intro|인트로/i.test(t)?'intro':/outro|아웃트로|엔딩/i.test(t)?'outro':'other';
  const blocks=[];let cur=null;
  (raw||'').split(/\r?\n/).forEach(line=>{
    const t=line.trim();
    if(!t){if(cur&&!cur.labeled)cur=null;return;}   // 표시 없는 문단은 빈 줄에서 끝, 표시 있는 블록은 스탠자 사이 빈 줄을 허용
    const m=t.match(/^[\[\(（【]\s*([^\]\)）】]{1,30}?)\s*[\]\)）】]\s*:?$/)||t.match(/^([A-Za-z가-힣\d ]{1,20})\s*[:：]$/)||t.match(/^(verse|chorus|bridge|intro|outro|pre-?chorus|hook|벌스|후렴|브릿지|인트로|아웃트로)\s*\d*$/i);
    if(m&&typeOf(m[1])!=='other'){cur={type:typeOf(m[1]),lines:[],labeled:true};blocks.push(cur);return;}
    if(!cur){cur={type:'other',lines:[],labeled:false};blocks.push(cur);}
    cur.lines.push(t);
  });
  // 표시 없는 문단 중 내용이 똑같이 반복되는 건 후렴으로
  const un=blocks.filter(b=>!b.labeled),seen={};
  un.forEach(b=>{const k=b.lines.join('\n');(seen[k]=seen[k]||[]).push(b);});
  Object.values(seen).forEach(g=>{if(g.length>1)g.forEach(b=>{b.type='chorus';});});
  const verses=blocks.filter(b=>b.type==='verse'||(b.type==='other'&&!b.labeled)).slice();
  const choruses=blocks.filter(b=>b.type==='chorus');
  const intros=blocks.filter(b=>b.type==='intro').slice(),outros=blocks.filter(b=>b.type==='outro').slice();
  const used=new Set(),out=[],missing=[];let placed=0,ci=0;
  headers.forEach(h=>{
    const k=/instrumental/i.test(h)?'inst':/chorus/i.test(h)?'chorus':/verse/i.test(h)?'verse':/intro/i.test(h)?'intro':/outro/i.test(h)?'outro':'inst';
    let b=null;
    if(k==='verse')b=verses.shift();
    else if(k==='chorus'&&choruses.length)b=choruses[Math.min(ci++,choruses.length-1)];   // 후렴이 하나뿐이면 매번 같은 후렴, 여러 개면 순서대로(마지막 후렴만 다르게 쓴 경우)
    else if(k==='intro')b=intros.shift();
    else if(k==='outro')b=outros.shift();
    out.push(h);
    if(b){used.add(b);placed++;out.push(...b.lines);}
    else if(k==='verse'||k==='chorus')missing.push(h);
    out.push('');
  });
  const dropped=blocks.filter(b=>!used.has(b)&&b.type!=='inst').map(b=>({verse:'벌스',chorus:'후렴',bridge:'브릿지',pre:'프리코러스',intro:'인트로',outro:'아웃트로',other:'문단',inst:''}[b.type]+' ('+(b.lines[0]||'').slice(0,12)+'…)'));
  return {text:out.join('\n').replace(/\n+$/,''),placed,missing,dropped};
}
function useMyLyrics(){
  const ta=document.getElementById('hh-lyrics-only-ta'),note=document.getElementById('hh-mylyrics-note');
  const say=(m,c)=>{if(note){note.hidden=false;note.style.color=c||'var(--text-2)';note.textContent=m;}};
  const raw=(ta?.value||'').trim();
  if(!raw){say('가사를 먼저 붙여넣어 주세요','var(--danger)');return;}
  const sect=document.getElementById('hh-sect-ta')?.value||'';
  const fit=fitUserLyrics(raw,lyricHeaders(parseSections(sect)));
  if(!fit.placed){say('❌ 가사를 곡 구조에 배치하지 못했어요 — [Verse]·[Chorus] 같은 표시를 붙이거나, 문단을 빈 줄로 나눠서 다시 붙여넣어 주세요','var(--danger)');return;}
  st.userLyrics=fit.text;   // 헤더가 붙은 정리본을 저장 — 나중에 구조가 바뀌어도 다시 배치됨
  if(ta)ta.value=fit.text;
  const la=document.getElementById('hh-lyrics-ta');
  if(la){la.value=mergeLyricsAndDirection(fit.text,sect)||fit.text;updateWriteCounters();}
  markPending('내 가사');
  say(`✅ 내 가사를 넣었어요 (${fit.placed}개 섹션에 배치). 위 ② Lyrics 칸에 지금 연출과 합쳐서 보여요 — Generate를 누르면 연출이 이 가사에 맞게 다시 쓰여요.${fit.missing.length?' ⚠ 가사가 없는 자리: '+fit.missing.join(', ')+' (문단이 모자라요)':''}${fit.dropped.length?' ⚠ 구조에 자리가 없어 빠진 부분: '+fit.dropped.join(', ')+' (브릿지·프리코러스 가사는 Instrumental 구간이라 안 들어가요)':''}`,fit.missing.length||fit.dropped.length?'#F59E0B':'var(--success)');
}
function clearMyLyrics(){
  st.userLyrics='';
  const ta=document.getElementById('hh-lyrics-only-ta');if(ta)ta.value=_hhWritten?.lyrics||'';
  markPending('AI가 가사 작성');
  const note=document.getElementById('hh-mylyrics-note');
  if(note){note.hidden=false;note.style.color='var(--text-2)';note.textContent='AI가 가사를 쓰도록 되돌렸어요 — Generate를 누르면 새로 써요.';}
}
function lyricHeaders(structure){
  return structure.map(s=>{
    const m=s.header.match(/^\[(Instrumental )?(Intro|Hook|Verse|Bridge|Outro)(?: (\d+))?/i);
    if(!m)return s.header;
    const t=m[2].toLowerCase(),n=m[3]?` ${m[3]}`:'';
    if(m[1]||t==='bridge')return '[Instrumental]';
    return t==='hook'?`[Chorus${n}]`:t==='verse'?`[Verse${n}]`:t==='intro'?'[Intro]':'[Outro]';
  });
}
function buildWriteSpec(prev){
  const g=GENRES[st.genre];
  const roles=computeMelodyRoles(st.melody);
  const hasVocal=st.vocal&&st.vocal!=='No Vocal';
  const auto=st._mtAutoManaged!==false;   // 장르를 고르면 808·드럼·멜로디·텍스처·프로듀서가 장르 기본값으로 자동 채워짐 — 사용자가 고른 게 아니므로 확정 값이 아니라 참고
  // 선택된 구조만 전달한다. 규칙 엔진의 부제·연출 문장은 AI 입력으로 사용하지 않는다.
  const counts={};
  const secs=st.structSegs.map(type=>{
    const n=counts[type]=(counts[type]||0)+1;
    const label=type.charAt(0).toUpperCase()+type.slice(1);
    const inner=['hook','verse','bridge'].includes(type);
    const header=`[${inner&&(!hasVocal||type==='bridge')?'Instrumental ':''}${label}${inner?' '+n:''}]`;
    const bars=inner?Number(document.getElementById('hh-bar-'+type)?.value||({hook:8,verse:12,bridge:4}[type])):null;
    return {header,type,bars};
  });
  const ul=hasVocal&&(st.userLyrics||'').trim()?fitUserLyrics(st.userLyrics,lyricHeaders(secs)):null;   // 사용자가 붙여넣은 가사(구조에 배치된 것)
  const userLy=ul&&ul.placed?ul.text:null;
  const secLimit=WRITE_LIMITS.section;   // 실제 연출+가사 병합 결과의 5000자 상한은 검증 단계에서 확인
  const sectionCaps={intro:180,hook:280,verse:220,bridge:220,outro:160};
  const structure=secs.map(s=>({header:s.header,type:s.type,bars:s.bars?+s.bars:null,maxChars:sectionCaps[s.type]||220}));
  const fixedStyle=[hasVocal?null:'[Instrumental]',hasVocal?null:'no vocals',st.keySet?`Key of ${KEYS[st.key]}`:null,st.bpmSet?`${st.bpm} BPM`:null,(g?g.tag:null)].filter(Boolean);
  return {
    genre:g?g.en:null,genreTag:g?g.tag:null,mood:st.mood,key:st.keySet?KEYS[st.key]:null,bpm:st.bpmSet?st.bpm:null,
    lead:auto?null:(roles?roles.lead:(st.melody[0]||null)),background:auto?null:(roles?roles.bg:null),
    drums:auto?[]:[...st.drums],bass:genreLowEnd(st.genre,use808()?st._808:'None'),bass808:st.b808Set?st._808:null,vocal:hasVocal?st.vocal:null,
    transitionFx:auto?[]:[...(st.transitionFx||[])],groove:auto?null:st.groove,texture:auto?[]:[...st.texture],
    producerReference:(auto||!producerRefActive())?null:(st.refs[0]||null),
    producerSound:(!auto&&producerRefActive()&&st.refs[0])?refFit(HH_REF.find(r=>r.kr===st.refs[0])?.en||'',', '):null,   // 이름은 못 쓰니 이 소리 특징을 스타일에 반영해야 함
    referenceSong:(document.getElementById('hh-ref-song')?.value||'').trim()||null,
    genrePalette:auto?{instruments:[...(g?.instr||[])],drums:GENRE_AUTO[st.genre]?.aDrums||[],groove:GENRE_AUTO[st.genre]?.groove||null}:null,
    selectionOrigins:referenceSelectionOrigins(),
    brief:effectiveBrief()?{instrumentalProfile:st.brief.instrumentalProfile||{},understood:st.brief.understood,styleTags:effectiveBrief().styleTags||[],cues:effectiveBrief().cues||{}}:null,
    commercial:st.commercial||null,density:st.density||null,antiAI:!!antiAI,
    structure,fixedStyleTags:fixedStyle,
    limits:{sectionTotal:secLimit,lyricsCombined:WRITE_LIMITS.section,style:WRITE_LIMITS.style},
    removedPhrases:[...(st.removedPhrases||[])],
    prevLength:prev?prev.section.length:null,
    mutableHeaders:prev?editScopeFor(prev,structure.map(s=>s.header)):null,   // null이면 새로 쓰기(전체 자유)
    prevSections:prev?parseSections(prev.section).map(s=>({header:s.header,body:s.body})):null,
    lyrics:hasVocal?{theme:(st.lyricTheme||'').trim()||null,lang:GENRE_LYRIC_LANG_FIXED[st.genre]||st.lyricLang||'English',headers:lyricHeaders(structure),provided:!!userLy}:null,
    prevLyrics:userLy||((hasVocal&&prev&&prev.lyrics)?prev.lyrics:null),
  };
}
// 전송·표시·가사 병합에 필요한 조건만 검사한다. 음악적 품질은 AI 프로듀서 리뷰가 판단한다.
function validateWritten(spec,section,style,opts={}){
  const errors=[];
  if(!section.trim())errors.push('섹션 프롬프트가 비어 있음');
  if(!style.trim())errors.push('스타일 프롬프트가 비어 있음');
  if(section.length>WRITE_LIMITS.section)errors.push('섹션 프롬프트는 5,000자 이하여야 함');
  if(style.length>WRITE_LIMITS.style)errors.push('스타일 프롬프트는 1,000자 이하여야 함');
  const secs=parseSections(section);
  const kind=header=>(header.match(/^\[(?:Instrumental\s+)?(Intro|Hook|Chorus|Verse|Bridge|Outro|Pre-Chorus|Build|Drop|Breakdown|Solo)\b/i)?.[1]||'').toLowerCase().replace('chorus','hook');
  if(spec.structure&&(secs.length!==spec.structure.length||secs.some((s,i)=>kind(s.header)!==kind(spec.structure[i]?.header||''))))errors.push('선택한 구간이 누락되거나 순서가 달라요. 필요한 구간: '+spec.structure.map(s=>s.header).join(' → '));
  if(section.trim()&&(!secs.length||secs.some(s=>!s.body.trim())))errors.push('섹션을 표시할 [헤더]와 구간별 설명이 필요함');
  if(spec.lyrics){
    const lyrics=(opts.lyrics||'').trim();
    if(!lyrics)errors.push('가사가 비어 있음');
    else{
      const parsed=parseLyricSections(lyrics),headers=lyricHeaders(secs);
      if(parsed.stray||parsed.secs.length!==headers.length||parsed.secs.some((s,i)=>s.header!==headers[i]))
        errors.push('가사와 연출을 빠짐없이 합칠 수 있도록 두 출력의 섹션을 맞춰주세요');
      const merged=mergeLyricsAndDirection(lyrics,section);
      if(!merged)errors.push('가사와 연출을 합치지 못함');
      else if(merged.length>WRITE_LIMITS.section)errors.push('가사와 연출을 합친 출력은 5,000자 이하여야 함');
      if(spec.prevLyrics&&spec.prevLyrics.replace(/\s+/g,' ').trim()!==lyrics.replace(/\s+/g,' ').trim())
        errors.push('보존할 가사가 변경됨 — 사용자가 제공하거나 이전에 확정한 가사를 유지해주세요');
    }
  }
  return {ok:!errors.length,errors};
}
// PDF PART 2·3 및 사용자가 제공한 자연어 스타일 프롬프트 5개의 원리를 적용한다.
const WRITE_STATIC=`${STYLE_BUDGET_GUIDE}

너는 장르 전문 프로듀서이자 Suno 프롬프트 작가야. [의도]와 [명세]를 읽고, 하나의 음악적 정체성이 들리는 스타일 프롬프트와 그에 일치하는 섹션 디렉팅을 영어로 써.

${PROMPT_ROLE_GUIDE}

[스타일 작성 방법 — 태그 목록이 아닌 연결된 자연어 한 문단]
- 장르·템포(정해진 경우)·보컬 유무·중심 감정으로 시작해. 감정은 두세 개로 중심을 잡되 bright with a bittersweet undertone처럼 대비해도 돼. 그 경우 밝은 리듬과 쓸쓸한 선율처럼 각 요소의 역할을 설명해.
- 곡의 특징이 될 아이디어를 하나 정해. 멜로디 모티프, 베이스 제스처, 리듬 셀, 악기와 보컬의 주고받기 등 곡에 맞는 것을 택해. 모든 곡에 같은 2마디 패턴을 강요하지 마.
- 아이디어의 길이·리듬·쉼·강세·음역 중 필요한 특징을 구체화해. 악기가 무엇을 먼저 연주하고 다른 악기가 언제 응답하는지, 무엇을 반복해 유지하는지 자연어 문장으로 연결해. 침묵도 그루브의 일부가 될 수 있어.
- 핵심 악기·베이스·드럼의 역할과 주법·처리를 쓰고, 시작 방식과 중요한 편곡 변화 한두 곳을 포함해. 형용사(warm, wide, polished 등)는 분위기를 보조해도 되지만 소리 원인을 대체하지는 않아.
- 훅을 반드시 복잡하게 만들지 마. 같은 리듬을 유지하면서 베이스 무게·타악 한 겹·음역·강세·스테레오 처리만 바꿔도 돼. 리드 악기의 역할이나 음색을 바꾸며 같은 모티프를 넘겨주는 것도 가능해.
- 유지할 것·바꿀 것·피할 것을 명확히 해. Avoid busy melodies 같은 필요한 제외 지시와 instrumental only 같은 명확한 조건도 허용해. 장황한 부정어 목록은 피하고 사용자의 제외 설정과 일치시켜.
- 한 문단 안에 정체성, 연주 관계, 핵심 전개를 담아. 콤마 개수·형용사 개수·단어 수를 맞추려고 &로 억지로 묶지 마. 스타일 글자 예산이 부족하면 주변 수식어와 부차적 디테일부터 줄이고 중심 패턴·쉼·응답·보컬 조건을 남겨.

[사용자가 준 예시에서 배울 설계 — 복붙 템플릿 아님]
1. 야간 신스팝: 특정 리듬의 모티프 일부를 인트로에서 암시하고 완전히 공개. 베이스가 응답하고 브레이크다운에서 비운 뒤, 원래 리듬을 유지하며 음역을 바꿔 회수.
2. 여름 팝 듀엣: 기타가 훅을 먼저 연주하고 여성 보컬이 리듬을 따라받고 남성 보컬이 응답한 뒤 함께 끝맺음. 밝은 편곡 속 그리운 선율. 듀엣을 선택한 곡에서만 참고.
3. 미니멀 라틴 팝: 낮은 플럭 두 번, 높은 스탭, 쉼, 하강하는 벤드와 짧은 응답으로 정체성. tiny end-note variations처럼 작은 변화만 주고 훅에서 저역과 타악 무게를 더함.
4. 나이트 팝: 뮤트 기타와 신스 플럭의 응답이 시작부터 등장. 동일 모티프를 기타·신스·일렉트릭 키로 음역을 바꿔 넘기되 베이스와 드럼은 같은 싱코페이션을 받침.
5. 미니멀 클럽: 정박 킥 위에 약간 늦는 베이스와 긴 쉼. 4마디마다 작은 변형, 훅에서도 그루브 유지. 위스퍼 찹은 보컬을 명시적으로 허용한 경우에만 참고하며 무보컬 곡에서는 금지.
이 예시의 장르·BPM·음형·악기·보컬을 다른 곡에 그대로 복사하지 마. 의도에 맞는 중심 아이디어와 상호작용을 새로 설계해. 같은 패턴의 반복 자체를 결함으로 보지 마.

[섹션 디렉팅]
- 하나의 <section> 블록 안에 선택한 전체 곡 구조를 처음부터 끝까지 작성해. Intro만 쓰고 끝내지 마.
- <section>은 Suno 가사 칸에 들어갈 최종 연출이야. 각 구간에서 결과에 실제로 필요한 디테일만 간결한 영어 자연어로 써. 디테일 개수를 미리 정하지 말고, 하나로 충분하면 하나만 쓰고 서로 연결된 여러 지시가 꼭 필요할 때만 함께 써.
- 스타일에 이미 적은 장르·BPM·무드·전체 악기 목록·모티프의 세부 음형을 반복하지 마. 이 구간에서 이전 구간과 달라지는 것, 반드시 유지할 패턴, 의도적으로 비울 요소처럼 구간을 구별하는 정보만 남겨.
- 무엇이 언제 어떻게 움직이는지가 분명해야 해. 구간 전체 상태와 순간 이벤트를 throughout, after, before 같은 말로 구분하고, 순간 이벤트는 모티프나 보컬이 쉬는 자리에 배치해. 사용자가 정한 마디 수 밖의 시점을 만들지 마.
- 스타일에 없는 악기를 한 번의 이벤트를 위해 추가하지 마. 같은 훅이나 미니멀 그루브를 유지해야 하면 억지로 필인·레이어·공간 변화를 만들지 말고 짧게 유지 지시만 써.
- 훅의 대비가 필요하면 훅에 계속 쌓기 전에 앞 구간에서 무엇을 덜어낼지 검토해. 다만 모든 곡에 큰 대비·마지막 최대 밀도·2마디 빌드업을 강제하지 마.
- 믹스·공간·인간미·전환효과를 모든 구간에 빠짐없이 적지 마. 그 구간의 음악적 역할을 바꾸는 디테일만 선택하고, 이미 충분하면 더 채우지 마. 구간별 maxChars는 간결성 권장값이고 전체 길이 상한은 limits를 따라.

[선택값과 레퍼런스]
- 베이스 리프가 곡의 중심이면 베이스 자체를 훅으로 디렉팅해. lead와 bass가 같은 악기면 하나의 파트이며 다른 베이스를 겹치지 마. 무보컬이어도 속삭임·보컬 촙을 넣거나 빈자리를 별도 리드로 메우지 마.
- 레퍼런스가 없으면 선택한 장르·무드·악기·그루브를 중심으로 일관된 새 곡을 설계해. 레퍼런스가 있으면 분석된 반주의 정체성을 유지하되 사용자가 직접 변경한 조건을 우선해.
- selectionOrigins가 ai-reference인 필드는 AI가 메뉴에 매핑한 참고값이지 사용자가 확정한 조건이 아니야. 반주 분석과 다르면 분석을 우선해. 사용자의 보컬 조건과 지정 BPM/Key는 유지해. instrumentalProfile의 실제 장르·그루브·베이스·편성을 메뉴 이름보다 우선하고, 목록 밖의 특징도 자연어로 표현해. 무보컬로 바뀌어도 반주·구조는 유지하고 보컬 빈자리를 채우려고 새 기타나 신스 리드를 추가하지 마. 기존 cues에 보컬이 섞여 있으면 보컬 부분만 제외하고 반주 정보는 보존해.
- 명세의 lead/background는 스타일 또는 섹션에서 실제 소리로 반영해. Sample chop은 chopped instrumental samples처럼 동등한 연주 표현도 가능해. drums는 스타일 또는 필요한 섹션에 실제 소리로 반영해. Sub-bass punch는 punchy sub-bass, Crisp hi-hats는 crisp hi-hats처럼 자연스럽게 표현해도 돼. bass는 장르에 맞는 저음 참고이며 808을 모든 장르에 강제로 추가하지 마. 위치는 음악적 의도로 정해. 사용자가 확정한 악기·그루브·전환효과·텍스처는 존중하고 장르 기본 추천은 참고로만 봐.
- bpm·key가 있으면 그대로 쓰고, null이면 특정 BPM·Key를 만들지 마. producerSound가 있으면 소리 특징을 스타일에 반영해. 실존 아티스트·프로듀서·곡 이름이나 OO-inspired는 출력하지 마.
- referenceSong이 있으면 곡 제목과 아티스트를 보고 네가 확실히 아는 사운드·연주·편곡 특성만 분석해서 반영해. 실제 오디오를 들었다고 주장하거나 모르는 세부를 지어내지 마. 제목과 이름은 최종 출력에 쓰지 말고 재현 가능한 소리 언어로 바꿔. BPM과 Key는 referenceSong에서 추측하지 말고 명세 값을 그대로 사용해.
- brief가 있으면 소리 특징·styleTags·cues를 반영해. 제목만 아는 곡을 실제로 들었다고 주장하지 마. 스타일에 명시한 악기는 섹션에서 실제 역할을 갖게 해.
- 형용사 단어가 아니라 대상과 적용 구간을 보고 모순을 판단해. 같은 리듬을 지키면서 음색을 바꾸는 것은 모순이 아니야.

[무보컬과 보컬 — 사용자 선택 최우선]
- vocal이 null이면 보컬·보컬 샘플·보컬찹·위스퍼·허밍·합창·애드립을 넣지 마. 예시보다 이 선택이 우선이야. 스타일에 instrumental only, no vocals처럼 무보컬 의도를 자연스럽고 명확하게 표현해. 정해진 금지 문구를 모두 나열할 필요는 없어. 섹션마다 같은 금지 문구를 반복할 필요는 없어. 샘플은 instrumental sample chops로 분명히 해.
- vocal이 있으면 [Instrumental]·no vocals·ZERO vocal chops·no vocal samples와 전체 purely/completely instrumental 선언은 넣지 마. 메뉴 이름 대신 실제 전달 방식·음역·처리를 써. Instrumental 헤더가 있는 구간에는 보컬을 넣지 마.
- 보컬 전달 방식은 스타일에서 정하고 섹션에서는 달라질 때만 설명해. 매 구간의 창법 키워드나 마지막 벨팅은 필수가 아니야. Light ad-libs는 리드 없이 드문 조각만, Full rap feature는 랩 중심, Heavy hooks는 후렴 중심, Sung lead vocal은 노래 중심이야. 요청하지 않은 듀엣을 예시 때문에 만들지 마.

[가사 — lyrics가 있을 때만]
- <lyrics>는 지정 언어와 주제로, <section>과 <style>은 영어로 써. 제공된 가사나 수정 모드의 이전 가사는 헤더·줄바꿈까지 보존해.
- 앱이 각 구간의 [헤더] → (자연어 연출) → 실제 가사 순서로 합쳐. 개선할 편곡·연주·보컬 전달은 <section>에 쓰고, 설명문을 실제 노랫말에 섞지 마. 사용자 가사에 없는 줄이나 단어를 인용해 특정 위치를 지시하지 마.
- 새 가사: 가사는 읽는 글이 아니라 실제로 부를 보컬 소스야. 벌스는 직접적인 감정 선언을 줄이고 시간·장소·사물·행동으로 장면을 보여줘. 후렴은 짧고 발음하기 쉬운 핵심 라인을 만들고 정확히 반복해. 프리코러스는 기대감을 올리고, 브리지는 새로운 관점이나 결과를 보여준 뒤 다음 핵심 구간으로 돌아갈 공간을 남겨. 각 줄을 소리 내어 읽는다고 생각하고 음절·호흡·모음 흐름을 고려해 설명적인 긴 문장을 줄여.
- 가사는 연출과 합칠 수 있는 헤더로 써. 줄 수는 마디·호흡·보컬 속도에 맞게 정하고 후렴의 핵심을 유지해. Instrumental 구간은 헤더만 둬.
- 새 AI 가사를 쓸 때는 필요한 순간에만 줄 끝 악기 태그를 넣어. 예: Stay with me tonight [guitar riff]. 가사 중간·태그만 있는 별도 줄·한 줄에 여러 태그는 금지. 두 줄당 하나 이하, 구간당 최대 두 개이며 모든 구간에 넣을 필요는 없어. 보컬 프레이즈가 짧게 끝나는 쉼에 배치해.
- 허용 이벤트: ${Object.keys(LYRIC_EVENTS).map(t=>'['+t+']').join(', ')}. 스타일에 긍정적으로 포함된 악기만 써. 원하지 않는 악기를 태그 때문에 추가하지 마. 지속 편성·페이드·믹스 처리는 <section>에 쓰고 실제 가사로 부를 문장에는 악기 설명을 넣지 마.
- 사용자 제공 가사와 고쳐쓰기의 이전 가사는 태그까지 그대로 유지해. 새 이벤트 추가는 새 AI 가사 작성에만 적용해. 무보컬에는 가사나 줄 끝 태그를 생성하지 마. 짧은 (ooh)는 가능하나 기존 노래 가사를 인용하지 마.
- 연출과 합친 Lyrics는 5000자 이하. 가사와 연출의 분량은 곡에 맞게 배분해. 구간별 maxChars는 간결하게 쓰기 위한 권장값이며 전체 길이 상한과 구분해.

[출력 계약 — 앱의 편집·병합 형식]
- 무보컬은 <section>…</section><style>…</style>, 보컬이면 <lyrics>…</lyrics>를 맨 앞에 추가. 다른 설명 없이 출력해.
- section은 선택한 구조와 흐름을 반영해. 앱에서 구간을 구분할 수 있도록 [헤더]를 별도 줄에 쓰고 아래에 필요한 자연어 연출을 ( )로 감싸 적어. 부제나 마디 접두어는 강제하지 않아.
- style은 자연어 한 문단이며 선택 조건을 의미로 반영해. fixedStyleTags는 참고 정보이지 복사할 필수 문구가 아니야. 무보컬 여부와 장르부터 시작해. 스타일은 처음부터 공백·문장부호 포함 700~900자를 목표로 설계하고 반드시 1000자 이내로 완성해. 단어 수나 토큰 수가 아니야. 섹션의 세부 설명을 스타일에 반복하지 마. limits.style과 limits.sectionTotal은 상한이지 목표가 아니야. 필요한 설명이 짧게 끝나면 더 채우지 마.
- 수정 시 확정된 지시와 삭제 문구를 반영하고 지정되지 않은 구간·가사는 보존해. 문장을 줄이면서 동사·시점·원래 패턴의 유지 조건을 없애지 마.`;
// 토큰 수가 아닌 공백 포함 실제 글자 수를 기준으로 스타일만 압축한다.
async function fitAiStyle(style,context=''){
  const originalStyle=style.replace(/\s+/g,' ').trim();
  let text=originalStyle;
  for(let attempt=0;text.length>WRITE_LIMITS.style&&attempt<3;attempt++){
    const raw=await callOpenAI(getOpenAIKey(),{
      maxTokens:1800,think:false,
      staticText:STYLE_BUDGET_GUIDE+'\n'+PROMPT_ROLE_GUIDE+'\n이미 작성한 Suno 스타일 프롬프트를 같은 음악적 의도의 영어 자연어 한 문단으로 압축해. 공백·문장부호 포함 700~900자를 목표로 하고 반드시 1000자 이내. 단어 수나 토큰 수가 아니다. 보컬 유무·선택 BPM/Key·장르·중심 패턴·주요 악기 역할과 꼭 필요한 전개를 보존하고 중복 형용사·반복 설명부터 줄여. 새로운 악기·지시를 추가하지 마. 입력의 targetCharacters에 맞춰 다시 설계해. 직전 길이에서 minimumReduction 이상 줄여야 해. 원문과 조건은 보존할 의미를 확인하는 참고이며 모든 단어를 다시 복사하지 마. 문장을 중간에서 자르지 마. <style>...</style>만 출력해.',
      dynamicText:JSON.stringify({currentCharacters:text.length,maximumCharacters:WRITE_LIMITS.style,targetCharacters:[850,700,550][attempt],minimumReduction:Math.max(0,text.length-[850,700,550][attempt]),context,originalStyle,style:text})
    });
    text=(raw.match(/<style>([\s\S]*?)<\/style>/i)?.[1]||raw).replace(/\s+/g,' ').trim();
    if(!text)throw new Error('스타일 압축 결과가 비어 있어요');
  }
  return text;
}
async function writeOnce({mode,spec,prev,errors,failed,onPartial}){
  const key=getOpenAIKey();
  const styleContext=JSON.stringify({selection:spec,appliedFeedback:{...st.narrAI},confirmedStyle:[...(st.extraTags||[])],removedPhrases:[...(st.removedPhrases||[])]});
  const directives=Object.entries(st.narrAI||{}).map(([k,v])=>`- ${k}: ${v}`).join('\n')||'(없음)';
  const dynamicText=`

[모드] ${mode==='edit'?`고쳐쓰기 — 아래 [이전 결과]를 바탕으로 [지시]를 반영해. **음악적 내용을 변경할 섹션은 다음이야: ${(spec.mutableHeaders||[]).join(' | ')||'(없음 — 음악적 내용 유지)'}**. 다른 구간의 음악적 의도와 자연어 작성 방식은 유지해. 모든 구간에서 중복·장황한 문장을 줄이고 스타일과의 역할 모순을 정리해도 돼. 이전 문장 자체를 보존하라는 뜻은 아니야. 가사는 별도 보존 조건을 따라. 중복·모순을 줄이되 필요한 보완의 길이를 억지로 제한하지 마, 스타일 프롬프트는 확정 스타일 지시·삭제 확정 문구를 반영해 정리해도 돼`:'새로 쓰기 — [의도]와 [명세]에 맞게 처음부터 써'}

[명세]
${JSON.stringify(spec,null,1)}

[지시 — 섹션 키별, 스타일 지시는 아래 확정 태그]
${directives}
확정 스타일 지시: ${(st.extraTags||[]).join(' & ')||'(없음)'}
삭제 확정 문구(어떤 형태로도 다시 쓰지 말 것): ${(st.removedPhrases||[]).join(' | ')||'(없음)'}
${_writeFix?`\n[개선 요청 — 이 결과가 추가 검사에서 지적받은 항목이야. 아래를 해소하도록 고쳐 써. 지적과 무관한 섹션·가사는 [이전 결과] 그대로 유지하고, 지적된 부분만 구체적인 소리 표현으로 바꿔. 새 지적을 만들지 않도록 다른 규칙도 그대로 지켜]\n${_writeFix.map((x,i)=>`${i+1}. ${x}`).join('\n')}`:''}

[의도 — 사용자가 고르거나 곡 분석으로 정해진 것. 장르 기본값이 아니라 이 의도를 따라 써. "장르 기본 추천"으로 표시된 건 자동으로 채워진 참고값일 뿐이고, BPM·Key·보컬은 유지해. 악기·드럼 등은 selectionOrigins를 확인해: ai-reference는 레퍼런스 분석보다 우선하지 않는 자동 추천이고 current-selection은 현재 선택이므로 존중해]
${aiSelectionCtx({soft:true})}
${spec.brief?`곡 분석에서 나온 소리 특징(반드시 반영): ${spec.brief.understood}\n섹션별 특징: ${JSON.stringify(spec.brief.cues)}`:''}
${spec.lyrics&&spec.lyrics.provided?`\n[가사 지시 — 사용자가 직접 쓴 가사가 있어. <lyrics> 블록을 맨 앞에 쓰되, 아래 가사를 헤더·줄·줄바꿈까지 글자 그대로 복사해(고치거나 새로 쓰거나 줄이지 마 — 검사기가 글자 단위로 대조해). 네가 쓸 건 <section> 연출 설명과 <style>이고, 연출은 이 가사의 장면·감정·리듬에 맞춰 벌스·후렴마다 가사가 살아나는 보컬 전달과 편곡을 구체적으로 써. 가사 안에 없는 이야기를 연출에 지어내지 마]\n가사 헤더(순서·글자 그대로): ${spec.lyrics.headers.join(' | ')}\n[사용자 가사 — 그대로 복사]\n${spec.prevLyrics}\n`:''}${spec.lyrics&&!spec.lyrics.provided?`\n[가사 지시 — 보컬 곡이라 <lyrics> 블록을 맨 앞에 써]\n가사 언어: ${spec.lyrics.lang}\n사용자가 원하는 가사의 느낌·주제: ${spec.lyrics.theme||'(비어 있음 — 곡의 무드·분석 결과·장르에 어울리는 이야기와 감정을 네가 정해)'}\n가사 헤더(순서·글자 그대로): ${spec.lyrics.headers.join(' | ')}\n`:''}${mode==='edit'&&prev?`\n[이전 결과 — 섹션]\n${prev.section}\n\n[이전 결과 — 스타일]\n${prev.style}\n${spec.prevLyrics?`\n[이전 결과 — 가사 (글자 그대로 유지)]\n${spec.prevLyrics}\n`:''}`:''}${errors&&errors.length?`\n[직전 시도가 검사에서 실패한 사유 — 반드시 고쳐서 다시 써]\n${errors.map(e=>'- '+e).join('\n')}\n[직전 실패 결과 — 위 오류를 바로잡되 선택과 작성 스타일은 유지]\n${failed?JSON.stringify(failed):'(없음)'}\n`:''}`;
  // 숨은 추론을 끄면 작성이 61초→약 18초(4곡 모두 첫 시도에 검증 통과), 스트리밍으로 나오는 대로 화면에 보여줌
  const raw=await callOpenAI(key,{maxTokens:16000,staticText:WRITE_STATIC,dynamicText,think:false,onText:onPartial});
  const sec=readAiSections(raw),sty=raw.match(/<style>([\s\S]*?)<\/style>/i);
  if(!sec||!sty)throw new Error('AI 응답에서 <section>/<style>을 찾지 못했습니다');
  const lyr=raw.match(/<lyrics>([\s\S]*?)<\/lyrics>/i);
  if(spec.lyrics&&!lyr)throw new Error('AI 응답에서 <lyrics>를 찾지 못했습니다');
  return {section:restoreSectionHeaders(sec,spec.structure,!spec.vocal),style:await fitAiStyle(sty[1],JSON.stringify({intent:styleContext,section:sec})),lyrics:spec.lyrics&&lyr?lyr[1].trim():''};
}
function renderWriteBadge(){
  const b=document.getElementById('hh-write-badge');
  if(!b)return;
  const map={
    off:['📝 규칙 초안',''],
    pending:['✍️ AI 작성 중…','작성이 끝나면 아래 텍스트가 교체돼요 (그 사이 복사하면 규칙 초안이 복사됨)'],
    ok:_writeWarn?[`✍️ AI 작성 · 길이 조정 필요`,'AI 작성문을 보존했지만 출력 제한 확인이 필요해요: '+_writeWarn.slice(0,4).join(' / ')]:['✍️ AI 작성 완료','출력 누락·글자 수·가사 병합을 확인했어요. 음악적 품질은 AI 프로듀서 리뷰에서 확인하세요.'],
    fallback:['📝 규칙 초안 (AI 작성 검증 실패)',_writeErr||''],
  };
  const [t,title]=map[_writeState]||map.off;
  b.textContent=t;b.title=title;
  // 툴팁은 마우스를 올려야만 보이고(터치에선 불가) 4개까지만 잘려서, 사유 전체를 배지 아래에 눈에 보이게 펼침 — 배지를 누르면 접기/펴기
  const hdr=b.closest('.output-box-header');
  let d=document.getElementById('hh-write-detail');
  if(!d&&hdr){d=document.createElement('div');d.id='hh-write-detail';d.style.cssText='font-size:11px;line-height:1.7;padding:8px 10px;margin:6px 0;border-radius:var(--r-sm);background:var(--surface-3);color:var(--text-2)';hdr.after(d);}
  if(!d)return;
  const items=_writeState==='ok'&&_writeWarn?_writeWarn:_writeState==='fallback'?(_writeErr?_writeErr.split(' / '):[]):[];
  const has=items.length>0;
  const note=_writeNote?'<div style="margin-top:6px;color:var(--accent-text)">'+escHtml(_writeNote)+'</div>':'';
  b.style.cursor=has?'pointer':'';b.onclick=has?()=>{d.hidden=!d.hidden;}:null;
  d.hidden=!(has||_writeNote);
  d.innerHTML=has?(_writeState==='ok'
    ?'<b style="color:var(--text-1)">개선 권장 '+items.length+'개</b> — AI 원문을 보존했어요. 스타일을 1000자 이내로 줄인 뒤 사용해주세요.'
    :'<b style="color:var(--text-1)">AI 출력 처리에 실패해 규칙 초안을 보여주고 있어요</b> — 이유:')
    +'<ul style="margin:6px 0 0;padding-left:18px">'+items.map(x=>'<li>'+escHtml(x)+'</li>').join('')+'</ul>'
    +(_writeState==='ok'?'<button onclick="reviseWithWarnings(this)" style="margin-top:8px;padding:6px 14px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:12px;font-weight:700;cursor:pointer">🔧 이 항목 반영해서 다시 쓰기</button>':'')+note:note;
}
function updateWriteCounters(){
  const sect=document.getElementById('hh-sect-ta')?.value||'',style=document.getElementById('hh-style-ta')?.value||'';
  const lc=document.getElementById('hh-lyrics-count'),la=document.getElementById('hh-lyrics-ta');
  if(lc&&la){lc.textContent=`${la.value.length}/5000자`;lc.style.color=la.value.length>5000?'var(--danger)':'var(--success)';}
  const a=document.getElementById('hh-sect-count'),b=document.getElementById('hh-style-count');
  if(a){a.textContent=`${sect.length}/5000자`;a.style.color=sect.length>5000?'var(--danger)':sect.length>4200?'#F59E0B':'var(--success)';}
  if(b){b.textContent=`${style.length}/1000자`;b.style.color=style.length>1000?'var(--danger)':style.length>800?'#F59E0B':'var(--success)';}
}
function updatePromptHistoryTexts(id,section,style,lyrics){
  if(!id)return;
  const list=loadPromptHistory();const e=list.find(x=>x.id===id);
  if(!e)return;
  e.section=section;e.style=style;e.aiWritten=true;e.lyrics=lyrics||'';e.warn=promptBudgetWarnings(section,style,lyrics);
  try{localStorage.setItem(PROMPT_HISTORY_KEY,JSON.stringify(list));}catch(_){}
  renderPromptHistory();
}
async function hhAiWrite(entryId,{fresh=false}={}){
  if(!aiWriteEnabled()||!_hhDraft)return;
  const token=++_writeToken;
  const draft=_hhDraft;
  _writeEntryId=entryId;
  if(!_writeFix)_writeNote='';
  const fixNotes=_writeFix,prevW=_hhWritten,prevWarn=_writeWarn;   // 개선 다시 쓰기면 실패·무개선 때 이전 결과로 되돌리려고 보관
  _writeState='pending';_writeErr='';_writeWarn=null;renderWriteBadge();
  const run=(async()=>{
    try{
      const mode=(!fresh&&_hhWritten&&_hhWritten.meta?.ok&&_hhWritten.fpBase===draft.fpBase)?'edit':'create';
      const spec=buildWriteSpec(mode==='edit'?_hhWritten:null);
      let errors=null,result=null,lastErrors=null,warn=null,failed=null;
      for(let attempt=0;attempt<3;attempt++){   // 실패 사유를 붙여 최대 2번 재시도 — 폴백(규칙 초안)은 의도 반영이 약하니 마지막 수단
        const out=await writeOnce({mode,spec,prev:mode==='edit'?_hhWritten:null,errors,failed,onPartial:txt=>{
          if(token!==_writeToken)return;
          const sm=readAiSections(txt,true),tm=txt.match(/<style>([\s\S]*?)(?:<\/style>|$)/i),lm=txt.match(/<lyrics>([\s\S]*?)(?:<\/lyrics>|$)/i);
          const ta=document.getElementById('hh-sect-ta'),sa=document.getElementById('hh-style-ta'),la=document.getElementById('hh-lyrics-ta');
          if(lm&&la)la.value=lm[1].trim();   // 스트리밍 중에는 가사만 보이다가, 끝나면 연출 설명과 합친 텍스트로 교체
          if(sm&&ta)ta.value=sm;
          if(tm&&sa)sa.value=tm[1].trim().replace(/\s*\n\s*/g,' ');
          updateWriteCounters();
        }});
        if(token!==_writeToken)return;
        const v=validateWritten(spec,out.section,out.style,{lyrics:out.lyrics});
        if(v.ok){result=out;break;}
        // 압축까지 끝난 AI 원문을 길이 초과만으로 규칙 초안과 교체하지 않는다.
        if(out.style.length>WRITE_LIMITS.style&&validateWritten(spec,out.section,out.style.slice(0,WRITE_LIMITS.style),{lyrics:out.lyrics}).ok){
          result=out;warn=['스타일 '+out.style.length+'자 — 1000자 제한을 아직 넘습니다. 아래 버튼으로 다시 압축한 뒤 사용하세요.'];break;
        }
        errors=v.errors;lastErrors=v.errors;failed=out;
      }
      if(token!==_writeToken)return;
      if(prevW?.meta?.ok&&!result){   // 재작성 실패 시 기존 AI 결과를 보존한다.
        _hhWritten=prevW;_writeState='ok';_writeWarn=prevWarn;
        _writeNote='새 작성에 실패해 이전 AI 결과를 유지했어요. 현재 선택·피드백은 아직 반영되지 않았어요';
        const ta=document.getElementById('hh-sect-ta'),sa=document.getElementById('hh-style-ta');
        if(ta)ta.value=prevW.section;if(sa)sa.value=prevW.style;
        {const la=document.getElementById('hh-lyrics-ta');if(la)la.value=prevW.lyrics?(mergeLyricsAndDirection(prevW.lyrics,prevW.section)||prevW.lyrics):'';const lo=document.getElementById('hh-lyrics-only-ta');if(lo)lo.value=prevW.lyrics||'';}
        updateWriteCounters();
        return;
      }
      if(fixNotes)_writeNote=warn&&warn.length?('개선 권장 '+(prevWarn||[]).length+'개 → '+warn.length+'개로 줄었어요'):'개선 권장 항목을 모두 반영했어요';
      if(result){
        _hhWritten={fpFull:draft.fpFull,fpBase:draft.fpBase,section:result.section,style:result.style,lyrics:result.lyrics||'',meta:{ok:true,mode,warn},dirSnap:{narrAI:{...(st.narrAI||{})},removedPhrases:[...(st.removedPhrases||[])]}};
        _writeState='ok';_writeWarn=warn;
        const ta=document.getElementById('hh-sect-ta'),sa=document.getElementById('hh-style-ta');
        if(ta)ta.value=result.section;
        if(sa)sa.value=result.style;
        {const la=document.getElementById('hh-lyrics-ta'),lo=document.getElementById('hh-lyrics-only-ta');
          if(la&&result.lyrics)la.value=mergeLyricsAndDirection(result.lyrics,result.section)||result.lyrics;
          if(lo)lo.value=result.lyrics||'';}
        updateWriteCounters();
        updatePromptHistoryTexts(entryId,result.section,result.style,result.lyrics);
      }else{
        _hhWritten={fpFull:draft.fpFull,fpBase:draft.fpBase,section:draft.sect,style:draft.style,meta:{ok:false,errors:lastErrors}};
        _writeState='fallback';_writeErr=(lastErrors||[]).slice(0,3).join(' / ');
        restoreDraftText(draft);
      }
    }catch(e){
      if(token!==_writeToken)return;
      if(prevW?.meta?.ok){
        _hhWritten=prevW;_writeState='ok';_writeWarn=prevWarn;_writeNote='새 작성에 실패해 이전 AI 결과를 유지했어요. 현재 선택·피드백은 아직 반영되지 않았어요 ('+e.message+')';
        const ta=document.getElementById('hh-sect-ta'),sa=document.getElementById('hh-style-ta');
        if(ta)ta.value=prevW.section;if(sa)sa.value=prevW.style;
        {const la=document.getElementById('hh-lyrics-ta');if(la)la.value=prevW.lyrics?(mergeLyricsAndDirection(prevW.lyrics,prevW.section)||prevW.lyrics):'';const lo=document.getElementById('hh-lyrics-only-ta');if(lo)lo.value=prevW.lyrics||'';}
        updateWriteCounters();
        return;
      }
      _hhWritten={fpFull:draft.fpFull,fpBase:draft.fpBase,section:draft.sect,style:draft.style,meta:{ok:false,errors:[e.message]}};
      _writeState='fallback';_writeErr=e.message;
      restoreDraftText(draft);
    }finally{
      if(token===_writeToken){_writeFix=null;renderWriteBadge();_writePromise=null;}
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
let _briefToken=0;
// 무보컬을 골랐는데 브리프 문구에 보컬 묘사("whispered vocals")가 있으면 Suno가 보컬을 넣을 수 있어서 그런 문구는 뺌
// 보컬을 제거해도 같은 문장의 리듬·베이스 정보는 잃지 않는다.
// 작성기가 보컬 조건을 우선 적용하고 instrumentalProfile의 반주 특징을 보존한다.
function effectiveBrief(){return st.brief||null;}
const REFERENCE_FIELDS=['genre','mood','drums','_808','melody','texture','density','groove','transitionFx','melodyTone','structSegs'];
function referenceSelectionOrigins(){
  return Object.fromEntries(REFERENCE_FIELDS.map(k=>[k,st.referenceSelections&&Object.prototype.hasOwnProperty.call(st.referenceSelections,k)&&JSON.stringify(st[k])===JSON.stringify(st.referenceSelections[k])?'ai-reference':'current-selection']));
}
function briefCtxLine(){return st.brief?`원하는 곡의 느낌: "${st.brief.text}" — ${st.brief.understood} / 소리 특징: ${(st.brief.styleTags||[]).join(' & ')}`:null;}
const BRIEF_STATIC=`너는 음악을 잘 모르는 사람의 말도 알아듣는 프로듀서야. 사용자는 Suno AI로 곡을 만들려고 하고, (a) 참고할 곡명("아티스트 - 제목") 또는 (b) 만들고 싶은 느낌·상황("신나고 춤추고 싶어지는 곡")을 한 줄로 적었어. 이걸 프롬프트 빌더의 선택 항목으로 번역해줘.

${REFERENCE_DEVELOPMENT_GUIDE}

규칙:
- 곡명이면 kind="song": 제목과 아티스트를 보고 네가 확실히 아는 실제 사운드(드럼, 베이스, 신스/악기, 보컬 처리, 믹스 공간감, 에너지 흐름)를 반영해. 실제 오디오를 들었다고 주장하지 말고, 잘 모르는 곡이면 kind="vibe"로 두고 understood에 "이 곡은 잘 몰라서 이름만으로는 판단하지 않았다"고 적은 뒤 입력의 다른 단서로만 골라.
- 느낌 설명이면 kind="vibe": 무드·에너지·상황(춤, 드라이브, 공부, 이별 등)에서 어울리는 장르·악기를 골라.
- 아티스트의 대표 장르로 곡을 단정하지 마. 하이퍼팝·일렉트로클래시·일렉트로 하우스·UK 개러지는 해당 곡의 리듬과 소리로 구분해. 베이스 리프가 훅이면 그 베이스를 melodyLead로 고를 수 있고, 별도 기타·신스 멜로디를 만들 필요는 없어.
- 선택지에 구체적인 장르가 있으면 일반 pop 대신 해당 장르를 골라. drums는 핵심 킥·스네어 패턴을 먼저, 셰이커·클랩 같은 보조 타악기는 그 다음에 골라. 멜로디 배경은 필수가 아니며 근거 없이 Ambient pad를 추가하지 마. 쿠아트로·나일론 기타·일반 어쿠스틱 기타를 구별하고 확신 없는 악기 재질이나 주법을 단정하지 마.
- 먼저 원곡의 반주 특징을 메뉴와 독립적으로 instrumentalProfile에 분석해: genre, groove, bass, instruments, arrangement, energy를 영어 자연어로 설명해. 확신 없는 특징은 빈 문자열로 두고 꾸며내지 마. 보컬 특징은 여기에 섞지 마.
- 그다음 화면 표시용 genre는 전체 장르 목록에서 가장 가까운 en을 고르되 적절한 항목이 없으면 null. 원곡을 힙합으로 변환하지 마. 다른 선택 필드도 맞는 항목만 고르고 없으면 null 또는 빈 배열. 메뉴 매핑 때문에 원곡의 반주 분석을 바꾸지 마.
- styleTags(1~2개)와 cues는 영어 소리 묘사 키워드 구야. 콤마 없이 4~9단어 구 하나씩. 실존 아티스트·프로듀서·곡·앨범 이름은 절대 쓰지 마 (Suno 정책). 메뉴에 없는 악기도 확실히 아는 원곡 특징이면 instrumentalProfile에 설명할 수 있어.
- cues: intro/hook/verse/bridge/outro에 확실히 아는 반주 특징만 써. 원곡에서 같은 패턴이면 같은 설명을 유지해도 돼. 구간마다 다른 표현이나 고조를 만들어내지 마. 보컬 멜로디를 악기 훅으로 바꾸지 말고 모르는 구간은 빈 문자열로 둬.
- producer: [선택지]의 프로듀서 레퍼런스 중 이 곡/느낌의 소리에 실제로 어울리는 1명 — 어울리는 사람이 없으면(예: 팝·클럽 곡) 억지로 고르지 말고 null. 이 필드만 목록의 이름을 그대로 쓰고, cues·styleTags에는 이름 금지.
- vocalChar: 보컬 녹음 질감 목록 중 하나(속삭임·친밀한 곡은 드라이/클로즈 계열).
- vocal: 보컬이 거의 없으면 "No Vocal", 있으면 목록 중 가장 가까운 것. vocalStyle은 목록 중 하나 또는 null.
- BPM과 Key는 분석하지 마 — 참고 곡을 고르면 프로그램이 Spotify에서 채우고, 아니면 사용자가 직접 정해.
- 응답은 설명 없이 '{'로 시작하는 JSON 하나만.
{"instrumentalProfile":{"genre":"","groove":"","bass":"","instruments":"","arrangement":"","energy":""},"kind":"song|vibe","understood":"한국어 1~2문장: 어떤 곡/느낌으로 이해했는지","genre":"","mood":"","drums":["",""],"bass808":"","melodyLead":"","melodyBackground":"","texture":["",""],"density":"","vocal":"","vocalStyle":null,"vocalChar":"","producer":null,"styleTags":[""],"cues":{"intro":"","hook":"","verse":"","bridge":"","outro":""},"reason":"한국어 한 문장"}`;
// 분석 프롬프트에 붙는 선택지 목록 (텍스트 분석·GPT 오디오 분석 공용)
function briefOptionsText(){
  return `[선택지]
장르(en — 느낌):
${GENRES.map((g,i)=>({g,i})).map(({g,i})=>`- ${g.en} — ${GENRE_FEEL[i]||g.sound}`).join('\n')}
무드: ${HH_MOODS.map(m=>m.kr).join(' | ')}
${Object.entries(MENU_BY_FAMILY).map(([f,m])=>`[${f}] 드럼: ${m.drums.join(' | ')}\n[${f}] 멜로디 악기: ${m.melody.join(' | ')}`).join('\n')}
808(힙합 계열만): ${HH_808.join(' | ')}
텍스처: ${HH_TEXTURE.join(' | ')}
밀도: ${HH_DENSITY.join(' | ')}
보컬: ${HH_VOCAL.join(' | ')}
보컬 스타일: ${HH_VOCAL_STYLE.join(' | ')}
보컬 질감(vocalChar): ${HH_VOCAL_CHAR.join(' | ')}
프로듀서 레퍼런스(producer): ${HH_REF.map(r=>`${r.kr} (${r.vibes})`).join(' | ')}`;
}
function briefAutoApply(id,before){
  if(id==='sound')return true;
  const sourceField={genre:'genre',mood:'mood',drums:'drums','808':'_808',melody:'melody',texture:'texture',density:'density'}[id];
  if(sourceField&&before.origins?.[sourceField]==='ai-reference')return true;
  if(id==='genre')return before.genre===null;
  const field={mood:'mood',drums:'drums','808':'b808Set',melody:'melody',texture:'texture',density:'density'}[id];
  return field?!before[field]:false;   // 보컬과 이미 고른 값은 자동 분석이 덮어쓰지 않는다.
}
async function aiAnalyzeBrief(opts={}){
  const key=getOpenAIKey();
  const text=(document.getElementById('hh-brief')?.value||'').trim();
  const btn=document.getElementById('hh-brief-btn');
  const statusEl=document.getElementById('hh-brief-status');
  const fail=msg=>{if(statusEl){statusEl.hidden=false;statusEl.style.color='var(--danger)';statusEl.textContent='❌ '+msg;}};
  if(!key){fail('🎧 SPOTIFY 연동 패널에서 OpenAI API Key를 먼저 저장하세요');return false;}
  if(!text){fail('곡명이나 만들고 싶은 느낌을 한 줄 적어주세요');return false;}
  const token=++_briefToken;
  const before={origins:referenceSelectionOrigins(),genre:st.genre,mood:st.mood,drums:st.drums.length,melody:st.melody.length,texture:st.texture.length,density:st.density,b808Set:st.b808Set};
  btn.disabled=true;btn.textContent='🤖 분석 중...';
  if(statusEl)statusEl.hidden=true;
  try{
    const dynamicText=`

[사용자 입력]
${text}

${briefOptionsText()}`;

    const raw=await callOpenAI(key,{maxTokens:3000,staticText:BRIEF_STATIC,dynamicText,think:false});
    if(token!==_briefToken||(document.getElementById('hh-brief')?.value||'').trim()!==text)return false;
    const p=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    _briefProposal=buildBriefProposal(text,p);
    const current=(document.getElementById('hh-brief')?.value||'').trim();
    if(opts.expectedText&&current!==opts.expectedText){_briefProposal=null;return false;}
    if(opts.autoApply&&st.genre===before.genre){
      _briefProposal.items.forEach(it=>it.on=briefAutoApply(it.id,before));
      applyBrief({preserveManual:true});
    }else renderBriefResult();
    return true;
  }catch(e){
    if(token===_briefToken)fail(e.message);
    return false;
  }finally{
    if(token===_briefToken){btn.disabled=false;btn.textContent='🤖 AI로 분석·추천';}
  }
}
// AI 응답을 메뉴 값으로 검증 — 목록에 없는 값은 버리고, 이름이 섞인 소리 키워드는 걸러냄
function buildBriefProposal(text,p){
  const names=HH_REF.map(r=>r.kr.toLowerCase());
  const clean=(s,max)=>{const t=String(s||'').replace(/[,\n]+/g,' ').replace(/\s+/g,' ').trim().slice(0,max);return t&&!names.some(n=>t.toLowerCase().includes(n))?t:'';};
  const v={};
  const genreIdx=GENRES.findIndex(g=>g.en===p.genre||g.tag===p.genre);
  v.genre=genreIdx;
  setInstrumentMenus(GENRES[v.genre]?.family||(st.genre===null?null:GENRES[st.genre].family));   // 아래 검증이 새 장르 계열의 메뉴를 보게 (끝에서 원복)
  v.mood=HH_MOODS.find(m=>m.kr===p.mood)?.kr||null;
  v.drums=(p.drums||[]).filter(d=>HH_DRUMS.includes(d)).slice(0,3);
  v.bass808=HH_808.includes(p.bass808)?p.bass808:null;
  v.lead=HH_MELODY.includes(p.melodyLead)?p.melodyLead:null;
  v.bg=HH_MELODY.includes(p.melodyBackground)&&p.melodyBackground!==v.lead?p.melodyBackground:null;
  setInstrumentMenus(st.genre===null?null:GENRES[st.genre].family);   // 검증 끝 — 현재 장르 계열로 원복
  v.texture=pickCompatibleTextures((p.texture||[]).filter(t=>HH_TEXTURE.includes(t)));
  v.density=HH_DENSITY.includes(p.density)?p.density:null;
  v.vocal=HH_VOCAL.includes(p.vocal)?p.vocal:null;
  v.vocalStyle=HH_VOCAL_STYLE.includes(p.vocalStyle)?p.vocalStyle:null;
  v.vocalChar=HH_VOCAL_CHAR.includes(p.vocalChar)?p.vocalChar:null;
  v.producer=HH_REF.find(r=>r.kr===p.producer)?.kr||null;
  const styleTags=(Array.isArray(p.styleTags)?p.styleTags:[]).map(t=>clean(t,70)).filter(Boolean).slice(0,2);
  const instrumentalProfile=Object.fromEntries(['genre','groove','bass','instruments','arrangement','energy'].map(k=>[k,clean(p.instrumentalProfile?.[k],400)]).filter(([,v])=>v));
  const cues={};
  ['intro','hook','verse','bridge','outro'].forEach(k=>{const c=clean(p.cues?.[k],110);if(c)cues[k]=c;});
  const items=[];
  const add=(id,label,val,show)=>{if(val)items.push({id,label,text:show,on:true});};
  add('mood','무드',v.mood,v.mood);
  add('genre','장르',v.genre>=0,v.genre>=0?`${GENRES[v.genre].kr} — ${GENRE_FEEL[v.genre]||''}`:'');
  // BPM·Key는 분석 대상이 아님 — 참고 곡을 Spotify로 고르면 채워지고, 아니면 사용자가 직접 정함
  add('drums','드럼',v.drums.length,v.drums.join(', '));
  add('808','808',v.bass808,v.bass808);
  add('melody','멜로디',v.lead,[v.lead,v.bg].filter(Boolean).join(' + '));
  add('texture','믹스 텍스처',v.texture.length,v.texture.join(', '));
  add('density','밀도',v.density,v.density);
  add('vocal','보컬',v.vocal,[v.vocal,v.vocalStyle,v.vocalChar].filter(Boolean).join(' · '));
  if('producer' in p&&p.kind!=='song')add('producer','프로듀서',true,v.producer||'없음 — 어울리는 프로듀서가 없어 소리 특징 키워드로 대신해요');
  add('sound','소리 특징',styleTags.length||Object.keys(cues).length||Object.keys(instrumentalProfile).length,[...Object.values(instrumentalProfile),...styleTags,...Object.values(cues)].join(' / '));
  if(!items.length)throw new Error('AI가 목록에 있는 값을 반환하지 못했습니다');
  return {text,kind:p.kind==='song'?'song':'vibe',understood:String(p.understood||'').slice(0,300),reason:String(p.reason||'').slice(0,200),v,styleTags,cues,instrumentalProfile,items};
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
function applyBrief(opts={}){
  const P=_briefProposal;
  if(!P)return;
  const manual=opts.preserveManual?Object.fromEntries(REFERENCE_FIELDS.filter(k=>referenceSelectionOrigins()[k]!=='ai-reference'&&st[k]!=null&&(!Array.isArray(st[k])||st[k].length)&&(!['_808','groove','transitionFx','melodyTone'].includes(k)||st._mtAutoManaged===false)).map(k=>[k,JSON.parse(JSON.stringify(st[k]))])):{};
  const wasBassSet=st.b808Set;
  const beforeSelections=Object.fromEntries(REFERENCE_FIELDS.map(k=>[k,JSON.stringify(st[k]??null)]));
  const on=id=>P.items.some(i=>i.id===id&&i.on);
  const v=P.v;
  _aiSuggestions=null;
  if(on('mood')){st.mood=v.mood;moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',onMoodChange);}
  if(on('genre')&&st.genre!==v.genre)selectGenre(v.genre);
  else if(on('mood'))onMoodChange();
  if(on('drums')){st.drums=v.drums.filter(d=>HH_DRUMS.includes(d));chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,onDrumsManualChange);clearAutoHint('hh-drums-hint');}
  if(on('808')){st._808=v.bass808;st.b808Set=true;chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,on808Change);clearAutoHint('hh-808-hint');}
  if(on('melody')){
    let bg=v.bg;
    if(!HH_MELODY.includes(v.lead))v.lead=null;else if(bg&&!HH_MELODY.includes(bg))bg=null;
    st.melody=v.lead?(bg?[v.lead,bg]:[v.lead]):[];
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
    chipGrid(document.getElementById('hh-vocal'),HH_VOCAL,st,'vocal',1,onVocalChange);
    recommendVocalChar();
    if(v.vocalChar&&st.vocal!=='No Vocal'){st.vocalChar=v.vocalChar;chipGrid(document.getElementById('hh-vocal-char'),HH_VOCAL_CHAR,st,'vocalChar',1,null);}
    if(v.vocalStyle&&st.vocal!=='No Vocal'){st.vocalStyle=v.vocalStyle;chipGrid(document.getElementById('hh-vocal-style'),HH_VOCAL_STYLE,st,'vocalStyle',1,null);}
    onStructSignalChange();
  }
  if(on('producer')){st.refs=v.producer?[v.producer]:[];renderProducerRef();clearAutoHint('hh-ref-hint');}
  Object.assign(st,manual);
  if(Object.prototype.hasOwnProperty.call(manual,'_808'))st.b808Set=wasBassSet;
  if(opts.preserveManual)renderHhChips();
  st.brief=on('sound')?{text:P.text,kind:P.kind,understood:P.understood,styleTags:P.styleTags,cues:P.cues,source:P.source||'ai',instrumentalProfile:P.instrumentalProfile||{}}:null;
  st.referenceSelections=P.kind==='song'?Object.fromEntries(REFERENCE_FIELDS.filter(k=>beforeSelections[k]!==JSON.stringify(st[k]??null)||on(({_808:'808',structSegs:'structure',melodyTone:'melody'}[k]||k))).map(k=>[k,JSON.parse(JSON.stringify(st[k]??null))])):null;
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
// 아티스트·핫한 곡 선택기 → 입력칸 (예전 "아티스트 타입비트" 탭을 ✨ 박스 안으로 합침)
// ============================================================
// 레퍼런스 곡이 있으면 곡의 소리(분석)가 기준 — 프로듀서 레퍼런스까지 얹으면 둘이 부딪힘(실측: 레퍼런스 점수 2~4). 곡 없이 장르·무드만이면 프로듀서를 씀
function refSongActive(){return !!(document.getElementById('hh-ref-song')?.value||'').trim()||!!(st.brief&&st.brief.kind==='song');}
function producerRefActive(){return !refSongActive();}
function syncProducerLock(){
  const c=document.getElementById('hh-ref');if(!c)return;
  const lock=!producerRefActive();
  let n=document.getElementById('hh-ref-lock');
  if(lock&&!n){n=document.createElement('div');n.id='hh-ref-lock';n.style.cssText='font-size:11px;line-height:1.7;padding:8px 10px;border-radius:var(--r-sm);background:var(--surface-3);color:var(--text-2);margin-bottom:8px';n.textContent='🎵 레퍼런스 곡이 있어서 프로듀서 레퍼런스는 쓰지 않아요 — 곡의 소리를 분석해서 반영해요. (곡을 지우면 다시 고를 수 있어요)';c.before(n);}
  if(!lock&&n)n.remove();
  c.style.opacity=lock?'.35':'';c.style.pointerEvents=lock?'none':'';
  const ab=document.getElementById('hh-ref-ai-block');if(ab)ab.style.display=lock?'none':'';
}
let _refCandidate=null;
let _refAutoText='',_refAutoPromise=null;
function autoAnalyzeReference(label){
  if(!label||!getOpenAIKey()||(st.brief?.kind==='song'&&st.brief.text===label))return Promise.resolve(false);
  if(_refAutoPromise&&_refAutoText===label)return _refAutoPromise;
  if(st.brief?.text!==label)st.brief=null;
  const input=document.getElementById('hh-brief');if(input)input.value=label;
  _refAutoText=label;
  const pending=aiAnalyzeBrief({autoApply:true,expectedText:label}).finally(()=>{if(_refAutoPromise===pending){_refAutoText='';_refAutoPromise=null;}});
  _refAutoPromise=pending;
  return _refAutoPromise;
}
function setRefSongFromPicker(label,cand){
  if(!label)return;
  const r=document.getElementById('hh-ref-song');if(r)r.value=label;
  const b=document.getElementById('hh-brief');if(b)b.value=label;
  _refCandidate=(cand&&(cand.bpm||cand.key!==undefined&&cand.key!==null))?{bpm:cand.bpm||null,key:(cand.key!==undefined&&cand.key!==null)?cand.key:null}:null;
  const s=document.getElementById('hh-brief-status');
  if(s){
    s.hidden=false;s.style.color='var(--text-1)';
    const aiText=getOpenAIKey()?'GPT가 곡명으로 장르·무드·악기·편곡 특징을 자동 분석합니다. 완료 후 원하는 항목만 바꾸고 Generate를 누르세요.':'OpenAI API Key를 저장하면 GPT가 곡명으로 장르·무드·악기·편곡 특징을 분석합니다.';
    s.innerHTML=`🎵 <b>${escHtml(label)}</b>을(를) 넣었어요. ${aiText}${_refCandidate?`<div style="margin-top:6px;color:var(--text-2)">곡 데이터는 BPM·Key만 사용: ${[_refCandidate.bpm?_refCandidate.bpm+' BPM':'',_refCandidate.key!==null?KEYS[_refCandidate.key]:''].filter(Boolean).join(' · ')} (정확하지 않을 수 있어요) <button onclick="applyRefCandidate()" style="margin-left:6px;padding:2px 10px;border-radius:12px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:11px;cursor:pointer">BPM·Key 적용</button></div>`:''}`;
  }
  document.getElementById('hh-brief-section')?.scrollIntoView({behavior:'smooth',block:'start'});
  markPending('참고 곡 선택');
  autoAnalyzeReference(label);
}
function applyRefCandidate(){
  const c=_refCandidate;if(!c)return;
  if(c.bpm){st.bpm=c.bpm;st.bpmSet=true;document.getElementById('hh-bpm').value=c.bpm;}
  if(c.key!==null){st.key=c.key;st.keySet=true;document.getElementById('hh-key').value=c.key;}
  const s=document.getElementById('hh-brief-status');if(s){s.hidden=false;s.textContent='✅ 참고값을 BPM·Key에 넣었어요 — 곡과 다르면 02 KEY & BPM에서 고치세요';s.style.color='var(--success)';}
  markPending('참고 곡 BPM·Key');
}
