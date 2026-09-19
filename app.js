// ============================================================
// STATE
// ============================================================
const st={
  genre:null,key:7,bpm:140,
  _808:'Balanced',drums:[],melody:[],melodyTone:null,mood:null,vocal:'No Vocal',vocalChar:null,vocalStyle:null,
  refs:[],texture:[],era:null,region:null,density:null,length:null,commercial:null,
  narrSt:{},narrAI:{},narrDirs:{},structSegs:['intro','hook','verse','hook','outro'],structIdx:null,
  extraTags:[],transitionFx:[],melodyLeadIdx:0,groove:null,
  _appliedAdvTipGenre:null,_appliedArrangeTipGenre:null,sectionArrangeExtras:{},sectionArrangeOccurrence:{},refAf:null,
  _mtAutoManaged:true, // 멜로디·텍스처가 아직 자동 추천 상태인지 — 사용자가 직접 칩 클릭하면 false로 바뀌어 이후 자동 갱신이 덮어쓰지 않음
  _structAutoManaged:true, // 구조(STRUCTURE BUILDER)가 아직 자동 추천 상태인지 — 프리셋 클릭·세그먼트 추가/삭제하면 false
};

// Vocal tab states
const VTS={
  pop:{genre:null,bpm:120,key:7,mood:null,instruments:[],vocalStyle:null,concept:'',narrSt:{},structSegs:['intro','verse','chorus','chorus','outro'],structIdx:null},
  elec:{genre:null,bpm:128,key:7,mood:null,instruments:[],vocalStyle:null,concept:'',narrSt:{},structSegs:['intro','build','drop','breakdown','drop','outro'],structIdx:null},
  rock:{genre:null,bpm:120,key:7,mood:null,instruments:[],vocalStyle:null,concept:'',narrSt:{},structSegs:['intro','verse','chorus','chorus','outro'],structIdx:null},
};

let antiAI=true;

// ============================================================
// UTILITIES
// ============================================================
function toggleSection(header){
  header.classList.toggle('open');
  const body=header.nextElementSibling;
  body.classList.toggle('collapsed');
}

function copyOutput(id,btn){
  const ta=document.getElementById(id);
  navigator.clipboard.writeText(ta.value).then(()=>{
    btn.textContent='Copied!';btn.classList.add('copied');
    setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},1800);
  });
}

function chipGrid(container,items,state,key,maxSel,onChange){
  container.innerHTML='';
  items.forEach((item,i)=>{
    const val=typeof item==='string'?item:(item.kr||item.en||item.name||item);
    const el=document.createElement('div');
    el.className='chip';
    el.textContent=val;
    const selected=Array.isArray(state[key])?state[key].includes(val):state[key]===val;
    if(selected)el.classList.add('selected');
    el.onclick=()=>{
      if(Array.isArray(state[key])){
        if(state[key].includes(val)){state[key]=state[key].filter(x=>x!==val);}
        else if(!maxSel||state[key].length<maxSel){state[key].push(val);}
        else{state[key].shift();state[key].push(val);}
      } else {
        state[key]=state[key]===val?null:val;
      }
      chipGrid(container,items,state,key,maxSel,onChange);
      if(onChange)onChange(val,i);
    };
    container.appendChild(el);
  });
}

function moodGrid(container,moods,state,key,onChange){
  container.innerHTML='';
  moods.forEach(m=>{
    const el=document.createElement('div');
    el.className='mood-card'+(state[key]===m.kr?' selected':'');
    el.innerHTML=`<div class="mood-card-name">${m.kr}</div><div class="mood-card-tag">${m.tag}</div>`;
    el.onclick=()=>{state[key]=state[key]===m.kr?null:m.kr;moodGrid(container,moods,state,key,onChange);if(onChange)onChange();};
    container.appendChild(el);
  });
}

// ============================================================
// HIP-HOP INIT
// ============================================================
function hhInit(){
  // Genre presets
  const presetRow=document.getElementById('hh-genre-presets');
  GENRE_PRESETS.forEach(p=>{
    const el=document.createElement('div');
    el.className='preset-pill';
    el.textContent=p.name;
    el.style.borderColor=p.color+'80';
    el.style.color=p.color;
    el.onclick=()=>{
      if(st.genre!==p.genre)selectGenre(p.genre);   // 808·드럼·멜로디 등 장르별 자동 추천도 같이 채움 (예전엔 장르/BPM/Key만 바뀌고 나머지는 비어 있었음)
      st.bpm=p.bpm;st.key=p.key;
      document.getElementById('hh-bpm').value=p.bpm;
      document.getElementById('hh-key').value=p.key;
      renderHhGenres();
    };
    presetRow.appendChild(el);
  });

  // Key select
  const keyEl=document.getElementById('hh-key');
  KEYS.forEach((k,i)=>{
    const opt=document.createElement('option');
    opt.value=i;opt.textContent=k;
    if(i===st.key)opt.selected=true;
    keyEl.appendChild(opt);
  });
  keyEl.onchange=()=>{st.key=parseInt(keyEl.value);};
  document.getElementById('hh-bpm').oninput=e=>{st.bpm=parseInt(e.target.value)||140;};

  renderHhChips();
  renderArtists('hh-artists-typeBeat',HH_ARTISTS,'hh');
  renderPromptHistory();
  updateAiButtonVisibility();
}
// hhInit·hhReset이 공통으로 쓰는 칩/그리드 렌더 블록 — 한쪽만 고치고 잊어버리는 걸 방지
function renderHhChips(){
  renderHhGenres();
  chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,onRhythmManualChange);
  chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,onDrumsManualChange);
  chipGrid(document.getElementById('hh-melody'),HH_MELODY,st,'melody',2,onMelodyManualChange);
  renderMelodyRoleUI();
  chipGrid(document.getElementById('hh-melody-tone'),HH_MELODY_TONE,st,'melodyTone',1,null);
  moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',onMoodChange);
  renderGenreGuide();
  chipGrid(document.getElementById('hh-vocal'),HH_VOCAL,st,'vocal',1,()=>{recommendVocalChar();onStructSignalChange();});
  renderProducerRef();
  chipGrid(document.getElementById('hh-texture'),HH_TEXTURE,st,'texture',2,onTextureManualChange);
  chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,onRhythmManualChange);
  chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,onRhythmManualChange);
  chipGrid(document.getElementById('hh-era'),HH_ERA,st,'era',1,null);
  chipGrid(document.getElementById('hh-region'),HH_REGION,st,'region',1,null);
  chipGrid(document.getElementById('hh-density'),HH_DENSITY,st,'density',1,onStructSignalChange);
  chipGrid(document.getElementById('hh-commercial'),HH_COMMERCIAL,st,'commercial',1,onStructSignalChange);
  chipGrid(document.getElementById('hh-length'),HH_LENGTH,st,'length',1,onStructSignalChange);
  renderHhNarr();
  renderStructBuilder('hh',HH_STRUCT_PRESETS,HH_SEG_PALETTE,st);
}

// 장르별 레퍼런스 곡 추천 (인덱스 = GENRES 인덱스)
// ⚠️ UPDATE NOTE: HH_ARTISTS 업데이트 시 이 배열도 함께 갱신 (각 장르 핫 곡 5개)
const HH_GENRE_SONGS=[
  ['Travis Scott - FE!N','Future & Metro Boomin - We Still Don\'t Trust You','Drake - Rich Flex','21 Savage - redrum','Gunna - fukumean'],          // 0 Trap
  ['Playboi Carti - Vamp Anthem','Playboi Carti - Magnolia','Night Lovell - Dark Light','SpaceGhostPurrp - Terror Gang','Ski Mask the Slump God - Catch Me Outside'],  // 1 Dark Trap
  ['Rod Wave - Tombstone','Don Toliver - No Idea','Polo G - Hall of Fame','Drake - Rich Baby Daddy','Lil Baby & Gunna - Drip Too Hard'],               // 2 Melodic Trap
  ['Pop Smoke - Welcome to the Party','Pop Smoke - Dior','Sheff G - No Suburban','Fivio Foreign - Big Drip','Kay Flock - No Suburban, Pt. 2'],  // 3 NY Drill
  ['Headie One - 18HUNNA','Unknown T - Homerton B','Digga D - Woi','Central Cee - Doja','Digga D - 6 + 4'],  // 4 UK Drill
  ['Kordhell - Murder In My Mind','DVRST - Close Eyes','INTERWORLD - METAMORPHOSIS','MoonDeity - NEON BLADE','Ghostface Playa - WHY NOT'],  // 5 Phonk
  ['Westside Gunn - Shawn vs Flair','Joey Bada$$ - Survival Tactics','Nas - N.Y. State of Mind','Mobb Deep - Shook Ones, Pt. II','Westside Gunn - Rex Ryan'],  // 6 Boom Bap
  ['A$AP Rocky - Peso','A$AP Rocky - Palace','Lil B - I\'m God','Yung Lean - Ginseng Strip 2002','Bladee - Obedient'],  // 7 Cloud Rap
  ['Nujabes - Feather','Nujabes - Aruarian Dance','Idealism - Snowfall','Idealism - Last Time','J Dilla - Time: The Donut of the Heart'],  // 8 Lo-fi
  ['Lil Uzi Vert - Just Wanna Rock','Bandmanrill - Jiggy In Jersey','Sha EK & Bandmanrill - WHO YOU TOUCH','DJ Sliink - Football Anthem','DJ Sliink - Express Yourself'],  // 9 Jersey Club
  ['Playboi Carti - Sky','Ken Carson - Yale','Destroy Lonely - BANE','Yeat - Rich Minion','Summrs - Outside'],                                       // 10 Rage/Plugg
  ['MHD - Afro Trap Pt. 4 (Fais le mouv)','MHD - Champions League','Burna Boy - Last Last','Asake - Organise','Rema & Selena Gomez - Calm Down'],  // 11 Afrotrap
  ['Kendrick Lamar - euphoria','J. Cole - Middle Child','Cordae - The Parables','Lil Baby - The Bigger Picture','Noname - Song 33'],                 // 12 Conscious
  ['Summer Walker - No Love','SZA - Shirt','Kehlani - Nights Like This','The Weeknd - Sacrifice','Don Toliver - Tore Up'],                           // 13 Trap Soul
  ['Charli XCX - 360','Ericdoa - Fool Around','glaive - 1984','100 gecs - Hand Crushed by a Mallet','Jane Remover - Haunted'],                      // 14 Hyperpop
  ['glaive - astrid','midwxst - Trying','glaive & ericdoa - Cloak n Dagger','glaive & ericdoa - Fuck This Town','glaive - Asheville'],  // 15 Digicore
  ['Autumn! - Knock Knock','SSGKobe - Thrax','Summrs - Right Now','Homixide Gang - 2am','Lil Seeto - Closer'],  // 16 Pluggnb
  ['Tyler the Creator - EARFQUAKE','Earl Sweatshirt - Grief','Brockhampton - SUGAR','Injury Reserve - Knees','Frank Ocean - Ivy'],                   // 17 Westwood
  ['Bones - RestInPeace','Ski Mask the Slump God & XXXTentacion - Take a Step Back','XXXTentacion - YuNg BrAtZ','Zillakami - Shake Junt','Ghostemane - Mercury'],   // 18 Trap Metal
  ['Cash Cobain - Dunk Contest','Cash Cobain - Fisherrr','Jordan Adetunji - KEHLANI','Drake - Calling For You','Chow Lee & Cash Cobain - NOBODY'],   // 19 Sexy Drill
];

// 장르별 808·드럼 자동 추천 (프로덕션 가이드 리서치 기반)
// Sources: emastered.com, attackmagazine.com, beatkey.app, melodigging.com, orphiq.com, routenote, wikipedia/phonk/plugg
const GENRE_AUTO=[
  {a808:'Heavy',    aDrums:['Trap rolls','Crisp hi-hats'],           fx:['임팩트/크래시','라이저'],       groove:'타이트 그리드'}, // 0 Trap      — hi-hats "most defining feature", 808 heavy support (emastered)
  {a808:'Dominant', aDrums:['Trap rolls','Sub-bass punch'],          fx:['리버스 심벌','순간 정적'],       groove:'타이트 그리드'}, // 1 Dark Trap  — distorted dominant 808, dense trap rolls
  {a808:'Balanced', aDrums:['Trap rolls','Crisp hi-hats'],           fx:['라이저','필터 스윕다운'],        groove:'살짝 스윙'},    // 2 Melodic Trap — softer trap pattern, emotional focus
  {a808:'Heavy',    aDrums:['Rolling triplets','Crisp hi-hats'],     fx:['순간 정적','필터 스윕다운'],     groove:'타이트 그리드'}, // 3 NY Drill  — hard-hitting, sliding 808, rolling hi-hat triplets
  {a808:'Heavy',    aDrums:['Rolling triplets','Crisp hi-hats'],     fx:['스네어 롤','임팩트/크래시'],     groove:'타이트 그리드'}, // 4 UK Drill  — "sharper hi-hat triplets", sliding 808 basslines (attackmagazine)
  {a808:'Heavy',    aDrums:['Memphis cowbell chop','Sub-bass punch'], fx:['테이프 스탑','필터 스윕다운'],   groove:'헤비 스윙'},    // 5 Phonk     — TR-808 cowbell+boom bap roots, distorted 808 (wikipedia)
  {a808:'Minimal',  aDrums:['Boom Bap kick','Crisp hi-hats'],        fx:['테이프 스탑','스네어 롤'],       groove:'헤비 스윙'},    // 6 Boom Bap  — "swung drums off the grid", sampled breakbeats, no 808 (orphiq)
  {a808:'Balanced', aDrums:['Crisp hi-hats'],                        fx:['화이트노이즈 스윕','순간 정적'], groove:'살짝 스윙'},    // 7 Cloud Rap — "808s present but not overpowering", minimal drums (routenote)
  {a808:'Minimal',  aDrums:['Boom Bap kick'],                        fx:['테이프 스탑','순간 정적'],       groove:'레이드백 포켓'}, // 8 Lo-fi     — warm analog, dusty boom bap drums, minimal bass
  {a808:'Balanced', aDrums:['Jersey bounce kick','Crisp hi-hats'],  fx:['임팩트/크래시','스네어 롤'],     groove:'푸시드 포켓'},  // 9 Jersey Club — syncopated ghost kicks + eighth-note hats, sidechained 808 (beatkey)
  {a808:'Dominant', aDrums:['Trap rolls','Glitchy breaks'],          fx:['필터 스윕다운','임팩트/크래시'], groove:'타이트 그리드'}, // 10 Rage/Plugg — "heavy distorted sliding 808", 1/16–1/32 hi-hat rolls (melodigging)
  {a808:'Balanced', aDrums:['Afro log drum','Shaker groove','Rolling triplets'],    fx:['스네어 롤','임팩트/크래시'],     groove:'살짝 스윙'},    // 11 Afrotrap  — afro rolling percussion, balanced bass
  {a808:'None',     aDrums:['Boom Bap kick','Crisp hi-hats'],        fx:['순간 정적','테이프 스탑'],       groove:'헤비 스윙'},    // 12 Conscious — organic soulful samples, no 808 (orphiq)
  {a808:'Heavy',    aDrums:['Sub-bass punch','Crisp hi-hats'],       fx:['필터 스윕다운','라이저'],        groove:'레이드백 포켓'}, // 13 Trap Soul — "808 IS the melody", sparse slow 8th hi-hats (beatkey)
  {a808:'Heavy',    aDrums:['Four-on-the-floor kick','Glitchy breaks'], fx:['화이트노이즈 스윕','임팩트/크래시'], groove:'타이트 그리드'}, // 14 Hyperpop  — four-on-floor kick + glitchy chaotic elements
  {a808:'Balanced', aDrums:['Glitchy breaks','Crisp hi-hats'],       fx:['화이트노이즈 스윕','순간 정적'], groove:'타이트 그리드'}, // 15 Digicore  — bedroom digital aesthetic, lo-fi glitch texture
  {a808:'Dominant', aDrums:['Sub-bass punch'],                       fx:['필터 스윕다운','순간 정적'],     groove:'살짝 스윙'},    // 16 Pluggnb   — Zaytoven: "808 bumping, everything else is just extra" (wikipedia)
  {a808:'Minimal',  aDrums:['Live jazz drums','Crisp hi-hats'],      fx:['테이프 스탑','스네어 롤'],       groove:'헤비 스윙'},    // 17 Westwood  — jazz-influenced live drums, quirky organic feel
  {a808:'Dominant', aDrums:['Trap rolls','Sub-bass punch'],          fx:['임팩트/크래시','스네어 롤'],       groove:'타이트 그리드'}, // 18 Trap Metal — heavily distorted clipping 808, downtuned riffs, screamed vocals, aggressive trap rolls
  {a808:'Balanced', aDrums:['Jersey bounce kick','Rolling triplets'], fx:['필터 스윕다운','임팩트/크래시'], groove:'살짝 스윙'},    // 19 Sexy Drill — chopped R&B sample loop, sliding 808, jersey-style bounce kick + drill hats, nonchalant delivery
];

// 전환 효과(브릿지/드롭 전환) — 장르 고르면 GENRE_AUTO.fx로 자동 선택, 직접 바꿀 수도 있음
const HH_TRANSITION_FX=['라이저','리버스 심벌','화이트노이즈 스윕','임팩트/크래시','필터 스윕다운','순간 정적','스네어 롤','테이프 스탑'];
const TRANSITION_FX_TAG={
  '라이저':'riser sweep up','리버스 심벌':'reverse cymbal swell','화이트노이즈 스윕':'white noise sweep',
  '임팩트/크래시':'impact crash hit','필터 스윕다운':'low-pass filter sweep down','순간 정적':'brief silence break',
  '스네어 롤':'rising snare roll','테이프 스탑':'tape stop effect',
};

// 스윙/그루브 느낌(리듬 타이밍) — 장르 고르면 GENRE_AUTO.groove로 자동 선택, 직접 바꿀 수도 있음
const HH_GROOVE=['타이트 그리드','살짝 스윙','헤비 스윙','레이드백 포켓','푸시드 포켓'];
// 훅 2 이후에 그루브가 어떻게 달라지는지 — 스타일 태그엔 스윙이 있는데 훅 섹션엔 언급이 없어서 훅이 그리드형으로 밋밋해질 위험 지적
// Anti-AI가 켜져 있으면 'tight quantized grid, straight rhythm'이 요구하는 인간적 불완전함과 정면충돌(리뷰 지적) — 그리드는 유지하되 사람 손 타이밍을 명시
const grooveText=g=>(antiAI&&g==='타이트 그리드')?'tight groove with subtle human micro-timing':(GROOVE_TAG[g]||'');
const GROOVE_VARY2={
  '타이트 그리드':'hi-hat velocity pattern shifting between bars',
  '살짝 스윙':'swing loosening on the off-beats',
  '헤비 스윙':'MPC swing drifting slightly behind',
  '레이드백 포켓':'kick nudging slightly later',
  '푸시드 포켓':'hats rushing slightly ahead',
};
const TEXTURE_SECTION={
  'Sidechain pump':{hook:'sidechain pumping on bass and pads',verse:'pump eased off'},
  'Bass-heavy':{hook:'sub-heavy low end',verse:'sub weight kept underneath'},
  'Punchy mix':{hook:'punchy transients'},
  'Lo-fi grain':{hook:'gritty grain',verse:'dusty grain',outro:'grain and hiss lingering'},
  'Vintage tape':{hook:'tape-saturated warmth',bridge:'tape wobble',outro:'tape hiss lingering'},
  'Pristine digital':{hook:'clean digital top end'},
  'Polished production':{hook:'glossy polished sheen'},
  'Raw sound':{hook:'raw unpolished edge'},
};
const GROOVE_VARY={
  '타이트 그리드':'ghost-note syncopation added on the off-beats',
  '살짝 스윙':'swing pushed slightly harder in the last 2 bars',
  '헤비 스윙':'MPC swing loosening further',
  '레이드백 포켓':'snare dragging slightly further behind the beat',
  '푸시드 포켓':'kick pushing further ahead of the beat',
};
const GROOVE_TAG={
  '타이트 그리드':'tight quantized grid, straight rhythm',
  '살짝 스윙':'subtle swing groove',
  '헤비 스윙':'heavy swung groove, human MPC-style feel',
  '레이드백 포켓':'laid-back behind-the-beat pocket',
  '푸시드 포켓':'pushed ahead-of-beat urgency',
};

// 멜로디 악기 리드/배경 기본 역할 — 2개 골랐을 때 어느 게 리드인지 자동 판단 (⇄로 바꿀 수 있음)
const MELODY_ROLE={
  'Dark synth':'lead','Emotional piano':'lead','Guitar loop':'lead','Sample chop':'lead','Brass stab':'lead',
  'Ambient pad':'background','Strings':'background','Psychedelic FX':'background',
  'Rhodes keys':'lead','Saxophone':'lead','Supersaw synth':'lead',
  'Flute':'lead','Harp':'lead','Music box':'lead','Organ':'lead','Vibraphone':'lead','Kalimba':'lead','Arp pluck synth':'lead',
  'Cello':'background','Sitar':'background','Vocoder synth':'background',
};
// 리드 멜로디 악기가 섹션마다 어떤 느낌으로 연주되면 좋을지 — 같은 악기라도 인트로/훅/벌스/브릿지/아웃트로마다 다르게
// 장르가 정하는 연주법이 악기 기본값보다 우선 — 기본 기타(핑거피킹·스트러밍)는 트랩 메탈의 다운튜닝 리프와 정반대
const GENRE_ARTICULATION={
  18:{'Guitar loop':{intro:'downtuned distorted riff ringing out',hook:'heavy palm-muted chugging riff',verse:'sparse muted single-note riff',bridge:'sustained feedback drone',outro:'riff decaying into feedback'}},
};
const MELODY_ARTICULATION={
  'Dark synth':{intro:'slow sustained tone',hook:'staccato stabs',verse:'sparse sustained notes',bridge:'rising arpeggiated pattern',outro:'fading sustained tone'},
  'Emotional piano':{intro:'soft single sustained chord',hook:'rhythmic chord stabs',verse:'sparse single-note melody',bridge:'flowing legato run',outro:'slow fading chord'},
  'Guitar loop':{intro:'gentle fingerpicked notes',hook:'tight rhythmic strumming',verse:'fingerpicked pattern',bridge:'muted palm-mute groove',outro:'fingerpicked fade-out'},
  'Sample chop':{intro:'single chopped phrase',hook:'rhythmic chopped stabs',verse:'sparse chopped fragments',bridge:'pitched rising chop',outro:'slowed chopped fade'},
  'Ambient pad':{intro:'soft sustained drone',hook:'wide sustained swell',verse:'quiet static drone',bridge:'slow rising swell',outro:'fading sustained drone'},
  'Brass stab':{intro:'single soft stab',hook:'short punchy stabs',verse:'restrained single stabs',bridge:'sustained rising swell',outro:'held fading stab'},
  'Strings':{intro:'soft legato sustain',hook:'staccato rhythmic hits',verse:'legato sustained bed',bridge:'rising tremolo swell',outro:'slow legato fade'},
  'Psychedelic FX':{intro:'slow sweeping texture',hook:'glitchy stutter bursts',verse:'sparse sweeping texture',bridge:'sweeping rising FX',outro:'fading sweeping texture'},
  'Rhodes keys':{intro:'soft sustained chord',hook:'rhythmic chord stabs',verse:'sparse warm chords',bridge:'flowing chord progression',outro:'slow fading chord'},
  'Saxophone':{intro:'soft held note',hook:'melodic lead line',verse:'sparse improvised phrase',bridge:'rising melodic run',outro:'slow fading phrase'},
  'Supersaw synth':{intro:'soft rising pad',hook:'wide detuned stabs',verse:'thin sustained layer',bridge:'rising detuned swell',outro:'fading detuned pad'},
  'Flute':{intro:'soft breathy held note',hook:'quick fluttering run',verse:'sparse airy phrase',bridge:'rising breathy trill',outro:'slow fading breath tone'},
  'Harp':{intro:'soft rolling glissando',hook:'rhythmic plucked arpeggio',verse:'sparse plucked notes',bridge:'rising cascading glissando',outro:'slow fading pluck'},
  'Music box':{intro:'delicate single chime',hook:'tinkling melodic loop',verse:'sparse chiming notes',bridge:'slowing detuned chime',outro:'fading music box chime'},
  'Organ':{intro:'soft held chord swell',hook:'rhythmic chord stabs',verse:'sparse warm chord',bridge:'rising Leslie swell',outro:'slow fading chord'},
  'Vibraphone':{intro:'soft mallet roll',hook:'rhythmic mallet hits',verse:'sparse mallet notes',bridge:'rising tremolo roll',outro:'slow fading mallet ring'},
  'Kalimba':{intro:'soft plucked pattern',hook:'rhythmic plucked loop',verse:'sparse plucked notes',bridge:'rising plucked run',outro:'fading plucked note'},
  'Arp pluck synth':{intro:'soft rising arpeggio',hook:'rapid plucked arpeggio',verse:'sparse plucked sequence',bridge:'rising pitched arpeggio',outro:'slowing fading arpeggio'},
  'Cello':{intro:'soft sustained low tone',hook:'rhythmic bowed stabs',verse:'sparse sustained low note',bridge:'rising bowed swell',outro:'slow fading low tone'},
  'Sitar':{intro:'droning sustained tone',hook:'rhythmic plucked buzz',verse:'sparse droning texture',bridge:'rising sliding drone',outro:'fading droning tone'},
  'Vocoder synth':{intro:'soft robotic sustained tone',hook:'rhythmic robotic stabs',verse:'sparse robotic texture',bridge:'rising pitched sweep',outro:'fading robotic tone'},
};
// 멜로디 2개 선택 시 리드/배경 자동 배정 — st.melodyLeadIdx로 사용자가 ⇄ 바꾼 상태 반영
function computeMelodyRoles(arr){
  if(!arr||arr.length!==2)return null;
  let leadIdx=(MELODY_ROLE[arr[0]]!=='lead'&&MELODY_ROLE[arr[1]]==='lead')?1:0;
  if(st.melodyLeadIdx===1)leadIdx=1-leadIdx;
  return {lead:arr[leadIdx],bg:arr[1-leadIdx]};
}
function renderMelodyRoleUI(){
  const box=document.getElementById('hh-melody-roles');
  if(!box)return;
  const roles=computeMelodyRoles(st.melody);
  box.hidden=!roles;
  if(roles){
    box.querySelector('.mr-lead').textContent=roles.lead;
    box.querySelector('.mr-bg').textContent=roles.bg;
  }
}
function swapMelodyRoles(){
  st.melodyLeadIdx=st.melodyLeadIdx?0:1;
  renderMelodyRoleUI();
}

// 장르별 기본 무드 (큐레이션 아티스트 곡 클릭 시 — 실제 오디오 분석 없이도 무드를 채워주기 위한 장르 기반 추정)
const GENRE_DEFAULT_MOOD=[
  '에너제틱·하입','어둡고 위압적','멜로딕·감성','분노·공격적','어둡고 위압적','어둡고 위압적',
  '칠·그루비','사이키델릭·몽환','칠·그루비','에너제틱·하입','분노·공격적','에너제틱·하입',
  '내성적·사색','감각적·관능적','에너제틱·하입','에너제틱·하입','사이키델릭·몽환','내성적·사색',
  '분노·공격적','감각적·관능적',
];

