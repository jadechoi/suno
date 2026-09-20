// ============================================================
// SPOTIFY INTEGRATION
// ============================================================
// Spotify pitch(0-11) + mode(0=min,1=maj) → KEYS index
// KEYS=['C major','D major','Eb major','F major','G major','Ab major','Bb major','A minor','B minor','C minor','D minor','E minor','F minor','F# minor','G minor']
const SP_KEY_MAP={
  '0,1':0,'1,1':0,'2,1':1,'3,1':2,'4,1':2,'5,1':3,'6,1':4,'7,1':4,'8,1':5,'9,1':5,'10,1':6,'11,1':0,
  '0,0':9,'1,0':9,'2,0':10,'3,0':10,'4,0':11,'5,0':12,'6,0':13,'7,0':14,'8,0':14,'9,0':7,'10,0':7,'11,0':8
};

function toggleSpPanel(){
  const body=document.getElementById('sp-panel-body');
  const st2=body.style.display==='none';
  body.style.display=st2?'block':'none';
  if(st2){
    let id=_spMemId,sec=_spMemSecret;
    if(!id){try{id=localStorage.getItem('sp_client_id')||'';}catch(_){}}
    if(!sec){try{sec=localStorage.getItem('sp_client_secret')||'';}catch(_){}}
    document.getElementById('sp-client-id').value=id;
    document.getElementById('sp-client-secret').value=sec?'••••••••••••':'';
    const rKey=getRapidApiKey();
    const rKeyEl=document.getElementById('rapidapi-key');
    if(rKeyEl&&rKey)rKeyEl.value='••••••••••••••••';
    const rSt=document.getElementById('rapidapi-status');
    if(rSt&&rKey){rSt.textContent='✅ RapidAPI Key 저장됨 — 403 시 자동 사용';rSt.hidden=false;rSt.style.color='var(--success)';}
    const aKey=getAnthropicKey();
    const aKeyEl=document.getElementById('anthropic-key');
    if(aKeyEl&&aKey)aKeyEl.value='••••••••••••••••';
    const aSt=document.getElementById('anthropic-key-status');
    if(aSt&&aKey){aSt.textContent='✅ Anthropic API Key 저장됨';aSt.hidden=false;aSt.style.color='var(--success)';}
    if(_spDirectToken)setSpTab('token');
  }
}
let _spDirectToken='';// in-memory direct token
let _spMemId='',_spMemSecret='';// in-memory credentials (fallback when localStorage fails)
function setSpTab(tab){
  const isKey=tab==='key';
  document.getElementById('sp-tab-key').style.background=isKey?'var(--accent-dim)':'var(--surface-2)';
  document.getElementById('sp-tab-key').style.color=isKey?'var(--accent-text)':'var(--text-2)';
  document.getElementById('sp-tab-token').style.background=!isKey?'var(--accent-dim)':'var(--surface-2)';
  document.getElementById('sp-tab-token').style.color=!isKey?'var(--accent-text)':'var(--text-2)';
  document.getElementById('sp-tab-key-body').style.display=isKey?'':'none';
  document.getElementById('sp-tab-token-body').style.display=isKey?'none':'';
  if(!isKey)updateTokenCodeBlock();
}
function buildTokenCode(){
  let id=_spMemId,sec=_spMemSecret;
  if(!id){try{id=localStorage.getItem('sp_client_id')||'';}catch(_){}}
  if(!sec){try{sec=localStorage.getItem('sp_client_secret')||'';}catch(_){}}
  const idStr=id||'YOUR_CLIENT_ID';
  const secStr=sec?'••••••••':' YOUR_CLIENT_SECRET';
  // Build the actual btoa string only when we have real values
  const b64Expr=id&&sec?`btoa('${id}:${sec}')`:`btoa('YOUR_CLIENT_ID:YOUR_CLIENT_SECRET')`;
  return `fetch('https://accounts.spotify.com/api/token', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/x-www-form-urlencoded',\n    'Authorization': 'Basic ' + ${b64Expr}\n  },\n  body: 'grant_type=client_credentials'\n}).then(r => r.json()).then(d => console.log(d.access_token));`;
}
function updateTokenCodeBlock(){
  const el=document.getElementById('sp-token-code');
  if(el)el.textContent=buildTokenCode();
}
function copyTokenCode(){
  const code=buildTokenCode();
  navigator.clipboard.writeText(code).then(()=>{
    const btn=document.getElementById('sp-copy-btn');
    if(btn){btn.textContent='✅';setTimeout(()=>btn.textContent='복사',1500);}
  }).catch(()=>{
    // Fallback
    const ta=document.createElement('textarea');
    ta.value=code;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();document.execCommand('copy');
    document.body.removeChild(ta);
    const btn=document.getElementById('sp-copy-btn');
    if(btn){btn.textContent='✅';setTimeout(()=>btn.textContent='복사',1500);}
  });
}
function applyDirectToken(){
  const val=(document.getElementById('sp-direct-token').value||'').trim();
  if(!val||val.length<20){showSpTokenMsg('❌ 유효한 토큰을 입력해주세요');return;}
  _spDirectToken=val;
  try{sessionStorage.setItem('sp_direct_token',val);}catch(_){}
  updateSpPanelStatus();
  showSpTokenMsg('✅ 토큰 적용됨! 이제 검색이 가능합니다.');
}
function showSpTokenMsg(msg){
  const el=document.getElementById('sp-token-msg');
  if(!el)return;
  el.textContent=msg;el.hidden=false;
  const isErr=msg.startsWith('❌');
  el.style.color=isErr?'var(--danger)':'var(--success)';
  if(!isErr)setTimeout(()=>el.hidden=true,4000);
}
function saveSpotifyCreds(){
  const id=document.getElementById('sp-client-id').value.trim();
  const secEl=document.getElementById('sp-client-secret');
  const sec=secEl.value==='••••••••••••'?(_spMemSecret||localStorage.getItem('sp_client_secret')||''):secEl.value.trim();
  if(!id||!sec){showSpSaveMsg('❌ ID와 Secret 모두 입력하세요');return;}
  // Always save to memory first (guaranteed to work)
  _spMemId=id;_spMemSecret=sec;
  // Try localStorage as persistence layer
  let lsPersisted=false;
  try{
    localStorage.setItem('sp_client_id',id);
    localStorage.setItem('sp_client_secret',sec);
    lsPersisted=localStorage.getItem('sp_client_id')===id;
  }catch(_){}
  try{localStorage.removeItem('sp_token');localStorage.removeItem('sp_token_exp');}catch(_){}
  updateSpPanelStatus();
  updateTokenCodeBlock();
  showSpSaveMsg(lsPersisted?`✅ 저장됨 (ID: ${id.slice(0,6)}…)`:`✅ 메모리에 저장됨 (ID: ${id.slice(0,6)}…) — 페이지 새로고침 시 재입력 필요`);
}
function clearSpotifyCreds(){
  _spDirectToken='';_spMemId='';_spMemSecret='';
  try{sessionStorage.removeItem('sp_direct_token');}catch(_){}
  ['sp_client_id','sp_client_secret','sp_token','sp_token_exp'].forEach(k=>{try{localStorage.removeItem(k);}catch(_){}});
  document.getElementById('sp-client-id').value='';
  document.getElementById('sp-client-secret').value='';
  document.getElementById('sp-direct-token').value='';
  updateSpPanelStatus();
  showSpSaveMsg('초기화됨');
}
function showSpSaveMsg(msg){
  const el=document.getElementById('sp-save-msg');
  if(!el)return;
  el.textContent=msg;el.hidden=false;
  const isErr=msg.startsWith('❌');
  el.style.color=isErr?'var(--danger)':'var(--success)';
  if(!isErr)setTimeout(()=>el.hidden=true,4000);
}
function updateSpPanelStatus(){
  const el=document.getElementById('sp-panel-status');
  if(!el)return;
  if(_spDirectToken){el.textContent='⚡ 토큰 연결됨';el.style.color='var(--success)';return;}
  if(_spMemId&&_spMemSecret){el.textContent='✅ 연결됨';el.style.color='var(--success)';return;}
  let connected=false;
  try{connected=!!(localStorage.getItem('sp_client_id')&&localStorage.getItem('sp_client_secret'));}catch(_){}
  el.textContent=connected?'✅ 연결됨':'미연결 · 클릭해서 설정';
  el.style.color=connected?'var(--success)':'var(--text-3)';
}

