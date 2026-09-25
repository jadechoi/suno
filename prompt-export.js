// 외부 GPT에는 사용자가 복사·붙여넣기로 전달한다. API 키는 포함하지 않는다.
const FINAL_EDITOR_URL='https://chatgpt.com/g/g-699a4d64f8dc81918f3d99547931f645-suno-x-myuis-peurompeuteu-5dangye-siseutem';
function finalEditorControls(tab){
  return `<div class="output-box"><button type="button" class="copy-btn" onclick="openFinalEditor('${tab}',this)">✨ 전체 복사 · GPT에서 다듬기</button><p style="font-size:12px;color:var(--text-2)">스타일·섹션·선택 조건을 복사하고 GPT를 열어요. 열린 GPT에서 ⌘V / Ctrl+V 후 전송하세요.</p><div id="${tab}-editor-status" role="status" aria-live="polite" style="font-size:12px"></div><a href="${FINAL_EDITOR_URL}" target="_blank" rel="noopener noreferrer" style="font-size:12px">탭이 열리지 않으면 GPT 직접 열기 ↗</a></div>`;
}
function finalEditorText(tab){
  const value=id=>(document.getElementById(id)?.value||'').trim();
  const style=value(tab+'-style-ta'),section=value(tab+'-sect-ta');
  if(!style||!section)throw new Error('먼저 프롬프트를 생성해주세요.');
  const settings=tab==='hh'?aiSelectionCtx():JSON.stringify({genre:VTS[tab].genre,mood:VTS[tab].mood,bpm:VTS[tab].bpm,key:KEYS[VTS[tab].key],instruments:VTS[tab].instruments,vocal:VTS[tab].vocalStyle,concept:VTS[tab].concept,reference:VTS[tab].refSong,structure:VTS[tab].structSegs,direction:VTS[tab].narrSt},null,2);
  const lyrics=value(tab==='hh'?'hh-lyrics-only-ta':tab+'-lyrics-ta');
  const feedback=tab==='hh'?JSON.stringify({direction:st.narrAI,confirmedStyle:st.extraTags,excludedPhrases:st.removedPhrases}):'';
  return `이미 기획된 Suno 프롬프트를 최종 편집해주세요. 처음부터 기획을 다시 하지 마세요.
선택한 장르·무드·보컬 유무·지정 BPM/Key와 확정 피드백을 유지하세요. 중심 모티프·그루브, 악기의 주법·응답·쉼, 핵심 편곡 변화를 보존하고 중복과 모순을 정리하세요. 새로운 아이디어를 추가하거나 의미를 바꾼 부분은 별도로 알려주세요. 조건과 작성문이 충돌하면 임의로 바꾸지 말고 알려주세요.
스타일은 연결된 영어 자연어 한 문단으로 공백 포함 1000자 이하. 섹션과 가사를 합친 출력은 5000자 이하. 태그 나열로 바꾸거나 핵심을 지우며 줄이지 마세요. 이미 좋은 부분은 유지하고 가사 원문은 수정하지 마세요.
출력은 ① 최종 스타일 ② 최종 섹션(가사가 있으면 해당 구간에 한 번만 병합) ③ 변경 설명으로 구분해주세요.

[현재 선택 조건 — 생성 후 변경된 조건이 있으면 아래 작성문과 비교]
${settings}
${feedback?'\n[확정 피드백·제외 조건]\n'+feedback+'\n':''}
[스타일 프롬프트]
${style}

[섹션 프롬프트]
${section}
${lyrics?'\n[가사 원문 — 섹션에 이미 포함돼 있으면 중복하지 마세요]\n'+lyrics:''}`;
}
async function openFinalEditor(tab,button){
  const status=document.getElementById(tab+'-editor-status');
  const say=text=>{if(status)status.textContent=text;};
  let opened;
  try{
    if((tab==='hh'&&_writeState==='pending')||(tab==='pop'&&popStylePending))throw new Error('AI 작성이 끝난 뒤 눌러주세요.');
    const text=finalEditorText(tab);
    if(!navigator.clipboard?.writeText)throw new Error('이 브라우저에서 자동 복사를 지원하지 않습니다. 출력의 Copy 버튼을 이용해주세요.');
    button.disabled=true;
    // 사용자 클릭 안에서 탭을 열어 비동기 복사 후 팝업 차단을 피한다.
    const copied=navigator.clipboard.writeText(text);
    opened=window.open('about:blank','_blank');
    if(opened)opened.opener=null;
    await copied;
    if(opened)opened.location.replace(FINAL_EDITOR_URL);
    say('전체 복사 완료. GPT에서 ⌘V / Ctrl+V로 붙여넣고 전송하세요. 탭이 안 열리면 아래 링크를 눌러주세요.');
  }catch(e){if(opened)opened.close();say('복사·열기 실패: '+e.message);}
  finally{button.disabled=false;}
}