// ============================================================
// 멜로디·믹스 텍스처 추천 스코어링 — 장르 하나만 보는 고정 룰이 아니라
// 장르(1순위) + 무드(2순위) + 시대감(보정) 신호를 합산해서 매번 조합에 맞게 상위 2개를 고름
// ============================================================
// 장르의 정체성이 특정 악기의 리드 역할에 달린 경우(트랩 메탈=기타 리프) — 그 악기가 추천 2개 안에 들면 리드로
const GENRE_LEAD={18:'Guitar loop'};
const GENRE_MELODY_TIPS={
  0:'Dark synth + Guitar loop', 1:'Dark synth + Ambient pad',
  2:'Emotional piano + Ambient pad', 3:'Dark synth + Strings',
  4:'Strings + Dark synth', 5:'Dark synth + Psychedelic FX',
  6:'Sample chop + Saxophone', 7:'Ambient pad + Emotional piano',
  8:'Rhodes keys + Guitar loop', 9:'Sample chop + Guitar loop',
  10:'Dark synth + Psychedelic FX', 11:'Guitar loop + Ambient pad',
  12:'Saxophone + Emotional piano', 13:'Rhodes keys + Ambient pad',
  14:'Psychedelic FX + Supersaw synth', 15:'Supersaw synth + Psychedelic FX',
  16:'Ambient pad + Emotional piano', 17:'Saxophone + Guitar loop',
  18:'Guitar loop + Dark synth', 19:'Rhodes keys + Sample chop',
};
const MOOD_MELODY_FIT={
  '어둡고 위압적':['Dark synth','Strings'], '감각적·관능적':['Rhodes keys','Guitar loop'],
  '멜로딕·감성':['Emotional piano','Guitar loop'], '에너제틱·하입':['Brass stab','Sample chop'],
  '사이키델릭·몽환':['Psychedelic FX','Ambient pad'], '칠·그루비':['Rhodes keys','Ambient pad'],
  '분노·공격적':['Dark synth','Sample chop'], '내성적·사색':['Ambient pad','Emotional piano'],
  '축제·환희':['Brass stab','Sample chop'], '승리감·웅장':['Strings','Brass stab'],
  '슬프고·멜랑콜리':['Emotional piano','Ambient pad'], '자신감·플렉스':['Sample chop','Brass stab'],
  '로맨틱·달콤한':['Emotional piano','Strings'], '긴장감·서스펜스':['Strings','Psychedelic FX'],
  '노스탤직·향수':['Saxophone','Guitar loop'], '미스터리·신비':['Psychedelic FX','Strings'],
};
// 리드 멜로디 악기 자체의 음색 — 믹스 전체 텍스처(09번)와는 별개로 "그 악기가 어떤 톤으로 녹음됐는지"
const HH_MELODY_TONE=['웜·아날로그','브라이트·클린','빈티지·러프','디스토티드·그릿','소프트·머플드'];
const MELODY_TONE_TAG={
  '웜·아날로그':'warm analog','브라이트·클린':'bright clean','빈티지·러프':'vintage worn',
  '디스토티드·그릿':'distorted gritty','소프트·머플드':'soft mellow',
};
const GENRE_MELODY_TONE={
  0:'브라이트·클린',1:'디스토티드·그릿',2:'웜·아날로그',3:'디스토티드·그릿',4:'디스토티드·그릿',
  5:'빈티지·러프',6:'빈티지·러프',7:'소프트·머플드',8:'소프트·머플드',9:'브라이트·클린',
  10:'디스토티드·그릿',11:'웜·아날로그',12:'웜·아날로그',13:'웜·아날로그',14:'브라이트·클린',
  15:'디스토티드·그릿',16:'소프트·머플드',17:'빈티지·러프',
  18:'디스토티드·그릿',19:'웜·아날로그',
};
const MOOD_MELODY_TONE={
  '어둡고 위압적':['디스토티드·그릿'],'감각적·관능적':['웜·아날로그'],'멜로딕·감성':['웜·아날로그'],
  '에너제틱·하입':['브라이트·클린'],'사이키델릭·몽환':['소프트·머플드'],'칠·그루비':['웜·아날로그'],
  '분노·공격적':['디스토티드·그릿'],'내성적·사색':['소프트·머플드'],'축제·환희':['브라이트·클린'],
  '승리감·웅장':['브라이트·클린'],'슬프고·멜랑콜리':['웜·아날로그'],'자신감·플렉스':['브라이트·클린'],
  '로맨틱·달콤한':['웜·아날로그'],'긴장감·서스펜스':['디스토티드·그릿'],'노스탤직·향수':['빈티지·러프'],
  '미스터리·신비':['소프트·머플드'],
};
// 편곡 포인트에 무드 보정 문구를 덧붙였던 것과 같은 패턴 — 톤 카테고리(5개)는 그대로 쓰되, 무드별 뉘앙스를 한 겹 더 얹어서 스타일 태그를 더 구체적으로 만듦
// 각 무드당 2개씩 — Generate 누를 때마다 pick()으로 무작위 하나 골라서 같은 설정이어도 문구가 조금씩 달라지게 함
const MOOD_TONE_NUANCE={
  '어둡고 위압적':['heavily saturated','ominously thick'],'감각적·관능적':['softly rounded','smoothly sensual'],
  '멜로딕·감성':['gently breathing','tenderly emotive'],'에너제틱·하입':['crisp and forward','punchy and alive'],
  '사이키델릭·몽환':['swirling and hazy','dreamily blurred'],'칠·그루비':['loose and relaxed','easygoing and warm'],
  '분노·공격적':['harsh and biting','raw and violent'],'내성적·사색':['delicately fragile','quietly restrained'],
  '축제·환희':['bright and shimmering','joyfully vivid'],'승리감·웅장':['thick and towering','epically massive'],
  '슬프고·멜랑콜리':['thin and fragile','mournfully faint'],'자신감·플렉스':['bold and present','swaggering and confident'],
  '로맨틱·달콤한':['silky and smooth','tenderly warm'],'긴장감·서스펜스':['tightly wound','nervously coiled'],
  '노스탤직·향수':['faded and worn','sepia-toned and warm'],'미스터리·신비':['distant and veiled','cryptically hushed'],
};
// 808 베이스 톤 뉘앙스 — {레벨} 808 태그 뒤에 무드별로 한 번 더 붙임
const MOOD_808_NUANCE={
  '어둡고 위압적':['deep and menacing','ominously rumbling'],'감각적·관능적':['warm and rounded','smoothly rolling'],
  '멜로딕·감성':['melodically tuned','emotionally resonant'],'에너제틱·하입':['punchy and forward','tight and snappy'],
  '사이키델릭·몽환':['woozy and detuned','hazy and floating'],'칠·그루비':['loose and bouncy','relaxed and round'],
  '분노·공격적':['distorted and gritty','aggressively driving'],'내성적·사색':['soft and distant','subdued and quiet'],
  '축제·환희':['bright and bouncy','festival-ready punchy'],'승리감·웅장':['massive and towering','epic and booming'],
  '슬프고·멜랑콜리':['fragile and thin','mournfully sustained'],'자신감·플렉스':['confidently punchy','bold and present'],
  '로맨틱·달콤한':['soft and silky','gently rounded'],'긴장감·서스펜스':['tightly wound','ominously pulsing'],
  '노스탤직·향수':['warm vintage tone','faded and worn'],'미스터리·신비':['distant and veiled','mysteriously muted'],
};
// 드럼 연주 뉘앙스 — 드럼 태그 리스트 뒤에 한 번만 붙는 연주 형용사
const MOOD_DRUMS_NUANCE={
  '어둡고 위압적':['menacingly tight','ominously precise'],'감각적·관능적':['smoothly swung','sensually loose'],
  '멜로딕·감성':['gently played','emotionally restrained'],'에너제틱·하입':['energetically driving','relentlessly pushing'],
  '사이키델릭·몽환':['loosely hazy','dreamily swung'],'칠·그루비':['laid-back groovy','loosely relaxed'],
  '분노·공격적':['aggressively pounding','violently driving'],'내성적·사색':['minimally restrained','quietly sparse'],
  '축제·환희':['energetically bouncy','festival-driving'],'승리감·웅장':['powerfully marching','epically driving'],
  '슬프고·멜랑콜리':['softly subdued','fragile and sparse'],'자신감·플렉스':['confidently swaggering','boldly strutting'],
  '로맨틱·달콤한':['gently swaying','softly tender'],'긴장감·서스펜스':['tightly wound','anxiously ticking'],
  '노스탤직·향수':['loosely vintage','warmly worn'],'미스터리·신비':['sparsely mysterious','quietly cryptic'],
};
// 그루브 태그 뒤에 붙는 무드 뉘앙스
const MOOD_GROOVE_NUANCE={
  '어둡고 위압적':['with ominous weight','with menacing restraint'],'감각적·관능적':['with sensual sway','with smooth undulation'],
  '멜로딕·감성':['with emotional breathing room','with gentle rubato'],'에너제틱·하입':['with relentless drive','with forward momentum'],
  '사이키델릭·몽환':['with woozy drift','with hazy sway'],'칠·그루비':['with laid-back ease','with relaxed bounce'],
  '분노·공격적':['with aggressive push','with violent drive'],'내성적·사색':['with quiet restraint','with sparse hesitation'],
  '축제·환희':['with festival bounce','with joyful lift'],'승리감·웅장':['with triumphant march','with epic weight'],
  '슬프고·멜랑콜리':['with mournful drag','with fragile hesitation'],'자신감·플렉스':['with confident swagger','with bold strut'],
  '로맨틱·달콤한':['with tender sway','with gentle lilt'],'긴장감·서스펜스':['with anxious tension','with tightly coiled energy'],
  '노스탤직·향수':['with vintage looseness','with warm nostalgia'],'미스터리·신비':['with cryptic hesitation','with veiled restraint'],
};
// 믹스 텍스처 태그 뒤에 붙는 무드 뉘앙스
const MOOD_TEXTURE_NUANCE={
  '어둡고 위압적':['with an ominous sheen','with menacing depth'],'감각적·관능적':['with a sensual glow','with smooth warmth'],
  '멜로딕·감성':['with emotional clarity','with gentle warmth'],'에너제틱·하입':['with forward energy','with punchy presence'],
  '사이키델릭·몽환':['with a hazy shimmer','with woozy blur'],'칠·그루비':['with a relaxed glow','with laid-back warmth'],
  '분노·공격적':['with a gritty edge','with aggressive bite'],'내성적·사색':['with quiet subtlety','with understated depth'],
  '축제·환희':['with a bright shimmer','with festive sparkle'],'승리감·웅장':['with epic scale','with towering presence'],
  '슬프고·멜랑콜리':['with a fragile haze','with mournful thinness'],'자신감·플렉스':['with bold presence','with confident sheen'],
  '로맨틱·달콤한':['with a silky glow','with tender warmth'],'긴장감·서스펜스':['with a tense edge','with anxious clarity'],
  '노스탤직·향수':['with a faded warmth','with vintage haze'],'미스터리·신비':['with a veiled shimmer','with cryptic depth'],
};
const GENRE_TEXTURE_TIPS={
  0:'Sidechain pump + Bass-heavy', 1:'Heavy reverb + Bass-heavy',
  2:'Stereo wide + Heavy reverb', 3:'Dry intimate + Bass-heavy',
  4:'Dry intimate + Bass-heavy', 5:'Lo-fi grain + Vintage tape',
  6:'Vintage tape + Lo-fi grain', 7:'Heavy reverb + Stereo wide',
  8:'Lo-fi grain + Vintage tape', 9:'Sidechain pump + Bass-heavy',
  10:'Pristine digital + Bass-heavy', 11:'Stereo wide + Sidechain pump',
  12:'Vintage tape + Dry intimate', 13:'Heavy reverb + Dry intimate',
  14:'Pristine digital + Stereo wide', 15:'Lo-fi grain + Pristine digital',
  16:'Heavy reverb + Bass-heavy', 17:'Vintage tape + Dry intimate',
  18:'Raw sound + Bass-heavy', 19:'Dry intimate + Vintage tape',
};
const MOOD_TEXTURE_FIT={
  '어둡고 위압적':['Heavy reverb','Bass-heavy'], '감각적·관능적':['Dry intimate','Heavy reverb'],
  '멜로딕·감성':['Stereo wide','Heavy reverb'], '에너제틱·하입':['Sidechain pump','Bass-heavy'],
  '사이키델릭·몽환':['Heavy reverb','Stereo wide'], '칠·그루비':['Vintage tape','Dry intimate'],
  '분노·공격적':['Punchy mix','Bass-heavy'], '내성적·사색':['Raw sound','Dry intimate'],
  '축제·환희':['Sidechain pump','Stereo wide'], '승리감·웅장':['Polished production','Stereo wide'],
  '슬프고·멜랑콜리':['Dry intimate','Heavy reverb'], '자신감·플렉스':['Punchy mix','Bass-heavy'],
  '로맨틱·달콤한':['Dry intimate','Heavy reverb'], '긴장감·서스펜스':['Dry intimate','Heavy reverb'],
  '노스탤직·향수':['Vintage tape','Lo-fi grain'], '미스터리·신비':['Heavy reverb','Lo-fi grain'],
};
// 시대감(era) 축 — 빈티지(테이프/로파이) vs 디지털(프리스틴/스테레오) 보정용, 텍스처 채점에만 사용
const ERA_TEXTURE_BOOST={
  '90s':['Vintage tape','Lo-fi grain'], '2000s':['Vintage tape','Dry intimate'],
  '2010s':['Stereo wide','Sidechain pump'], '2020s':['Pristine digital','Stereo wide'],
};
// 드럼은 지금까지 GENRE_AUTO(장르 고정 2개)로만 정해지고 무드가 바뀌어도 다시 안 뽑혔음(멜로디/텍스처는 이미
// scorePick으로 장르+무드 둘 다 봄) — 같은 패턴으로 드럼도 무드를 반영하도록 함. GENRE_DRUMS_TIPS는 기존
// GENRE_AUTO[i].aDrums랑 그대로 맞춰서, 무드가 안 갈리면 결과가 똑같이 나옴(회귀 없음)
const GENRE_DRUMS_TIPS={
  0:'Trap rolls + Crisp hi-hats', 1:'Trap rolls + Sub-bass punch',
  2:'Trap rolls + Crisp hi-hats', 3:'Rolling triplets + Crisp hi-hats',
  4:'Rolling triplets + Crisp hi-hats', 5:'Memphis cowbell chop + Sub-bass punch',
  6:'Boom Bap kick + Crisp hi-hats', 7:'Crisp hi-hats',
  8:'Boom Bap kick', 9:'Jersey bounce kick + Crisp hi-hats',
  10:'Trap rolls + Glitchy breaks', 11:'Afro log drum + Shaker groove + Rolling triplets',
  12:'Boom Bap kick + Crisp hi-hats', 13:'Sub-bass punch + Crisp hi-hats',
  14:'Four-on-the-floor kick + Glitchy breaks', 15:'Glitchy breaks + Crisp hi-hats',
  16:'Sub-bass punch', 17:'Live jazz drums + Crisp hi-hats',
  18:'Sub-bass punch + Trap rolls', 19:'Jersey bounce kick + Rolling triplets',
};
// 전환 효과도 무드를 반영 — 예전엔 GENRE_AUTO.fx(장르 고정)라 슬픈 곡도 임팩트 크래시·라이저로 열고 닫았음. 장르 기본 2개가 기준, 무드가 그 안에서 순서를 바꾸거나 대체
const MOOD_FX_FIT={
  '어둡고 위압적':['순간 정적','필터 스윕다운'],'감각적·관능적':['필터 스윕다운','리버스 심벌'],'멜로딕·감성':['리버스 심벌','라이저'],
  '에너제틱·하입':['라이저','스네어 롤'],'사이키델릭·몽환':['화이트노이즈 스윕','테이프 스탑'],'칠·그루비':['테이프 스탑','필터 스윕다운'],
  '분노·공격적':['임팩트/크래시','스네어 롤'],'내성적·사색':['순간 정적','필터 스윕다운'],'축제·환희':['라이저','임팩트/크래시'],
  '승리감·웅장':['스네어 롤','임팩트/크래시'],'슬프고·멜랑콜리':['필터 스윕다운','테이프 스탑'],'자신감·플렉스':['순간 정적','임팩트/크래시'],
  '로맨틱·달콤한':['리버스 심벌','필터 스윕다운'],'긴장감·서스펜스':['라이저','순간 정적'],'노스탤직·향수':['테이프 스탑','화이트노이즈 스윕'],
  '미스터리·신비':['리버스 심벌','순간 정적'],
};
// 무드가 주도하고(3/2점) 장르 기본 전환효과는 동점 정리용 보너스 — 장르가 주도하면(3점) 슬픈 트랩도 임팩트 크래시+라이저로 남았음(실측)
const MOOD_FX_TIPS=Object.fromEntries(Object.entries(MOOD_FX_FIT).map(([m,fx])=>[m,fx.join(' + ')]));
const GENRE_DRUM_BONUS={11:['Afro log drum','Shaker groove']};
const MOOD_DRUMS_FIT={
  '어둡고 위압적':['Trap rolls','Sub-bass punch'], '감각적·관능적':['Crisp hi-hats','Sub-bass punch'],
  '멜로딕·감성':['Trap rolls','Crisp hi-hats'], '에너제틱·하입':['Four-on-the-floor kick','Rolling triplets'],
  '사이키델릭·몽환':['Glitchy breaks','Crisp hi-hats'], '칠·그루비':['Boom Bap kick','Crisp hi-hats'],
  '분노·공격적':['Trap rolls','Sub-bass punch'], '내성적·사색':['Boom Bap kick','Sub-bass punch'],
  '축제·환희':['Four-on-the-floor kick','Jersey bounce kick'], '승리감·웅장':['Trap rolls','Sub-bass punch'],
  '슬프고·멜랑콜리':['Boom Bap kick','Crisp hi-hats'], '자신감·플렉스':['Trap rolls','Sub-bass punch'],
  '로맨틱·달콤한':['Crisp hi-hats','Boom Bap kick'], '긴장감·서스펜스':['Rolling triplets','Glitchy breaks'],
  '노스탤직·향수':['Live jazz drums','Boom Bap kick'], '미스터리·신비':['Glitchy breaks','Sub-bass punch'],
};

// 808 강도·그루브도 드럼과 같은 패턴으로 무드를 반영 — 예전엔 GENRE_AUTO(장르 고정값)가 무드를 바꿔도 그대로여서
// 같은 장르면 "어두운"이든 "로맨틱"이든 808 세기·타이밍 감이 똑같았음(문구 뉘앙스만 무드별로 달랐음).
// 장르가 기준점이고 무드는 그 안에서만 움직임: 808은 ±1단계(장르가 808 자체를 안 쓰면 None 유지), 그루브는 장르가 허용하는 2개 안에서만 선택
const MOOD_808_DELTA={
  '어둡고 위압적':1,'분노·공격적':1,'승리감·웅장':1,
  '내성적·사색':-1,'슬프고·멜랑콜리':-1,'로맨틱·달콤한':-1,'노스탤직·향수':-1,'미스터리·신비':-1,
};
// 장르별로 어울리는 그루브 2개(첫 번째 = GENRE_AUTO 기본값, 두 번째 = 무드에 따라 바뀔 수 있는 대안) — 무드가 장르 정체성(예: 드릴은 레이드백 X)을 깨지 않게
const GENRE_GROOVE_ALT=['살짝 스윙','레이드백 포켓','레이드백 포켓','푸시드 포켓','살짝 스윙','레이드백 포켓','레이드백 포켓','레이드백 포켓','헤비 스윙','타이트 그리드','푸시드 포켓','푸시드 포켓','레이드백 포켓','살짝 스윙','푸시드 포켓','푸시드 포켓','레이드백 포켓','살짝 스윙','푸시드 포켓','푸시드 포켓'];
const GENRE_GROOVE_TIPS=Object.fromEntries(GENRE_AUTO.map((a,i)=>[i,`${a.groove} + ${GENRE_GROOVE_ALT[i]}`]));
const MOOD_GROOVE_FIT={
  '어둡고 위압적':['타이트 그리드','레이드백 포켓'],'감각적·관능적':['레이드백 포켓','살짝 스윙'],
  '멜로딕·감성':['살짝 스윙','레이드백 포켓'],'에너제틱·하입':['푸시드 포켓','타이트 그리드'],
  '사이키델릭·몽환':['레이드백 포켓','헤비 스윙'],'칠·그루비':['레이드백 포켓','헤비 스윙'],
  '분노·공격적':['푸시드 포켓','타이트 그리드'],'내성적·사색':['레이드백 포켓','살짝 스윙'],
  '축제·환희':['푸시드 포켓','살짝 스윙'],'승리감·웅장':['타이트 그리드','푸시드 포켓'],
  '슬프고·멜랑콜리':['레이드백 포켓','살짝 스윙'],'자신감·플렉스':['살짝 스윙','타이트 그리드'],
  '로맨틱·달콤한':['살짝 스윙','레이드백 포켓'],'긴장감·서스펜스':['타이트 그리드','푸시드 포켓'],
  '노스탤직·향수':['헤비 스윙','레이드백 포켓'],'미스터리·신비':['레이드백 포켓','타이트 그리드'],
};

// 악기 톤 카테고리와 무드 뉘앙스가 서로 반대일 수 있음(예: "distorted gritty" + "gently breathing" — 리뷰가 "부드러운지 거친지 모호"하다고 지적, 320조합 중 38건) —
// 톤과 충돌하는 뉘앙스 후보는 빼고 고름 (남는 게 없으면 톤만)
const SOFT_NUANCE=/gentl|tender|silky|soft|delicate|quiet|fragile|thin|faint|hush|breath|smooth|dream|swirl|loose|easygoing|mourn/i;
const HARSH_NUANCE=/harsh|violent|biting|saturated|menac|raw|coiled/i;
function compatibleToneNuance(mood){
  const opts=(MOOD_TONE_NUANCE[mood]||[]).filter(n=>!(st.melodyTone==='디스토티드·그릿'&&SOFT_NUANCE.test(n))&&!(st.melodyTone==='소프트·머플드'&&HARSH_NUANCE.test(n)));
  return opts.length?pick(opts):'';
}
// 배열(또는 문자열)에서 하나 무작위로 — 문자열이면 그대로 반환. Generate 누를 때마다 문구가 조금씩 달라지게 하는 데 씀
function pick(v){return Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;}

// 장르 3점/2점 + 무드 2점/1점 + (있으면) 보너스 1점씩 합산 → 점수 내림차순 정렬. 조합이 다르면 결과도 다름
function scorePick(options,genreTips,moodFit,genreIdx,moodKr,bonus){
  const scores={};
  options.forEach(o=>scores[o]=0);
  const gc=genreTips[genreIdx];
  if(gc)gc.split(' + ').forEach((o,i)=>{if(o in scores)scores[o]+=(i===0?3:2);});
  const mf=moodFit[moodKr];
  if(mf)mf.forEach((o,i)=>{if(o in scores)scores[o]+=(i===0?2:1);});
  if(bonus)bonus.forEach(o=>{if(o in scores)scores[o]+=1;});
  return options.slice().sort((a,b)=>scores[b]-scores[a]||options.indexOf(a)-options.indexOf(b));
}

// 텍스처 추천이 서로 모순되는 쌍을 고를 수 있었음 — 장르 표(Trap Soul: Heavy reverb + Dry intimate)와 무드 표(감각적·슬픈·로맨틱·긴장감: Dry intimate + Heavy reverb)가
// 스스로 상반된 쌍을 내놔서 스타일 태그에 "dry intimate & heavy reverb"가 같이 들어갔음 (측정: 640조합 중 다수). 상위부터 채우되 이미 고른 것과 충돌하는 건 건너뜀
const TEXTURE_CLASH=[['Dry intimate','Heavy reverb'],['Dry intimate','Stereo wide'],['Pristine digital','Lo-fi grain'],['Pristine digital','Vintage tape'],['Pristine digital','Raw sound'],['Polished production','Raw sound'],['Polished production','Lo-fi grain']];
const texturesClash=(x,y)=>TEXTURE_CLASH.some(([p,q])=>(p===x&&q===y)||(p===y&&q===x));
function pickCompatibleTextures(ranked,n=2){
  const chosen=[];
  for(const t of ranked){
    if(chosen.length>=n)break;
    if(chosen.some(c=>texturesClash(c,t)))continue;
    chosen.push(t);
  }
  return chosen;
}
// 배경 악기가 리드와 같은 성질(둘 다 저역, 또는 둘 다 넓게 깔리는 지속음)이면 마스킹 — 상위 후보 중 다른 성질(짧은 트랜지언트·다른 대역)로 교체, 없으면 트랜지언트 기본 후보
function complementBg(lead,bg,ranked){
  const clash=(x,y)=>(MELODY_REGISTER[x]==='low'&&MELODY_REGISTER[y]==='low')||(MELODY_SUSTAINED.has(x)&&MELODY_SUSTAINED.has(y));
  if(!clash(lead,bg))return bg;
  const pool=[...ranked.slice(2,8),'Arp pluck synth','Kalimba','Sample chop'];
  return pool.find(m=>m!==lead&&!MELODY_SUSTAINED.has(m)&&MELODY_REGISTER[m]!=='low')||bg;
}
// 장르·무드(+시대감)를 보고 멜로디 리드/배경 + 믹스 텍스처 2개를 자동 추천 — 음악 지식 없이도 기본값이 채워지도록
function recommendMelodyTexture(){
  if(st.genre===null)return;
  const rankedMelody=scorePick(HH_MELODY,GENRE_MELODY_TIPS,MOOD_MELODY_FIT,st.genre,st.mood,null);
  let [lead,bg]=rankedMelody;
  // 둘 다 저역 지속음이면 상위 후보 중 대역이 다른 악기로 배경을 교체 (예: Dark synth + Ambient pad → 밝은 플럭/벨 계열)
  bg=complementBg(lead,bg,rankedMelody);
  if(GENRE_LEAD[st.genre]&&GENRE_LEAD[st.genre]===bg)[lead,bg]=[bg,lead];
  st.melody=[lead,bg];
  st.melodyLeadIdx=(MELODY_ROLE[lead]!=='lead'&&MELODY_ROLE[bg]==='lead')?1:0;

  const rankedTexture=scorePick(HH_TEXTURE,GENRE_TEXTURE_TIPS,MOOD_TEXTURE_FIT,st.genre,st.mood,ERA_TEXTURE_BOOST[st.era]);
  st.texture=pickCompatibleTextures(rankedTexture);

  const rankedTone=scorePick(HH_MELODY_TONE,GENRE_MELODY_TONE,MOOD_MELODY_TONE,st.genre,st.mood,null);
  st.melodyTone=rankedTone[0];

  // 드럼도 멜로디/텍스처랑 같은 방식으로 장르+무드 둘 다 반영 — 예전엔 GENRE_AUTO(장르만) 값이 무드를 바꿔도 그대로였음
  // 아프로 트랩은 로그드럼 + 샤커(중역대 퍼커션 질감) + 트랩 하이햇 3개가 정체성 — 무드 추천(예: 킥 패턴)이 샤커를 밀어내지 않게 보너스, 개수도 3개
  const rankedDrums=scorePick(HH_DRUMS,GENRE_DRUMS_TIPS,MOOD_DRUMS_FIT,st.genre,st.mood,GENRE_DRUM_BONUS[st.genre]);
  st.drums=rankedDrums.slice(0,(GENRE_DRUMS_TIPS[st.genre]||'').split(' + ').length>=3?3:2);

  recommendRhythm();
  chipGrid(document.getElementById('hh-melody'),HH_MELODY,st,'melody',2,onMelodyManualChange);
  renderMelodyRoleUI();
  chipGrid(document.getElementById('hh-texture'),HH_TEXTURE,st,'texture',2,onTextureManualChange);
  chipGrid(document.getElementById('hh-melody-tone'),HH_MELODY_TONE,st,'melodyTone',1,null);
  chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,onDrumsManualChange);
  setAutoHint('hh-melody-hint',`${lead} + ${bg}`);
  setAutoHint('hh-texture-hint',st.texture.join(', '));
  setAutoHint('hh-melody-tone-hint',st.melodyTone);
  setAutoHint('hh-drums-hint',st.drums.join(', '));
  st._mtAutoManaged=true;
  recommendVocalChar();
}
function recommendRhythm(){
  const auto=GENRE_AUTO[st.genre];
  if(!auto)return;
  const base=HH_808.indexOf(auto.a808);
  st._808=base>0?HH_808[Math.min(HH_808.length-1,Math.max(1,base+(MOOD_808_DELTA[st.mood]||0)))]:auto.a808;
  // bonus: 무드의 1순위 그루브에 +1 — 장르 기본값과 동점일 때(예: 하이퍼팝 타이트 vs 에너제틱의 푸시드) 조용히 장르 쪽으로 밀리지 않게
  st.groove=scorePick(HH_GROOVE,GENRE_GROOVE_TIPS,MOOD_GROOVE_FIT,st.genre,st.mood,MOOD_GROOVE_FIT[st.mood]?.slice(0,1))[0];
  chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,onRhythmManualChange);
  chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,onRhythmManualChange);
  setAutoHint('hh-808-hint','808: '+st._808);
  setAutoHint('hh-groove-hint',st.groove);
  st.transitionFx=st.mood?scorePick(HH_TRANSITION_FX,MOOD_FX_TIPS,{},st.mood,null,auto.fx).slice(0,2):[...auto.fx];
  chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,onRhythmManualChange);
  setAutoHint('hh-fx-hint',st.transitionFx.join(', '));
}
// 808/그루브를 직접 만지면 이후 무드 변경이 덮어쓰지 않게 — 드럼과 같은 플래그
function onRhythmManualChange(){
  st._mtAutoManaged=false;
}
function onDrumsManualChange(){
  st._mtAutoManaged=false;
}
function onMelodyManualChange(){
  st._mtAutoManaged=false;
  renderMelodyRoleUI();
}
function onTextureManualChange(){
  st._mtAutoManaged=false;
}