let _spLastError='';
async function getSpotifyToken(){
  // 1) Direct token takes priority (in-memory or sessionStorage fallback)
  if(!_spDirectToken){
    try{const t=sessionStorage.getItem('sp_direct_token');if(t){_spDirectToken=t;updateSpPanelStatus();}}catch(_){}
  }
  if(_spDirectToken){_spLastError='';return _spDirectToken;}
  // 2) Client Credentials — memory first, localStorage fallback
  let id=_spMemId,secret=_spMemSecret;
  if(!id||!secret){
    try{id=localStorage.getItem('sp_client_id')||'';secret=localStorage.getItem('sp_client_secret')||'';}catch(_){}
  }
  if(!id||!secret){_spLastError='크레덴셜 없음 — Spotify 연동 패널을 열어 설정하세요';return null;}
  let cached='',exp=0;
  try{cached=localStorage.getItem('sp_token')||'';exp=+(localStorage.getItem('sp_token_exp')||0);}catch(_){}
  if(cached&&Date.now()<exp-15000)return cached;
  try{
    const r=await fetch('https://accounts.spotify.com/api/token',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded','Authorization':'Basic '+btoa(id+':'+secret)},
      body:'grant_type=client_credentials'
    });
    if(!r.ok){
      let body='';try{body=await r.text();}catch(_){}
      _spLastError=`HTTP ${r.status}: ${body||r.statusText}`;
      return null;
    }
    const d=await r.json();
    try{localStorage.setItem('sp_token',d.access_token);localStorage.setItem('sp_token_exp',Date.now()+d.expires_in*1000);}catch(_){}
    _spLastError='';
    return d.access_token;
  }catch(e){
    _spLastError=(e.message.includes('Failed to fetch')||e.message.includes('NetworkError'))
      ?'네트워크 오류 — 인터넷 연결 및 Spotify API 상태를 확인하세요':e.message;
    return null;
  }
}

async function testSpotifyConnection(){
  const el=document.getElementById('sp-test-result');
  if(el){el.innerHTML='테스트 중…';el.hidden=false;el.style.color='var(--text-3)';}
  // Check direct token first
  if(_spDirectToken){
    const tok=await getSpotifyToken();
    if(el){
      if(tok){el.innerHTML='✅ 직접 토큰 유효 — 검색 가능';el.style.color='var(--success)';updateSpPanelStatus();}
      else{el.innerHTML='❌ 직접 토큰이 만료됨 — ⚡ 토큰 직접 입력 탭에서 새 토큰을 붙여넣어 주세요';el.style.color='var(--danger)';}
    }
    return;
  }
  // API key mode: verify localStorage is writable
  let lsOk=false;
  try{localStorage.setItem('_sp_ls_test','ok');lsOk=localStorage.getItem('_sp_ls_test')==='ok';localStorage.removeItem('_sp_ls_test');}catch(_){}
  let id='',secret='';
  try{id=localStorage.getItem('sp_client_id')||'';secret=localStorage.getItem('sp_client_secret')||'';}catch(e){
    if(el){el.innerHTML=`❌ localStorage 접근 불가: ${e.message}`;el.style.color='var(--danger)';el.hidden=false;}
    return;
  }
  if(!lsOk){
    if(el){el.innerHTML=`❌ localStorage를 쓸 수 없습니다 — 브라우저 설정에서 쿠키/저장소를 허용하세요.`;el.style.color='var(--danger)';el.hidden=false;}
    return;
  }
  if(!id||!secret){
    if(el){el.innerHTML=`❌ 저장된 크레덴셜 없음<br>▸ ID: <strong>${id?id.slice(0,6)+'… (있음)':'없음'}</strong>&nbsp;▸ Secret: <strong>${secret?'있음':'없음'}</strong><br><br>Client ID와 Secret을 입력 후 <strong>저장</strong>을 눌러주세요.`;el.style.color='var(--danger)';el.hidden=false;}
    return;
  }
  try{localStorage.removeItem('sp_token');localStorage.removeItem('sp_token_exp');}catch(_){}
  const tok=await getSpotifyToken();
  if(!el)return;
  if(tok){
    el.innerHTML=`✅ 연결 성공! ID: ${id.slice(0,6)}…`;
    el.style.color='var(--success)';
    updateSpPanelStatus();
  }else{
    const isNet=_spLastError.includes('네트워크');
    const is401=_spLastError.includes('401');
    el.style.color='var(--danger)';
    el.innerHTML=`❌ 실패: ${_spLastError}`
      +(isNet?`<br><br>📌 네트워크 오류입니다. 인터넷 연결을 확인하고 다시 시도해 주세요.`
      :is401?`<br><br>📌 Client ID 또는 Secret이 틀렸습니다. 대시보드에서 다시 복사해 주세요.`
      :`<br>▸ ID: ${id.slice(0,6)}… ▸ Secret: ${secret.slice(0,4)}…`);
    el.hidden=false;
  }
}

