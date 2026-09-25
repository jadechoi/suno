// 화면 분류만 담당한다. 음악 데이터의 family·저장 인덱스는 바꾸지 않는다.
const GENRE_PICKER_GROUPS=[['hiphop','힙합'],['pop','팝·R&B'],['latin','라틴·아프로'],['elec','일렉·클럽'],['rock','밴드·록']];
function genrePickerFamily(tag){
  if(tag==='hyperpop')return 'elec';
  if(RHYTHM_POP_PROFILES.some(p=>p.tag===tag))return 'latin';
  return GENRES.find(g=>g.tag===tag)?.family||'pop';
}
function renderGenrePicker(container,genres,selectedTag,onSelect){
  const groups=GENRE_PICKER_GROUPS.filter(([key])=>genres.some(g=>genrePickerFamily(g.tag)===key));
  if(container.dataset.selectedTag!==(selectedTag||'')||!groups.some(([key])=>key===container.dataset.family)){
    container.dataset.family=selectedTag?genrePickerFamily(selectedTag):(container.id==='pop-genre-chips'?'pop':groups[0]?.[0]);
  }
  container.dataset.selectedTag=selectedTag||'';
  container.replaceChildren();
  const families=document.createElement('div');families.className='genre-families';families.setAttribute('role','group');families.setAttribute('aria-label','장르 계열');
  groups.forEach(([key,label])=>{
    const b=document.createElement('button');b.type='button';b.className='genre-family';b.textContent=label;
    b.setAttribute('aria-pressed',String(key===container.dataset.family));
    b.onclick=()=>{container.dataset.family=key;renderGenrePicker(container,genres,selectedTag,onSelect);};
    families.appendChild(b);
  });
  container.appendChild(families);
  const grid=document.createElement('div');grid.className='chip-grid';
  genres.filter(g=>genrePickerFamily(g.tag)===container.dataset.family).forEach(g=>{
    const b=document.createElement('button');b.type='button';b.className='chip'+(g.tag===selectedTag?' selected':'');b.textContent=g.kr;
    b.setAttribute('aria-pressed',String(g.tag===selectedTag));b.onclick=()=>onSelect(g.tag);grid.appendChild(b);
  });
  container.appendChild(grid);
}
function vocalInstrumentChoices(s){
  const groups={
    hiphop:['808 베이스','하이햇','샘플','피아노','신스','베이스','드럼','어쿠스틱 기타','패드','보컬 레이어'],
    pop:['피아노','어쿠스틱 기타','일렉 기타','신스','스트링스','브라스','베이스','드럼','패드','하프','플루트','보컬 레이어'],
    latin:['나일론 기타','쿠아트로','어쿠스틱 기타','라틴 리듬','뎀보 리듬','댄스홀 리듬','아프로비츠 리듬','일렉 기타','베이스','신스','보컬 레이어'],
    elec:['디스토션 모노 베이스','탄력적인 FM 베이스','오르간 베이스','로그드럼 베이스','메탈릭 신스 스탭','신스','드럼 머신','베이스','패드','피아노','보컬 레이어'],
    rock:['일렉 기타','디스토션 기타','어쿠스틱 기타','베이스','생드럼','피아노','스트링스','패드','보컬 레이어'],
  };
  return [...new Set([...(groups[genrePickerFamily(s.genre)]||groups.pop),...s.instruments])];
}