// ============================================================
// 보컬 녹음 질감 — vocal이 켜져 있을 때만 의미 있음 (디폴트는 No Vocal)
// 마이크 거리감·리버브양이 실제 결과를 크게 바꾼다는 프로듀서 팁 반영
// ============================================================
const HH_VOCAL_CHAR=['클로즈·드라이','헤비 컴프레션','인티밋 라이브룸','스타디움 리버브','미니멀 리버브'];
const VOCAL_CHAR_TAG={
  '클로즈·드라이':'extreme proximity to the mic, dry without reverb',
  '헤비 컴프레션':'processed via heavy compression',
  '인티밋 라이브룸':'intimate live room feel',
  '스타디움 리버브':'stadium-sized reverb',
  '미니멀 리버브':'minimal reverb',
};
const GENRE_VOCAL_CHAR={
  0:'클로즈·드라이',1:'클로즈·드라이',2:'헤비 컴프레션',3:'클로즈·드라이',4:'클로즈·드라이',
  5:'인티밋 라이브룸',6:'인티밋 라이브룸',7:'스타디움 리버브',8:'미니멀 리버브',9:'헤비 컴프레션',
  10:'클로즈·드라이',11:'헤비 컴프레션',12:'인티밋 라이브룸',13:'헤비 컴프레션',14:'헤비 컴프레션',
  15:'클로즈·드라이',16:'인티밋 라이브룸',17:'인티밋 라이브룸',
  18:'헤비 컴프레션',19:'클로즈·드라이',
};
const MOOD_VOCAL_CHAR={
  '어둡고 위압적':['클로즈·드라이'],'감각적·관능적':['인티밋 라이브룸'],'멜로딕·감성':['헤비 컴프레션'],
  '에너제틱·하입':['스타디움 리버브'],'사이키델릭·몽환':['스타디움 리버브'],'칠·그루비':['미니멀 리버브'],
  '분노·공격적':['클로즈·드라이'],'내성적·사색':['인티밋 라이브룸'],'축제·환희':['스타디움 리버브'],
  '승리감·웅장':['스타디움 리버브'],'슬프고·멜랑콜리':['인티밋 라이브룸'],'자신감·플렉스':['헤비 컴프레션'],
  '로맨틱·달콤한':['인티밋 라이브룸'],'긴장감·서스펜스':['클로즈·드라이'],'노스탤직·향수':['미니멀 리버브'],
  '미스터리·신비':['클로즈·드라이'],
};
// GENRE_VOCAL_CHAR 값은 scorePick이 기대하는 "X + Y" 포맷과 호환되도록 단일 문자열 그대로 사용(split해도 1개짜리 배열이 됨)
function recommendVocalChar(){
  const box=document.getElementById('hh-vocal-char-box');
  if(!box)return;
  if(!st.vocal||st.vocal==='No Vocal'){box.hidden=true;st.vocalChar=null;return;}
  box.hidden=false;
  const ranked=st.genre!==null?scorePick(HH_VOCAL_CHAR,GENRE_VOCAL_CHAR,MOOD_VOCAL_CHAR,st.genre,st.mood,null):HH_VOCAL_CHAR;
  st.vocalChar=ranked[0];
  chipGrid(document.getElementById('hh-vocal-char'),HH_VOCAL_CHAR,st,'vocalChar',1,null);
  setAutoHint('hh-vocal-char-hint',st.vocalChar);
  recommendVocalStyle();
}

// 보컬 "스타일"(톤·감정 전달 방식) — 녹음 질감(마이크 거리감)과는 다른 축. vocal이 켜져 있을 때만 표시
const HH_VOCAL_STYLE=['소울풀','파워풀','브리시·위스퍼','감성적','클린'];
const VOCAL_STYLE_TAG={
  '소울풀':'soulful voice','파워풀':'powerful voice','브리시·위스퍼':'breathy whisper vocal',
  '감성적':'emotional vocal','클린':'clean vocal tone',
};
const GENRE_VOCAL_STYLE={
  0:'파워풀',1:'파워풀',2:'감성적',3:'파워풀',4:'파워풀',
  5:'소울풀',6:'소울풀',7:'브리시·위스퍼',8:'브리시·위스퍼',9:'파워풀',
  10:'파워풀',11:'소울풀',12:'소울풀',13:'감성적',14:'파워풀',
  15:'브리시·위스퍼',16:'브리시·위스퍼',17:'소울풀',
  18:'파워풀',19:'브리시·위스퍼',
};
const MOOD_VOCAL_STYLE={
  '어둡고 위압적':['파워풀'],'감각적·관능적':['브리시·위스퍼'],'멜로딕·감성':['감성적'],
  '에너제틱·하입':['파워풀'],'사이키델릭·몽환':['브리시·위스퍼'],'칠·그루비':['소울풀'],
  '분노·공격적':['파워풀'],'내성적·사색':['감성적'],'축제·환희':['파워풀'],
  '승리감·웅장':['파워풀'],'슬프고·멜랑콜리':['감성적'],'자신감·플렉스':['소울풀'],
  '로맨틱·달콤한':['브리시·위스퍼'],'긴장감·서스펜스':['감성적'],'노스탤직·향수':['소울풀'],
  '미스터리·신비':['브리시·위스퍼'],
};
// 편곡 포인트 조언에 무드별 보정 문구를 덧붙임 — 장르만으로는 무드가 다른 두 곡이 똑같은 조언을 받는 문제 보완
const MOOD_ARRANGE_TIP={
  '어둡고 위압적':'긴장감을 유지하려면 급격한 다이내믹 변화보다 낮게 깔린 텐션을 끌고 가세요.',
  '감각적·관능적':'느린 그루브와 여백을 살려서 관능적인 무드가 숨쉴 공간을 주세요.',
  '멜로딕·감성':'멜로디 라인이 감정을 전달하는 주인공이니 다른 악기는 최대한 자리를 비켜주세요.',
  '에너제틱·하입':'에너지가 계속 상승하는 느낌을 주려면 섹션마다 레이어를 하나씩 더 쌓아보세요.',
  '사이키델릭·몽환':'몽환적인 느낌을 살리려면 리듬보다 텍스처와 공간감에 집중하세요.',
  '칠·그루비':'그루브만 살짝 바꾸면서 전체적으로 여백과 일관된 무드를 유지하세요.',
  '분노·공격적':'공격성을 유지하려면 드럼을 절대 비우지 말고 훅마다 임팩트를 더 세게 주세요.',
  '내성적·사색':'요소를 최소로 줄이고 정적인 순간을 충분히 남겨서 사색적인 느낌을 주세요.',
  '축제·환희':'훅마다 텐션을 더 크게 터뜨려서 축제 같은 고조감을 계속 갱신하세요.',
  '승리감·웅장':'레이어를 점점 쌓아 올려서 마지막 훅에서 가장 웅장한 순간을 만드세요.',
  '슬프고·멜랑콜리':'악기 수를 줄이고 멜로디의 여운을 길게 남겨서 감정을 짙게 만드세요.',
  '자신감·플렉스':'훅의 그루브를 자신감 있게 반복해서 각인시키고, 벌스에서도 에너지를 크게 낮추지 마세요.',
  '로맨틱·달콤한':'멜로디와 보컬(있다면)이 대화하듯 서로 자리를 비켜주며 부드럽게 흘러가게 하세요.',
  '긴장감·서스펜스':'다음에 무슨 일이 벌어질지 궁금하게 만들도록 브릿지에서 긴장을 최대한 늦게 풀어주세요.',
  '노스탤직·향수':'빈티지한 질감을 살리며 구조를 단순하게 유지해서 옛날 느낌을 흐트러뜨리지 마세요.',
  '미스터리·신비':'갑자기 드러내기보다 조금씩 정보를 흘리듯 악기를 하나씩 등장시키세요.',
};
function recommendVocalStyle(){
  const box=document.getElementById('hh-vocal-style-box');
  if(!box)return;
  if(!st.vocal||st.vocal==='No Vocal'){box.hidden=true;st.vocalStyle=null;return;}
  box.hidden=false;
  const ranked=st.genre!==null?scorePick(HH_VOCAL_STYLE,GENRE_VOCAL_STYLE,MOOD_VOCAL_STYLE,st.genre,st.mood,null):HH_VOCAL_STYLE;
  st.vocalStyle=ranked[0];
  chipGrid(document.getElementById('hh-vocal-style'),HH_VOCAL_STYLE,st,'vocalStyle',1,null);
  setAutoHint('hh-vocal-style-hint',st.vocalStyle);
}

function setAutoHint(id,text){
  const el=document.getElementById(id);
  if(!el)return;
  el.hidden=false;
  el.querySelector('span').textContent=text+' · 변경 가능';
}
function clearAutoHint(id){
  const el=document.getElementById(id);
  if(el)el.hidden=true;
}

function renderHhGenres(){
  const container=document.getElementById('hh-genre-chips');
  container.innerHTML='';
  GENRES.forEach((g,i)=>{
    const el=document.createElement('div');
    el.className='chip'+(st.genre===i?' selected':'');
    el.textContent=g.kr;
    el.title=GENRE_FEEL[i]||'';
    el.onclick=()=>selectGenre(i);
    container.appendChild(el);
  });
  // 장르 이름만으로는 어떤 소리인지 모르는 사람용 — 고른 장르의 느낌을 쉬운 말로 바로 아래에
  const feel=document.getElementById('hh-genre-feel');
  if(feel){
    const g=st.genre!==null?GENRES[st.genre]:null;
    feel.hidden=!g;
    if(g)feel.textContent=`${g.kr} — ${GENRE_FEEL[st.genre]} (${g.bpm} BPM)`;
  }
  renderGenreGuideResult();
}
// 무드 → 장르 가이드: 무드를 고르면 어울리는 장르를 느낌 설명과 함께 보여주고, 누르면 장르+무드가 같이 설정됨
let _guideMood=null;
function renderGenreGuide(){
  const box=document.getElementById('hh-guide-moods');
  if(!box)return;
  box.innerHTML='';
  HH_MOODS.forEach(m=>{
    const el=document.createElement('div');
    el.className='chip'+(_guideMood===m.kr?' selected':'');
    el.textContent=m.kr;
    el.onclick=()=>{_guideMood=_guideMood===m.kr?null:m.kr;renderGenreGuide();};
    box.appendChild(el);
  });
  renderGenreGuideResult();
}
function renderGenreGuideResult(){
  const res=document.getElementById('hh-guide-result');
  if(!res)return;
  const ids=_guideMood?MOOD_GENRE_GUIDE[_guideMood]||[]:[];
  res.hidden=!ids.length;
  res.innerHTML='';
  ids.forEach((gi,rank)=>{
    const g=GENRES[gi];
    const sel=st.genre===gi&&st.mood===_guideMood;
    const el=document.createElement('div');
    el.style.cssText=`background:${sel?'rgba(157,78,221,.18)':'var(--surface-2)'};border:1px solid ${sel?'var(--accent)':'var(--border)'};border-radius:var(--r);padding:10px 12px;cursor:pointer`;
    el.innerHTML=`<div style="font-size:13px;font-weight:600;color:${sel?'var(--accent-text)':'var(--text-1)'};margin-bottom:4px">${rank===0?'⭐ ':''}${g.kr} <span style="font-weight:400;font-size:10px;color:var(--text-3)">${g.bpm} BPM</span></div><div style="font-size:11px;color:var(--text-2);line-height:1.5">${GENRE_FEEL[gi]}</div>`;
    el.onclick=()=>pickGenreFromGuide(gi,_guideMood);
    res.appendChild(el);
  });
}
// 무드를 먼저 정해두고 장르를 고르면 selectGenre 안의 자동 추천(멜로디·808·그루브 등)이 그 무드를 반영함
function pickGenreFromGuide(gi,moodKr){
  st.mood=moodKr;
  moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',onMoodChange);
  if(st.genre!==gi)selectGenre(gi);
  else onMoodChange();
  renderHhGenres();
}
function onMoodChange(){
  if(st._mtAutoManaged)recommendMelodyTexture();
  if(st._structAutoManaged)recommendStructure();
}

function selectGenre(i){
  const deselect=st.genre===i;
  st.genre=deselect?null:i;
  _aiSuggestions=null;
  if(st.genre!==null){
    st.bpm=GENRES[i].bpm;
    document.getElementById('hh-bpm').value=st.bpm;
    renderGenreRefSuggestions(i);
    // 808·드럼·전환효과 자동 추천 적용
    const auto=GENRE_AUTO[i];
    if(auto){
      st._808=auto.a808;
      st.drums=[...auto.aDrums];
      st.transitionFx=[...auto.fx];
      st.groove=auto.groove;
      chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,onRhythmManualChange);
      chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,onDrumsManualChange);
      chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,onRhythmManualChange);
      chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,onRhythmManualChange);
      setAutoHint('hh-808-hint','808: '+auto.a808);
      setAutoHint('hh-drums-hint',auto.aDrums.join(', '));
      setAutoHint('hh-fx-hint',auto.fx.join(', '));
      setAutoHint('hh-groove-hint',auto.groove);
    }
    recommendMelodyTexture();
    recommendProducerRef();
    recommendStructure();
  } else {
    const sg=document.getElementById('hh-ref-suggestions');
    if(sg)sg.innerHTML='';
    clearAutoHint('hh-808-hint');
    clearAutoHint('hh-drums-hint');
    clearAutoHint('hh-fx-hint');
    clearAutoHint('hh-groove-hint');
    clearAutoHint('hh-melody-hint');
    clearAutoHint('hh-texture-hint');
    clearAutoHint('hh-ref-hint');
    clearAutoHint('hh-melody-tone-hint');
    clearAutoHint('hh-struct-hint');
    st.refs=[];renderProducerRef();
  }
  renderHhGenres();
  const trendEl=document.getElementById('hh-genre-trends');
  if(trendEl)trendEl.querySelectorAll('[data-genre-idx]').forEach(b=>{
    b.classList.toggle('selected',+b.dataset.genreIdx===st.genre);
  });
}

function suggestionChip(text,onClick){
  const btn=document.createElement('button');
  btn.style.cssText='background:var(--surface-3);border:1px solid var(--border);border-radius:20px;color:var(--text-2);font-family:"Space Grotesk",sans-serif;font-size:11px;padding:4px 10px;cursor:pointer;transition:.15s;white-space:nowrap';
  btn.textContent=text;
  btn.onmouseenter=()=>{btn.style.borderColor='var(--accent)';btn.style.color='var(--accent-text)';};
  btn.onmouseleave=()=>{btn.style.borderColor='var(--border)';btn.style.color='var(--text-2)';};
  btn.onclick=onClick;
  return btn;
}

// 예전엔 큐레이션 목록에서 "아티스트 이름"만 뽑아 그 아티스트의 최신 인기곡을 가져왔는데, 그러면 곡 자체(장르에 맞게 골라둔 것)는 버려지고
// 여러 장르에 걸쳐 활동하는 아티스트(Drake가 4개 장르 목록에 있음)는 어느 장르에서든 같은 곡이 나왔음 → 목록의 곡을 그대로 보여주고,
// Spotify는 클릭했을 때만 그 곡을 찾아서 Key·BPM·무드에 씀 (장르 선택 때마다 나가던 검색·API 호출도 사라짐)
function renderGenreRefSuggestions(genreIdx){
  const sg=document.getElementById('hh-ref-suggestions');
  if(!sg)return;
  sg.innerHTML='';
  const label=document.createElement('div');
  label.style.cssText='width:100%;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--text-3);margin-bottom:2px';
  label.textContent='추천 레퍼런스 곡 · 클릭 시 곡 이름 입력 (Spotify 연결 시 Key·BPM·무드도 자동 적용)';
  sg.appendChild(label);
  (HH_GENRE_SONGS[genreIdx]||[]).forEach(song=>{
    sg.appendChild(suggestionChip(song,e=>{
      const btn=e.currentTarget;
      sg.querySelectorAll('button').forEach(b=>{b.style.background='var(--surface-3)';b.style.borderColor='var(--border)';b.style.color='var(--text-2)';});
      btn.style.background='var(--accent-dim)';
      btn.style.borderColor='var(--accent)';
      btn.style.color='var(--accent-text)';
      pickRefSong(song);
    }));
  });
}
async function pickRefSong(song){
  const refEl=document.getElementById('hh-ref-song');
  if(refEl)refEl.value=song;
  const tok=await getSpotifyToken();
  if(!tok)return;                                   // 미연결이면 텍스트만
  const statusEl=document.getElementById('sp-search-status');
  const [artist,...rest]=song.split(' - ');
  const t=await resolveTrackByArtistAndTitle(artist.trim(),rest.join(' - ').trim(),tok);
  if(t)applySpotifyTrack(t.id,song);
  else if(statusEl){statusEl.textContent='Spotify에서 이 곡을 찾지 못해 곡 이름만 입력했어요';statusEl.hidden=false;}
}

function renderArtists(containerId,artists,tabKey){
  const container=document.getElementById(containerId);
  container.innerHTML='';
  artists.forEach((a,ai)=>{
    const row=document.createElement('div');
    row.className='artist-row';
    const header=document.createElement('div');
    header.className='artist-header';
    header.innerHTML=`<div class="artist-pill" style="background:${a.color}20;border:1px solid ${a.color}50;color:${a.color}">${a.name}</div><span class="artist-caret">▼</span>`;
    header.onclick=()=>{row.classList.toggle('open');};
    const songs=document.createElement('div');
    songs.className='artist-songs';
    const grid=document.createElement('div');
    grid.className='songs-grid';
    a.songs.forEach(s=>{
      const card=document.createElement('div');
      card.className='song-card';
      const meta=tabKey==='hh'?`${GENRES[s.genre]?.en||''} · ${s.bpm} BPM · ${KEYS[s.key]||''}`:`${s.tag||''} · ${s.bpm} BPM`;
      card.innerHTML=`<div class="song-name">${s.title}</div><div class="song-meta">${meta}</div>`;
      card.onclick=()=>{applyArtistSong(tabKey,s,a);};
      grid.appendChild(card);
    });
    songs.appendChild(grid);
    row.appendChild(header);row.appendChild(songs);
    container.appendChild(row);
  });
}

// 음악 비전공자는 "다크 · 오케스트라 · 영화적" 같은 vibes 문구만 보고 지금 고른 장르랑 어울릴지 판단하기 어려움
// (실사용자 피드백) — GENRE_REF(장르별 추천 2명, 이미 있던 데이터)를 활용해 추천 여부를 배지로 명시해줘서,
// vibes 문구를 직접 해석 안 해도 "이건 이 장르에 잘 맞는다고 이미 검증된 선택"이라는 걸 바로 알 수 있게 함
function renderProducerRef(){
  const container=document.getElementById('hh-ref');
  if(!container)return;
  container.innerHTML='';
  container.style.cssText='display:block'; // #hh-ref는 원래 .chip-grid(flex-row)라 힌트+카드그리드를 세로로 쌓으려면 덮어써야 함
  const recommended=st.genre!==null?(GENRE_REF[st.genre]||[]):[];
  if(recommended.length){
    const hint=document.createElement('div');
    hint.style.cssText='font-size:10px;color:var(--text-3);margin-bottom:6px';
    hint.textContent='⭐ 표시 = 지금 고른 장르에 잘 맞는 추천 (뭘 골라야 할지 모르겠으면 이 중에서 선택하세요)';
    container.appendChild(hint);
  }
  const grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px';
  container.appendChild(grid);
  // 추천 2명을 그리드 맨 앞으로 — 비전공자는 골라야 할 게 22개나 있으면 압도되니 기본값을 맨 위에 노출
  const sorted=[...HH_REF].sort((a,b)=>recommended.includes(b.kr)-recommended.includes(a.kr));
  sorted.forEach(p=>{
    const selected=st.refs.includes(p.kr);
    const isRecommended=recommended.includes(p.kr);
    const el=document.createElement('div');
    el.style.cssText=`background:${selected?'rgba(157,78,221,.18)':'var(--surface-2)'};border:1px solid ${selected?'var(--accent)':isRecommended?'rgba(245,158,11,.5)':'var(--border)'};border-radius:var(--r);padding:10px 12px;cursor:pointer;transition:.15s`;
    el.innerHTML=`<div style="font-size:13px;font-weight:600;color:${selected?'var(--accent-text)':'var(--text-1)'};margin-bottom:4px">${isRecommended?'⭐ ':''}${p.kr}</div><div style="font-size:11px;color:var(--text-2);margin-bottom:3px">${p.vibes}</div><div style="font-size:10px;color:var(--text-3)">${p.artists}</div>`;
    el.onclick=()=>{
      if(st.refs.includes(p.kr)){st.refs=st.refs.filter(x=>x!==p.kr);}
      else{st.refs=[p.kr];}
      renderProducerRef();
    };
    grid.appendChild(el);
  });
}
// 장르 고르면 GENRE_REF로 프로듀서 레퍼런스 자동 채움 — 수동으로 클릭해서 언제든 바꿀 수 있음
function recommendProducerRef(){
  if(st.genre===null)return;
  const refs=GENRE_REF[st.genre];
  if(!refs)return;
  // 2명이 자동으로 붙으면 설명 6개가 스타일 박스의 ~28%를 차지하고 서로 충돌하기도 해서(예: Ronny J + Mike Dean) 1명만 —
  // 더 원하면 직접 고르거나 AI 추천(지금까지 고른 걸 보고 1명)을 받음
  st.refs=[refs[0]];
  renderProducerRef();
  setAutoHint('hh-ref-hint',refs[0]);
}
// 장르+무드 보고 구조 프리셋(Standard/Hook Heavy/Minimal/Extended) 자동 추천
// 장르 선택 시엔 무조건 덮어씀(808/드럼 등과 동일 패턴), 무드 변경 시엔 호출하는 쪽에서 _structAutoManaged 체크 후 호출
// 구조의 예상 길이(초) — 예전엔 섹션 마디 수 ÷ BPM으로 계산했는데, 실사용에서 Standard가 계산상 1:50인데 실제로는 3분짜리 곡이 나옴(Suno는 마디 수를
// 거의 무시하고 섹션 수로 길이를 정함). 그래서 BPM·마디 수를 빼고 "훅·벌스·브릿지 섹션 하나당 약 26초"로 보정 (Standard 7섹션 ≈ 3:00). 한 건의 관찰로 맞춘 대략치라 구조끼리 비교하는 용도로만
const SEC_PER_SECTION=26;
function structDurationSec(segs){
  return segs.filter(x=>x==='hook'||x==='verse'||x==='bridge').length*SEC_PER_SECTION;
}
const fmtDur=sec=>`${Math.floor(sec/60)}:${String(Math.round(sec%60)).padStart(2,'0')}`;
// 구조 추천 점수 — 장르와 무드를 같은 비중(각 1순위 2점·2순위 1점)으로 보고, 그 위에 목표 길이(직접 골랐다면 사실상 결정적)·색깔·밀도·보컬을 더함.
// 공용 scorePick(장르 3/2 > 무드 2/1)을 쓰면 무드가 절대 장르를 못 이겨서 16개 무드에 구조가 2가지뿐이었음(실측)
function recommendStructure(){
  if(st.genre===null)return;
  const scores=Object.fromEntries(HH_STRUCT_PRESETS.map(p=>[p.name,0]));
  const add=(n,p)=>{if(n in scores)scores[n]+=p;};
  const why=[];
  const gl=(GENRE_STRUCTURE[st.genre]||'').split(' + ');
  gl.forEach((n,i)=>add(n,i===0?2:1));
  (MOOD_STRUCTURE[st.mood]||[]).forEach((n,i)=>add(n,i===0?2.05:1));   // 장르와 무드 1순위가 엇갈릴 때(동점) 사용자가 직접 고른 무드 쪽을 살짝 우선
  if(st.length&&LENGTH_SEC[st.length]){
    const target=LENGTH_SEC[st.length];
    const byDist=HH_STRUCT_PRESETS.map(p=>[p.name,Math.abs(structDurationSec(p.segs)-target)]).sort((x,y)=>x[1]-y[1]);
    add(byDist[0][0],6);add(byDist[1][0],2);
    why.push('목표 길이 '+st.length);
  }
  if(st.commercial){(STRUCT_BY_COMMERCIAL[st.commercial]||[]).forEach(n=>add(n,1));why.push(st.commercial.split('/')[0]);}
  if(st.density){(STRUCT_BY_DENSITY[st.density]||[]).forEach(n=>add(n,1));why.push('밀도 '+st.density);}
  if(st.vocal&&st.vocal!=='No Vocal'){STRUCT_VOCAL.forEach(n=>add(n,1));why.push('보컬');}
  const best=Object.entries(scores).sort((x,y)=>y[1]-x[1]||HH_STRUCT_PRESETS.findIndex(p=>p.name===x[0])-HH_STRUCT_PRESETS.findIndex(p=>p.name===y[0]))[0][0];
  const idx=HH_STRUCT_PRESETS.findIndex(p=>p.name===best);
  if(idx<0)return;
  st.structSegs=[...HH_STRUCT_PRESETS[idx].segs];
  st.structIdx=idx;
  renderStructBuilder('hh',HH_STRUCT_PRESETS,HH_SEG_PALETTE,st);
  setAutoHint('hh-struct-hint',`${best} · 약 ${fmtDur(structDurationSec(st.structSegs))} — 장르·무드${why.length?' + '+why.join(' + '):''} 반영`);
  st._structAutoManaged=true;
}
// 구조 추천에 쓰이는 신호(길이·색깔·밀도·보컬)가 바뀌면 자동 추천 상태일 때만 다시 계산
function onStructSignalChange(){if(st._structAutoManaged)recommendStructure();}

// HH mode toggle: 'genre' = 장르 기반, 'typeBeat' = 아티스트 타입비트
let hhMode='genre';
function setHHMode(mode){
  hhMode=mode;
  document.querySelectorAll('.hh-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  document.getElementById('hh-genre-section').style.display=mode==='genre'?'':'none';
  document.getElementById('hh-typeBeat-section').style.display=mode==='typeBeat'?'':'none';
}

function applyArtistSong(tabKey,song,artist){
  if(tabKey==='hh'){
    if(song.genre!==undefined)st.genre=song.genre;
    if(song.bpm)st.bpm=song.bpm;
    if(song.key!==undefined)st.key=song.key;
    document.getElementById('hh-bpm').value=st.bpm;
    document.getElementById('hh-key').value=st.key;
    // 레퍼런스 곡 자동 입력
    const refEl=document.getElementById('hh-ref-song');
    if(refEl&&artist&&song.title)refEl.value=`${artist.name} - ${song.title}`;
    // 808·드럼·전환효과 자동 추천 (곡 장르 기반)
    const auto=GENRE_AUTO[song.genre];
    if(auto){
      st._808=auto.a808;
      st.drums=[...auto.aDrums];
      st.transitionFx=[...auto.fx];
      st.groove=auto.groove;
      chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,onRhythmManualChange);
      chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,onDrumsManualChange);
      chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,onRhythmManualChange);
      chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,onRhythmManualChange);
      setAutoHint('hh-808-hint','808: '+auto.a808);
      setAutoHint('hh-drums-hint',auto.aDrums.join(', '));
      setAutoHint('hh-fx-hint',auto.fx.join(', '));
      setAutoHint('hh-groove-hint',auto.groove);
    }
    // 무드 자동 추천 (실제 오디오 분석은 없으므로 장르 기반 추정치)
    const defMood=GENRE_DEFAULT_MOOD[song.genre];
    if(defMood){
      st.mood=defMood;
      moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',null);
    }
    recommendMelodyTexture();
    recommendProducerRef();
    recommendStructure();
    renderHhGenres();
    showToast(`🎵 <b>${artist?.name||''} — ${song.title||''}</b><br>Key: ${KEYS[st.key]||'?'} · ${st.bpm}BPM · 무드: ${defMood||'-'} (장르 추정) 적용됨`);
    updateFloatSummary();
  } else {
    const s=VTS[tabKey];
    if(song.tag)s.genre=song.tag;
    if(song.bpm)s.bpm=song.bpm;
    if(song.key!==undefined)s.key=song.key;
    document.getElementById(`${tabKey}-bpm`).value=s.bpm;
    document.getElementById(`${tabKey}-key`).value=s.key;
    renderVocalGenres(tabKey);
    showToast(`🎵 <b>${artist?.name||''} — ${song.title||''}</b><br>${s.bpm}BPM 적용됨`);
    updateFloatSummary();
  }
}