async function spotifySearch(q){
  const tok=await getSpotifyToken();
  if(!tok)return null;// null = auth error (caller already handles this)
  try{
    const r=await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=6&market=KR`,{headers:{Authorization:'Bearer '+tok}});
    if(r.status===401){_spDirectToken='';try{sessionStorage.removeItem('sp_direct_token');}catch(_){}updateSpPanelStatus();_spLastError='토큰 만료';return null;}
    if(!r.ok){_spLastError=`Spotify API ${r.status}`;return null;}
    const d=await r.json();
    return(d.tracks?.items||[]).map(t=>({id:t.id,name:t.name,artist:t.artists.map(a=>a.name).join(', '),album:t.album.name,year:(t.album.release_date||'').slice(0,4)}));
  }catch(e){_spLastError='네트워크 오류: '+e.message;return null;}
}

async function getAudioFeatures(trackId){
  return getAudioFeaturesViaRapidAPI(trackId);
}
let _spAudioFeaturesStatus=0;

// ---- RapidAPI fallback (Musicae → SoundNet) ----
function getRapidApiKey(){
  try{return localStorage.getItem('rapidapi_key')||'';}catch(_){return'';}
}
function saveRapidApiKey(){
  const el=document.getElementById('rapidapi-key');
  const val=el?.value.trim()||'';
  const msgEl=document.getElementById('rapidapi-status');
  if(val==='••••••••••••••••'){ // 패널 열 때 채워둔 마스킹 표시일 뿐, 안 건드렸으면 그대로 둠
    if(msgEl){msgEl.textContent='✅ 이미 저장된 Key 그대로 유지됨';msgEl.hidden=false;msgEl.style.color='var(--success)';}
    return;
  }
  if(!val){
    if(msgEl){msgEl.textContent='❌ Key를 입력하세요';msgEl.hidden=false;msgEl.style.color='var(--danger)';}
    return;
  }
  try{localStorage.setItem('rapidapi_key',val);}catch(_){}
  if(msgEl){msgEl.textContent='✅ 저장됨 — 다음 곡 클릭부터 자동으로 사용됩니다';msgEl.hidden=false;msgEl.style.color='var(--success)';}
}


async function getAudioFeaturesViaRapidAPI(trackId){
  const key=getRapidApiKey();
  if(!key)return null;
  // 1) Musicae — Spotify 포맷 동일 drop-in
  try{
    const r=await fetch(`https://spotify-extended-audio-features-api.p.rapidapi.com/v1/audio-features/${trackId}`,{
      headers:{'X-RapidAPI-Key':key,'X-RapidAPI-Host':'spotify-extended-audio-features-api.p.rapidapi.com'}
    });
    if(r.ok){const d=await r.json();if(d&&d.tempo!=null){console.log('Musicae OK',d);return d;}}
    else console.warn('Musicae HTTP',r.status);
  }catch(e){console.warn('Musicae error',e);}
  // 2) SoundNet fallback
  try{
    const r=await fetch(`https://soundnet1.p.rapidapi.com/track-features?track_id=${trackId}`,{
      headers:{'X-RapidAPI-Key':key,'X-RapidAPI-Host':'soundnet1.p.rapidapi.com'}
    });
    if(r.ok){
      const d=await r.json();
      // SoundNet may return slightly different keys — normalize to Spotify format
      if(d&&Number.isFinite(d.tempo??d.bpm)){
        return{
          tempo:d.tempo??d.bpm,
          key:d.key??null,   // 모르면 null — 기본값(A)을 지어내지 않음
          mode:d.mode??0,
          energy:d.energy??0.7,
          valence:d.valence??0.5,
          danceability:d.danceability??0.75,
          loudness:d.loudness??-8
        };
      }
    } else console.warn('SoundNet HTTP',r.status);
  }catch(e){console.warn('SoundNet error',e);}
  return null;
}

let _spAudioFeaturesBlocked=false;

function spMoodFromFeatures(energy,valence,danceability){
  if(energy>0.72&&valence<0.33)return'어둡고 위압적';
  if(energy>0.68&&valence>0.65)return'에너제틱·하입';
  if(energy>0.65&&valence<0.52)return'분노·공격적';
  if(energy<0.38&&valence<0.4)return'내성적·사색';
  if(energy<0.48&&danceability>0.65)return'칠·그루비';
  if(valence>0.58&&danceability>0.72)return'감각적·관능적';
  if(valence>0.5&&energy>0.4)return'사이키델릭·몽환';
  return'멜로딕·감성';
}
function sp808FromEnergy(energy){
  if(energy<0.25)return'None';
  if(energy<0.45)return'Minimal';
  if(energy<0.65)return'Balanced';
  if(energy<0.82)return'Heavy';
  return'Dominant';
}
// 에너지·댄서빌리티로 리듬 밀도(1번째)와 보조 레이어(2번째)를 따로 판단 — 장르 고정값이 아니라 그 곡 실제 특성 기반
function spDrumsFromFeatures(energy,danceability){
  const picks=[];
  if(energy>0.75&&danceability>0.6)picks.push('Trap rolls');
  else if(energy>0.6&&danceability>0.6)picks.push('Rolling triplets');
  else if(energy<0.4)picks.push('Boom Bap kick');
  else picks.push('Crisp hi-hats');
  if(energy>0.8&&danceability<0.5)picks.push('Glitchy breaks');
  else if(energy>0.55)picks.push('Sub-bass punch');
  else if(!picks.includes('Crisp hi-hats'))picks.push('Crisp hi-hats');
  return[...new Set(picks)].slice(0,2);
}

