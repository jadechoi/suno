// 🎧 들어보고 확인하기 — GPT가 완성된 음원을 듣고 평가한 뒤 수정 제안으로 바꾸는 흐름
let _extFeedbackDraft='';
function listenHtml(){
  const connected=!!getOpenAIKey();
  return `<div style="font-size:12px;color:var(--text-2);line-height:1.8;margin-bottom:6px">Suno에서 받은 MP3/WAV를 고르면 GPT가 직접 듣고, 현재 프롬프트와 비교해 수정 제안까지 만듭니다.</div>
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input id="hh-listen-file" type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" style="font-size:11px;color:var(--text-2);max-width:240px">
<button onclick="listenOpenAiRun(this)" ${connected?'':'disabled'} style="padding:7px 16px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:12px;font-weight:700;cursor:pointer;opacity:${connected?1:.5}">🎧 GPT에게 듣고 평가받기</button></div>
<div id="hh-listen-status" ${connected?'hidden':''} style="font-size:11px;padding:6px 8px;border-radius:var(--r-sm);background:var(--surface-3);margin-top:6px;color:var(--text-3)">${connected?'':'상단 AI 추천에서 OpenAI API Key를 먼저 저장하세요'}</div>
<details style="margin-top:10px"><summary style="cursor:pointer;font-size:11px;color:var(--text-3)">직접 받은 피드백을 제안으로 바꾸기</summary><div style="margin-top:8px">
<textarea id="hh-external-feedback-ta" oninput="_extFeedbackDraft=this.value" placeholder="여기에 받은 평가를 붙여넣기 (예: 훅이 반복될 때 변화가 부족해서 두 번째 임팩트가 약하다...)" style="display:block;width:100%;box-sizing:border-box;min-height:90px;margin-top:10px;padding:8px 10px;border-radius:var(--r-sm);border:1px solid var(--border-hi);background:var(--surface-2);color:var(--text-1);font-family:'Space Grotesk',sans-serif;font-size:12px;resize:vertical">${escHtml(_extFeedbackDraft)}</textarea>
<div style="display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap">
  <button id="hh-ai-external-btn" onclick="aiParseExternalFeedback()" ${connected?'':'disabled'} style="padding:7px 16px;border-radius:20px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent-text);font-size:12px;font-weight:700;cursor:pointer;opacity:${connected?1:.5}">🤖 제안으로 바꾸기</button>
</div></div></details>`;
}

function listenRequestText(){
  const sect=document.getElementById('hh-sect-ta')?.value||'',style=document.getElementById('hh-style-ta')?.value||'';
  return `첨부한 곡은 Suno AI로 아래 프롬프트를 넣어 만든 곡이야. 곡을 실제로 끝까지 듣고, 프롬프트대로 나왔는지 평가해줘. 음악을 잘 모르는 사람도 이해할 수 있게 쉬운 말로 써줘.

아래 형식으로 답해줘:
【프롬프트대로 나온 것】 실제로 들린 것 (악기, 드럼, 베이스, 보컬 유무, 분위기)
【안 나온 것】 프롬프트에는 있는데 안 들리거나 다르게 들린 것을 구체적으로 — 몇 분 몇 초 근처인지, 어느 섹션인지 같이
【구조】 섹션이 지시대로 나뉘는지, 반복 훅의 차이와 마지막 클라이맥스가 자연스러운지
【장르·분위기】 의도와 맞는지, 아니면 실제로 어떤 장르와 분위기로 들리는지
【고칠 점】 결과에 가장 큰 영향을 줄 수정만 중요도순 최대 5개. 문제가 적으면 억지로 채우지 마.

[스타일 프롬프트]
${style}

${(_hhWritten?.lyrics||'').trim()?`[가사 프롬프트 (연출 설명 + 가사)]\n${(document.getElementById('hh-lyrics-ta')?.value||'').trim()}\n\n[참고: 연출 설명만]`:'[섹션 프롬프트]'}
${sect}`;
}