function renderHhNarr(){
  const container=document.getElementById('hh-narr');
  container.innerHTML='';
  const aiKeys=Object.keys(st.narrAI);
  if(aiKeys.length){
    const aiBox=document.createElement('div');
    aiBox.style.cssText='margin-bottom:10px;padding:8px;border-radius:var(--r-sm);background:rgba(157,78,221,.08);border:1px solid rgba(157,78,221,.25)';
    aiBox.innerHTML=`<div style="font-size:11px;color:var(--text-3);margin-bottom:6px">🤖 AI 전개 디렉션 (섹션별)</div>`;
    aiKeys.forEach(k=>{
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:8px;padding:4px 0';
      row.innerHTML=`<span style="font-size:11px;color:var(--text-3);min-width:44px">${k}</span><span style="font-size:11px;color:var(--accent-text);flex:1">${escHtml(st.narrAI[k])}</span><span style="cursor:pointer;color:var(--text-3);font-size:11px" title="AI 디렉션 지우기">✕</span>`;
      row.querySelector('span[title]').onclick=()=>{delete st.narrAI[k];if(st.narrDirs)delete st.narrDirs[k];renderHhNarr();};
      aiBox.appendChild(row);
    });
    container.appendChild(aiBox);
  }
  HH_NARR.forEach(seg=>{
    const div=document.createElement('div');
    div.className='narr-seg';
    const hdr=document.createElement('div');
    hdr.className='narr-seg-header';
    hdr.innerHTML=`<span class="narr-seg-icon">${seg.icon}</span> ${seg.label} <span class="artist-caret" style="margin-left:auto">▼</span>`;
    hdr.onclick=()=>{div.classList.toggle('open');};
    const opts=document.createElement('div');
    opts.className='narr-seg-options';
    const optsRow=document.createElement('div');
    optsRow.className='narr-opts';
    seg.opts.forEach(o=>{
      const el=document.createElement('div');
      el.className='narr-opt'+(st.narrSt[seg.label]===o?' selected':'');
      el.textContent=o;
      el.onclick=()=>{
        st.narrSt[seg.label]=st.narrSt[seg.label]===o?null:o;
        renderHhNarr();
      };
      optsRow.appendChild(el);
    });
    opts.appendChild(optsRow);
    div.appendChild(hdr);div.appendChild(opts);
    container.appendChild(div);
  });
}

function renderStructBuilder(prefix,presets,palette,state){
  const presetsEl=document.getElementById(`${prefix}-struct-presets`);
  const palEl=document.getElementById(`${prefix}-struct-palette`);
  const seqEl=document.getElementById(`${prefix}-struct-seq`);

  if(presetsEl){
    presetsEl.innerHTML='';
    presets.forEach((p,i)=>{
      const btn=document.createElement('button');
      btn.className='struct-preset-btn';
      btn.textContent=p.name;
      if(prefix==='hh')btn.title=`${p.desc||''} · 약 ${fmtDur(structDurationSec(p.segs))} (섹션 수 기준 추정)`;
      btn.onclick=()=>{
        state.structSegs=[...p.segs];state.structIdx=i;state._structAutoManaged=false;
        presetsEl.querySelectorAll('.struct-preset-btn').forEach((b,bi)=>b.classList.toggle('active',bi===i));
        renderSeq(prefix,state,seqEl);
      };
      if(JSON.stringify(p.segs)===JSON.stringify(state.structSegs))btn.classList.add('active');
      presetsEl.appendChild(btn);
    });
  }

  if(palEl){
    palEl.innerHTML='';
    palette.forEach(seg=>{
      const btn=document.createElement('button');
      btn.className='struct-seg-btn';
      btn.textContent=seg;
      btn.onclick=()=>{state.structSegs.push(seg);state.structIdx=null;state._structAutoManaged=false;if(presetsEl)presetsEl.querySelectorAll('.struct-preset-btn').forEach(b=>b.classList.remove('active'));renderSeq(prefix,state,seqEl);};
      palEl.appendChild(btn);
    });
  }

  renderSeq(prefix,state,seqEl);
}

function renderSeq(prefix,state,seqEl){
  if(!seqEl)seqEl=document.getElementById(`${prefix}-struct-seq`);
  seqEl.innerHTML='';
  state.structSegs.forEach((seg,i)=>{
    const el=document.createElement('div');
    el.className='struct-item';
    el.innerHTML=`${seg}<span class="remove" onclick="removeStructSeg('${prefix}',${i})">✕</span>`;
    seqEl.appendChild(el);
  });
  if(prefix==='hh'){
    const est=document.createElement('div');
    est.style.cssText='font-size:10px;color:var(--text-3);width:100%;margin-top:4px';
    est.textContent=`≈ ${fmtDur(structDurationSec(state.structSegs))} (섹션 수 × 약 ${SEC_PER_SECTION}초 추정 — Suno는 마디 수를 그대로 지키지 않아요)`;
    seqEl.appendChild(est);
  }
}

function removeStructSeg(prefix,idx){
  const stRef=prefix==='hh'?st:VTS[prefix];
  stRef.structSegs.splice(idx,1);
  stRef.structIdx=null;
  stRef._structAutoManaged=false;
  const presetsEl=document.getElementById(`${prefix}-struct-presets`);
  if(presetsEl)presetsEl.querySelectorAll('.struct-preset-btn').forEach(b=>b.classList.remove('active'));
  renderSeq(prefix,stRef,null);
}

// ============================================================
// VOCAL TAB BUILDER
// ============================================================
function buildVocalTab(tabKey,genres,artists,genrePresets,moods,instrs,vocalStyles,narr,structPresets,palette){
  const inner=document.getElementById(`${tabKey}-inner`);
  inner.innerHTML='';

  const s=VTS[tabKey];

  // Genre section
  inner.appendChild(makeSection('01','GENRE',()=>{
    const body=document.createElement('div');
    // Genre presets
    const prow=document.createElement('div');
    prow.className='preset-row';
    genrePresets.forEach(p=>{
      const el=document.createElement('div');
      el.className='preset-pill';
      el.textContent=p.name;
      el.style.borderColor=p.color+'80';
      el.style.color=p.color;
      el.onclick=()=>{s.genre=p.tag;renderVocalGenres(tabKey);};
      prow.appendChild(el);
    });
    body.appendChild(prow);
    const chips=document.createElement('div');
    chips.className='chip-grid';
    chips.id=`${tabKey}-genre-chips`;
    body.appendChild(chips);
    return body;
  }));

  // Artists
  inner.appendChild(makeSection('🎤','ARTIST PRESETS',()=>{
    const body=document.createElement('div');
    body.className='artist-accordion';
    body.id=`${tabKey}-artists`;
    return body;
  }));

  // Key & BPM
  inner.appendChild(makeSection('02','KEY & BPM',()=>{
    const body=document.createElement('div');
    body.className='bkrow';
    const kw=document.createElement('div');kw.className='key-wrap';
    const ks=document.createElement('select');ks.className='select-input';ks.id=`${tabKey}-key`;
    KEYS.forEach((k,i)=>{const o=document.createElement('option');o.value=i;o.textContent=k;if(i===s.key)o.selected=true;ks.appendChild(o);});
    ks.onchange=()=>{s.key=parseInt(ks.value);};
    kw.appendChild(ks);body.appendChild(kw);
    const bw=document.createElement('div');bw.className='bpm-wrap';
    const bi=document.createElement('input');bi.type='number';bi.className='bpm-input';bi.id=`${tabKey}-bpm`;bi.value=s.bpm;bi.min=60;bi.max=220;
    bi.oninput=e=>{s.bpm=parseInt(e.target.value)||120;};
    const bl=document.createElement('span');bl.className='bpm-label';bl.textContent='BPM';
    bw.appendChild(bi);bw.appendChild(bl);body.appendChild(bw);
    return body;
  }));

  // Mood
  inner.appendChild(makeSection('03','MOOD',()=>{
    const body=document.createElement('div');
    body.className='mood-grid';
    body.id=`${tabKey}-mood-grid`;
    return body;
  }));

  // Instruments
  inner.appendChild(makeSection('04','INSTRUMENTS <span style="font-size:10px;color:var(--text-3);margin-left:4px">max 3</span>',()=>{
    const body=document.createElement('div');
    body.className='chip-grid';
    body.id=`${tabKey}-instr-chips`;
    return body;
  }));

  // Vocal Style
  inner.appendChild(makeSection('05','VOCAL STYLE',()=>{
    const body=document.createElement('div');
    body.className='chip-grid';
    body.id=`${tabKey}-vstyle-chips`;
    return body;
  }));

  // Narrative
  inner.appendChild(makeSection('🎬','NARRATIVE DIRECTING',()=>{
    const body=document.createElement('div');
    const segs=document.createElement('div');
    segs.className='narr-segments';
    segs.id=`${tabKey}-narr`;
    body.appendChild(segs);
    const conceptArea=document.createElement('div');
    conceptArea.className='concept-area';
    conceptArea.innerHTML=`<label>곡 기획 · 상황</label><textarea id="${tabKey}-concept" placeholder="예) 디카페인을 마셨는데 카페인을 마신 것처럼 심장이 뛰는 설렘 / 새벽에 전화하면 안 되는 상대에게 전화한 자책감" rows="3"></textarea>`;
    body.appendChild(conceptArea);
    return body;
  }));

  // Structure
  inner.appendChild(makeSection('🏗','STRUCTURE BUILDER',()=>{
    const body=document.createElement('div');
    const sp=document.createElement('div');sp.className='struct-presets';sp.id=`${tabKey}-struct-presets`;
    body.appendChild(sp);
    const sb=document.createElement('div');sb.className='struct-builder';
    const palWrap=document.createElement('div');
    const palLabel=document.createElement('div');palLabel.style.cssText='font-size:11px;color:var(--text-2);margin-bottom:6px';palLabel.textContent='클릭해서 추가';
    const pal=document.createElement('div');pal.className='struct-palette';pal.id=`${tabKey}-struct-palette`;
    palWrap.appendChild(palLabel);palWrap.appendChild(pal);
    sb.appendChild(palWrap);
    body.appendChild(sb);
    const seqWrap=document.createElement('div');seqWrap.style.marginTop='10px';
    const seqLabel=document.createElement('div');seqLabel.style.cssText='font-size:11px;color:var(--text-2);margin-bottom:6px';
    seqLabel.innerHTML='구성 순서 <span style="color:var(--text-3)">(X를 눌러 제거)</span>';
    const seq=document.createElement('div');seq.className='struct-sequence';seq.id=`${tabKey}-struct-seq`;
    seqWrap.appendChild(seqLabel);seqWrap.appendChild(seq);
    body.appendChild(seqWrap);
    return body;
  }));

  // Output
  const out=document.createElement('div');
  out.className='output-section';
  out.innerHTML=`
    <button class="gen-btn" onclick="vocalGenerate('${tabKey}')">✨ Generate Prompts</button>
    <div class="output-boxes" id="${tabKey}-output" style="display:none">
      <div class="output-box">
        <div class="output-box-header">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="output-box-label">② 섹션 프롬프트</span>
            <span class="output-badge" id="${tabKey}-antiai-badge" style="display:none">✦ Anti-AI ON</span>
          </div>
          <button class="copy-btn" onclick="copyOutput('${tabKey}-sect-ta',this)">Copy</button>
        </div>
        <textarea class="output-ta" id="${tabKey}-sect-ta" rows="12" readonly></textarea>
      </div>
      <div class="output-box">
        <div class="output-box-header">
          <span class="output-box-label">③ 스타일 프롬프트</span>
          <button class="copy-btn" onclick="copyOutput('${tabKey}-style-ta',this)">Copy</button>
        </div>
        <textarea class="output-ta" id="${tabKey}-style-ta" rows="4" readonly></textarea>
      </div>
    </div>`;
  inner.appendChild(out);

  // Now populate dynamic parts
  renderVocalGenres(tabKey);
  renderArtists(`${tabKey}-artists`,artists,tabKey);
  moodGrid(document.getElementById(`${tabKey}-mood-grid`),moods,s,'mood',null);
  chipGrid(document.getElementById(`${tabKey}-instr-chips`),instrs,s,'instruments',3,null);

  // vocal styles
  const vsChips=document.getElementById(`${tabKey}-vstyle-chips`);
  vsChips.innerHTML='';
  vocalStyles.forEach(vs=>{
    const el=document.createElement('div');
    el.className='chip'+(s.vocalStyle===vs.kr?' selected':'');
    el.textContent=vs.kr;
    el.onclick=()=>{s.vocalStyle=s.vocalStyle===vs.kr?null:vs.kr;vsChips.querySelectorAll('.chip').forEach((c,ci)=>c.classList.toggle('selected',vocalStyles[ci].kr===s.vocalStyle));};
    vsChips.appendChild(el);
  });

  // narr
  renderVocalNarr(tabKey,narr);

  // concept textarea
  const concTa=document.getElementById(`${tabKey}-concept`);
  if(concTa){concTa.value=s.concept;concTa.oninput=()=>{s.concept=concTa.value;};}

  // struct
  renderStructBuilder(tabKey,structPresets,palette,s);
}

function makeSection(num,title,bodyFn){
  const sec=document.createElement('div');
  sec.className='section';
  const hdr=document.createElement('div');
  hdr.className='section-header open';
  hdr.onclick=()=>toggleSection(hdr);
  hdr.innerHTML=`<div class="section-title"><span class="section-num">${num}</span> ${title}</div><span class="caret">▼</span>`;
  const body=document.createElement('div');
  body.className='section-body';
  const content=bodyFn();
  body.appendChild(content);
  sec.appendChild(hdr);sec.appendChild(body);
  return sec;
}

function renderVocalGenres(tabKey){
  const s=VTS[tabKey];
  const genres=tabKey==='pop'?POP_GENRES:tabKey==='elec'?ELEC_GENRES:ROCK_GENRES;
  const container=document.getElementById(`${tabKey}-genre-chips`);
  if(!container)return;
  container.innerHTML='';
  genres.forEach(g=>{
    const el=document.createElement('div');
    el.className='chip'+(s.genre===g.tag?' selected':'');
    el.textContent=g.kr;
    el.onclick=()=>{s.genre=s.genre===g.tag?null:g.tag;renderVocalGenres(tabKey);};
    container.appendChild(el);
  });
}

function renderVocalNarr(tabKey,narr){
  const container=document.getElementById(`${tabKey}-narr`);
  if(!container)return;
  const s=VTS[tabKey];
  container.innerHTML='';
  narr.forEach(seg=>{
    const div=document.createElement('div');
    div.className='narr-seg';
    const hdr=document.createElement('div');
    hdr.className='narr-seg-header';
    hdr.innerHTML=`<span class="narr-seg-icon">${seg.icon}</span> ${seg.label} <span class="artist-caret" style="margin-left:auto">▼</span>`;
    hdr.onclick=()=>{div.classList.toggle('open');};
    const opts=document.createElement('div');
    opts.className='narr-seg-options';
    const optsRow=document.createElement('div');
    optsRow.className='narr-opts';
    seg.opts.forEach(o=>{
      const el=document.createElement('div');
      el.className='narr-opt'+(s.narrSt[seg.label]===o?' selected':'');
      el.textContent=o;
      el.onclick=()=>{
        s.narrSt[seg.label]=s.narrSt[seg.label]===o?null:o;
        const narrs=tabKey==='pop'?POP_NARR:tabKey==='elec'?ELEC_NARR:ROCK_NARR;
        renderVocalNarr(tabKey,narrs);
      };
      optsRow.appendChild(el);
    });
    opts.appendChild(optsRow);
    div.appendChild(hdr);div.appendChild(opts);
    container.appendChild(div);
  });
}