let _spSearchTimer=null;
// 타이핑 멈추면 자동으로 검색 — 예전엔 타이머만 걸어두고 실제로 검색을 트리거하는 코드가 없어서
// 검색 버튼을 직접 누르거나 Enter를 쳐야만 결과가 떴음
function onRefSongInput(val){
  clearTimeout(_spSearchTimer);
  if(val.length<3){hideSpotifyDropdown();return;}
  _spSearchTimer=setTimeout(()=>doSpotifySearch(),500);
}
async function doSpotifySearch(){
  const q=(document.getElementById('hh-ref-song')?.value||'').trim();
  if(q.length<2)return;
  const statusEl=document.getElementById('sp-search-status');
  if(statusEl){statusEl.textContent='🔍 검색 중...';statusEl.hidden=false;}
  const tok=await getSpotifyToken();
  if(!tok){
    const errMsg=_spLastError||'미연결';
    const hint=errMsg.includes('크레덴셜')||errMsg.includes('미연결')?'상단 🎧 SPOTIFY 연동 패널 열기 → API 키 입력 또는 ⚡ 토큰 직접 입력':'상단 🎧 SPOTIFY 연동 패널 → 연결 테스트로 원인 확인';
    if(statusEl){statusEl.textContent=`⚠️ ${errMsg} — ${hint}`;statusEl.hidden=false;}
    return;
  }
  const results=await spotifySearch(q);
  if(statusEl)statusEl.hidden=true;
  if(results===null){
    const errMsg=_spLastError||'API 오류';
    const isNet=errMsg.includes('fetch')||errMsg.includes('네트워크');
    if(statusEl){
      statusEl.innerHTML=isNet
        ?`⚠️ 네트워크 오류 — 인터넷 연결 확인 후 다시 시도하세요`
        :`⚠️ ${errMsg}`;
      statusEl.hidden=false;
    }
    return;
  }
  if(results.length===0){
    if(statusEl){statusEl.textContent='검색 결과 없음 (다른 키워드로 시도)';statusEl.hidden=false;}
    return;
  }
  showSpotifyDropdown(results);
}
function showSpotifyDropdown(results){
  const dd=document.getElementById('sp-dropdown');
  if(!dd)return;
  // .section에 둥근 모서리용 overflow:hidden이 걸려있어서, 그 안에 있으면 검색 결과가 길 때 카드 경계에서 잘려 보임 —
  // body로 꺼내서(포지션은 fixed로) 그 클리핑을 벗어나게 하고, 입력창 기준으로 매번 위치를 다시 계산
  if(dd.parentElement!==document.body)document.body.appendChild(dd);
  const wrap=document.getElementById('hh-ref-search-wrap');
  if(wrap){
    const r=wrap.getBoundingClientRect();
    dd.style.left=r.left+'px';
    dd.style.top=(r.bottom+4)+'px';
    dd.style.width=r.width+'px';
  }
  dd.innerHTML='';
  results.forEach(t=>{
    const row=document.createElement('div');
    row.style.cssText='padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:2px;transition:.12s';
    row.innerHTML=`<span style="font-size:13px;font-weight:600;color:var(--text-1)">${t.name}</span><span style="font-size:11px;color:var(--text-3)">${t.artist} · ${t.album}${t.year?' ('+t.year+')':''}</span>`;
    row.onmouseenter=()=>row.style.background='var(--surface-3)';
    row.onmouseleave=()=>row.style.background='';
    row.onclick=()=>applySpotifyTrack(t.id,`${t.artist} - ${t.name}`);
    dd.appendChild(row);
  });
  dd.hidden=false;
  // 바깥 클릭 시 닫기
  setTimeout(()=>document.addEventListener('click',_spClickAway,{once:true}),50);
}
function _spClickAway(e){
  const dd=document.getElementById('sp-dropdown');
  if(dd&&!dd.contains(e.target))hideSpotifyDropdown();
}
function hideSpotifyDropdown(){
  const dd=document.getElementById('sp-dropdown');
  if(dd)dd.hidden=true;
}

async function applySpotifyTrack(trackId,label){
  hideSpotifyDropdown();
  const inp=document.getElementById('hh-ref-song');
  if(inp)inp.value=label;
  {const bi=document.getElementById('hh-brief');if(bi)bi.value=label;}
  const statusEl=document.getElementById('sp-search-status');
  if(statusEl){statusEl.textContent='⚙️ 오디오 피처 분석 중...';statusEl.hidden=false;}
  const af=await getAudioFeatures(trackId);
  if(!af){
    const code=_spAudioFeaturesStatus;
    let msg='';
    if(code===403){
      msg='❌ HTTP 403 — Spotify가 2024년 11월부터 일반 앱의 BPM/Key API를 차단했습니다. Developer Dashboard → 앱 → Extended quota mode 신청 필요';
    } else if(code===401){
      msg='❌ HTTP 401 — 토큰 만료. Spotify 연동 패널에서 재연결하세요';
    } else {
      msg=`❌ Audio Features 조회 실패 (HTTP ${code||'?'}) — F12 콘솔에서 상세 오류를 확인하세요`;
    }
    if(statusEl){statusEl.textContent=msg;statusEl.hidden=false;}
    return;
  }
  st.refAf=af; // store for arrange direction generation
  // Key
  const keyIdx=SP_KEY_MAP[`${af.key},${af.mode}`];
  if(keyIdx!=null){st.key=keyIdx;st.keySet=true;document.getElementById('hh-key').value=keyIdx;}
  // BPM (일부 곡은 실제의 2배로 인식 — 에너지 낮으면 절반)
  let bpm=Math.round(af.tempo);
  if(bpm>170&&af.energy<0.55)bpm=Math.round(bpm/2);
  if(bpm<70&&af.energy>0.6)bpm=bpm*2;
  if(Number.isFinite(bpm)&&bpm>0){st.bpm=Math.min(220,Math.max(60,bpm));st.bpmSet=true;document.getElementById('hh-bpm').value=st.bpm;}
  // 808
  const level=af._808||sp808FromEnergy(af.energy);
  st._808=level;
  // 드럼 — 장르 고정값(GENRE_AUTO) 대신 이 곡의 실제 에너지·댄서빌리티로 판단
  const drums=spDrumsFromFeatures(af.energy,af.danceability);
  st.drums=drums;
  // Mood
  const moodKr=spMoodFromFeatures(af.energy,af.valence,af.danceability);
  st.mood=moodKr;
  moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',null);
  if(st._mtAutoManaged)recommendMelodyTexture();
  if(st._structAutoManaged)recommendStructure();
  // recommendMelodyTexture가 808/드럼도 장르+무드 룰로 다시 뽑아서 곡에서 직접 읽은 값을 덮어쓰므로, 곡 값을 그 뒤에 확정
  st._808=level;
  st.drums=drums;
  chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,onRhythmManualChange);
  setAutoHint('hh-808-hint',(_spAudioFeaturesBlocked?'장르 기반: ':'Spotify: ')+level);
  chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,onDrumsManualChange);
  setAutoHint('hh-drums-hint',(_spAudioFeaturesBlocked?'장르 기반: ':'Spotify: ')+drums.join(', '));
  if(statusEl){
    const keyStr=KEYS[st.key]||'?';
    const sfx=_spAudioFeaturesBlocked?' (장르 기반 추정)':'';
    statusEl.textContent=`✅ Key: ${keyStr} · BPM: ${st.bpm} · 무드: ${moodKr} · 808: ${level} · 드럼: ${drums.join(', ')}${sfx}`;
    statusEl.hidden=false;
  }
}


// ============================================================
// TRENDING ARTISTS
// ============================================================
// genre:"tag" 아티스트 검색 — popularity 붙은 아티스트 객체를 바로 돌려줌 (플레이리스트 스크래핑 불필요)
// genre: 필드 필터는 이 앱 등급에서 사실상 무의미한(popularity 0, 무명 아티스트) 결과만 줘서
// 평문 키워드 검색으로 대체 — Spotify 자체 relevance 랭킹이 훨씬 낫다 (실측 확인됨).
const isKoreanName=name=>/[가-힣]/.test(name);

