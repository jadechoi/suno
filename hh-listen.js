// 🎧 들어보고 확인하기 — 곡을 오디오로 듣는 AI(예: Gemini)에게 평가받고, 그 답을 붙여넣어 프롬프트 수정 제안으로 바꾸는 흐름만 남김
let _extFeedbackDraft='';   // 화면을 다시 그려도 붙여넣은 글이 안 사라지게
function listenHtml(){
  const hasKey=!!getAnthropicKey();
  return `<div style="font-size:12px;color:var(--text-2);line-height:1.8">
  ① Suno에서 만든 곡 파일(mp3)을 <b>오디오를 들을 수 있는 AI</b>(예: Gemini)에 올려요.<br>
  ② 아래 <b>평가 요청문 복사</b>를 눌러 그 AI에 붙여넣어요. (지금 프롬프트가 자동으로 들어가요)<br>
  ③ AI가 준 평가를 아래 칸에 붙여넣고 <b>제안으로 바꾸기</b>를 눌러요. 그다음 마음에 드는 제안만 적용하고 Generate를 누르면 돼요.
</div>
<div style="margin-top:8px"><button onclick="listenCopyAiRequest(this)" style="padding:6px 14px;border-radius:14px;border:1px solid var(--border-hi);background:var(--surface-3);color:var(--accent-text);font-size:12px;cursor:pointer">📋 AI 평가 요청문 복사</button></div>
<textarea id="hh-external-feedback-ta" oninput="_extFeedbackDraft=this.value" placeholder="여기에 AI가 준 평가를 붙여넣기 (예: 훅이 반복될 때 변화가 부족해서 두 번째 임팩트가 약하다...)" style="display:block;width:100%;box-sizing:border-box;min-height:90px;margin-top:10px;padding:8px 10px;border-radius:var(--r-sm);border:1px solid var(--border-hi);background:var(--surface-2);color:var(--text-1);font-family:'Space Grotesk',sans-serif;font-size:12px;resize:vertical">${escHtml(_extFeedbackDraft)}</textarea>
<div style="display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap">
  <button id="hh-ai-external-btn" onclick="aiParseExternalFeedback()" ${hasKey?'':'disabled'} style="padding:7px 16px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:12px;font-weight:700;cursor:pointer;opacity:${hasKey?1:.5}">🤖 제안으로 바꾸기</button>
  ${hasKey?'':'<span style="font-size:11px;color:var(--text-3)">API Key가 필요해요</span>'}
</div>`;
}
// 오디오를 듣는 AI에게 줄 평가 요청문 — 답을 위 칸에 붙여 넣으면 됨
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