// ============================================================
// GENERATE - HIP HOP
// ============================================================
function escHtml(str){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function makeOutBlock(label,contentHTML,copyId,borderColor){
  const box=document.createElement('div');
  box.className='output-box';
  box.style.borderLeft='3px solid '+borderColor;
  const hdr=document.createElement('div');
  hdr.className='output-box-header';
  const labelEl=document.createElement('span');
  labelEl.className='output-box-label';
  labelEl.textContent=label;
  hdr.appendChild(labelEl);
  if(copyId){
    const btn=document.createElement('button');
    btn.style.cssText='padding:6px 18px;border-radius:20px;border:none;background:var(--accent);color:#fff;font-family:"Space Grotesk",sans-serif;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.3px;transition:.15s';
    btn.textContent='Copy';
    btn.onmouseenter=()=>{btn.style.opacity='.82';};
    btn.onmouseleave=()=>{btn.style.opacity='1';};
    btn.onclick=()=>{
      const ta=document.getElementById(copyId);
      navigator.clipboard.writeText(ta.value).then(()=>{
        btn.textContent='Copied!';btn.style.background='var(--success)';
        setTimeout(()=>{btn.textContent='Copy';btn.style.background='var(--accent)';},1800);
      });
    };
    hdr.appendChild(btn);
  }
  box.appendChild(hdr);
  const body=document.createElement('div');
  body.style.padding='12px 16px';
  body.innerHTML=contentHTML;
  box.appendChild(body);
  return box;
}

// Generates expert-driven arrange direction from current song params (genre, 808, BPM, mood)
function genArrangeDir(genre,sec,ctx){
  const {eDesc,dDesc,mDesc,hookEng,bpmNum}=ctx;
  // Expert modifiers derived from what the producer has actually set up
  const boomLvl={None:0,Minimal:1,Balanced:2,Heavy:3,Dominant:4}[st._808]??2;
  const fastBpm=bpmNum>=135;
  const slowBpm=bpmNum<=95;
  // Hook entry: heavy 808 → instant drop no build; light → gradual layer
  // 각 후보를 2개씩 두고 pick()으로 골라서, 같은 곡 안에 훅/벌스가 여러 번 나와도 genArrangeDir가 매번 똑같은 문장을 반복하지 않게 함
  const intHook=pick(boomLvl>=3
    ?['all layers hitting from bar 1 — instant drop, no build','full impact from the first bar, zero build-up']
    :boomLvl<=1
    ?['layers entering one by one over first 4 bars, slow build into drop','elements stacking gradually across the first 4 bars into the drop']
    :['drop at bar 3 after 2-bar setup, mid-intensity entry','brief 2-bar setup then drop at bar 3, medium intensity entry']);
  // Verse contrast: high 808 means hook was massive → verse needs dramatic strip-down
  const intVerse=pick(boomLvl>=3
    ?['strip to skeleton — kick and hi-hat only, 808 pulled back, wide empty space for contrast','pared down to just kick and hi-hat, 808 pulled way back, lots of open space']
    :boomLvl<=1
    ?['verse stays airy, no heavy bass, just rhythmic texture bed','verse kept light and airy, no low end, purely rhythmic texture']
    :['verse pulls 808 back by half, lighter drum hit, spacious clean pocket','808 cut back by half in the verse, drums lighter, clean open pocket']);
  // BPM-based timing advice
  const loopWord=pick(slowBpm
    ?['slow hypnotic loop, let notes ring long, wide reverb tail','slow hypnotic repetition, notes ringing out with a wide reverb tail']
    :fastBpm
    ?['tight short loop, fast attack drums, aggressive forward momentum','short tight loop, fast-attack drums driving hard forward']
    :['medium rolling groove, steady rhythmic drive','steady mid-tempo groove with a consistent rhythmic pulse']);
  // Tone: read from hookEng (already derived from mood)
  const toneWord=pick(hookEng.includes('dark')||hookEng.includes('aggressive')||hookEng.includes('hard')
    ?['dark brooding tone maintained throughout, no brightness','consistently dark and brooding, brightness kept out']
    :hookEng.includes('melodic')||hookEng.includes('soulful')||hookEng.includes('conscious')
    ?['warm melodic tone, emotional resonance forward','warm and melodic throughout, emotional resonance up front']
    :['neutral energetic tone, consistent intensity','even-keeled energetic tone, intensity held steady']);
  // genre-specific templates — interpolate song descriptors + ref audio feature modifiers
  const map={
    0:{hook:`${eDesc} ${intHook}, ${dDesc} at peak, ${toneWord}`,
       verse:`${eDesc} stripped back, ${dDesc} lighter pattern, ${intVerse}`,
       bridge:`${dDesc} dropping out, ${toneWord}, tension building into next drop`},
    1:{hook:`dense ${eDesc} wall, ${mDesc} atmospheric layers ${intHook}, dramatic dark drop`,
       verse:`ultra sparse — single ${dDesc} hit, ghostly ${mDesc} bed only, ${intVerse}`,
       bridge:`${mDesc} swell rising, eerie reverb, ${toneWord}`},
    2:{hook:`${mDesc} lead melody dominant, ${hookEng} drop, ${intHook}`,
       verse:`${mDesc} motif softly hinted, ${intVerse}, intimate melodic feel`,
       bridge:`${mDesc} tension rising, ${toneWord}, emotional peak building`},
    3:{hook:`${eDesc} slide melody prominent, ${dDesc} monotone pattern, ${toneWord}, ${loopWord}`,
       verse:`${eDesc} slide continuous, ${dDesc} sparse, hypnotic repetition, ${intVerse}`,
       bridge:`${eDesc} slide chromatic tension, ${dDesc} drilling tight, ${toneWord}`},
    4:{hook:`${dDesc} heavy offbeat snare dominant, UK drop, ${intHook}, ${toneWord}`,
       verse:`${dDesc} lighter variation, offbeat snare reduced, ${mDesc} spacious bed, ${intVerse}`,
       bridge:`${dDesc} snare roll building, ${toneWord}, tension before hook`},
    5:{hook:`2-bar ${mDesc} loop ${intHook}, ${eDesc} grunt cycling, ${loopWord}`,
       verse:`same ${mDesc} loop stripped, ${dDesc} lighter, ${intVerse}`,
       bridge:`loop filtered down, ${dDesc} half-time, ${toneWord}, tension before full reset`},
    6:{hook:`${mDesc} sample groove ${intHook}, ${dDesc} punchy boom bap, ${loopWord}`,
       verse:`${mDesc} deep sample pocket, ${dDesc} classic groove, ${intVerse}`,
       bridge:`${mDesc} sample chop variation, ${dDesc} rhythmic shift, ${toneWord}`},
    7:{hook:`maximum wide space, ${dDesc} sparse minimal, ${mDesc} dreamy warm, ${toneWord}`,
       verse:`${dDesc} nearly absent, pure ${mDesc} ambient texture, ${intVerse}`,
       bridge:`quiet ${mDesc} ambient swell, soft texture shift, ${toneWord}`},
    8:{hook:`consistent ${mDesc} lo-fi loop, ${dDesc} gentle groove, ${toneWord}`,
       verse:`same ${mDesc} feel, ${dDesc} very subtle variation, ${intVerse}`,
       bridge:`soft ${mDesc} continuation, slight ${dDesc} texture shift, ${toneWord}`},
    9:{hook:`${dDesc} syncopated bounce ${intHook}, chopped sample stabs cutting through, ${loopWord}`,
       verse:`${dDesc} pattern thinned, sample chops pulled back, ${mDesc} light bed, ${intVerse}`,
       bridge:`${dDesc} pattern stuttering, chopped sample echo fading, ${toneWord}, tension before drop`},
    10:{hook:`${mDesc} 1-bar loop relentless, ${eDesc} distorted and pitched hard, ${loopWord}`,
        verse:`same ${mDesc} loop, ${dDesc} stripped, ${intVerse}`,
        bridge:`${mDesc} filter sweep down, ${dDesc} brief break, ${toneWord}, loop resets full`},
    11:{hook:`${dDesc} afro percussion locked ${intHook}, tropical ${mDesc} groove driving, ${loopWord}`,
        verse:`${dDesc} percussion lighter, tropical ${mDesc} softly layered, ${intVerse}`,
        bridge:`${dDesc} stripping then rebuilding, ${toneWord}, tropical tension rising`},
    12:{hook:`simple sparse ${dDesc}, wide open space, ${mDesc} breathing room, ${toneWord}`,
        verse:`${dDesc} minimal — stays out of the way, ${mDesc} clean open pocket, ${intVerse}`,
        bridge:`${mDesc} brief swell, ${dDesc} resolves cleanly, ${toneWord}`},
    13:{hook:`${eDesc} pitch-matched to chords, ${mDesc} harmonic melody dominant, ${intHook}`,
        verse:`${eDesc} chord melody carrying the track, ${dDesc} lighter, ${intVerse}`,
        bridge:`${eDesc} chromatic tension, 808 pitch bending, ${toneWord}`},
    14:{hook:`extreme ${eDesc} explosion, ${dDesc} industrial peak, ${intHook}, every element maxed`,
        verse:`near silence contrast, ${dDesc} stripped completely, ${intVerse}`,
        bridge:`${dDesc} sudden surge, ${eDesc} aggressive build, ${toneWord}`},
    15:{hook:`raw ${mDesc} bedroom texture, ${dDesc} lo-fi DIY, ${intHook}, imperfect organic`,
        verse:`rawer ${mDesc} intimate, ${dDesc} unpolished intentional grain, ${intVerse}`,
        bridge:`${mDesc} raw texture shifting, imperfect ${dDesc} swell, ${toneWord}`},
    16:{hook:`long slow ${eDesc} sustain melody, cloud drift, ${mDesc} minimal, ${intVerse}`,
        verse:`ultra slow held ${eDesc} notes, ${mDesc} hazy dreamy bed, maximum space`,
        bridge:`${eDesc} sustained fading, ${mDesc} airy drift, ${toneWord}`},
    17:{hook:`unexpected ${mDesc} chord stab, ${dDesc} gritty jazz flip, ${intHook}, ${toneWord}`,
        verse:`${mDesc} unique chop, ${dDesc} dusty grimy pocket, ${loopWord}`,
        bridge:`${mDesc} chop pivot, unexpected harmonic shift, ${toneWord}`},
    18:{hook:`${eDesc} distorted and clipping, ${mDesc} riff hammering, ${dDesc} relentless, ${intHook}`,
        verse:`${mDesc} riff stripped to a single line, ${dDesc} hard and sparse, ${intVerse}`,
        bridge:`${eDesc} sustained growl swelling, ${dDesc} stuttering, ${toneWord}, tension before the crash`},
    19:{hook:`${dDesc} bouncy kick pattern ${intHook}, chopped R&B sample loop forward, ${eDesc} sliding softly`,
        verse:`${mDesc} sample chop loop stays, ${dDesc} thinned to kick and hats, relaxed nonchalant pocket, ${intVerse}`,
        bridge:`sample loop filtered down, ${dDesc} stuttering, ${toneWord}, tension before hook`},
  };
  const g=map[genre];
  if(!g)return`${eDesc} ${sec} arrangement, ${dDesc} adapted, ${toneWord}`;
  return g[sec]||`${eDesc} ${sec} direction, ${mDesc} featured`;
}

function buildHHSectionPrompt(genre,moodIdx,keyStr,bpmNum,eightOh,drums,melody,region){
  const segs=st.structSegs;
  const bH=+(document.getElementById('hh-bar-hook')?.value||8);
  const bV=+(document.getElementById('hh-bar-verse')?.value||12);
  const bB=+(document.getElementById('hh-bar-bridge')?.value||4);
  const keyName=keyStr||'minor key';
  // 808을 'None'으로 고르면(예: Conscious Hip Hop — 진짜 808 없는 장르) 스타일 태그엔 808 언급이 안 들어가는데
  // 섹션 텍스트는 무조건 "booming 808 bass"라고 못박혀 있어서 직접 모순이 남 — 실측 확인. 808 없는 장르는
  // g.instr에 실제 저음 악기(live bass 등)가 있으니 그걸 대신 씀
  const eDesc=(eightOh&&eightOh!=='None')?eightOh+' 808 bass':(eightOh==='None'?(GENRES[st.genre]?.instr?.find(x=>/bass/i.test(x))||'warm bass'):'booming 808 bass');
  // 드럼을 직접 안 고르면(가장 흔한 경우) 장르 안 보고 무조건 "crisp trap drums"로 고정돼 있었음 —
  // 스타일 태그 쪽은 이미 GENRES[st.genre].drum(장르별 문구, 예: "hyperpop drums")을 쓰는데 섹션 텍스트만 안 맞춰져 있어서
  // 같은 프롬프트 안에서 "hyperpop drums"(스타일) vs "crisp trap drums"(섹션)로 모순이 남— 장르 기본 문구로 맞춤
  // 드럼을 2개 골라도 섹션엔 첫 번째만 들어가고 두 번째(예: Rolling triplets)는 스타일 태그에만 있었음 — 리뷰가 "Trap rolls가 섹션에 없다"고 반복 지적.
  // 역할 분담: 메인=훅 전체, 보조=훅 변주·벌스에서 가볍게, 롤/하이햇 계열=브릿지 빌드업
  const drumList=Array.isArray(drums)?drums:(drums?String(drums).split(',').map(s=>s.trim()).filter(Boolean):[]);
  const dDesc=drumList[0]||(GENRES[st.genre]?.drum||'crisp trap drums');
  const dSecond=drumList[1]||null;
  const dRoll=drumList.find(d=>/roll|triplet|hi-hat|break/i.test(d))||null;
  const grooveTag=grooveText(st.groove)||'consistent rhythmic pocket';
  // ', '가 아니라 ' & '로 묶음 — genArrangeDir 템플릿 상당수가 "2-bar ${mDesc} loop"처럼 mDesc를 문장 중간에 끼워 넣는데,
  // 악기 2개가 쉼표로 이어지면 "2-bar Dark synth, Psychedelic FX loop"처럼 어디까지가 한 덩어리인지 모호해짐
  const mDesc=(melody&&melody.length)?melody.join(' & '):'dark synthesizers';
  const hasVocal=st.vocal&&st.vocal!=='No Vocal';
  const vocalCharTag=VOCAL_CHAR_TAG[st.vocalChar]||'clean vocal recording';
  const vocalStyleTag=VOCAL_STYLE_TAG[st.vocalStyle];
  const vocalDesc=vocalStyleTag?`${vocalStyleTag}, ${vocalCharTag}`:vocalCharTag;

  // 각 무드당 2개씩 — pick()으로 Generate할 때마다 무작위 하나 골라서 같은 무드라도 훅/벌스 이름이 매번 조금씩 달라짐
  // 인덱스는 HH_MOODS 순서와 정확히 1:1 매칭 (무드 8→16개로 늘릴 때 중간에 새 무드가 끼어들면서 일부가 밀렸던 걸 재정렬함)
  const hookSubMap=[['Dark Drop','Shadow Drop'],['Sensual Chorus','Smooth Chorus'],['Melodic Chorus','Emotional Chorus'],['Hype Drop','Hype Surge'],['Cinematic Drop','Dreamy Drop'],['Chill Peak','Smooth Peak'],['Hard Drop','Aggressive Drop'],['Conscious Peak','Introspective Peak'],['Euphoric Anthem','Festival Anthem'],['Triumphant Peak','Victory Peak'],['Melancholic Peak','Sorrowful Peak'],['Flex Anthem','Cocky Chorus'],['Romantic Chorus','Tender Chorus'],['Suspense Peak','Anxious Peak'],['Nostalgic Chorus','Wistful Chorus'],['Mysterious Drop','Enigmatic Drop']];
  const hookEngMap=[['dark explosive','ominous explosive'],['sensual smooth','silky smooth'],['melodic uplifting','melodic emotional'],['maximum hype','peak hype'],['psychedelic dreamy','hazy cinematic'],['smooth peak','laid-back peak'],['aggressive hard','aggressive hard-hitting'],['conscious introspective','contemplative peak'],['euphoric explosive','festival explosive'],['triumphant anthemic','victorious anthemic'],['melancholic emotional','sorrowful emotional'],['confident flexing','cocky flexing'],['romantic sweet','tender sweet'],['tense suspenseful','anxious suspenseful'],['nostalgic wistful','sentimental wistful'],['mysterious enigmatic','cryptic enigmatic']];
  const verseSubMap=[['Grimy Pocket','Shadowy Pocket'],['Sensual Pocket','Smooth Pocket'],['Melodic Pocket','Emotional Pocket'],['Coiled Energy','Restrained Hype'],['Cinematic Build','Dreamy Drift'],['Chill Pocket','Groovy Pocket'],['Hard Pocket','Aggressive Pocket'],['Conscious Flow','Introspective Flow'],['Building Hype','Festival Flow'],['Rising Anthem','Victory Build'],['Sorrowful Pocket','Melancholic Pocket'],['Cocky Pocket','Flexing Pocket'],['Tender Pocket','Romantic Pocket'],['Anxious Pocket','Suspense Pocket'],['Wistful Pocket','Nostalgic Pocket'],['Enigmatic Pocket','Mysterious Pocket']];
  const hookSub=moodIdx>=0?pick(hookSubMap[moodIdx%hookSubMap.length]):'Euphoric Drop';
  // 'maximum hype'·'peak hype'처럼 무드 문구 자체가 절대 최대치면 첫 훅부터 천장을 찍어서 이후 훅의 "더 세게"가 성립 안 함(리뷰 지적) — 최대치 표현은 마지막 훅에만
  const hookEngRaw=moodIdx>=0?pick(hookEngMap[moodIdx%hookEngMap.length]):'euphoric';
  const hookEng=hookEngRaw.replace(/^(maximum|peak) /i,'');
  const verseSub=moodIdx>=0?pick(verseSubMap[moodIdx%verseSubMap.length]):'Stripped Pocket';
  // 마지막 훅(클라이맥스) 문구가 항상 "Maximum ~energy, heaviest impact"로 고정이면 몽환/차분한 무드엔 안 어울림 —
  // 이런 무드는 "제일 시끄러운 순간"이 아니라 "제일 몰입감 있는 순간"이 클라이맥스가 되어야 함
  const MELLOW_CLIMAX_MOODS=['멜로딕·감성','감각적·관능적','사이키델릭·몽환','칠·그루비','내성적·사색','슬프고·멜랑콜리','로맨틱·달콤한','노스탤직·향수','미스터리·신비'];
  const isMellowMood=MELLOW_CLIMAX_MOODS.includes(st.mood);

  const cnt={hook:0,verse:0,bridge:0};
  const dyn=MOOD_DYNAMICS[st.mood]||{};
  const fxAll=(st.transitionFx&&st.transitionFx.length)?st.transitionFx.map(f=>TRANSITION_FX_TAG[f]||f):['reverse cymbal swell','low-pass filter sweep down'];
  let preBuildN=0;   // 무드별 다이내믹 성격 (진입/훅 어택/벌스 거동/브릿지 긴장/끝맺음)
  const totalHooks=segs.filter(s=>s==='hook').length;
  const totalVerses=segs.filter(s=>s==='verse').length;
  const totalBridges=segs.filter(s=>s==='bridge').length;
  const sAE=st.sectionArrangeExtras||{};
  const _ctx={eDesc,dDesc,mDesc,hookEng,bpmNum};
  const lines=[];

  // 멜로디 악기명은 처음 2번(Intro·첫 Hook)만 명시하고, 이후엔 "같은 악기" 콜백으로 순환 — 섹션마다 문구 그대로 반복되는 것 방지
  // 멜로디 2개 선택 시 맨 처음 등장은 리드/배경 역할까지 명시해서 입체감 부여
  const melodyRoles=computeMelodyRoles(melody);
  const leadInstrument=melodyRoles?melodyRoles.lead:(melody&&melody[0]);
  const mDescFull=melodyRoles?`${melodyRoles.lead} lead, ${melodyRoles.bg} background`:mDesc;
  const bgName=melodyRoles?.bg||null;
  const leadName=leadInstrument||mDesc;
  let introUsed=false;
  // section별로 리드 악기를 "어떤 느낌으로" 연주할지 괄호로 덧붙임 — 같은 악기 반복 언급이라도 구간마다 다른 연주법
  // + 리드 악기 자체의 톤(웜·아날로그 등)은 첫 등장(인트로)에서만 무드 뉘앙스까지 얹음 (매번 붙이면 전 섹션에 토씨 그대로 반복)
  const toneTag=MELODY_TONE_TAG[st.melodyTone]||'';
  const toneNuance=compatibleToneNuance(st.mood);
  const toneTagFull=toneTag&&toneNuance?`${toneTag}, ${toneNuance}`:toneTag;
  const artOf=section=>leadInstrument&&(GENRE_ARTICULATION[st.genre]?.[leadInstrument]||MELODY_ARTICULATION[leadInstrument])?.[section];
  const withArt=(name,section)=>{const x=artOf(section);return x?`${name} (${x})`:name;};
  const introRef=()=>{
    const ref=mDescFull;
    const art=artOf('intro');
    const tone=toneTagFull;
    if(leadInstrument&&ref.includes(leadInstrument)){
      const toned=tone?`${tone} ${leadInstrument}`:leadInstrument;
      return ref.replace(leadInstrument,art?`${toned} (${art})`:toned);
    }
    if(tone&&art)return `${tone} ${ref} (${art})`;
    if(tone)return `${tone} ${ref}`;
    return art?`${ref} (${art})`:ref;
  };
  // 인트로 이후엔 "matching synth layers", "consistent instrumentation" 같은 이름 없는 콜백으로 바꿨었는데, Suno에게 아무 정보도 안 되고
  // 리뷰에서도 "Supersaw/Kalimba가 인트로 뒤에 자취를 감춘다"는 지적이 나옴 — 섹션마다 악기 이름을 역할과 함께 계속 명시
  // (리드/백킹 위계는 유지: 리드는 연주법 괄호와 함께, 백킹은 "underneath/counter-line/carrying" 같은 역할어로)
  const melodyRef=(section,occ,total)=>{
    if(section==='intro')return introRef();
    if(section==='hook'){
      // 마지막 훅에서 리드와 배경이 둘 다 풀파워면 808과 함께 로우~로우미드에 몰림(리뷰 반복 지적) — 리드만 풀파워, 배경은 저역을 비워주게 필터
      if(occ===total)return `${withArt(leadName,'hook')} at full power${bgName?`, ${bgName} filtered to leave room for the ${eDesc}`:`, ${leadName} doubled an octave up`}`;
      if(occ===1)return `${withArt(leadName,'hook')}${bgName?`, ${bgName} layered underneath${MELODY_SUSTAINED.has(bgName)&&eightOh!=='None'?`, high-passed above the ${eDesc}`:''}`:''}`;
      const alt=(occ-2)%2===1;
      return `${withArt(leadName,'hook')}, ${bgName?(alt?`${leadName} and ${bgName} trading phrases in call-and-response`:`${bgName} stepping forward as a counter-line`):(alt?`stutter-edited variation of the ${leadName} phrase`:`${leadName} answering itself an octave higher`)}`;   // 배경 악기가 없으면 "new counter-melody layer"처럼 악기 미지정 문구 대신 리드 자체의 변주로
    }
    if(section==='verse'){
      if(occ===1)return withArt(leadName,'verse');
      return `${bgName?`${bgName} carrying the melody, `:''}${withArt(leadName,'verse')} pulled back`;
    }
    if(section==='bridge'){
      if(occ===total)return withArt(leadName,'bridge');
      return (bgName&&occ%2===0)?`${bgName} rising swell`:withArt(leadName,'bridge');
    }
    return withArt(leadName,section);
  };
  // 수동 프리셋(HH_NARR, 4개 고정 카테고리)과 AI narrDir(실제 섹션마다 고유 키, 예: hook2)은 서로 다른 키 공간이라 분리 —
  // AI는 이 특정 occurrence에 쓴 게 있으면 그걸 쓰고, 없으면 수동 프리셋(카테고리 단위)으로 폴백
  const aiNote=occKey=>st.narrAI[occKey]?`, ${st.narrAI[occKey]}`:'';
  const manualNote=category=>{
    const choice=st.narrSt[category];
    if(choice==='아카펠라 오프닝'&&!hasVocal)return''; // 보컬 없는 트랙에서 "보컬만 나오는 오프닝"은 ZERO vocal chops 지시와 직접 모순됨
    const dir=choice&&HH_NARR_DIR[category]?.[choice];
    return dir?`, ${dir}`:'';
  };
  // sectionArrangeExtras[type]는 true(장르 기본 편곡 문구) 또는 AI가 직접 쓴 문자열(구체적 아이디어) 둘 다 가능
  const arrangeExtra=type=>{
    const v=sAE[type];
    if(!v)return'';
    return `, ${typeof v==='string'?v:genArrangeDir(st.genre,type,_ctx)}`;
  };
  // 스테레오 폭·리버브 같은 공간감 묘사가 곡 전체에서 안 바뀌면(기존엔 텍스처 태그가 전역 1회 선택이라 매 섹션 그대로 반복됨)
  // Suno가 다이나믹 변화를 덜 만듦 — 섹션 역할별로 명시적인 공간 프로파일을 줘서 인트로(넓고 리버브)→벌스(좁고 드라이)
  // →훅(타이트하게 펀치)→클라이맥스 훅(가장 넓고 포화)→아웃트로(디케이) 아크를 기본 출력에 항상 포함시킴.
  // 훅이 3개 이상이면 첫 훅/클라이맥스 훅만 다르고 중간 훅들이 전부 "tight, punchy" 그대로 반복돼서 훅끼리
  // 점진적 확장감이 없다는 지적을 받음(실측 확인) — 첫 훅 이후로는 "이전 훅보다 조금 더 넓어짐"으로 상대적으로
  // 표현해서, 훅이 몇 개든 첫 훅→클라이맥스까지 계속 넓어지는 흐름이 되게 함
  // 공간감 문구가 텍스처와 무관하게 고정이라, 스타일 태그엔 "dry intimate"인데 섹션엔 "wide reverb / widest stereo"가 박히는 모순이 있었음
  // (실측: 320개 조합 중 Dry intimate 125·Heavy reverb 101·Stereo wide 56건이 섹션 문구와 정면 충돌) — 고른 텍스처에 맞춰 같은 아크(인트로→훅→벌스→브릿지→클라이맥스→아웃트로)를 그 질감으로 표현
  const hasTex=t=>(st.texture||[]).includes(t);
  const dryTex=hasTex('Dry intimate'),revTex=hasTex('Heavy reverb'),wideTex=hasTex('Stereo wide');
  const spaceArc=(role,occ,total)=>{
    if(role==='hook'){
      if(occ===1)return wideTex?'wide punchy stereo':(dryTex?'tight punchy stereo, dry':'tight punchy stereo, controlled width');
      return `wider than previous hook, building toward the drop${dryTex?', still dry':(revTex?', reverb blooming':'')}`;
    }
    return({
      intro:dryTex?'close dry mix, minimal reverb':(revTex?'wide reverb wash, open stereo':'wide reverb, open stereo'),
      verse:occ>1
        ?`slightly wider than the previous verse, still ${revTex?'reverb-soaked':(wideTex?'open':'dry and close')}`
        :(revTex?'narrow but reverb-soaked, intimate stereo':(wideTex?'narrower than the hooks but still open stereo':'narrow, dry, intimate stereo')),
      bridge:occ===total?'stereo collapsing toward mono just before the drop':(occ===1?'stereo narrowing as the filter closes, reverb tail cut short':'stereo pulling in tighter than the last bridge'),
      climax:dryTex?'widest stereo yet still dry, saturated, full':(hasTex('Raw sound')?'widest stereo, raw and overdriven':'widest stereo, saturated, full'),
      outro:dryTex?'short reverb decay, stereo collapsing to mono':(revTex?'long reverb tail, stereo collapsing to mono':'reverb decay, stereo collapsing to mono'),
    }[role]||'');
  };
  // 공간계가 아닌 텍스처(펌핑·저역·테이프 등)는 섹션마다 다르게 동작 — 훅에선 살고 벌스에선 물러나는 식으로 그 섹션 역할에 맞는 한 구절씩
  const texLine=role=>(st.texture||[]).map(t=>TEXTURE_SECTION[t]?.[role]).filter(Boolean).join(', ');
  // 같은 타입 섹션이 3번 이상 나오면 기본 문구가 토씨 그대로 반복돼서(훅2=훅3, 벌스2=벌스3, 브릿지1=2) Suno가 같은 루프를 복붙함 —
  // 두 번째부터는 occurrence마다 다른 소소한 변주를 얹어서 반복 속에서도 곡이 진행되게 함
  const BRIDGE_TECH=['filter closing on the beat','drums dropping to half-time','pitch riser on the lead','reverse swell on the snare','stutter-edit on the hats','bass dropping out into silence'];
  const sAO=st.sectionArrangeOccurrence||{};
  // 이 장르의 섹션 편곡 방향({d}=메인 드럼,{m}=리드,{e}=808/베이스)과 프로듀서 레퍼런스의 핵심 특징 — 기본 생성물에 처음부터 포함
  const cue=type=>(GENRE_SECTION_CUE[st.genre]?.[type]||'').replace(/\{e\}/g,eDesc);
  const refSig=REF_SIG[st.refs[0]]||'';
  const hookDrums=drumList.slice(0,3).join(' & ')||dDesc;
  // "마지막"으로 고정하면 조언이 "첫 훅"을 가리켜도 무시되니, AI가 정한 occurrence(기본은 기존처럼 마지막)를 그대로 따름 —
  // 이 타입의 진짜 클라이맥스 판정(isLast 등)과는 별개 — 그건 훅 서브타이틀/에너지 문구용으로 계속 그대로 씀
  const boostOccursHere=(type,current,total)=>(sAO[type]==='first'?current===1:current===total);

  // 아웃트로가 인트로를 다시 불러와서 구조적으로 호응하게 — 인트로 3갈래 중 뭐가 쓰였는지 한 줄로 저장해뒀다가 아웃트로에서 참조
  let introVibe='';
  segs.forEach((type,si)=>{
    if(type==='intro'){
      lines.push('[Intro]');
      // 스킵 방지 — 잔잔한 페이드인 빌드업은 Suno가 기본으로 만드는 "안전한" 패턴이라 가장 먼저 스킵당함
      // 보컬 있으면 Vocal First, 에너지 낮은 장르는 Signature Sound, 나머지는 Groove First로 즉시 진입
      const gEnergy=GENRES[st.genre]?.energy;
      const lowEnergy=gEnergy==='low'||gEnergy==='low-mid';
      const fxOpen=(st.transitionFx&&st.transitionFx.length)?(TRANSITION_FX_TAG[st.transitionFx[0]]||st.transitionFx[0]):'impact crash hit';
      if(hasVocal){
        introVibe='the immediate vocal entrance';
        lines.push(`(Cold open — ${eDesc} and ${dDesc} hit immediately in ${keyName}, ${melodyRef('intro')}, ${st.vocal.toLowerCase()} enter within the first beat, ${vocalDesc}, no build-up, ${spaceArc('intro')}${aiNote('intro')+manualNote('인트로')})`);
      } else if(lowEnergy){
        introVibe='the mood-first, minimal-build opening';
        lines.push(`(Immediate mood set — ${melodyRef('intro')} defines the tone from bar 1 in ${keyName}, ${grooveTag}, minimal build, ${eDesc} enters within the first bar, ${spaceArc('intro')}${aiNote('intro')+manualNote('인트로')})`);
      } else {
        introVibe=`the ${fxOpen} cold open`;
        lines.push(`(Cold open — ${fxOpen}, then ${eDesc} and ${dDesc} ${dyn.entry||'slam in immediately'} in ${keyName}, ${melodyRef('intro')}, full groove from bar 1, no intro build-up, ${spaceArc('intro')}${aiNote('intro')+manualNote('인트로')})`);
      }
    } else if(type==='hook'){
      cnt.hook++;
      const isLast=cnt.hook===totalHooks;
      const isEdge=cnt.hook===1||isLast;   // 첫·마지막 훅에만 장르 방향·레퍼런스 특징·"ZERO vocal chops" — 가운데 훅은 변주로 차별화
      const sub=isLast?(isMellowMood?'Fullest Atmosphere':'Maximum Anthemic Climax'):hookSub;
      // hookEng 자체가 이미 "maximum ..."인 경우(예: 에너제틱·하입 무드) "Maximum maximum ..." 중복 방지
      const energy=isLast
        ?(isMellowMood
          ?`${hookEng.charAt(0).toUpperCase()+hookEng.slice(1)} at its fullest, all layers present, deepest atmosphere`
          :`Maximum ${hookEng.replace(/^maximum /i,'')} energy, all layers activated, heaviest impact`)
        :(cnt.hook===1
          ?`${hookEng.charAt(0).toUpperCase()+hookEng.slice(1)} drop, ${isMellowMood?'full arrangement':'full energy'}`
          :`${hookEng.charAt(0).toUpperCase()+hookEng.slice(1)} drop ${['returning a step denser than the previous hook','denser again, one layer short of the full peak','nearly at the peak, only the final push held back'][Math.min(cnt.hook-2,2)]}`);
      const vocalPhrase=hasVocal?`${st.vocal.toLowerCase()} driving the hook${isEdge?`, ${vocalDesc}`:''}`:(isEdge?'completely instrumental, ZERO vocal chops':'instrumental');   // 보컬 질감 문구는 매 섹션 반복하면 길이만 늘어서(확장 구조+보컬은 5000자 한도에 근접) 첫·마지막 훅에만
      // 가운데 훅: 훅 1과 리듬 문구가 토씨까지 같으면 Suno가 같은 루프를 복붙함 — 보조 드럼이 있으면 그게 주도하는 변주, 없으면 필인
      const hookVary=(!isLast&&cnt.hook>=2)
        ?(cnt.hook%2===0
          ?(dSecond?`the ${dSecond} pattern takes over the rhythm in the second half, drum fill into the downbeat`:'drum fill into the downbeat')
          :`${dDesc} fills every other bar, variation on the lead phrase`)
        :'';
      lines.push(`[${hasVocal?'':'Instrumental '}Hook ${cnt.hook}: ${sub}]`);
      // dDesc(드럼 "패턴 종류" — four-on-the-floor kick/jersey bounce kick/trap rolls 등 장르마다 다른 리듬 뼈대)를 빼면 장르를 바꿔도
      // 훅에서 리듬 정체성이 안 드러남(실사용자 피드백: "장르 다른데 왜 드럼이 같아 보여") — 이제 고른 드럼 전부(메인 & 보조)
      // 마지막 훅이 첫 훅과 리듬·장르·레퍼런스 문구를 그대로 공유해서(측정: 평균 66% 겹침) 리뷰가 세 장르 모두 "훅1과 훅3가 복붙"이라고 지적 —
      // 마지막 훅은 첫 훅에 이미 쓴 문구를 반복하지 않고 "무엇이 더 커졌는지"만 쓴다: 드럼 필 밀도, 그루브 최대치, 무드별 정점, 리드 옥타브 더블링
      const lastOfMany=isLast&&cnt.hook>1;
      const hookBody=lastOfMany
        ?[energy,`${hookDrums}, ${dRoll?`${dRoll} accelerating into fills every bar`:'drum fills every bar'}`,GROOVE_PEAK[st.groove]||'',cue('peak'),dyn.peak,melodyRef('hook',cnt.hook,totalHooks),vocalPhrase,spaceArc('climax',cnt.hook,totalHooks)].filter(Boolean).join(', ')
        :[energy,hookDrums,cnt.hook===1?grooveText(st.groove):(((cnt.hook-2)%2===0?GROOVE_VARY:GROOVE_VARY2)[st.groove]||''),isEdge&&dyn.hook,isEdge&&cue('hook'),melodyRef('hook',cnt.hook,totalHooks),isEdge&&refSig,isEdge&&texLine('hook'),vocalPhrase,spaceArc(isLast?'climax':'hook',cnt.hook,totalHooks),hookVary].filter(Boolean).join(', ');
      lines.push(`(${bH} Bars: ${hookBody}${boostOccursHere('hook',cnt.hook,totalHooks)?arrangeExtra('hook'):''}${aiNote(`hook${cnt.hook}`)}${cnt.hook===1?manualNote('버스/훅'):''}${isLast?manualNote('클라이맥스/드롭'):''})`);
    } else if(type==='verse'){
      cnt.verse++;
      const sub=cnt.verse===1?`Stripped & ${verseSub}`:`${['Rhythmic Switch','Half-Time Tension','Last Calm'][Math.min(cnt.verse-2,2)]} & ${verseSub}`;
      const bassWord=eightOh==='None'?'bass':'808s';
      const desc=cnt.verse===1
        ?[dyn.verse?`Beat strips back, ${dyn.verse}`:'Beat strips back, spacious and clean arrangement',`sparse ${bassWord}, lighter drum pattern (${dSecond||dDesc} only)`,cue('verse'),`${melodyRef('verse',1)} softened`,texLine('verse')].filter(Boolean).join(', ')
        :(cnt.verse===2
          ?[`Slightly varied ${dDesc} bounce, ${bassWord==='bass'||GENRES[st.genre]?.energy==='low'||GENRES[st.genre]?.energy==='low-mid'?'steady warm bassline':'deeper continuous sub-bass'}`,melodyRef('verse',cnt.verse),'intimate groove',isMellowMood?'':'still coiled, anticipation building quietly toward the next hook'].filter(Boolean).join(', ')
          :(cnt.verse===3
            ?[`${dRoll||dDesc} pattern shifting to a half-time feel`,melodyRef('verse',cnt.verse),isMellowMood?'':'tension tighter than the previous verse'].filter(Boolean).join(', ')
            :[`${dRoll||dDesc} stripped to sparse ticks`,melodyRef('verse',cnt.verse),'the last calm moment before the drop'].join(', ')));
      const vocalPhrase=hasVocal?`${st.vocal.toLowerCase()} present${cnt.verse===1?`, ${vocalDesc}`:''}`:'purely instrumental pocket';
      // 다음이 바로 훅이면(브릿지 없는 구조) 벌스 끝 2마디에 전환효과 빌드 — 없으면 클라이맥스가 갑자기 튀어나오고, 고른 전환효과 2번째는 어디에도 안 쓰임(리뷰 반복 지적)
      let preBuild='';
      if(segs[si+1]==='hook'){
        const finalDrop=segs.slice(si+1).filter(x=>x==='hook').length===1;
        const fx=finalDrop?fxAll.join(', '):fxAll[preBuildN%fxAll.length];preBuildN++;   // 마지막 드롭 직전엔 고른 전환효과 전부
        preBuild=`last 2 bars: ${fx}${finalDrop&&dRoll?`, ${dRoll} accelerating`:''} into the ${finalDrop?'final drop':'drop'}`;
      }
      lines.push(`[${hasVocal?'':'Instrumental '}Verse ${cnt.verse}: ${sub}]`);
      lines.push(`(${bV} Bars: ${desc}, ${vocalPhrase}, ${spaceArc('verse',cnt.verse)}${preBuild?', '+preBuild:''}${boostOccursHere('verse',cnt.verse,totalVerses)?arrangeExtra('verse'):''}${aiNote(`verse${cnt.verse}`)}${cnt.verse===1?manualNote('버스/훅'):''})`);
    } else if(type==='bridge'){
      cnt.bridge++;
      const isLastB=cnt.bridge===totalBridges;
      // 마지막 브릿지는 이미 내용상(Quick break, chord echoing, fx, maximum tension) 빌드업 역할을 하고 있어서
      // 새 섹션 타입은 안 만들고, 라벨만 "다음 드롭 직전"이라는 걸 더 명확히 드러내는 이름으로 보강
      const sub=isLastB?'Pre-Drop Build-up':'Tension Build';
      // 전환 효과 — 사용자가 고른 게 있으면 그걸로, 없으면 기본값. 브릿지마다 시작 효과를 돌려서(1번은 A→B, 2번은 B→A)
      // 두 브릿지가 같은 효과음 조합·순서로 반복되지 않게 함
      const fxList=fxAll;
      const off=(cnt.bridge-1)%fxList.length;
      const fxPhrase=[...fxList.slice(off),...fxList.slice(0,off)].join(', ');
      const rollPhrase=dRoll?`${dRoll} accelerating`:'';
      const desc=isLastB
        ?['Quick break',`isolated ${melodyRef('bridge',cnt.bridge,totalBridges)} chord echoing`,rollPhrase,fxPhrase,BRIDGE_TECH[(cnt.bridge+2)%BRIDGE_TECH.length],'maximum tension',spaceArc('bridge',cnt.bridge,totalBridges)].filter(Boolean).join(', ')
        :(cnt.bridge===1
          ?[dyn.bridge||'Heavy low-pass filter muffles the beat',cue('bridge'),texLine('bridge'),fxPhrase,`${melodyRef('bridge',cnt.bridge,totalBridges)} building anticipation`,spaceArc('bridge',cnt.bridge,totalBridges)].filter(Boolean).join(', ')
          :[rollPhrase,fxPhrase,`${melodyRef('bridge',cnt.bridge,totalBridges)} building anticipation`,BRIDGE_TECH[(cnt.bridge-2)%BRIDGE_TECH.length],spaceArc('bridge',cnt.bridge,totalBridges)].filter(Boolean).join(', '));
      lines.push(`[Instrumental Bridge ${cnt.bridge}: ${sub}]`);
      lines.push(`(${bB} Bars: ${desc}${boostOccursHere('bridge',cnt.bridge,totalBridges)?arrangeExtra('bridge'):''}${aiNote(`bridge${cnt.bridge}`)})`);
    } else if(type==='outro'){
      lines.push('[Outro]');
      // 3단 아웃트로 — 작곡가 가이드가 17곡 중 16곡에서 공통으로 발견한 패턴: 드럼 먼저 빠짐 → 나머지 악기 페이드 → 마지막 악기 단독으로 울림
      // + 인트로를 다시 불러와서("echoing ~") 구조적으로 호응하게, 스테레오 폭도 클라이맥스에서 디케이로 좁아지게
      lines.push(`(Drums drop out first, then ${eDesc} and the rest fade out, ${melodyRef('outro')} final chord rings out alone in ${keyName}, ${spaceArc('outro')}, echoing ${introVibe} one last time before silence${dyn.outro?`, ${dyn.outro}`:''}${texLine('outro')?`, ${texLine('outro')}`:''}${aiNote('outro')+manualNote('아웃트로')})`);
    }
    lines.push('');
  });
  return lines.join('\n').trim();
}

// ============================================================
// PRODUCER ADVICE ENGINE
// ============================================================
// 장르별 훅 적정 마디 수 · 편곡 밀도 선호 (🎼 편곡 포인트를 실제 설정값 기준 동적 피드백으로 만드는 데 씀)
const GENRE_ARRANGE_PROFILE=[
  {bars:[4,8],  density:'balanced'}, // 0 Trap
  {bars:[4,8],  density:'dense'},    // 1 Dark Trap
  {bars:[6,10], density:'balanced'}, // 2 Melodic Trap
  {bars:[4,8],  density:'sparse'},   // 3 NY Drill
  {bars:[4,8],  density:'balanced'}, // 4 UK Drill
  {bars:[2,4],  density:'sparse'},   // 5 Phonk
  {bars:[8,16], density:'balanced'}, // 6 Boom Bap
  {bars:[8,16], density:'sparse'},   // 7 Cloud Rap
  {bars:[4,8],  density:'sparse'},   // 8 Lo-fi
  {bars:[4,8],  density:'balanced'}, // 9 Jersey Club
  {bars:[2,4],  density:'dense'},    // 10 Rage/Plugg
  {bars:[4,8],  density:'balanced'}, // 11 Afro Trap
  {bars:[8,16], density:'sparse'},   // 12 Conscious
  {bars:[6,12], density:'sparse'},   // 13 Trap Soul
  {bars:[4,8],  density:'dense'},    // 14 Hyperpop
  {bars:[4,8],  density:'dense'},    // 15 Digicore
  {bars:[8,16], density:'sparse'},   // 16 Pluggnb
  {bars:[8,16], density:'balanced'}, // 17 Westwood
  {bars:[4,8],  density:'dense'},    // 18 Trap Metal
  {bars:[4,8],  density:'balanced'}, // 19 Sexy Drill
];
function buildProducerAdvice(g,st,mood,bpmVal,keyStr){
  if(!g)return{warns:[],tips:[]};
  const warns=[];const tips=[];
  const _808levels=['None','Minimal','Balanced','Heavy','Dominant'];

  // 1. BPM 범위 체크
  const[lo,hi]=g.bpmR;
  if(bpmVal<lo-5||bpmVal>hi+5){
    const mid=Math.round((lo+hi)/2);
    warns.push({html:`⚠️ <strong>${g.kr}</strong> 권장 BPM은 <strong>${lo}–${hi}</strong>입니다. ${bpmVal} BPM은 장르 그루브가 깨질 수 있습니다.`,btnLabel:`${mid} BPM으로 조정`,btnFn:`applyAdvBPM(${mid})`});
  }

  // 2. 808 레벨 vs 장르 권장
  const auto=GENRE_AUTO[st.genre];
  if(auto){
    const ci=_808levels.indexOf(st._808||'Balanced');
    const ri=_808levels.indexOf(auto.a808);
    if(Math.abs(ci-ri)>=2){
      const dir=ci<ri?'낮습니다':'높습니다';
      warns.push({html:`⚠️ <strong>${g.kr}</strong>에는 <strong>${auto.a808} 808</strong>이 프로덕션 표준입니다. 현재 <strong>${st._808}</strong>은 너무 ${dir}.`,btnLabel:`${auto.a808} 808 적용`,btnFn:`applyAdv808('${auto.a808}')`});
    }
  }

  // 3. 장조/단조 vs 장르 특성
  const isMajor=st.key<7;
  const darkGenres=[1,3,4,5,10];
  if(darkGenres.includes(st.genre)&&isMajor){
    warns.push({html:`⚠️ <strong>${g.kr}</strong>는 대부분 단조(minor key)로 제작됩니다. <strong>${keyStr}</strong>는 장르 특유의 다크함을 약화시킬 수 있습니다.`,btnLabel:'단조로 변경 (A minor)',btnFn:'applyAdvKey()'});
  }

  // 4. 무드 vs 장르 에너지 충돌
  if(mood){
    const mIdx=HH_MOODS.findIndex(m=>m.kr===st.mood);
    const mellowMoods=[2,4,5,7,10,12,14]; // melodic, psychedelic, chill, introspective, sad, romantic, nostalgic
    const aggressiveMoods=[0,6]; // dark menacing, aggressive angry
    const hardGenres=[0,1,3,4,10,14];
    const mellowGenres=[7,8,16,6,12];
    if(hardGenres.includes(st.genre)&&mellowMoods.includes(mIdx)){
      warns.push({html:`⚠️ <strong>${g.kr}</strong>에 <strong>${mood.kr}</strong> 무드는 에너지가 맞지 않습니다. <strong>어둡고 위압적</strong> 또는 <strong>분노·공격적</strong> 무드를 추천합니다.`,btnLabel:'어둡고 위압적으로 변경',btnFn:`applyAdvMood('어둡고 위압적')`});
    }
    if(mellowGenres.includes(st.genre)&&aggressiveMoods.includes(mIdx)){
      warns.push({html:`⚠️ <strong>${g.kr}</strong>는 조용하고 내성적인 에너지입니다. <strong>칠·그루비</strong> 또는 <strong>내성적·사색</strong> 무드가 더 어울립니다.`,btnLabel:'칠·그루비로 변경',btnFn:`applyAdvMood('칠·그루비')`});
    }
  }

  // 5. 멜로디 악기 추천 (장르별 프로덕션 가이드 기반)
  const melodyTips=GENRE_MELODY_TIPS;
  const sugMelody=melodyTips[st.genre];
  if(sugMelody){
    if(!st.melody.length){
      tips.push({html:`💡 멜로디 악기 없음 — <strong>${g.kr}</strong>에는 <strong>${sugMelody}</strong> 조합이 잘 어울립니다.`,btnLabel:'악기 적용',btnFn:`applyAdvMelody('${sugMelody}')`});
    } else {
      const goodParts=sugMelody.split(' + ');
      const hasMatch=st.melody.some(m=>goodParts.some(p=>m.toLowerCase().includes(p.toLowerCase().split(' ')[0])));
      if(!hasMatch)tips.push({html:`💡 현재 멜로디 악기보다 <strong>${g.kr}</strong>에는 <strong>${sugMelody}</strong>가 더 어울립니다.`,btnLabel:'악기 교체',btnFn:`applyAdvMelody('${sugMelody}')`});
    }
  }

  // 6. 장르별 프로 팁
  const proTips={
    0:'🎛 하이햇 롤 벨로시티 오토메이션으로 에너지 변화를 만드세요. 808은 킥과 사이드체인 필수.',
    1:'🎛 긴 리버브와 딜레이로 공간감을 극대화하세요. 빈 공간이 다크함을 더 강조합니다.',
    2:'🎛 멜로디 훅을 먼저 완성하고 비트를 맞추세요. 감성 멜로디가 전체 곡을 이끕니다.',
    3:'🎛 808 피치 글라이드가 NY Drill의 핵심입니다. 반드시 음계에 맞게 튜닝해야 합니다.',
    4:'🎛 오프비트 스네어 타이밍이 UK Drill을 차갑게 만듭니다. 스네어를 전통 위치에서 살짝 벗어나게 배치하세요.',
    5:'🎛 카우벨 패턴과 멤피스 스타일 반복 루프가 Phonk의 시그니처입니다. 루프를 짧게 유지하세요.',
    6:'🎛 샘플 선택이 전부입니다. 바이닐 크래클과 오프그리드 드럼이 생동감의 핵심입니다.',
    7:'🎛 공간과 여백이 클라우드 랩의 미학입니다. 드럼을 너무 빡빡하게 채우지 마세요.',
    8:'🎛 의도적인 불완전함이 Lo-fi의 매력입니다. 바이닐 노이즈를 올리고 하이파이 요소를 줄이세요.',
    9:'🎛 고스트 킥을 메인 킥보다 6-10dB 낮게 맞추고 808은 빠른 사이드체인으로 펌핑 효과를 내세요.',
    10:'🎛 1-2마디 짧은 루프 반복이 Rage의 핵심입니다. 단순하고 중독적인 훅이 복잡한 멜로디보다 강합니다.',
    11:'🎛 아프로 퍼커션을 먼저 레이어링한 후 트랩 요소를 얹으세요. 그루브 타이밍이 핵심입니다.',
    12:'🎛 비트를 간결하게 유지하세요. 복잡한 비트는 가사 메시지를 방해합니다.',
    13:'🎛 808을 베이스가 아닌 멜로디 악기로 다루세요. 코드 진행에 맞게 피치를 정교하게 세팅해야 합니다.',
    14:'🎛 과함이 미덕입니다. 극단적 피치 시프트, 클리핑, 디스토션을 두려워하지 마세요.',
    15:'🎛 로파이 텍스처와 디지털 글리치의 균형이 핵심입니다. 침실 프로듀서 느낌을 유지하세요.',
    16:'🎛 808이 멜로디까지 담당합니다. 느린 BPM에서 808이 풍성하게 울리도록 긴 노트를 사용하세요.',
    17:'🎛 재즈 코드 진행과 퀴키한 샘플 선택이 Westwood 스타일을 완성합니다.',
    18:'🎛 808을 클리핑 직전까지 디스토션으로 밀고, 기타 리프는 다운튜닝된 짧은 반복으로 유지하세요. 스크림·그로울이 킥과 같은 타이밍에 꽂혀야 합니다.',
    19:'🎛 R&B 샘플 루프를 먼저 정하고 그 위에 저지 클럽 킥과 슬라이딩 808을 얹으세요. 무심한 듯 여유로운 딜리버리가 매력이라 비트를 꽉 채우지 마세요.',
  };
  if(proTips[st.genre]&&st._appliedAdvTipGenre!==st.genre){
    const tipTags=ADV_TIP_TAGS[st.genre]||[];
    const tsIdx=(window._advTagSets=window._advTagSets||[]).length;
    window._advTagSets.push(tipTags);
    tips.push({html:proTips[st.genre],btnLabel:'스타일에 반영',btnFn:tipTags.length?`applyAdvTagsIdx(${tsIdx})`:null});
  }

  // 7. 구조 분석
  const segs=st.structSegs||['intro','hook','verse','hook','outro'];
  const hookCnt=segs.filter(s=>s==='hook').length;
  const verseCnt=segs.filter(s=>s==='verse').length;
  const hasBridge=segs.includes('bridge');
  const bH=+(document.getElementById('hh-bar-hook')?.value||8);
  if(hookCnt>=3){
    warns.push({html:`⚠️ 훅이 <strong>${hookCnt}회</strong> 반복됩니다. 3회 이상이면 임팩트가 희석됩니다. 마지막 훅을 브릿지로 대체하는 걸 고려해보세요.`,btnLabel:null,btnFn:null});
  }
  if(hookCnt>=2&&verseCnt>=2&&!hasBridge){
    tips.push({html:`💡 <strong>구조 개선</strong> — 훅×${hookCnt}·벌스×${verseCnt} 구조에 브릿지를 추가하면 감정 절정이 생기고 마지막 훅의 임팩트가 강해집니다.`,btnLabel:null,btnFn:null});
  }
  if(bH<6){
    warns.push({html:`⚠️ 훅이 <strong>${bH}마디</strong>로 짧습니다. 인스트루멘탈 훅은 최소 8마디는 돼야 임팩트가 살아납니다.`,btnLabel:null,btnFn:null});
  }
  // 브릿지 위치 — 마지막 훅 직전이 아니면 고조 효과가 약함
  const lastHookIdx=segs.lastIndexOf('hook');
  const bridgeIdxs=segs.map((s,i)=>s==='bridge'?i:-1).filter(i=>i>=0);
  if(bridgeIdxs.length&&lastHookIdx>=0&&!bridgeIdxs.includes(lastHookIdx-1)){
    tips.push({html:`💡 <strong>브릿지 위치</strong> — 브릿지는 마지막 훅 바로 직전에 있어야 고조 효과가 가장 큽니다. 지금 위치면 반전 효과가 약해질 수 있어요.`,btnLabel:null,btnFn:null});
  }
  // 구조가 너무 납작함 — 훅만 반복되면 고조·반전을 줄 여지가 아예 없음
  const uniqueStructTypes=new Set(segs.filter(s=>s!=='intro'&&s!=='outro'));
  if(uniqueStructTypes.size<=1){
    warns.push({html:`⚠️ <strong>구조가 단조롭습니다</strong> — 훅만 반복되는 구조라 고조·반전을 줄 여지가 없습니다. 벌스나 브릿지를 최소 하나 추가해서 대비를 만들어보세요.`,btnLabel:null,btnFn:null});
  }

  // 8. 무드+멜로디 일관성
  const emotionalMoods=[2,5,7,10,12,14];
  const mIdx2=HH_MOODS.findIndex(m=>m.kr===st.mood);
  if(emotionalMoods.includes(mIdx2)&&!st.melody.length){
    const moodMelMap={2:'Dark synth + Guitar loop',5:'Mellow keys + Flute',7:'Soft piano + Ambient pad',10:'Emotional piano + Ambient pad',12:'Emotional piano + Strings',14:'Guitar loop + Ambient pad'};
    const sugMelody2=moodMelMap[mIdx2]||'Dark synth + Guitar loop';
    warns.push({html:`⚠️ <strong>${st.mood}</strong> 무드를 선택했지만 멜로디 악기가 없습니다. 감성이 제대로 전달되지 않습니다.`,btnLabel:'멜로디 악기 적용',btnFn:`applyAdvMelody('${sugMelody2}')`});
  }

  // 9. 밀도 vs 장르 적합성
  if(st.density){
    const sparseGenres=[7,8,12,16];
    const denseVals=['Dense','Maximalist'];
    const denseGenres=[0,3,14];
    const sparseVals=['Minimalist'];
    if(g&&sparseGenres.includes(st.genre)&&denseVals.includes(st.density)){
      tips.push({html:`💡 <strong>${g.kr}</strong>은 여백이 핵심인 장르입니다. <strong>${st.density}</strong> 밀도는 장르 감성을 해칩니다. Sparse 또는 Balanced를 권장합니다.`,btnLabel:null,btnFn:null});
    }
    if(g&&denseGenres.includes(st.genre)&&sparseVals.includes(st.density)){
      tips.push({html:`💡 <strong>${g.kr}</strong>은 레이어가 쌓여야 강합니다. Minimalist보다 Balanced 이상을 권장합니다.`,btnLabel:null,btnFn:null});
    }
  }

  // 10. 편곡 퀄리티 팁 🎼
  const arrangeQualityTips={
    0:'훅에서 808을 최대로 폭발시키고 벌스에서 줄이는 대비가 임팩트의 핵심입니다.',
    1:'공간이 무기입니다. 벌스를 최대한 Sparse하게 만들어 훅의 무게감을 극대화하세요.',
    2:'감성 멜로디 라인이 전부입니다. 훅 멜로디를 먼저 완성한 뒤 섹션 구조를 맞추세요.',
    3:'808 슬라이드 패턴이 멜로디 역할을 합니다. 단조로운 반복이 드릴의 최면적 강점입니다.',
    4:'훅과 벌스의 드럼 패턴 변화로 대비를 주세요. 오프비트 스네어가 UK 드릴의 인상을 결정합니다.',
    5:'2~4마디 짧은 루프의 최면적 반복이 Phonk의 핵심입니다. 루프를 길게 늘리지 마세요.',
    6:'샘플 그루브가 곡을 이끕니다. 훅보다 벌스 중심 구조가 붐뱁 감성에 더 어울립니다.',
    7:'여백이 악기입니다. 드럼을 줄일수록 공간감과 몽환적 분위기가 극대화됩니다.',
    8:'짧고 반복적인 루프 구조가 Lo-fi 감성에 맞습니다. 복잡한 섹션 전환보다 일관된 무드를 유지하세요.',
    9:'킥 패턴의 리듬 변주가 편곡의 핵심입니다. 짧은 섹션 전환으로 댄스 에너지를 지속하세요.',
    10:'1~2마디 루프가 전부입니다. 단순할수록 강합니다. 중독적인 한 줄 멜로디가 긴 편곡보다 효과적입니다.',
    11:'퍼커션 레이어를 먼저 완성하고 멜로디를 얹으세요. 리듬 그루브가 곡의 인상을 결정합니다.',
    12:'비트는 심플하게, 공간은 넓게. 가사에 집중할 수 있는 여유로운 편곡이 컨셔스의 미덕입니다.',
    13:'808이 멜로디입니다. 808 피치를 코드 진행에 정확히 맞추면 편곡이 훨씬 풍부해집니다.',
    14:'극단적 에너지 대비가 핵심입니다. 조용한 구간과 폭발적 구간을 번갈아 배치해 충격 효과를 극대화하세요.',
    15:'날것의 감성이 미덕입니다. 과도한 다듬기보다 불완전한 침실 프로듀서 텍스처를 유지하세요.',
    16:'느린 BPM에서 808의 긴 서스테인이 멜로디가 됩니다. 최소한의 요소로 최대한의 공간을 만드세요.',
    17:'의외성이 매력입니다. 예상치 못한 코드 전환과 독특한 샘플 조합이 Westwood 스타일을 완성합니다.',
    18:'훅은 리프+808 풀 어택, 벌스는 드럼과 보컬만 남기는 극단적 대비가 핵심입니다. 에너지가 식기 전에 짧게 끝내세요.',
    19:'샘플 루프가 곡을 이끕니다. 훅과 벌스 모두 같은 루프를 유지하고 킥 패턴과 808만 바꿔 변화를 주세요. 짧고 무드 중심의 구조가 어울립니다.',
  };
  // 실제 설정(훅 마디 수·멜로디·텍스처 개수)을 보고 편곡 포인트에 구체적인 진단 문장을 덧붙임
  const dynamicArrangeFeedback=(genreIdx,bars,melodyN,textureN)=>{
    const profile=GENRE_ARRANGE_PROFILE[genreIdx];
    if(!profile)return'';
    const [lo,hi]=profile.bars;
    const parts=[];
    if(bars<lo)parts.push(`지금 훅이 ${bars}마디로 이 장르 기준(${lo}-${hi}마디)보다 짧아요 — 늘려보세요`);
    else if(bars>hi)parts.push(`지금 훅이 ${bars}마디로 이 장르 기준(${lo}-${hi}마디)보다 길어요 — 줄여보세요`);
    const fill=melodyN+textureN;
    if(profile.density==='sparse'&&fill>=3)parts.push(`멜로디+텍스처가 ${fill}개나 켜져 있어 이 장르 특유의 여백이 줄어듭니다 — 1~2개로 줄이는 걸 권장`);
    if(profile.density==='dense'&&fill===0)parts.push(`멜로디·텍스처가 하나도 없어 허전할 수 있어요 — 이 장르는 레이어를 쌓는 게 어울림`);
    return parts.length?` → ${parts.join(', ')}`:'';
  };
  if(st.genre!=null&&arrangeQualityTips[st.genre]&&st._appliedArrangeTipGenre!==st.genre){
    const uniqueSegs=[...new Set(segs)].filter(s=>s!=='intro'&&s!=='outro');
    const sBtnStyle=`padding:3px 10px;border-radius:20px;border:1px solid var(--border-hi);font-size:11px;font-weight:600;cursor:pointer;transition:.15s;white-space:nowrap;`;
    const secBtns=uniqueSegs.map(s=>{
      const label={hook:'Hook',verse:'Verse',bridge:'Bridge'}[s]||(s.charAt(0).toUpperCase()+s.slice(1));
      const applied=!!(st.sectionArrangeExtras||{})[s];
      return applied
        ?`<span style="${sBtnStyle}background:var(--accent-dim);color:var(--accent-text);cursor:default">✓ ${label}</span>`
        :advCheckbox(`applyArrangeTipToSection('${s}')`,`편곡 ${label}`);
    }).join('');
    const dimBtn=`<button onclick="dismissArrangeTip()" style="${sBtnStyle}background:transparent;color:var(--text-3);border-color:var(--border)">✕</button>`;
    const feedback=dynamicArrangeFeedback(st.genre,bH,st.melody.length,st.texture.length);
    const moodTip=mood&&MOOD_ARRANGE_TIP[mood.kr]?` ${MOOD_ARRANGE_TIP[mood.kr]}`:'';
    tips.push({html:`🎼 <strong>편곡 포인트</strong> — ${arrangeQualityTips[st.genre]}${moodTip}${feedback}`,btnHtml:`<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-left:8px;flex-shrink:0">${secBtns}${dimBtn}</div>`});
  }

  return{warns,tips};
}

// ============================================================
// PRODUCER ADVICE — APPLY ACTIONS
// ============================================================
function applyAdvBPM(bpm){
  st.bpm=bpm;
  document.getElementById('hh-bpm').value=bpm;
}
function applyAdv808(level){
  st._808=level;
  st._mtAutoManaged=false;
  chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,onRhythmManualChange);
  setAutoHint('hh-808-hint','808: '+level);
}
function applyAdvKey(){
  st.key=7; // A minor
  document.getElementById('hh-key').value=7;
}
function applyAdvMelody(melStr){
  const parts=melStr.split(' + ');
  st.melody=[...parts];
  st._mtAutoManaged=false;
  chipGrid(document.getElementById('hh-melody'),HH_MELODY,st,'melody',null,onMelodyManualChange);
  renderMelodyRoleUI();
}
function applyAdvMood(moodKr){
  st.mood=moodKr;
  moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',null);
  if(st._mtAutoManaged)recommendMelodyTexture();
  if(st._structAutoManaged)recommendStructure();
}
function applyAdvTagsIdx(idx){
  const tags=(window._advTagSets||[])[idx]||[];
  tags.forEach(t=>{if(!st.extraTags.includes(t))st.extraTags.push(t);});
  st._appliedAdvTipGenre=st.genre;
}
function applyArrangeTipToSection(sectionType){
  st.sectionArrangeExtras=st.sectionArrangeExtras||{};
  // store true flag only — direction is generated dynamically in buildHHSectionPrompt
  st.sectionArrangeExtras[sectionType]=true;
  st.sectionArrangeOccurrence=st.sectionArrangeOccurrence||{};
  st.sectionArrangeOccurrence[sectionType]='last'; // 이 무료 팁은 항상 클라이맥스(마지막) 대상 — 기존 동작 그대로
}
function dismissArrangeTip(){
  st._appliedArrangeTipGenre=st.genre;
  hhGenerate(false,{noScroll:true});
}
// 룰 기반 피드백도 AI 리뷰와 같은 방식 — 항목마다 버튼을 눌러 그때그때 재생성하면 화면이 튀고 기록이 클릭 수만큼 쌓여서,
// 체크박스로 고른 것들을 한 번에 적용하고 재생성·기록은 1번만. 키는 예전 onclick 문자열("applyAdvBPM(140)") 그대로라 파싱만 하면 됨
const ADV_FN={applyAdvMood,applyAdvMelody,applyAdv808,applyAdvBPM,applyAdvKey,applyAdvTagsIdx,applyArrangeTipToSection};
const ADV_ORDER=Object.keys(ADV_FN); // 무드가 멜로디·808·드럼 재추천을 다시 돌리니 가장 먼저, 나머지가 그 위에 덮음
let _advSel=new Set();
function advCheckbox(key,label){
  window._advKeys.push(key);
  window._advLabels[key]=label;
  return `<label style="display:flex;align-items:center;gap:5px;margin-left:10px;cursor:pointer;flex-shrink:0;font-size:11px;font-weight:600;color:var(--accent-text);white-space:nowrap"><input type="checkbox" class="hh-adv-cb" data-adv="${key.replace(/"/g,'&quot;')}" ${_advSel.has(key)?'checked':''} onchange="toggleAdvPick(this.dataset.adv,this.checked)">${label}</label>`;
}
function toggleAdvPick(key,checked){
  if(checked){
    // 멜로디 교체·무드 변경은 서로 대안이라(예: 멜로디 제안이 2개) 둘 다 고르면 나중 것만 남고 앞의 건 조용히 사라짐 — 같은 종류는 하나만 선택되게
    const name=key.split('(')[0];
    if(name==='applyAdvMelody'||name==='applyAdvMood'){
      [..._advSel].forEach(k=>{if(k!==key&&k.startsWith(name+'('))_advSel.delete(k);});
      document.querySelectorAll('.hh-adv-cb').forEach(cb=>{if(cb.dataset.adv!==key&&cb.dataset.adv.startsWith(name+'('))cb.checked=false;});
    }
    _advSel.add(key);
  }else _advSel.delete(key);
  updateAdvApplyBtn();
}
function selectAllAdv(flag){
  _advSel=flag?new Set(window._advKeys):new Set();
  document.querySelectorAll('.hh-adv-cb').forEach(cb=>{cb.checked=flag;});
  updateAdvApplyBtn();
}
function updateAdvApplyBtn(){
  const btn=document.getElementById('hh-adv-apply-btn');
  if(!btn)return;
  const n=[..._advSel].filter(k=>window._advKeys.includes(k)).length;
  btn.textContent=`✅ 선택 적용 (${n})`;
  btn.disabled=!n;
  btn.style.opacity=n?'1':'.5';
  btn.style.cursor=n?'pointer':'default';
}
function applySelectedAdv(){
  const keys=[..._advSel].filter(k=>window._advKeys.includes(k));
  if(!keys.length)return;
  keys.sort((x,y)=>ADV_ORDER.indexOf(x.split('(')[0])-ADV_ORDER.indexOf(y.split('(')[0]));
  const labels=[];
  keys.forEach(k=>{
    const m=k.match(/^(\w+)\((.*)\)$/);
    let arg=m[2].trim();
    if(/^'.*'$/.test(arg))arg=arg.slice(1,-1);else arg=(arg!==''&&!isNaN(arg))?+arg:undefined;
    ADV_FN[m[1]](arg);
    labels.push(window._advLabels[k]||m[1]);
  });
  _advSel=new Set();
  hhGenerate(`룰 피드백 ${keys.length}개 적용: ${labels.slice(0,3).join(' · ')}${labels.length>3?` 외 ${labels.length-3}`:''}`,{noScroll:true});
  showToast(`✅ 피드백 ${keys.length}개 적용됨`);
}
function removeAdvTag(tag){
  st.extraTags=st.extraTags.filter(t=>t!==tag);
  hhGenerate(`태그 제거: ${tag}`);
}