// 실제 Billboard 주간 Hip-Hop/R&B 차트 — RapidAPI billboard-charts-api. 순위 자체가 진짜 트렌드 신호.
// id="r-b-hip-hop-songs" 는 실측으로 확인된 값 (카테고리 목록이 주는 id는 도메인 접두사가 깨져있어 못 씀)
// 계열별 차트 — 힙합은 Hip-Hop/R&B 주간 차트, 팝·R&B는 Hot 100. "r-b-hip-hop-songs"는 실측으로 확인된 id이고 "hot-100"도 실측 확인(100곡, 같은 응답 형식). Hot 100은 컨트리 등 전 장르가 섞여 있음
const BILLBOARD_CHARTS={hiphop:{id:'r-b-hip-hop-songs',label:'Hip-Hop/R&B 주간 차트'},pop:{id:'hot-100',label:'Hot 100 차트'}};
let _chartKey='hiphop';
function setChart(k){
  if(!BILLBOARD_CHARTS[k]||_chartKey===k)return;
  _chartKey=k;
  const chips=document.getElementById('hh-trending-chips');
  if(chips)chips.innerHTML='<span style="font-size:11px;color:var(--text-3);align-self:center">새로고침을 누르면 이 차트의 핫한 아티스트가 표시됩니다</span>';
  const acc=document.getElementById('hh-artists-typeBeat');if(acc)acc.innerHTML='<span style="font-size:11px;color:var(--text-3)">차트를 새로고침하면 이 차트의 아티스트가 자동으로 구성됩니다</span>';
  renderChartChips();
}
function renderChartChips(){
  const el=document.getElementById('hh-chart-chips');if(!el)return;
  el.innerHTML='';
  Object.entries(BILLBOARD_CHARTS).forEach(([k,c])=>{
    const b=document.createElement('button');b.textContent=c.label.replace(' 주간 차트','').replace(' 차트','');
    const on=_chartKey===k;
    b.style.cssText=`padding:3px 12px;border-radius:14px;font-size:11px;cursor:pointer;border:1px solid ${on?'var(--accent)':'var(--border)'};background:${on?'var(--accent-dim)':'var(--surface-2)'};color:${on?'var(--accent-text)':'var(--text-2)'}`;
    b.onclick=()=>setChart(k);
    el.appendChild(b);
  });
}
async function fetchBillboardChart(chartId){
  const key=getRapidApiKey();
  if(!key)return[];
  try{
    const r=await fetch(`https://billboard-charts-api.p.rapidapi.com/chart.php?id=${encodeURIComponent(chartId)}`,{
      headers:{'X-RapidAPI-Key':key,'X-RapidAPI-Host':'billboard-charts-api.p.rapidapi.com'}
    });
    if(!r.ok){console.warn('Billboard chart HTTP',r.status);return[];}
    const d=await r.json();
    return d.songs||[];
  }catch(e){console.warn('fetchBillboardChart error',e);return[];}
}
const fetchBillboardHipHopChart=()=>fetchBillboardChart(BILLBOARD_CHARTS.hiphop.id);

// 429가 떴을 때 곧바로 재시도하면 아직 안 풀린 제한 구간을 한 번 더 건드려서 요청만 늘리고 회복에 도움이 안 됨 —
// 재시도 대신 pMapLimit 쪽에서 애초에 완전 순차 + 충분한 간격으로 보내서 429 자체가 덜 나게 하는 쪽으로 대응.
// 단, 실측해보니 이 429의 실제 몸통이 {"reason":"QUOTA_EXCEEDED"} — 초당 요청 수 제한이 아니라 앱 단위
// 총 할당량(Development 등급이라 낮음) 소진이라, 페이싱으로는 애초에 못 고치는 종류의 에러. 최소한 사용자에게
// "잠시 후 재시도"가 아니라 "할당량 초과"라는 정확한 원인이라도 보여주려고 플래그만 남겨둠
let _spQuotaExceeded=false;
async function fetchWithRetry429(url,tok){
  const r=await fetch(url,{headers:{Authorization:'Bearer '+tok}});
  if(r.status===429){
    try{const body=await r.clone().json();if(body?.error?.reason==='QUOTA_EXCEEDED')_spQuotaExceeded=true;}catch(_){}
  }
  return r;
}
// Billboard 차트엔 Spotify ID가 없어서 아티스트 이름으로 정확히 검색해 ID를 리졸브
async function resolveArtistIdByName(name,tok){
  try{
    const r=await fetchWithRetry429(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&market=US&limit=1`,tok);
    if(!r.ok)return null;
    const d=await r.json();
    const a=(d.artists?.items||[])[0];
    return a&&a.id?{id:a.id,name:a.name,genres:a.genres||[]}:null;
  }catch(e){return null;}
}

// Spotify가 이 앱 등급에서 genres 필드도 지워버려서(popularity와 동일 증상, 실측 확인됨)
// Musicae 배치 조회로 genres만 복구 — "요즘 뜨는 서브장르" 집계에 필요
async function fetchArtistGenresViaRapidAPI(ids){
  const key=getRapidApiKey();
  if(!key||!ids.length)return{};
  try{
    const r=await fetch(`https://spotify-extended-audio-features-api.p.rapidapi.com/v1/artists?ids=${ids.slice(0,50).join(',')}`,{
      headers:{'X-RapidAPI-Key':key,'X-RapidAPI-Host':'spotify-extended-audio-features-api.p.rapidapi.com'}
    });
    if(!r.ok){console.warn('Musicae artists batch HTTP',r.status);return{};}
    const d=await r.json();
    const map={};
    (d.artists||[]).forEach(a=>{if(a&&a.id)map[a.id]=a.genres||[];});
    return map;
  }catch(e){console.warn('fetchArtistGenresViaRapidAPI error',e);return{};}
}

// native Spotify /v1/artists/{id}/top-tracks도 이 앱 등급에서 403 — Musicae RapidAPI의 동일 엔드포인트로 대체
async function fetchArtistTopTracksRaw(artistId){
  const key=getRapidApiKey();
  if(!key)return[];
  try{
    const r=await fetch(`https://spotify-extended-audio-features-api.p.rapidapi.com/v1/artists/${artistId}/top-tracks`,{
      headers:{'X-RapidAPI-Key':key,'X-RapidAPI-Host':'spotify-extended-audio-features-api.p.rapidapi.com'}
    });
    if(!r.ok){console.warn(`artist top-tracks "${artistId}" HTTP ${r.status}`);return[];}
    const d=await r.json();
    const tracks=d.tracks||d.items||[];
    // top-tracks는 역대 최고 인기곡 순이라 옛날 히트곡이 앞에 올 수 있음 — 최신 발매순으로 재정렬해서 "요즘 사운드"에 가깝게
    return tracks.slice().sort((a,b)=>(b.album?.release_date||'0')>(a.album?.release_date||'0')?1:-1);
  }catch(e){console.warn('fetchArtistTopTracksRaw error',e);return[];}
}

async function fetchArtistTopTracks(artistId,tok,limit=5){
  const tracks=await fetchArtistTopTracksRaw(artistId);
  return tracks.slice(0,limit).map(t=>({
    id:t.id,name:t.name,
    popularity:t.popularity||0,
    year:(t.album?.release_date||'').slice(0,4)
  }));
}

// Billboard엔 트랙 ID가 없어서, "지금 차트인 그 곡"을 Spotify에서 아티스트+제목으로 직접 찾는다
async function resolveTrackByArtistAndTitle(artist,title,tok){
  try{
    const r=await fetchWithRetry429(`https://api.spotify.com/v1/search?q=${encodeURIComponent(`${artist} ${title}`)}&type=track&market=US&limit=1`,tok);
    if(!r.ok)return null;
    const d=await r.json();
    const t=(d.tracks?.items||[])[0];
    return t?{id:t.id,name:t.name,popularity:t.popularity||0,year:(t.album?.release_date||'').slice(0,4)}:null;
  }catch(e){return null;}
}

async function applySpotifyTrackSong(artistId,artistName,genres,trackId,trackName){
  const statusEl=document.getElementById('trending-status');
  setRefSongFromPicker(`${artistName} - ${trackName}`,null);   // 오디오 피처를 못 가져와도 곡은 입력칸에 들어감
  if(statusEl){statusEl.textContent=`🎧 ${artistName} — ${trackName} 분석 중…`;statusEl.hidden=false;}
  const tok=await getSpotifyToken();
  if(!tok)return;
  const af=await getAudioFeatures(trackId);
  if(!af){
    const code=_spAudioFeaturesStatus;
    let msg=code===403
      ?`❌ HTTP 403 — Spotify가 2024년 11월부터 일반 앱의 BPM/Key API를 차단했습니다. Extended quota mode 신청 필요`
      :`❌ Audio Features 조회 실패 (HTTP ${code||'?'})`;
    if(statusEl){statusEl.textContent=msg;statusEl.hidden=false;}
    return;
  }
  st.refAf=af; // store for arrange direction generation
  // Key
  const keyIdx=SP_KEY_MAP[`${af.key},${af.mode}`];
  if(keyIdx!=null){st.key=keyIdx;st.keySet=true;document.getElementById('hh-key').value=keyIdx;}
  // BPM
  let bpm=Math.round(af.tempo);
  if(bpm>170&&af.energy<0.55)bpm=Math.round(bpm/2);
  if(bpm<70&&af.energy>0.6)bpm=bpm*2;
  if(Number.isFinite(bpm)&&bpm>0){st.bpm=Math.min(220,Math.max(60,bpm));st.bpmSet=true;document.getElementById('hh-bpm').value=st.bpm;}
  // 808
  const level=sp808FromEnergy(af.energy);
  st._808=level;chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,null);
  setAutoHint('hh-808-hint','Spotify: '+level);
  // Mood
  const moodKr=spMoodFromFeatures(af.energy,af.valence,af.danceability);
  st.mood=moodKr;moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',null);
  // 장르
  const genreIdx=detectGenreFromSpotify(genres);
  if(genreIdx!==null){
    st.genre=genreIdx;renderHhGenres();
    const auto=GENRE_AUTO[genreIdx];
    if(auto){
      st._808=auto.a808;st.drums=[...auto.aDrums];st.transitionFx=[...auto.fx];st.groove=auto.groove;
      chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,null);
      chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,null);
      chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,null);
      chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,null);
      setAutoHint('hh-808-hint','808: '+auto.a808);
      setAutoHint('hh-drums-hint',auto.aDrums.join(', '));
      setAutoHint('hh-fx-hint',auto.fx.join(', '));
      setAutoHint('hh-groove-hint',auto.groove);
    }
    recommendMelodyTexture();
    recommendProducerRef();
    recommendStructure();
  }
  // 레퍼런스 곡
  const refEl=document.getElementById('hh-ref-song');
  if(refEl)refEl.value=`${artistName} - ${trackName}`;
  const keyStr=KEYS[st.key]||'?';
  if(statusEl){
    statusEl.textContent=`✅ ${artistName} — ${trackName} · Key: ${keyStr} · ${st.bpm}BPM · 무드: ${moodKr} · 808: ${level}`;
    statusEl.hidden=false;
  }
  showToast(`🎧 <b>${artistName} — ${trackName}</b><br>Key: ${keyStr} · ${st.bpm}BPM · ${moodKr} 적용됨`);
  updateFloatSummary();
}

const TREND_COLORS=['#FF4D6D','#9D4EDD','#00C6FF','#FF6B35','#4DC886','#C77DFF','#FF9EC8','#F59E0B','#06B6D4','#22C55E'];

async function buildTrendingArtistAccordion(artists,tok){
  const container=document.getElementById('hh-artists-typeBeat');
  container.innerHTML='<div style="font-size:11px;color:var(--text-3);padding:6px 0">🎧 Spotify 핫 트랙 로딩 중…</div>';
  setTimeout(()=>{ // DOM paint 먼저
    container.innerHTML='';
    const rows=artists.slice(0,15).map((a,i)=>{
      const color=TREND_COLORS[i%TREND_COLORS.length];
      const row=document.createElement('div');
      row.className='artist-row';
      row.dataset.artistId=a.id;
      const header=document.createElement('div');
      header.className='artist-header';
      const popBadge=typeof a.popularity==='number'?`<span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;background:${a.popularity>=70?'#22c55e':a.popularity>=40?'#f59e0b':'var(--border)'};color:${a.popularity>=40?'#000':'var(--text-2)'};margin-left:4px">🔥${a.popularity}</span>`:'';
      header.innerHTML=`<div class="artist-pill" style="background:${color}20;border:1px solid ${color}50;color:${color}">${a.name}</div>${popBadge}<span class="artist-caret" style="margin-left:auto">▼</span>`;
      header.onclick=()=>row.classList.toggle('open');
      const songsDiv=document.createElement('div');
      songsDiv.className='artist-songs';
      songsDiv.innerHTML='<div style="font-size:11px;color:var(--text-3)">로딩 중…</div>';
      row.appendChild(header);row.appendChild(songsDiv);
      container.appendChild(row);
      return{a,songsDiv};
    });
    // 트랙 fetch(그중 일부는 Spotify /search)를 여기도 완전 순차 + 간격을 둬서 429를 덜 유발하게
    pMapLimit(rows,1,async({a,songsDiv})=>{
      // Billboard에서 확인된 "지금 차트인 곡"을 최우선으로 꽂는다
      let tracks=await fetchArtistTopTracks(a.id,tok,5);
      if(a.chartSong){
        const chartTitle=a.chartSong.name.toLowerCase().trim();
        const already=tracks.find(t=>t.name.toLowerCase().trim()===chartTitle);
        if(already){
          tracks=[already,...tracks.filter(t=>t!==already)];
        } else {
          const resolvedChart=await resolveTrackByArtistAndTitle(a.name,a.chartSong.name,tok);
          if(resolvedChart)tracks=[resolvedChart,...tracks].slice(0,5);
        }
      }
      if(!tracks.length){songsDiv.innerHTML='<div style="font-size:11px;color:var(--text-3)">트랙 없음</div>';return;}
      const grid=document.createElement('div');
      grid.className='songs-grid';
      tracks.forEach((t,ti)=>{
        const card=document.createElement('div');
        card.className='song-card';
        const chartBadge=(a.chartSong&&ti===0)?' · 📊 차트인':'';
        const popText=t.popularity?` · 인기도 ${t.popularity}`:'';
        card.innerHTML=`<div class="song-name">${t.name}</div><div class="song-meta">${t.year}${popText}${chartBadge}</div>`;
        card.onclick=()=>applySpotifyTrackSong(a.id,a.name,a.genres,t.id,t.name);
        grid.appendChild(card);
      });
      songsDiv.innerHTML='';songsDiv.appendChild(grid);
    },400);
  },0);
}