// source: undefined = 사용자가 직접 Generate 누름 (기록에 라벨 없음), 문자열 = 어떤 적용 액션이 실제로 프롬프트를 바꿔서 다시 생성됐는지 (기록에 라벨로 남음), false = 프롬프트 내용은 안 바뀌고 UI만 갱신 (기록 안 남김)
function hhGenerate(source,opts){
  const hasAiKey=!!getAnthropicKey();
  const g=st.genre!==null?GENRES[st.genre]:null;
  const keyStr=KEYS[st.key]||'A minor';
  const bpmVal=parseInt(document.getElementById('hh-bpm').value)||st.bpm;
  const refSong=(document.getElementById('hh-ref-song')?.value||'').trim();
  const moodIdx=HH_MOODS.findIndex(m=>m.kr===st.mood);
  const mood=moodIdx>=0?HH_MOODS[moodIdx]:null;

  const container=document.getElementById('hh-out-blocks');
  container.style.display='flex';
  container.innerHTML='';

  // ① 선택 내용 요약
  const summaryRows=[];
  if(refSong)summaryRows.push(['🎵 레퍼런스 곡',refSong]);
  summaryRows.push(['🎹 키',keyStr]);
  summaryRows.push(['🛡 AI 티 방지',antiAI?'ON':'OFF']);
  if(g)summaryRows.push(['🎛 서브장르',g.en]);
  summaryRows.push(['🥁 템포',bpmVal+' BPM']);
  summaryRows.push(['🔊 808',st._808||'Balanced']);
  if(st.drums.length)summaryRows.push(['🥁 드럼 패턴',st.drums.join(', ')]);
  if(st.melody.length)summaryRows.push(['🎵 멜로디',st.melody.join(', ')]);
  if(st.mood)summaryRows.push(['😶 분위기',st.mood+(mood?' · '+mood.tag:'')]);
  if(st.vocal&&st.vocal!=='No Vocal')summaryRows.push(['🎤 보컬',st.vocal]);
  if(st.refs.length){
    const refNames=st.refs.map(kr=>{const p=HH_REF.find(r=>r.kr===kr);return p?`${kr} (${p.vibes})`:kr;});
    summaryRows.push(['🎤 레퍼런스 프로듀서',refNames.join(' / ')]);
  }
  if(st.texture.length)summaryRows.push(['🎚 믹스 텍스처',st.texture.join(', ')]);
  if(st.era)summaryRows.push(['📅 시대',st.era]);
  if(st.region)summaryRows.push(['📍 지역',st.region]);
  if(st.density)summaryRows.push(['⚖ 밀도',st.density]);
  if(st.commercial)summaryRows.push(['🎯 색깔',st.commercial]);
  if(st.length)summaryRows.push(['⏱ 길이',st.length]);
  const narrEntries=HH_NARR.map(seg=>seg.label)
    .map(k=>[k, st.narrSt[k]])
    .filter(([,v])=>v);
  narrEntries.forEach(([k,v])=>summaryRows.push(['🎬 '+k,v]));
  Object.entries(st.narrAI).forEach(([occKey,v])=>summaryRows.push(['🎬 '+occKey,`🤖 ${v}`]));
  let tableHTML='<table style="width:100%;border-collapse:collapse">';
  summaryRows.forEach((row,i)=>{
    const bg=i%2===0?'rgba(255,255,255,0.035)':'transparent';
    tableHTML+=`<tr style="background:${bg}"><td style="padding:6px 10px;color:var(--text-2);font-size:11px;white-space:nowrap;width:42%">${row[0]}</td><td style="padding:6px 10px;color:var(--text-1);font-size:12px">${escHtml(row[1])}</td></tr>`;
  });
  tableHTML+='</table>';
  container.appendChild(makeOutBlock('① 선택 내용 요약',tableHTML,null,'#3B82F6'));

  // ② 섹션 프롬프트
  let sectText=buildHHSectionPrompt(
    g?g.tag:'trap',moodIdx,keyStr,bpmVal,st._808,
    st.drums.length?st.drums:null,st.melody,st.region
  );
  // AI 작성기: 위 결과는 "규칙 초안". 같은 입력 상태로 이미 검증 통과한 AI 작성본이 있으면 그걸 쓰고, 없으면 초안을 먼저 보여준 뒤 아래에서 비동기로 작성
  const _fps=hhWriteFingerprints();
  _hhDraft={sect:sectText,style:null,fpFull:_fps.fpFull,fpBase:_fps.fpBase};
  const _wc=(aiWriteEnabled()&&_hhWritten&&_hhWritten.meta?.ok&&_hhWritten.fpFull===_fps.fpFull)?_hhWritten:null;
  if(_wc)sectText=_wc.section;
  const sectBlock=makeOutBlock('② 섹션 프롬프트',
    `<div style="display:flex;justify-content:flex-end;margin-bottom:4px"><span id="hh-sect-count" style="font-size:11px;font-family:'Space Mono',monospace;color:${sectText.length>5000?'var(--danger)':sectText.length>4200?'#F59E0B':'var(--success)'}" title="Suno 가사/섹션 박스 한도">${sectText.length}/5000자</span></div><textarea class="output-ta" id="hh-sect-ta" rows="14" readonly style="display:block;width:100%">${escHtml(sectText)}</textarea><div id="hh-ai-polish-status" hidden style="font-size:11px;padding:6px 8px;border-radius:var(--r-sm);background:var(--surface-3);margin-top:8px"></div>`,
    'hh-sect-ta','#8B5CF6');
  {
    const wb=document.createElement('span');
    wb.className='output-badge';wb.id='hh-write-badge';wb.style.marginLeft='8px';
    sectBlock.querySelector('.output-box-label').after(wb);
  }
  if(antiAI){
    const badge=document.createElement('span');
    badge.className='output-badge';
    badge.style.marginLeft='8px';
    badge.textContent='✦ Anti-AI ON';
    sectBlock.querySelector('.output-box-label').after(badge);
  }
  // Copy 버튼 옆에 AI 다듬기 버튼 — 룰 기반 조합이라 어휘가 반복되고 표현이 납작해질 때 더 다양하고 디테일하게 재작성 (opt-in, 구조/수치는 보존하도록 지시)
  const hdr=sectBlock.querySelector('.output-box-header');
  const copyBtn=hdr.querySelector('button');
  const actionsWrap=document.createElement('div');
  actionsWrap.style.cssText='display:flex;gap:8px;align-items:center';
  hdr.appendChild(actionsWrap);
  actionsWrap.appendChild(copyBtn);
  if(hasAiKey){
    const polishBtn=document.createElement('button');
    polishBtn.id='hh-ai-polish-btn';
    polishBtn.dataset.state='original';
    polishBtn.textContent='🤖 AI로 다듬기';
    polishBtn.style.cssText='padding:6px 14px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-family:"Space Grotesk",sans-serif;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap';
    polishBtn.onclick=aiPolishSectionPrompt;
    actionsWrap.appendChild(polishBtn);
  }
  container.appendChild(sectBlock);

  // ③ 스타일 프롬프트
  // 순서: [Instrumental] → no vocals → genre → producer ref → mood → melody → 808/그루브/드럼(한 덩어리) → Key → BPM → texture → anti-AI
  // Suno 실측: 스타일 박스는 콤마로 구분되는 태그가 10개 안팎을 넘으면 뒤쪽부터 무시되기 시작함(WebSearch로 확인) —
  // 그래서 "선택 옵션 1개 = 콤마 태그 1개"로 쪼개던 걸 관련 있는 것끼리 ' & '로 묶어 콤마 개수 자체를 줄임.
  // tags.join(', ')은 배열 개수가 아니라 각 항목 안에 콤마가 몇 개 있는지로 실제 태그 개수가 정해지므로,
  // 나열형(콤마)이 아니라 결합형(&)으로 묶는 게 핵심 — 정보는 그대로 유지하면서 Suno가 세는 "태그 1개"로 압축
  const tags=[];
  const hhHasVocal=st.vocal&&st.vocal!=='No Vocal';
  if(!hhHasVocal){
    tags.push('[Instrumental]');
    tags.push('no vocals');                                         // 보컬 억제 보완 태그
  }
  // 색깔 수식어는 장르 단어 바로 앞에 붙임("commercial hyperpop") — 멀리 떨어진 별도 태그보다 장르에 확실히 걸림
  const commMod=st.commercial&&COMMERCIAL_TAG[st.commercial];
  // sig = 이 장르를 다른 장르와 가르는 핵심 사운드(예: 트랩 메탈의 다운튜닝 기타) — 장르 단어에 ' & '로 붙여 태그 개수는 안 늘림
  if(g)tags.push(`${commMod?commMod+' ':''}${g.tag}${g.sig?' & '+g.sig:''}`);
  // 프로듀서 레퍼런스 — 장르 바로 뒤 (가중치 최대화), 여러 명이어도 한 태그로
  if(st.refs.length){
    const refEns=st.refs.map(kr=>{const p=HH_REF.find(r=>r.kr===kr);return p?p.en:kr;});
    tags.push(refEns.map(e=>e.replace(/, /g,' & ')).join(' & '));
  }
  if(mood)tags.push(mood.tag);
  if(st.melody.length){
    const roles=computeMelodyRoles(st.melody);
    const toneTagStyle=MELODY_TONE_TAG[st.melodyTone];
    const toneNuanceStyle=mood&&compatibleToneNuance(mood.kr);
    const toneCombinedStyle=toneTagStyle&&toneNuanceStyle?`${toneTagStyle} ${toneNuanceStyle}`:toneTagStyle;
    // 리드·백킹도 별개 태그 2개 대신 " & "로 묶은 태그 1개로
    if(roles)tags.push(`${toneCombinedStyle?toneCombinedStyle+' ':''}${roles.lead.toLowerCase()} lead melody & ${roles.bg.toLowerCase()} background layer`);
    else tags.push(st.melody.map(m=>m.toLowerCase()).join(' & '));
  }
  // 808 + 그루브 + 드럼 — 전부 "리듬 섹션" 한 카테고리라 태그 1개로 통합 (예전엔 최대 3~5개 콤마 태그였음)
  const nuance808=mood&&pick(MOOD_808_NUANCE[mood.kr]);
  const nuanceGroove=mood&&pick(MOOD_GROOVE_NUANCE[mood.kr]);
  const nuanceDrums=mood&&pick(MOOD_DRUMS_NUANCE[mood.kr]);
  const rhythmParts=[];
  if(st._808&&st._808!=='None')rhythmParts.push(`${nuance808?nuance808+' ':''}${st._808} 808`);
  if(st.groove)rhythmParts.push(`${grooveText(st.groove)}${nuanceGroove?' '+nuanceGroove:''}`);
  if(st.drums.length)rhythmParts.push(`${st.drums.map(d=>d.toLowerCase()).join(' & ')}${nuanceDrums?' '+nuanceDrums:''}`);
  else if(g)rhythmParts.push(g.drum);
  if(rhythmParts.length)tags.push(rhythmParts.join(' & '));
  if(st.vocal&&st.vocal!=='No Vocal'){
    // 보컬 타입/스타일/톤도 태그 3개 대신 형용사처럼 붙여서 1개로
    const vocalBits=[VOCAL_CHAR_TAG[st.vocalChar],VOCAL_STYLE_TAG[st.vocalStyle],st.vocal.toLowerCase(),g?.vocalSig].filter(Boolean);
    tags.push(vocalBits.join(' '));
  }
  tags.push(`Key of ${keyStr}`);
  tags.push(`${bpmVal} BPM`);
  if(st.texture.length){
    const nuanceTexture=mood&&pick(MOOD_TEXTURE_NUANCE[mood.kr]);
    tags.push(`${st.texture.map(t=>t.toLowerCase()).join(' & ')}${nuanceTexture?' '+nuanceTexture:''}`);
  }
  const contextParts=[];
  if(st.era)contextParts.push(st.era+' era');
  if(st.region)contextParts.push(st.region+' sound');
  if(st.density)contextParts.push(DENSITY_TAG[st.density]||st.density.toLowerCase()+' arrangement');   // 'dense arrangement' 단독은 벌스의 stripped-back 지시와 충돌한다는 리뷰 — 밀도는 훅에만
  if(commMod&&!g)contextParts.push(commMod+' sound');
  if(contextParts.length)tags.push(contextParts.join(' & '));
  if(st.extraTags.length)tags.push(st.extraTags.join(' & '));      // 피드백에서 적용된 태그 — AI 라운드를 여러 번 돌려도 스타일 박스 태그 수가 안 늘도록 하나로 묶음(칩은 개별 제거 가능)
  // 장르 공통 문구("organic warm & analog")는 디지털 장르와 충돌하고 "이 곡만의 디테일이 없다"는 리뷰 지적이 반복돼서, 그 장르 리듬 요소의 구체적인 불완전함으로 (GENRE_HUMAN)
  if(antiAI){
    const leadHuman=st.melody.length?INSTR_HUMAN[computeMelodyRoles(st.melody)?.lead||st.melody[0]]:null;
    tags.push([GENRE_HUMAN[st.genre]||'organic warm human-feel & analog imperfections',leadHuman].filter(Boolean).join(' & '));
  }
  let styleText=tags.join(', ');
  _hhDraft.style=styleText;
  if(_wc)styleText=_wc.style;
  const charCount=styleText.length;
  const charColor=charCount>1000?'var(--danger)':charCount>800?'#F59E0B':'var(--success)';
  // 적용된 extraTags 칩
  const extraChipsHtml=st.extraTags.length
    ?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:10px">${st.extraTags.map(t=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;background:rgba(157,78,221,0.12);border:1px solid rgba(157,78,221,0.35);color:var(--accent-text);font-size:11px">${escHtml(t)}<span onclick="removeAdvTag('${t.replace(/'/g,"\\'")}')" style="cursor:pointer;opacity:.7;font-size:10px;line-height:1" title="제거">✕</span></span>`).join('')}</div>`
    :'';
  container.appendChild(makeOutBlock('③ 스타일 프롬프트',
    `<div style="display:flex;justify-content:flex-end;margin-bottom:4px"><span id="hh-style-count" style="font-size:11px;font-family:'Space Mono',monospace;color:${charColor}">${charCount}/1000자</span></div><textarea class="output-ta" id="hh-style-ta" rows="4" readonly style="display:block;width:100%">${escHtml(styleText)}</textarea>${extraChipsHtml}`,
    'hh-style-ta','#14B8A6'));

  // Suno Studio 세팅 팁 — Variety를 0보다 높게 두면 Suno가 위 스타일 태그를 자체적으로 고쳐써버려서
  // 여기서 공들여 만든 태그가 무시될 수 있음. 생성 전에 꼭 확인하라고 안내
  container.appendChild(makeOutBlock('⚙ Suno Studio 세팅 팁',
    `<div style="font-size:12px;color:var(--text-2);line-height:1.8">
      이 프롬프트를 최대한 그대로 반영하려면 Suno에서 생성하기 전에 이렇게 맞춰두세요 — <strong style="color:var(--danger)">Variety를 0보다 올리면 위 스타일 태그를 Suno가 직접 고쳐씁니다.</strong>
      <ul style="margin:8px 0 0;padding-left:18px">
        <li><strong style="color:var(--text-1)">Variety: 0%</strong> — 스타일 태그를 그대로 유지</li>
        <li><strong style="color:var(--text-1)">모델: v6</strong> (v6-wild 아님) — wild는 결과를 예측할 수 없게 바꿈</li>
        <li><strong style="color:var(--text-1)">Weirdness / Style Influence: 50%</strong> 유지 (기본값)</li>
      </ul>
    </div>`,
    null,'#F59E0B'));

  // ④ BPM & 템포 — 장르를 골랐으면 그 장르 기준으로, 아니면 일반 BPM대 설명으로
  let tempoDesc='';
  if(g){
    const[lo,hi]=g.bpmR;
    tempoDesc=(bpmVal>=lo&&bpmVal<=hi)
      ?`${g.kr} 권장 범위(${lo}–${hi}) 안`
      :`${g.kr} 권장 범위는 ${lo}–${hi}`;
  } else if(bpmVal<100)tempoDesc='< 100: 헤드노딩에 최적화된 슬로우 템포';
  else if(bpmVal<120)tempoDesc='100–119: 클래식 붐뱁 · 그루비 템포';
  else if(bpmVal<140)tempoDesc='120–139: 클라우드랩 · 멜로딕 트랩 템포';
  else if(bpmVal<155)tempoDesc='140–154: 표준 트랩 · 드릴 템포';
  else if(bpmVal<170)tempoDesc='155–169: 레이지 · 하이퍼트랩 템포';
  else tempoDesc='170+: 하이퍼팝 · 익스트림 템포';
  container.appendChild(makeOutBlock('④ BPM & 템포',
    `<div style="text-align:center;padding:16px 0"><div style="font-size:48px;font-weight:700;font-family:'Space Mono',monospace;color:var(--accent);line-height:1.1">${bpmVal}</div><div style="font-size:11px;color:var(--text-2);margin-top:6px">BPM · ${tempoDesc}</div></div>`,
    null,'#F97316'));

  // ⑤ 멜로디 악기 구성
  const melChips=st.melody.length
    ?st.melody.map(m=>`<span style="display:inline-flex;padding:4px 12px;border-radius:20px;background:rgba(0,229,160,0.12);border:1px solid rgba(0,229,160,0.35);color:var(--success);font-size:12px;margin:3px">${escHtml(m)}</span>`).join('')
    :'<span style="color:var(--text-3);font-size:12px">선택된 멜로디 악기 없음</span>';
  container.appendChild(makeOutBlock('⑤ 멜로디 악기 구성',
    `<div style="display:flex;flex-wrap:wrap;gap:4px;padding:10px 0">${melChips}</div>`,null,'#22C55E'));

  // ⑥ 비트 구조
  const segColors={intro:'#6366F1',hook:'#EC4899',verse:'#3B82F6',bridge:'#F59E0B',outro:'#6B7280'};
  const flowParts=st.structSegs.map((seg,i)=>{
    const c2=st.structSegs.slice(0,i).filter(x=>x===seg).length+1;
    const total=st.structSegs.filter(x=>x===seg).length;
    const label=seg.toUpperCase()+(total>1?' '+c2:'');
    const color=segColors[seg]||'#6B7280';
    return `<span style="display:inline-flex;padding:4px 10px;border-radius:4px;background:${color}22;border:1px solid ${color}88;color:${color};font-size:11px;font-weight:600">${label}</span>`;
  }).join('<span style="color:var(--text-3);margin:0 3px;font-size:12px">→</span>');
  container.appendChild(makeOutBlock('⑥ 비트 구조',
    `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:10px 0">${flowParts}</div>`,null,'#3B82F6'));

  // 🎚 비트 디렉팅 흐름 (only if any narr selected)
  if(narrEntries.length){
    const narrLines=narrEntries.map(([k,v])=>`<div style="padding:6px 0;border-bottom:1px solid var(--border);display:flex;gap:12px"><span style="color:var(--text-2);font-size:11px;min-width:80px;padding-top:1px">${k}</span><span style="color:var(--text-1);font-size:12px">${escHtml(v)}</span></div>`).join('');
    container.appendChild(makeOutBlock('🎚 비트 디렉팅 흐름',`<div style="padding:4px 0">${narrLines}</div>`,null,'#6366F1'));
  }

  // ⑦ 프로듀서 노트
  const noteLines=[];
  if(g)noteLines.push(`<strong>${g.en}</strong> 장르 · <em>${g.sound}</em> 사운드 · 에너지 <strong>${g.energy}</strong>`);
  noteLines.push(`조성 <strong>${keyStr}</strong> · 템포 <strong>${bpmVal} BPM</strong>`);
  if(st.melody.length)noteLines.push(`멜로디 악기: <strong>${st.melody.join(', ')}</strong>`);
  if(st._808&&st._808!=='None')noteLines.push(`808 강도: <strong>${st._808}</strong>`);
  if(refSong)noteLines.push(`레퍼런스: <em>${escHtml(refSong)}</em>`);
  if(antiAI)noteLines.push(`<strong>Anti-AI 필터</strong> ON — 유기적이고 인간적인 느낌 부여`);

  // 프로듀서 피드백
  window._advTagSets=[];  // 매 generate마다 초기화
  window._advKeys=[];window._advLabels={};
  const adv=buildProducerAdvice(g,st,mood,bpmVal,keyStr);
  const advBtn=(label,fn)=>fn?advCheckbox(fn,label):'';
  let advHtml='';
  if(adv.warns.length||adv.tips.length){
    const advRows=`${adv.warns.map(w=>`<div style="margin-bottom:7px;padding:9px 11px;background:rgba(255,77,109,.08);border:1px solid rgba(255,77,109,.3);border-radius:6px;font-size:12px;font-style:normal;color:var(--text-1);line-height:1.6;display:flex;align-items:center;justify-content:space-between;gap:8px"><span>${w.html}</span>${advBtn(w.btnLabel,w.btnFn)}</div>`).join('')}
      ${adv.tips.map(t=>`<div style="margin-bottom:7px;padding:9px 11px;background:rgba(0,198,255,.07);border:1px solid rgba(0,198,255,.22);border-radius:6px;font-size:12px;font-style:normal;color:var(--text-1);line-height:1.6;display:flex;align-items:center;justify-content:space-between;gap:8px"><span>${t.html}</span>${t.btnHtml||advBtn(t.btnLabel,t.btnFn)}</div>`).join('')}`;
    _advSel=new Set([..._advSel].filter(k=>window._advKeys.includes(k)));   // 사라진 항목의 선택은 버림
    const advBar=window._advKeys.length?`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;font-style:normal">
        <button id="hh-adv-apply-btn" onclick="applySelectedAdv()" style="padding:5px 14px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:11px;font-weight:700;white-space:nowrap">✅ 선택 적용 (${_advSel.size})</button>
        <a href="#" onclick="selectAllAdv(true);return false" style="font-size:11px;color:var(--text-2)">전체 선택</a>
        <a href="#" onclick="selectAllAdv(false);return false" style="font-size:11px;color:var(--text-2)">선택 해제</a>
      </div>`:'';
    // AI Key가 있으면 AI 프로듀서 리뷰가 우선이니, 룰 기반 피드백은 접어두고 클릭해야 펼쳐지게 (details는 네이티브 접기라 JS 불필요)
    advHtml=hasAiKey
      ?`<details style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-hi)">
          <summary style="cursor:pointer;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text-3)">🎧 룰 기반 피드백 (클릭해서 펼치기)</summary>
          <div style="margin-top:10px">${advBar}${advRows}</div>
        </details>`
      :`<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-hi)">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--accent-text);margin-bottom:10px;font-style:normal">🎧 프로듀서 피드백</div>
          ${advBar}${advRows}
        </div>`;
  }

  let aiReviewHtml;
  if(_aiSuggestions){
    const rowsHtml=_aiSuggestions.map((s,idx)=>{
      const emoji=AI_CATEGORY_EMOJI[s.category]||'💡';
      const actionable=aiSuggestionActionable(s);
      const btnHtml=actionable?(s.applied
        ?`<span style="margin-left:10px;padding:4px 10px;border-radius:20px;border:1px solid var(--border-hi);background:var(--accent-dim);color:var(--accent-text);font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0">✓ 적용됨</span>`
        :`<label style="display:flex;align-items:center;gap:5px;margin-left:10px;cursor:pointer;flex-shrink:0;font-size:11px;font-weight:600;color:var(--accent-text);white-space:nowrap"><input type="checkbox" class="hh-ai-cb" ${s.selected?'checked':''} onchange="toggleAiSuggestion(${idx},this.checked)">선택</label>`):'';
      const criteriaHtml=s.criteria&&rubricScore(s.criteria)!=null?`<div style="margin-top:5px;font-size:10px;color:var(--text-3)">${REVIEW_RUBRIC.filter(r=>s.criteria[r.key]!=null).map(r=>`${r.label} <strong style="color:${s.criteria[r.key]>=8?'var(--success)':s.criteria[r.key]>=6?'#F59E0B':'var(--danger)'}">${s.criteria[r.key]}</strong>`).join(' · ')}</div>`:'';
      const scoreColor=s.score==null?null:s.score>=75?'var(--success)':s.score>=50?'#F59E0B':'var(--danger)';
      const scoreHtml=s.score!=null?`<strong style="color:${scoreColor};margin-left:6px">${s.prevScore!=null?`${s.prevScore}→`:''}${s.score}/100</strong>`:'';
      const verifyHtml=s.verify?(()=>{
        const vColor=s.verify.status==='pass'?'var(--success)':s.verify.status==='partial'?'#F59E0B':'var(--danger)';
        const vIcon=s.verify.status==='pass'?'✅ 확인됨':s.verify.status==='partial'?'⚠️ 일부만 반영':'❌ 반영 안 됨';
        return `<div style="margin-top:5px;font-size:11px;color:${vColor}">${vIcon}${s.verify.note?' — '+escHtml(s.verify.note):''}</div>`;
      })():'';
      // "필터나 리듬 변주를 넣어" 같은 조언 문구는 방향만 말하지 실제로 뭘 썼는지는 안 보여줘서, 적용된 실제 문구를
      // 따로 보여줌 — 뭐가 바뀌었는지 프롬프트를 직접 뒤져보지 않아도 알 수 있게
      const appliedContentHtml=s.applied?(()=>{
        const parts=[];
        if(s.melodyLead)parts.push(`멜로디 리드 → ${s.melodyLead}`);
        if(s.boostText)parts.push(`"${s.boostText}"`);
        else if(s.boostSection)parts.push(`${s.boostSection} 섹션 편곡 강화 (장르 기본 문구 적용)`);
        if(s.tag)parts.push(s.tag.map(t=>`"${t}"`).join(', '));
        if(s.narrDir)parts.push(Object.entries(s.narrDir).map(([k,v])=>`${k}: "${v}"`).join(' / '));
        if(s.addSection)parts.push(`${s.addSection} 섹션 추가 (${s.addSectionPosition})`);
        if(s.mood)parts.push(`무드 → ${s.mood}`);
        if(s.removeRef)parts.push(`레퍼런스 제거: ${s.removeRef}`);
        if(s.removeTag)parts.push(`"${s.removeTag}" 포함 태그 제거`);
        return parts.length?`<div style="margin-top:5px;font-size:11px;color:var(--text-3)">✏️ 적용된 내용: ${parts.map(escHtml).join(' · ')}</div>`:'';
      })():'';
      return `<div style="margin-bottom:7px;padding:9px 11px;background:rgba(157,78,221,.06);border:1px solid rgba(157,78,221,.2);border-radius:6px;font-size:12px;font-style:normal;color:var(--text-1);line-height:1.6"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><span>${emoji} <strong>${escHtml(s.category)}</strong>${scoreHtml} — ${escHtml(s.text)}</span>${btnHtml}</div>${criteriaHtml}${appliedContentHtml}${verifyHtml}</div>`;
    }).join('');
    const hasApplied=_aiSuggestions.some(s=>s.applied);
    aiReviewHtml=`<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-hi)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--accent-text);font-style:normal">🤖 AI 프로듀서 리뷰</span>
        <div style="display:flex;gap:6px">
          ${hasApplied?`<button id="hh-ai-verify-btn" onclick="aiVerifyAppliedSuggestions()" style="padding:3px 10px;border-radius:20px;border:1px solid var(--border-hi);background:var(--surface-3);color:var(--accent-text);font-size:11px;cursor:pointer">🔍 적용 검증</button>`:''}
          <button id="hh-ai-arrange-btn" onclick="aiProducerReview()" style="padding:3px 10px;border-radius:20px;border:1px solid var(--border-hi);background:var(--surface-3);color:var(--text-2);font-size:11px;cursor:pointer">🔄 다시</button>
          <button onclick="clearAiSuggestions()" style="padding:3px 10px;border-radius:20px;border:1px solid var(--border-hi);background:transparent;color:var(--text-3);font-size:11px;cursor:pointer">✕</button>
        </div>
      </div>
      ${_aiSuggestions.some(s=>aiSuggestionActionable(s)&&!s.applied)?`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
        <button id="hh-ai-apply-btn" onclick="applySelectedAiSuggestions()" style="padding:5px 14px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:11px;font-weight:700;white-space:nowrap">✅ 선택 적용 (${_aiSuggestions.filter(s=>s.selected&&!s.applied&&aiSuggestionActionable(s)).length})</button>
        <a href="#" onclick="selectAllAiSuggestions(true);return false" style="font-size:11px;color:var(--text-2)">전체 선택</a>
        <a href="#" onclick="selectAllAiSuggestions(false);return false" style="font-size:11px;color:var(--text-2)">선택 해제</a>
        <span style="font-size:10px;color:var(--text-3)">원하는 조언만 골라 한 번에 적용하면 프롬프트 기록도 1번만 남아요</span>
      </div>`:''}
      ${rowsHtml}
      <div id="hh-ai-arrange-status" hidden style="font-size:11px;padding:6px 8px;border-radius:var(--r-sm);background:var(--surface-3);margin-top:8px"></div>
    </div>`;
  } else if(hasAiKey){
    aiReviewHtml=`<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-hi);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <button id="hh-ai-arrange-btn" onclick="aiProducerReview()" style="padding:6px 14px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">🤖 AI 프로듀서 리뷰 받기</button>
      <span style="font-size:11px;color:var(--text-3);font-style:normal">전문 프로듀서 총평, 레퍼런스 곡 부합도(type beat 평가), 악기·편곡·구조·믹스 등을 AI가 짚어줍니다</span>
    </div>
    <div id="hh-ai-arrange-status" hidden style="font-size:11px;padding:6px 8px;border-radius:var(--r-sm);background:var(--surface-3);margin-top:8px"></div>`;
  } else {
    aiReviewHtml=''; // API Key 없으면 AI 버튼 자체를 안 보여줌 — 클릭해도 어차피 Key 넣으라는 안내만 뜨니 UI만 지저분해짐
  }
  // 우리 AI 리뷰는 텍스트만 보고 짐작하지만, 실제로 완성된 곡을 들어본 외부 피드백(다른 AI 청취 평가, 사람 리뷰)이
  // 있으면 그게 훨씬 신뢰도 높은 정보라 — 붙여넣으면 같은 적용 파이프라인을 그대로 태움. _aiSuggestions 유무와 무관하게
  // Key만 있으면 항상 노출 (리뷰를 안 받아봤어도 외부 피드백은 바로 붙여넣을 수 있게)
  const externalFeedbackHtml=hasAiKey?`<details style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-hi)">
      <summary style="cursor:pointer;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text-3)">🎧 들어본 피드백 붙여넣기 (클릭해서 펼치기)</summary>
      <div style="margin-top:10px">
        <div style="font-size:11px;color:var(--text-3);margin-bottom:8px;font-style:normal">실제로 완성된 곡을 듣고 받은 평가(다른 AI 청취 리뷰, 사람 피드백 등)를 붙여넣으면, 그 내용을 바로 적용 가능한 제안으로 바꿔줘요.</div>
        <textarea id="hh-external-feedback-ta" placeholder="예: 훅이 반복될 때 변화가 부족해서 두 번째 임팩트가 약하다..." style="width:100%;min-height:80px;padding:8px 10px;border-radius:var(--r-sm);border:1px solid var(--border-hi);background:var(--surface-2);color:var(--text-1);font-size:12px;font-family:inherit;resize:vertical;box-sizing:border-box"></textarea>
        <button id="hh-ai-external-btn" onclick="aiParseExternalFeedback()" style="margin-top:8px;padding:6px 14px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;cursor:pointer">🎧 반영 제안 받기</button>
      </div>
    </details>`:'';
  container.appendChild(makeOutBlock('⑦ 프로듀서 노트',
    `<div style="font-size:12px;line-height:1.8;color:var(--text-2);font-style:italic;padding:4px 0">${noteLines.map(l=>`<p style="margin-bottom:5px">${l}</p>`).join('')}</div>${hasAiKey?aiReviewHtml+externalFeedbackHtml+advHtml:advHtml+aiReviewHtml}`,
    null,'#6B7280'));

  // MD 저장 — Generate마다 자동으로 쌓이는 프롬프트 히스토리(로컬 저장)와 별개로, 사용자가 직접 고른 것만 파일로 남기는 용도
  const saveWrap=document.createElement('div');
  saveWrap.style.cssText='text-align:center;padding:4px 0 10px';
  saveWrap.innerHTML='<button onclick="saveHhPromptAsMd()" style="padding:7px 16px;border-radius:20px;border:1px solid var(--border-hi);background:var(--surface-3);color:var(--text-1);font-family:\'Space Grotesk\',sans-serif;font-size:12px;font-weight:700;cursor:pointer">💾 이 프롬프트 MD로 저장</button>';
  container.appendChild(saveWrap);

  // Reset link
  const resetWrap=document.createElement('div');
  resetWrap.style.cssText='text-align:center;padding:10px 0 4px';
  resetWrap.innerHTML='<a href="#" style="color:var(--text-2);font-size:12px;text-decoration:none;transition:.15s" onmouseover="this.style.color=\'var(--text-1)\'" onmouseout="this.style.color=\'var(--text-2)\'" onclick="hhReset();return false">↑ 처음부터 다시 선택하기</a>';
  container.appendChild(resetWrap);
  if(!opts?.noScroll)setTimeout(()=>{container.scrollIntoView({behavior:'smooth',block:'start'});},50);   // AI 리뷰 패널 안에서 누른 동작은 이미 결과를 보고 있으니 화면을 옮기지 않음
  updateFloatSummary();
  updateAiApplyBtn();
  updateAdvApplyBtn();
  // stSnapshot — st는 JSON-safe 필드로만 이뤄져 있어서 그대로 깊은 복사해두면, 나중에 "다시 가져오기"로
  // 이 시점의 전체 설정(멜로디·구조·텍스처 등)을 그대로 복원해서 AI 리뷰를 다시 받을 수 있음
  const _entryId=source!==false?savePromptHistoryEntry({genre:g?g.kr:'-',bpm:bpmVal,key:keyStr,mood:st.mood||'-',refSong,summaryRows,section:sectText,style:styleText,source:typeof source==='string'?source:null,stSnapshot:JSON.parse(JSON.stringify(st))}):null;
  // 작성기 시작 — 캐시 적중이면 생략, 진행 중이면 중복 호출 안 함, 이전 실패가 같은 상태의 재렌더(source===false)면 재호출 안 함(명시적 Generate만 재시도)
  const _fb=_hhWritten&&_hhWritten.fpFull===_fps.fpFull&&!_hhWritten.meta?.ok;
  if(_wc){_writeState='ok';renderWriteBadge();}
  else if(!aiWriteEnabled()){_writeState='off';renderWriteBadge();}
  else if(_writePromise&&_hhDraft.fpFull===_fps.fpFull&&_writeState==='pending'&&source===false){renderWriteBadge();}
  else if(_fb&&source===false){_writeState='fallback';renderWriteBadge();}
  else hhAiWrite(_entryId);
}