// Spotify genres → GENRES index (best-effort)
const SP_GENRE_MAP=[
  {pats:['trap metal','rap metal'],idx:18},{pats:['sexy drill','bronx drill'],idx:19},
  {pats:['dark trap'],idx:1},{pats:['melodic rap','melodic trap'],idx:2},
  {pats:['ny drill','new york drill'],idx:3},{pats:['uk drill','british drill'],idx:4},
  {pats:['phonk','memphis'],idx:5},{pats:['boom bap','east coast hip hop','underground hip hop'],idx:6},
  {pats:['cloud rap','witch house'],idx:7},{pats:['lo-fi','chillhop'],idx:8},
  {pats:['jersey club'],idx:9},{pats:['plugg','rage'],idx:10},{pats:['afrobeats','afropop','afro trap'],idx:11},
  {pats:['conscious hip hop'],idx:12},{pats:['trap soul','r&b','soul'],idx:13},
  {pats:['hyperpop'],idx:14},{pats:['trap','rap','hip hop'],idx:0},
];
// 일렉·팝 계열 태그 → 통합 카탈로그 인덱스 (구체적인 태그부터)
const SP_GENRE_MAP_EXTRA=[
  {pats:['amapiano'],idx:30},{pats:['afro house'],idx:28},{pats:['melodic techno'],idx:27},{pats:['tech house'],idx:31},{pats:['techno'],idx:21},
  {pats:['uk garage','speed garage'],idx:22},{pats:['drum and bass','drum & bass','jungle'],idx:23},{pats:['ambient'],idx:24},{pats:['trance'],idx:25},
  {pats:['future bass'],idx:26},{pats:['idm','glitch'],idx:29},{pats:['deep house','progressive house','electro house','edm'],idx:20},
  {pats:['k-pop','korean pop'],idx:35},{pats:['dance pop'],idx:34},{pats:['alt r&b','alternative r&b'],idx:38},{pats:['neo soul'],idx:39},
  {pats:['dream pop','shoegaze'],idx:37},{pats:['bedroom pop'],idx:40},{pats:['synthpop','synth-pop','new wave'],idx:41},{pats:['indie pop'],idx:36},
  {pats:['acoustic pop','singer-songwriter','folk pop'],idx:42},
  {pats:['country pop','contemporary country','modern country','country'],idx:43},
  {pats:['j-pop','jpop','japanese pop','j-rock','city pop'],idx:44},
];
function detectGenreFromSpotify(genres){
  const joined=(genres||[]).join(' ').toLowerCase();
  const head=SP_GENRE_MAP.filter(m=>m.idx!==13&&m.idx!==0),tail=SP_GENRE_MAP.filter(m=>m.idx===13||m.idx===0);   // 13=trap soul(r&b), 0=일반 trap/rap
  for(const list of [head,SP_GENRE_MAP_EXTRA]){
    for(const{pats,idx}of list){
      if(idx===43&&/\brap\b|hip hop|trap/.test(joined))continue;   // 컨트리 랩 등은 힙합 쪽
      if(pats.some(p=>joined.includes(p)))return idx;
    }
  }
  if(_chartKey==='pop'){   // Hot 100 차트에서 온 아티스트의 일반 r&b/pop 태그는 팝·R&B 계열로
    if(['r&b','soul'].some(p=>joined.includes(p)))return 33;
    if(joined.includes('pop'))return 32;
  }
  for(const{pats,idx}of tail){if(pats.some(p=>joined.includes(p)))return idx;}
  return null;
}

// 한 번에 너무 많이 동시 요청하면 Spotify가 429(rate limit)로 응답 — 동시 실행 개수를 제한하고(limit),
// 요청 사이 간격도 둬서(delayMs) 순간 몰림 자체를 줄인다. 이 앱은 Extended quota mode가 아니라
// 기본 Development 등급이라 허용치가 낮아서, 동시성 제한만으로는 부족해 페이싱까지 같이 함
async function pMapLimit(items,limit,fn,delayMs=0){
  const results=new Array(items.length);
  let i=0;
  async function worker(){
    while(i<items.length){
      const idx=i++;
      results[idx]=await fn(items[idx],idx);
      if(delayMs)await new Promise(r=>setTimeout(r,delayMs));
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));
  return results;
}
async function fetchTrendingArtists(){
  const btn=document.getElementById('trending-refresh-btn');
  const statusEl=document.getElementById('trending-status');
  const chipsEl=document.getElementById('hh-trending-chips');
  const lastEl=document.getElementById('trending-last-update');
  if(btn)btn.textContent='로딩 중...';
  const chartCfg=BILLBOARD_CHARTS[_chartKey];
  if(statusEl){statusEl.textContent=`📊 Billboard ${chartCfg.label} 조회 중…`;statusEl.hidden=false;}
  _spQuotaExceeded=false;

  const tok=await getSpotifyToken();
  if(!tok){
    const isNet=(_spLastError||'').includes('fetch')||(_spLastError||'').includes('네트워크');
    if(chipsEl)chipsEl.innerHTML=isNet
      ?`<span style="font-size:11px;color:var(--danger)">⚠️ 네트워크 오류 — 인터넷 연결을 확인하세요</span>`
      :`<span style="font-size:11px;color:var(--danger)">⚠️ ${_spLastError||'미연결'} — 상단 🎧 SPOTIFY 연동 패널에서 설정하세요</span>`;
    if(btn)btn.textContent='↻ 새로고침';
    return;
  }

  const chart=await fetchBillboardChart(chartCfg.id);
  if(!chart.length){
    if(chipsEl)chipsEl.innerHTML='<span style="font-size:11px;color:var(--danger)">⚠️ Billboard 차트를 가져오지 못했습니다. RapidAPI에 billboard-charts-api를 구독했는지 확인하세요.</span>';
    if(statusEl){statusEl.textContent='Billboard 차트 조회 실패';statusEl.hidden=false;}
    if(btn)btn.textContent='↻ 새로고침';
    return;
  }

  // 차트 순위 그대로 유니크 아티스트 추출 (이미 진짜 트렌드 순서라 재정렬 불필요), 한국 아티스트 제외
  // 이 시점의 곡 제목(chartSong)을 같이 들고 있다가 아코디언에서 "진짜 지금 차트인 곡"을 최우선으로 보여줄 때 씀
  const seen=new Set();
  const chartEntries=[];
  chart.forEach(s=>{
    if(!s.artist||seen.has(s.artist)||isKoreanName(s.artist))return;
    seen.add(s.artist);
    chartEntries.push(s);
  });

  if(statusEl)statusEl.textContent=`Billboard 순위 아티스트 ${Math.min(chartEntries.length,15)}명 Spotify ID 조회 중…`;
  // Billboard엔 Spotify ID가 없어서 이름으로 리졸브 — 완전 순차 + 간격을 둬서 429를 덜 유발하게
  const resolved=(await pMapLimit(chartEntries.slice(0,15),1,async s=>{
    const a=await resolveArtistIdByName(s.artist,tok);
    return a?{...a,chartSong:{name:s.name,position:s.position}}:null;
  },400)).filter(Boolean);
  const scoredTop=resolved.filter(a=>!isKoreanName(a.name)).slice(0,15);

  if(!scoredTop.length){
    const quotaMsg='⚠️ Spotify API 일일 할당량 초과 — 이 앱이 Development 등급이라 한도가 낮습니다. 몇 시간 후 다시 시도하거나 Extended Quota Mode를 신청하세요.';
    if(chipsEl)chipsEl.innerHTML=`<span style="font-size:11px;color:var(--danger)">${_spQuotaExceeded?quotaMsg:'⚠️ Billboard 아티스트를 Spotify에서 찾지 못했습니다.'}</span>`;
    if(statusEl){statusEl.textContent=_spQuotaExceeded?'할당량 초과':'아티스트 리졸브 실패';statusEl.hidden=false;}
    if(btn)btn.textContent='↻ 새로고침';
    return;
  }
  if(statusEl)statusEl.textContent=`Billboard ${chartCfg.label} 기준 ${scoredTop.length}명 (실제 이번 주 순위)`;

  // genres 채워넣기 — 서브장르 집계용 (Spotify가 안 주니 Musicae로)
  const genreMap=await fetchArtistGenresViaRapidAPI(scoredTop.map(a=>a.id));
  scoredTop.forEach(a=>{if(genreMap[a.id]&&genreMap[a.id].length)a.genres=genreMap[a.id];});

  // 세션 캐시
  try{sessionStorage.setItem('sp_trending_'+_chartKey,JSON.stringify(scoredTop));
    sessionStorage.setItem('sp_trending_ts_'+_chartKey,Date.now());}catch(e){}

  renderTrendingChips(scoredTop);
  buildTrendingArtistAccordion(scoredTop,tok);
  if(lastEl){const now=new Date();lastEl.textContent=`업데이트: ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;}
  if(btn)btn.textContent='↻ 새로고침';

  // 요즘 뜨는 서브장르 — 검색으로 받은 아티스트들의 genres 태그를 우리 GENRES 인덱스로 집계 (추가 API 호출 없음)
  const trends=computeGenreTrends(scoredTop);
  renderGenreTrends(trends);
  const gtLastEl=document.getElementById('genre-trend-last-update');
  if(gtLastEl){const now=new Date();gtLastEl.textContent=`업데이트: ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;}
}

function computeGenreTrends(artists){
  // popularity 필드가 없어서(이 앱 등급 제한) count(등장 빈도)만으로 순위를 매긴다
  const buckets={};
  artists.forEach(a=>{
    const idx=detectGenreFromSpotify(a.genres);
    if(idx==null)return;
    if(!buckets[idx])buckets[idx]={idx,count:0};
    buckets[idx].count++;
  });
  return Object.values(buckets)
    .sort((a,b)=>b.count-a.count)
    .slice(0,6);
}

function renderGenreTrends(trends){
  const el=document.getElementById('hh-genre-trends');
  if(!el)return;
  el.innerHTML='';
  if(!trends.length){
    el.innerHTML='<span style="font-size:11px;color:var(--text-3)">해당하는 서브장르를 찾지 못했습니다</span>';
    return;
  }
  trends.forEach((t,i)=>{
    const g=GENRES[t.idx];
    if(!g)return;
    const badge=document.createElement('div');
    badge.dataset.genreIdx=t.idx;
    badge.className='chip'+(st.genre===t.idx?' selected':'');
    badge.style.cssText='display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:6px 12px;min-width:100px;border-radius:var(--r-sm);text-align:left;white-space:normal';
    badge.innerHTML=`<span>${i===0?'🔥 ':''}${g.kr}</span><span style="font-size:9px;color:var(--text-3);font-weight:400">검색된 아티스트 ${t.count}명</span>`;
    badge.onclick=()=>selectGenre(t.idx);
    el.appendChild(badge);
  });
}

function renderTrendingChips(artists){
  const el=document.getElementById('hh-trending-chips');
  if(!el)return;
  el.innerHTML='';
  artists.forEach(a=>{
    const chip=document.createElement('div');
    chip.className='chip';
    chip.style.cssText='display:flex;align-items:center;gap:5px;padding:5px 10px 5px 6px';
    if(typeof a.popularity==='number'){
      const pop=document.createElement('span');
      pop.style.cssText=`font-size:9px;font-weight:700;padding:1px 4px;border-radius:4px;background:${a.popularity>=70?'#22c55e':a.popularity>=40?'#f59e0b':'var(--border)'};color:${a.popularity>=40?'#000':'var(--text-2)'}`;
      pop.textContent=a.popularity;
      chip.appendChild(pop);
    }
    const name=document.createElement('span');
    name.textContent=a.name;
    chip.appendChild(name);
    chip.title=a.genres.slice(0,2).join(', ')||'hip-hop';
    // 칩 클릭으로 곡을 자동 적용하지 않음 — 아래 아코디언을 펼쳐서 "곡을 직접 골라야" mood/bpm이 적용되게 함
    chip.onclick=()=>openArtistRow(a.id);
    el.appendChild(chip);
  });
}

function openArtistRow(artistId){
  const row=document.querySelector(`#hh-artists-typeBeat [data-artist-id="${artistId}"]`);
  if(!row)return;
  row.classList.add('open');
  row.scrollIntoView({behavior:'smooth',block:'center'});
}


renderChartChips();
// 세션 캐시 복원
(function restoreTrendingCache(){
  try{
    const ts=+(sessionStorage.getItem('sp_trending_ts_'+_chartKey)||0);
    if(Date.now()-ts>3600000)return; // 1시간 이후 만료
    const cached=sessionStorage.getItem('sp_trending_'+_chartKey);
    if(!cached)return;
    const data=JSON.parse(cached);
    renderTrendingChips(data);
    const lastEl=document.getElementById('trending-last-update');
    if(lastEl){const d=new Date(ts);lastEl.textContent=`캐시: ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;}
  }catch(e){}
})();