// ============================================================
// MD 저장 — "저장" 눌렀을 때만 실제 파일로 다운로드 (자동 히스토리와 별개)
// ============================================================
function downloadTextFile(filename,content,mime){
  const blob=new Blob([content],{type:mime||'text/plain'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function saveHhPromptAsMd(){
  const g=st.genre!==null?GENRES[st.genre]:null;
  const sectText=document.getElementById('hh-sect-ta')?.value||'';
  const styleText=document.getElementById('hh-style-ta')?.value||'';
  const refSong=(document.getElementById('hh-ref-song')?.value||'').trim();
  const keyStr=KEYS[st.key]||'A minor';
  const bpmVal=document.getElementById('hh-bpm')?.value||st.bpm;
  const d=new Date();
  const dateStr=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

  const rows=[['장르',g?g.kr:'-'],['BPM',bpmVal],['Key',keyStr],['무드',st.mood||'-']];
  if(refSong)rows.push(['레퍼런스 곡',refSong]);
  if(st.melody.length)rows.push(['멜로디',st.melody.join(', ')]);
  if(st.melodyTone)rows.push(['악기 톤',st.melodyTone]);
  if(st.texture.length)rows.push(['믹스 텍스처',st.texture.join(', ')]);
  if(st.vocal&&st.vocal!=='No Vocal')rows.push(['보컬',st.vocal]);
  if(st.refs.length)rows.push(['프로듀서 레퍼런스',st.refs.join(', ')]);
  rows.push(['구조',st.structSegs.join(' → ')]);

  // 총평·레퍼런스 부합도는 애초에 적용(액션) 대상이 아니라 평가 자체가 목적이라, applied 여부와 무관하게 항상 포함 —
  // 점수 남겨두는 의미가 있으려면 여기 안 빠지고 저장돼야 함
  const aiNote=(_aiSuggestions||[]).filter(s=>s.applied||s.category==='총평'||s.category==='레퍼런스 부합도');
  const aiSection=aiNote.length
    ?`\n## 적용된 AI 프로듀서 리뷰\n${aiNote.map(s=>`- **${s.category}**${s.score!=null?` (${s.score}/100)`:''}: ${s.text}`).join('\n')}\n`
    :'';

  const md=`# ${g?g.kr:'힙합'} 프롬프트 — ${dateStr}

## 선택 요약
${rows.map(([k,v])=>`- **${k}**: ${v}`).join('\n')}
${aiSection}
## 섹션 프롬프트
\`\`\`
${sectText}
\`\`\`

## 스타일 프롬프트
\`\`\`
${styleText}
\`\`\`
`;
  const safeGenre=(g?g.en:'hiphop').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  downloadTextFile(`suno-${safeGenre}-${d.getTime()}.md`,md,'text/markdown');
  showToast('💾 MD 파일로 저장됨');
}

// ============================================================
// PROMPT HISTORY — Generate 누를 때마다 이 브라우저에 자동 기록
// ============================================================
const PROMPT_HISTORY_KEY='hh_prompt_history';
const PROMPT_HISTORY_MAX=50;
function loadPromptHistory(){
  try{return JSON.parse(localStorage.getItem(PROMPT_HISTORY_KEY)||'[]');}catch(e){return[];}
}
function savePromptHistoryEntry(entry){
  const list=loadPromptHistory();
  const id=Date.now()+'-'+Math.random().toString(36).slice(2,7);
  list.unshift({id,ts:Date.now(),label:'',...entry});
  if(list.length>PROMPT_HISTORY_MAX)list.length=PROMPT_HISTORY_MAX;
  try{localStorage.setItem(PROMPT_HISTORY_KEY,JSON.stringify(list));}catch(e){}
  renderPromptHistory();
  return id;
}
// 리뷰 점수를 그 프롬프트의 기록에 남김 — "처음 뽑은 프롬프트가 50점대"가 기억이 아니라 수치로 남아야 엔진을 고칠 때마다 실제로 올랐는지 비교할 수 있음.
// 같은 프롬프트(섹션+스타일 텍스트가 같은 기록)의 첫 점수만 저장 (적용 후 점수는 적용 후 프롬프트의 기록에 붙음)
function recordAiScore(score,criteria){
  if(!Number.isFinite(score))return;
  const sect=(document.getElementById('hh-sect-ta')?.value||'').trim();
  const style=(document.getElementById('hh-style-ta')?.value||'').trim();
  const list=loadPromptHistory();
  const e=list.find(x=>(x.section||'').trim()===sect&&(x.style||'').trim()===style);
  if(!e)return;
  (e.aiRounds=e.aiRounds||[]).push({score,criteria:criteria||null,ts:Date.now()});   // 라운드별 추이(첫 점수 배지는 그대로)
  if(e.aiScore!=null){try{localStorage.setItem(PROMPT_HISTORY_KEY,JSON.stringify(list));}catch(_){}return;}
  e.aiScore=score;
  try{localStorage.setItem(PROMPT_HISTORY_KEY,JSON.stringify(list));}catch(_){}
  renderPromptHistory();
}
function deletePromptHistoryEntry(id){
  const list=loadPromptHistory().filter(e=>e.id!==id);
  try{localStorage.setItem(PROMPT_HISTORY_KEY,JSON.stringify(list));}catch(e){}
  renderPromptHistory();
}
function clearPromptHistory(){
  if(!confirm('생성 기록을 전부 삭제할까요?'))return;
  try{localStorage.removeItem(PROMPT_HISTORY_KEY);}catch(e){}
  renderPromptHistory();
}
function updatePromptHistoryLabel(id,label){
  const list=loadPromptHistory();
  const e=list.find(x=>x.id===id);
  if(e){e.label=label;try{localStorage.setItem(PROMPT_HISTORY_KEY,JSON.stringify(list));}catch(_){}}
}
// 옛날 생성 기록을 현재 작업 상태로 완전히 되돌려서(멜로디·구조·텍스처 등 st 전체) 다시 AI 리뷰를 받을 수 있게 함 —
// 단순히 텍스트만 불러오면 st가 그 시점과 안 맞아서 "적용" 버튼들이 엉뚱한 상태에 적용됨
function restorePromptHistoryEntry(id){
  const entry=loadPromptHistory().find(e=>e.id===id);
  if(!entry)return;
  if(!entry.stSnapshot){showToast('⚠️ 이 기록은 옛날 버전이라 복원 정보가 없어요');return;}
  Object.keys(st).forEach(k=>delete st[k]);
  Object.assign(st,entry.stSnapshot);
  const bpmEl=document.getElementById('hh-bpm');
  if(bpmEl)bpmEl.value=st.bpm;
  const keyEl=document.getElementById('hh-key');
  if(keyEl)keyEl.value=st.key;
  const refEl=document.getElementById('hh-ref-song');
  if(refEl)refEl.value=entry.refSong||'';
  _aiSuggestions=null;
  renderHhChips();
  // AI가 작성한 기록이면 그 텍스트를 이 상태의 캐시로 — 복원할 때마다 AI를 다시 부르지 않고 저장돼 있던 그 텍스트가 그대로 나옴
  if(entry.aiWritten&&entry.section&&entry.style){
    const f=hhWriteFingerprints();
    _hhWritten={fpFull:f.fpFull,fpBase:f.fpBase,section:entry.section,style:entry.style,meta:{ok:true,mode:'restored'}};
  }else _hhWritten=null;
  hhGenerate(`기록에서 복원: ${entry.label||entry.genre}`);
  document.getElementById('hh-genre-section')?.scrollIntoView({behavior:'smooth'});
  showToast('↺ 이 기록으로 복원됨 — AI 프로듀서 리뷰를 다시 받아보세요');
}
function renderPromptHistory(){
  const el=document.getElementById('hh-prompt-history');
  if(!el)return;
  const list=loadPromptHistory();
  if(!list.length){
    el.innerHTML='<span style="font-size:11px;color:var(--text-3)">아직 기록 없음 — Generate 누르면 여기 쌓임</span>';
    return;
  }
  el.innerHTML='';
  list.forEach(e=>{
    const d=new Date(e.ts);
    const dateStr=`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    const row=document.createElement('div');
    row.style.cssText='border:1px solid var(--border);border-radius:var(--r-sm);padding:8px 10px;background:var(--surface-2)';
    row.innerHTML=`
      <div style="display:flex;align-items:center;gap:8px;cursor:pointer;flex-wrap:wrap" class="ph-header">
        <span style="font-size:10px;color:var(--text-3);font-family:'Space Mono',monospace">${dateStr}</span>
        <span style="font-size:12px;font-weight:600">${e.genre} · ${e.bpm}BPM · ${e.key}</span>
        ${e.aiScore!=null?`<span style="font-size:10px;padding:2px 8px;border-radius:20px;border:1px solid var(--border-hi);color:${e.aiScore>=75?'var(--success)':e.aiScore>=50?'#F59E0B':'var(--danger)'}" title="이 프롬프트의 첫 AI 리뷰 점수">🧑‍🎤 ${e.aiScore}/100</span>`:''}
        ${e.source?`<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:rgba(157,78,221,0.12);border:1px solid rgba(157,78,221,0.35);color:var(--accent-text)">🔧 ${escHtml(e.source)}</span>`:''}
        <span style="font-size:11px;color:var(--text-3);margin-left:auto">▼</span>
      </div>
      <div class="ph-body" hidden style="margin-top:8px;flex-direction:column;gap:6px">
        <input type="text" placeholder="메모 (예: Cinematic Drop 곡)" value="${escHtml(e.label||'')}" style="width:100%;padding:5px 8px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface-1);color:var(--text-1);font-size:11px" class="ph-label-input">
        <table style="width:100%;border-collapse:collapse">
          ${(e.summaryRows||[]).map(([k,v],i)=>`<tr style="background:${i%2===0?'rgba(255,255,255,0.035)':'transparent'}"><td style="padding:4px 8px;color:var(--text-3);font-size:11px;white-space:nowrap;width:42%">${k}</td><td style="padding:4px 8px;color:var(--text-1);font-size:11px">${escHtml(v)}</td></tr>`).join('')}
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
          <span style="font-size:11px;color:var(--accent-text);cursor:pointer;text-decoration:underline" class="ph-prompt-toggle">프롬프트 보기 ▾</span>
          <div style="display:flex;gap:6px">
            <button style="padding:3px 9px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:10px;font-weight:700;cursor:pointer" class="ph-restore">↺ 다시 가져오기</button>
            <button style="padding:3px 9px;border-radius:20px;border:1px solid var(--border);background:transparent;color:var(--text-3);font-size:10px;cursor:pointer" class="ph-delete">삭제</button>
          </div>
        </div>
        <div class="ph-prompt" hidden style="flex-direction:column;gap:6px">
          <textarea readonly rows="6" style="width:100%;font-size:11px;padding:6px 8px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface-1);color:var(--text-1);font-family:'Space Mono',monospace">${escHtml(e.section)}</textarea>
          <textarea readonly rows="3" style="width:100%;font-size:11px;padding:6px 8px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface-1);color:var(--text-1);font-family:'Space Mono',monospace">${escHtml(e.style)}</textarea>
        </div>
      </div>`;
    row.querySelector('.ph-header').onclick=()=>{
      const b=row.querySelector('.ph-body');
      b.hidden=!b.hidden;
      b.style.display=b.hidden?'none':'flex';
    };
    row.querySelector('.ph-label-input').onchange=ev=>updatePromptHistoryLabel(e.id,ev.target.value);
    row.querySelector('.ph-prompt-toggle').onclick=(ev)=>{
      const p=row.querySelector('.ph-prompt');
      p.hidden=!p.hidden;
      p.style.display=p.hidden?'none':'flex';
      ev.target.textContent=p.hidden?'프롬프트 보기 ▾':'프롬프트 숨기기 ▴';
    };
    row.querySelector('.ph-restore').onclick=()=>restorePromptHistoryEntry(e.id);
    row.querySelector('.ph-delete').onclick=()=>deletePromptHistoryEntry(e.id);
    el.appendChild(row);
  });
}

function hhReset(){
  _aiSuggestions=null;
  st.genre=null;st.key=7;st.bpm=140;
  st._808='Balanced';st.drums=[];st.melody=[];st.mood=null;st.vocal='No Vocal';
  st.refs=[];st.texture=[];st.era=null;st.region=null;st.density=null;st.length=null;st.commercial=null;
  st.narrSt={};st.narrAI={};st.narrDirs={};st.structSegs=['intro','hook','verse','hook','outro'];st.structIdx=null;
  st.transitionFx=[];st.groove=null;st.melodyLeadIdx=0;st._mtAutoManaged=true;st.vocalChar=null;st.vocalStyle=null;st.melodyTone=null;st._structAutoManaged=true;
  st.sectionArrangeExtras={};st.sectionArrangeOccurrence={};
  const refSongEl=document.getElementById('hh-ref-song');
  if(refSongEl)refSongEl.value='';
  document.getElementById('hh-bpm').value=140;
  document.getElementById('hh-key').value=7;
  const outBlocks=document.getElementById('hh-out-blocks');
  if(outBlocks){outBlocks.style.display='none';outBlocks.innerHTML='';}
  clearAutoHint('hh-melody-hint');
  clearAutoHint('hh-texture-hint');
  clearAutoHint('hh-fx-hint');
  clearAutoHint('hh-groove-hint');
  clearAutoHint('hh-ref-hint');
  clearAutoHint('hh-melody-tone-hint');
  clearAutoHint('hh-struct-hint');
  const vcBox=document.getElementById('hh-vocal-char-box');
  if(vcBox)vcBox.hidden=true;
  const vsBox=document.getElementById('hh-vocal-style-box');
  if(vsBox)vsBox.hidden=true;
  renderHhChips();
  window.scrollTo({top:0,behavior:'smooth'});
  updateFloatSummary();
}

// ============================================================
// GENERATE - VOCAL TABS
// ============================================================
function vocalGenerate(tabKey){
  const s=VTS[tabKey];
  const keyStr=KEYS[s.key]||'A minor';
  const bpm=document.getElementById(`${tabKey}-bpm`).value||s.bpm;

  const isElec=tabKey==='elec';
  const narr=tabKey==='pop'?POP_NARR:tabKey==='elec'?ELEC_NARR:ROCK_NARR;
  const moods=tabKey==='pop'?POP_MOODS:tabKey==='elec'?ELEC_MOODS:ROCK_MOODS;
  const vStyles=tabKey==='pop'?POP_VOCAL_STYLES:tabKey==='elec'?ELEC_VOCAL_STYLES:ROCK_VOCAL_STYLES;

  // Section prompt
  let sect='';

  // Concept block
  if(s.concept&&s.concept.trim()){
    sect+=`[Concept / 곡 기획]\n${s.concept.trim()}\n\n`;
  }

  // Segment descriptions
  const segDesc={
    intro:'Gentle introduction, sets the emotional tone and atmosphere',
    verse:'Understated delivery, storytelling, restrained instrumentation',
    prechorus:'Energy builds, emotion intensifies, leading into the chorus',
    chorus:'Full emotional release, hook melody soars, peak energy',
    bridge:'Contrasting section, emotional shift, builds anticipation',
    outro:'Gradual resolution, emotional denouement, final fade',
    build:'Energy accumulates, layers add, tension mounts',
    drop:'Full energy release, main groove or melody hits hard',
    breakdown:'Stripped back, melodic interlude, atmosphere rebuilds',
    solo:'Instrumental spotlight, technical expression, emotional peak',
  };

  const narMap={};
  narr.forEach(n=>{narMap[n.label]=n;});

  // Count occurrences
  const counts={};
  s.structSegs.forEach(seg=>{
    if(!counts[seg])counts[seg]=0;
    counts[seg]++;
  });
  const used={};

  s.structSegs.forEach(seg=>{
    if(!used[seg])used[seg]=0;
    used[seg]++;
    const cnt=used[seg];
    const total=counts[seg];
    const suffix=total>1?` ${cnt}`:'';

    // Find matching narr label
    const narrLabelMap={
      intro:'인트로',verse:'벌스',prechorus:'프리코러스',chorus:'코러스',
      bridge:'브릿지',outro:'아웃트로',build:'빌드업',drop:'드롭',
      breakdown:'브레이크다운',solo:'솔로',hook:'버스/훅'
    };
    const narrLabel=narrLabelMap[seg]||seg;
    const narrChoice=s.narrSt[narrLabel];
    const narrNote=narrChoice?` [${narrChoice}]`:'';

    const segLabel=seg.charAt(0).toUpperCase()+seg.slice(1);
    sect+=`[${segLabel}${suffix}]${narrNote}\n(${segDesc[seg]||'Section develops the musical ideas'})\n\n`;
  });

  // Style prompt
  const tags=[];
  if(s.genre)tags.push(s.genre);
  const mood=moods.find(m=>m.kr===s.mood);
  if(mood)tags.push(mood.tag);
  tags.push(`Key of ${keyStr}`);
  tags.push(`${bpm} BPM`);
  const vs=vStyles.find(v=>v.kr===s.vocalStyle);
  if(vs)tags.push(vs.tag);
  if(s.instruments.length)tags.push(s.instruments.join(', '));
  if(antiAI)tags.push('organic, warm, human-feel, analog imperfections, natural dynamics');

  document.getElementById(`${tabKey}-sect-ta`).value=sect.trim();
  document.getElementById(`${tabKey}-style-ta`).value=tags.join(', ');
  document.getElementById(`${tabKey}-output`).style.display='block';
  const badge=document.getElementById(`${tabKey}-antiai-badge`);
  if(badge)badge.style.display=antiAI?'inline-flex':'none';
}

// ============================================================
// ============================================================
// TOAST
// ============================================================
function showToast(msg,duration=3200){
  const el=document.getElementById('toast');
  if(!el)return;
  el.innerHTML=msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),duration);
}

// ============================================================
// FLOATING BAR
// ============================================================
function activeTab(){
  return document.querySelector('.tab-btn.active')?.dataset.tab||'hiphop';
}
function floatGenerate(){
  const tab=activeTab();
  if(tab==='hiphop')hhGenerate();
  else vocalGenerate(tab);
}
function floatReset(){
  const tab=activeTab();
  if(tab==='hiphop')hhReset();
  else window.scrollTo({top:0,behavior:'smooth'});
}
function updateFloatSummary(){
  const el=document.getElementById('float-summary');
  if(!el)return;
  const tab=activeTab();
  const parts=[];
  if(tab==='hiphop'){
    if(st.genre!==null)parts.push(GENRES[st.genre]?.en||'');
    const bpm=parseInt(document.getElementById('hh-bpm')?.value)||st.bpm;
    parts.push(bpm+'BPM');
    if(st.mood)parts.push(st.mood);
    if(st._808&&st._808!=='Balanced')parts.push('808:'+st._808);
    if(st.drums.length)parts.push(st.drums[0]);
  } else {
    const s=VTS?.[tab];
    if(s){
      if(s.genre)parts.push(s.genre);
      const bEl=document.getElementById(`${tab}-bpm`);
      if(bEl)parts.push((parseInt(bEl.value)||s.bpm)+'BPM');
      if(s.mood)parts.push(s.mood);
    }
  }
  el.textContent=parts.length?parts.join(' · '):'선택 없음';
}

// TAB SWITCHING
// ============================================================
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.tab-content[data-tab="${btn.dataset.tab}"]`).classList.add('active');
    updateFloatSummary();
  });
});

// Anti-AI toggle
document.getElementById('antiAiToggle').addEventListener('change',e=>{
  antiAI=e.target.checked;
});

// ============================================================
// INIT
// ============================================================
hhInit();
// Restore direct token from sessionStorage on page load
try{const t=sessionStorage.getItem('sp_direct_token');if(t)_spDirectToken=t;}catch(_){}
updateSpPanelStatus();

buildVocalTab('pop',POP_GENRES,POP_ARTISTS,POP_GENRE_PRESETS,POP_MOODS,POP_INSTR,POP_VOCAL_STYLES,POP_NARR,POP_STRUCT_PRESETS,POP_SEG_PALETTE);
buildVocalTab('elec',ELEC_GENRES,ELEC_ARTISTS,ELEC_GENRE_PRESETS,ELEC_MOODS,ELEC_INSTR,ELEC_VOCAL_STYLES,ELEC_NARR,ELEC_STRUCT_PRESETS,ELEC_SEG_PALETTE);
buildVocalTab('rock',ROCK_GENRES,ROCK_ARTISTS,ROCK_GENRE_PRESETS,ROCK_MOODS,ROCK_INSTR,ROCK_VOCAL_STYLES,ROCK_NARR,ROCK_STRUCT_PRESETS,ROCK_SEG_PALETTE);
updateFloatSummary();
