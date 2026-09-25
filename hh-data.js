// ============================================================
// DATA
// ============================================================
const KEYS=['C major','D major','Eb major','F major','G major','Ab major','Bb major','A minor','B minor','C minor','D minor','E minor','F minor','F# minor','G minor'];

const GENRES=[
  {kr:'Trap',en:'Trap',tag:'trap',bpm:140,bpmR:[130,160],instr:['808 bass','hi-hat rolls','snare clap'],vocal:'trap vocals',pts:['hard-hitting 808','rolling hi-hats','snare on 2&4'],sound:'dark punchy',energy:'high',drum:'punchy trap drums'},
  {kr:'다크 트랩',en:'Dark Trap',tag:'dark trap',bpm:135,bpmR:[125,148],instr:['distorted 808','eerie pad','minor key melody'],vocal:'menacing rap',pts:['heavy distorted 808','atmospheric tension','dark minor key'],sound:'ominous heavy',energy:'intense',drum:'hard trap drums'},
  {kr:'멜로딕 트랩',en:'Melodic Trap',tag:'melodic trap',bpm:138,bpmR:[128,150],instr:['emotional piano','ambient synth','layered 808'],vocal:'melodic rap/sung hooks',pts:['emotional melody','atmospheric pads','melodic hooks'],sound:'emotional atmospheric',energy:'mid-high',drum:'melodic trap drums'},
  {kr:'NY 드릴',en:'NY Drill',tag:'NY drill',bpm:145,bpmR:[138,152],instr:['sliding 808','dark piano','horror strings'],vocal:'aggressive drill rap',pts:['sliding 808 glide','dark minor piano','aggressive drums'],sound:'dark aggressive',energy:'high',drum:'NY drill drums'},
  {kr:'UK 드릴',en:'UK Drill',tag:'UK drill',bpm:140,bpmR:[135,148],instr:['bass drill pattern','dark strings','ominous synth'],vocal:'UK accent rap',pts:['dark UK bass pattern','cold ominous atmosphere','crisp snare'],sound:'cold dark',energy:'high',drum:'UK drill drums'},
  {kr:'Phonk',en:'Phonk',tag:'phonk',bpm:135,bpmR:[125,145],instr:['memphis sample','808 slide','cowbell'],vocal:'phonk rap/Memphis',pts:['Memphis sample chops','heavy 808 slide','cowbell percussion'],sound:'dark vintage',energy:'mid',drum:'boom bap with phonk fx'},
  {kr:'붐뱁',en:'Boom Bap',tag:'boom bap',bpm:92,bpmR:[80,100],instr:['sample loop','punchy kick','vinyl crackle'],vocal:'lyrical rap',pts:['punchy kick on 1&3','crisp snare 2&4','vinyl texture'],sound:'classic warm',energy:'mid',drum:'classic boom bap drums'},
  {kr:'클라우드 랩',en:'Cloud Rap',tag:'cloud rap',bpm:120,bpmR:[110,130],instr:['dreamy pad','reverb guitar','spacious 808'],vocal:'dreamy rap/sung',pts:['dreamy reverb-drenched pads','spacious atmospheric','floaty feel'],sound:'dreamy spacious',energy:'low-mid',drum:'light airy drums'},
  {kr:'Lo-fi',en:'Lo-fi Hip Hop',tag:'lo-fi hip hop',bpm:85,bpmR:[75,95],instr:['vinyl crackle','jazz sample','warm piano'],vocal:'minimal/none',pts:['vinyl record crackle','warm analog tape','jazzy chord progressions'],sound:'warm cozy',energy:'low',drum:'lo-fi dusty drums'},
  {kr:'저지 클럽',en:'Jersey Club',tag:'jersey club',bpm:145,bpmR:[140,155],instr:['chopped vocal','kick pattern','club bass'],vocal:'chopped vocal samples',pts:['syncopated kick pattern','chopped vocal chops','club energy'],sound:'energetic club',energy:'very high',drum:'jersey club kicks'},
  {kr:'Rage/Plugg',en:'Rage/Plugg',tag:'rage plugg',bpm:156,bpmR:[145,170],instr:['distorted synth','pitched 808','glitchy FX'],vocal:'screaming/autotune rap',pts:['loud distorted synths','pitched up 808','hypnotic loop'],sound:'aggressive hypnotic',energy:'very high',drum:'fast trap drums'},
  {kr:'아프로트랩',en:'Afro Trap',tag:'afro trap',bpm:130,bpmR:[120,140],instr:['afro percussion','tropical synth','pan flute'],vocal:'afro drill/rap',pts:['afro percussion patterns','tropical melodic elements','bouncy groove'],sound:'tropical energetic',energy:'high',drum:'afro trap drums'},
  {kr:'컨셔스',en:'Conscious Hip Hop',tag:'conscious hip hop',bpm:96,bpmR:[85,105],instr:['soulful sample','live bass','warm keys'],vocal:'lyrical conscious rap',pts:['soulful sample-based','organic live instrumentation','message-driven'],sound:'soulful organic',energy:'mid',drum:'soulful boom bap'},
  {kr:'트랩 소울',en:'Trap Soul',tag:'trap soul',bpm:125,bpmR:[115,135],instr:['soft piano','falsetto hook','smooth 808'],vocal:'R&B/sung/falsetto',pts:['soft melodic piano','smooth 808 bass','emotional R&B feel'],sound:'smooth emotional',energy:'mid',drum:'soft trap soul drums'},
  {kr:'하이퍼팝',en:'Hyperpop',tag:'hyperpop',bpm:165,bpmR:[155,180],instr:['glitchy synth','pitched vocal','4-on-floor kick'],vocal:'hyperpitch autotune',pts:['extreme pitch shifted vocals','glitchy electronic elements','sugar rush energy'],sound:'chaotic bright',energy:'maximum',drum:'hyperpop drums'},
  {kr:'디짓코어',en:'Digicore',tag:'digicore',bpm:148,bpmR:[138,160],instr:['SoundCloud texture','bedroom synth','crunchy 808'],vocal:'lo-fi autotune rap',pts:['bedroom producer texture','SoundCloud aesthetic','raw lo-fi quality'],sound:'raw digital',energy:'high',drum:'digicore drums'},
  {kr:'플럭gnb',en:'Pluck & B',tag:'pluggnb',bpm:140,bpmR:[130,150],instr:['melodic pluck','slow 808','ghostly pad'],vocal:'melodic ad-libs/hum',pts:['slow hypnotic pluck melody','half-time slow feel','ghostly atmospheric'],sound:'hypnotic slow',energy:'low',drum:'minimal slow drums'},
  {kr:'Westwood',en:'Westwood/Odd Future',tag:'westwood hip hop',bpm:93,bpmR:[80,105],instr:['jazz chord','live drum','quirky sample'],vocal:'introspective/quirky rap',pts:['jazzy quirky chords','live organic drums','unconventional structure'],sound:'quirky organic',energy:'mid',drum:'live jazz-influenced drums'},
  {kr:'트랩 메탈',en:'Trap Metal',tag:'trap metal',bpm:150,bpmR:[135,165],instr:['distorted 808','downtuned guitar riff','industrial noise'],vocal:'screamed/growled rap',pts:['heavily distorted clipping 808','downtuned metal guitar riffs','aggressive screamed vocals'],sound:'aggressive industrial',energy:'very high',drum:'aggressive trap metal drums',sig:'downtuned distorted guitar riffs & clipping 808 distortion',vocalSig:'screamed growled vocals'},
  {kr:'섹시 드릴',en:'Sexy Drill',tag:'sexy drill',bpm:140,bpmR:[130,150],instr:['chopped R&B sample','sliding 808','jersey club kick'],vocal:'nonchalant smooth rap',pts:['chopped R&B sample loop','smooth sliding 808','bouncy jersey-influenced drums'],sound:'smooth seductive',energy:'mid-high',drum:'bouncy jersey-drill drums'},
];

// 음악을 잘 모르는 사람용 — 장르가 어떤 느낌인지 쉬운 말로 (GENRES 인덱스 순서)
const GENRE_FEEL=[
  '묵직한 저음(808)과 빠르게 쪼개지는 하이햇이 특징인 힙합의 기본형. 힘 있고 자신감 넘치는 느낌',
  '어둡고 음산한 분위기에 무거운 저음. 영화 속 악당 테마 같은 느낌',
  '트랩 비트 위에 감성적인 멜로디. 슬프고 아련하면서도 중독성 있는 느낌',
  '차갑고 공격적인 뉴욕식 드릴. 미끄러지듯 움직이는 저음이 위협적인 분위기',
  '차갑고 날카로운 영국식 드릴. 엇박 스네어로 긴장감이 도는 느낌',
  '카우벨 소리와 빈티지한 반복 루프. 야간 드리프트 영상 같은 어둡고 멋진 느낌',
  '90년대식 클래식 힙합. 묵직한 킥과 샘플 소리, 따뜻하고 향수 어린 느낌',
  '구름 위에 뜬 듯 몽환적이고 여백 많은 사운드. 잔잔하게 꿈꾸는 느낌',
  '지직거리는 바이닐 소리의 아늑한 힙합. 공부·휴식할 때 듣는 편안한 느낌',
  '통통 튀는 킥 리듬의 클럽 음악. 춤추고 싶어지는 신나는 느낌',
  '찌그러진 신스와 폭발적인 에너지. 록스타 같은 거칠고 중독적인 느낌',
  '아프리카 리듬(아프로비츠)과 트랩의 결합. 밝고 열대 분위기의 신나는 그루브',
  '메시지가 담긴 차분한 힙합. 따뜻한 샘플과 생악기, 진지하고 깊이 있는 느낌',
  'R&B처럼 부드럽고 감성적인 트랩. 밤에 듣는 로맨틱하고 촉촉한 느낌',
  '과장되고 반짝이는 초고속 전자음. 설탕 같은 밝음과 정신없는 에너지',
  '침실에서 만든 듯한 날것의 디지털 사운드. 외롭고 감성적인 인터넷 세대 느낌',
  '아주 느리고 최면 같은 몽환적 R&B풍. 흐느적거리며 떠다니는 느낌',
  '재즈 코드와 라이브 드럼의 독특하고 장난기 있는 힙합. 예측 불가한 개성의 느낌',
  '메탈처럼 찌그러진 기타·저음과 절규. 매우 거칠고 분노에 찬 느낌',
  'R&B 샘플 위에 통통 튀는 드릴 비트. 무심하고 세련된 섹시한 느낌',
];
// 만들고 싶은 무드 → 어울리는 장르 (GENRES 인덱스, 앞쪽일수록 잘 맞음)
const MOOD_GENRE_GUIDE={
  '어둡고 위압적':[1,3,4,18],'감각적·관능적':[19,13,16],'멜로딕·감성':[2,13,15],
  '에너제틱·하입':[10,9,0,14],'사이키델릭·몽환':[7,16,17],'칠·그루비':[8,6,17,19],
  '분노·공격적':[18,10,1,3],'내성적·사색':[12,8,7,17],'축제·환희':[11,9,14],
  '승리감·웅장':[0,6,2],'슬프고·멜랑콜리':[2,13,7,15],'자신감·플렉스':[0,5,19],
  '로맨틱·달콤한':[13,19,16],'긴장감·서스펜스':[1,4,3],'노스탤직·향수':[6,8,17],
  '미스터리·신비':[7,1,16],
};

const GENRE_PRESETS=[
  {name:'UK Garage',genre:22,bpm:132,key:2,color:'#06B6D4'},
  {name:'Jersey Club',genre:9,bpm:148,key:3,color:'#8B5CF6'},
  {name:'Phonk',genre:5,bpm:135,key:7,color:'#DC2626'},
  {name:'Afrobeats',genre:11,bpm:130,key:3,color:'#F59E0B'},
  {name:'Boom Bap',genre:6,bpm:90,key:10,color:'#92400E'},
  {name:'Dark Drill',genre:1,bpm:144,key:9,color:'#1D4ED8'},
  {name:'Lo-fi',genre:8,bpm:84,key:10,color:'#6EE7B7'},
  {name:'Cloud Rap',genre:7,bpm:120,key:7,color:'#93C5FD'},
  {name:'하이퍼팝',genre:14,bpm:165,key:13,color:'#84CC16'},
  {name:'디짓코어',genre:15,bpm:145,key:9,color:'#60A5FA'},
  {name:'플럭gnb',genre:16,bpm:72,key:10,color:'#818CF8'},
  {name:'Westwood',genre:17,bpm:93,key:3,color:'#34D399'},
  {name:'Trap Metal',genre:18,bpm:150,key:9,color:'#B91C1C'},
  {name:'Sexy Drill',genre:19,bpm:140,key:10,color:'#EC4899'},
];

const HH_ARTISTS=[
  {name:'Drake',color:'#FF4D6D',songs:[
    {title:'Janice STFU',genre:1,bpm:134,key:13},{title:"God's Plan",genre:2,bpm:77,key:4},
    {title:'Knife Talk',genre:0,bpm:140,key:10},{title:'Rich Baby Daddy',genre:0,bpm:138,key:14},
    {title:'Champagne Poetry',genre:12,bpm:88,key:8}
  ]},
  {name:'Playboi Carti',color:'#9D4EDD',songs:[
    {title:'Whole Lotta Red',genre:10,bpm:157,key:13},{title:'Magnolia',genre:10,bpm:130,key:7},
    {title:'Sky',genre:10,bpm:148,key:13},{title:'New Tank',genre:10,bpm:163,key:13},
    {title:'ILoveUIHateU',genre:10,bpm:155,key:11}
  ]},
  {name:'Lil Uzi Vert',color:'#C77DFF',songs:[
    {title:'Just Wanna Rock',genre:10,bpm:142,key:7},{title:'XO Tour Llif3',genre:2,bpm:124,key:13},
    {title:'Money Longer',genre:10,bpm:130,key:7},{title:'Futsal Shuffle',genre:0,bpm:145,key:9}
  ]},
  {name:'Central Cee',color:'#00C6FF',songs:[
    {title:'Doja',genre:4,bpm:141,key:9},{title:'Loading',genre:4,bpm:140,key:10},
    {title:'Obsessed',genre:4,bpm:134,key:9},{title:'Band4Band',genre:4,bpm:143,key:9}
  ]},
  {name:'Ice Spice',color:'#FF9EC8',songs:[
    {title:'Munch',genre:3,bpm:145,key:7},{title:'In Ha Mood',genre:3,bpm:143,key:10},
    {title:'Princess Diana',genre:3,bpm:140,key:7},{title:'Deli',genre:3,bpm:148,key:9}
  ]},
  {name:'Travis Scott',color:'#FF6B35',songs:[
    {title:'FE!N',genre:10,bpm:165,key:13},{title:'SICKO MODE',genre:1,bpm:155,key:9},
    {title:'HIGHEST IN THE ROOM',genre:7,bpm:100,key:10},{title:'goosebumps',genre:2,bpm:130,key:8},
    {title:'STARGAZING',genre:10,bpm:145,key:13}
  ]},
  {name:'Future×Metro',color:'#4DC886',songs:[
    {title:'We Don\'t Trust You',genre:1,bpm:142,key:7},{title:'Superhero',genre:2,bpm:128,key:14},
    {title:'WAIT FOR U',genre:13,bpm:117,key:11},{title:'712PM',genre:1,bpm:138,key:7}
  ]},
  {name:'Don Toliver',color:'#A78BFA',songs:[
    {title:'Body',genre:2,bpm:128,key:8},{title:'No Idea',genre:13,bpm:120,key:8},
    {title:'After Party',genre:13,bpm:122,key:9},{title:'Tore Up',genre:2,bpm:130,key:13}
  ]},
  {name:'J. Cole',color:'#E09B30',songs:[
    {title:'Two Six',genre:12,bpm:91,key:14},{title:'No Role Modelz',genre:6,bpm:96,key:8},
    {title:'MIDDLE CHILD',genre:1,bpm:148,key:7},{title:'Love Yourz',genre:12,bpm:76,key:3}
  ]},
  {name:'Kehlani',color:'#F472B6',songs:[
    {title:'Folded',genre:13,bpm:110,key:7},{title:'Nights Like This',genre:13,bpm:105,key:9},
    {title:'Honey',genre:13,bpm:92,key:7}
  ]},
  {name:'식케이',color:'#FB923C',songs:[
    {title:'Your Type',genre:13,bpm:98,key:8},{title:'Money Rain',genre:2,bpm:125,key:10},
    {title:'Wavelength',genre:13,bpm:92,key:11}
  ]},
  {name:'릴모쉬핏',color:'#EF4444',songs:[
    {title:'Rage Style',genre:10,bpm:152,key:13},{title:'Dark Drill',genre:1,bpm:143,key:9},
    {title:'Hard Trap',genre:0,bpm:140,key:13}
  ]},
  {name:'시스템 서울',color:'#38BDF8',songs:[
    {title:'Seoul Cloud',genre:7,bpm:118,key:10},{title:'Seoul Drill',genre:3,bpm:144,key:9},
    {title:'K-Trap Soul',genre:13,bpm:108,key:7}
  ]},
  {name:'Charli XCX',color:'#84CC16',songs:[
    {title:'360',genre:14,bpm:138,key:8},{title:'Von dutch',genre:14,bpm:141,key:9},
    {title:'Vroom Vroom',genre:14,bpm:158,key:13},{title:'Good Ones',genre:14,bpm:135,key:7}
  ]},
  {name:'100 gecs',color:'#FACC15',songs:[
    {title:'money machine',genre:14,bpm:175,key:13},{title:'hand crushed',genre:14,bpm:166,key:7},
    {title:'mememe',genre:14,bpm:165,key:9}
  ]},
  {name:'glaive',color:'#60A5FA',songs:[
    {title:'astrid',genre:15,bpm:145,key:11},{title:'2 rotten grapes',genre:15,bpm:148,key:7},
    {title:'1984',genre:15,bpm:142,key:9}
  ]},
  {name:'Summrs',color:'#818CF8',songs:[
    {title:'right now',genre:16,bpm:75,key:10},{title:'outside',genre:16,bpm:70,key:7},
    {title:'all in',genre:16,bpm:72,key:9},{title:'i need it',genre:16,bpm:78,key:13}
  ]},
  {name:'Homixide Gang',color:'#A78BFA',songs:[
    {title:'1000 Homixides',genre:16,bpm:80,key:13},{title:'Demons',genre:16,bpm:74,key:9},
    {title:'2am',genre:16,bpm:68,key:10}
  ]},
  {name:'Tyler The Creator',color:'#34D399',songs:[
    {title:'EARFQUAKE',genre:17,bpm:97,key:4},{title:'See You Again',genre:17,bpm:90,key:3},
    {title:'NEW MAGIC WAND',genre:17,bpm:120,key:7},{title:'GONE GONE',genre:17,bpm:82,key:7}
  ]},
  {name:'Earl Sweatshirt',color:'#6EE7B7',songs:[
    {title:'Grief',genre:17,bpm:70,key:7},{title:'Chum',genre:12,bpm:88,key:10},
    {title:'Riot!',genre:17,bpm:85,key:7}
  ]},
];

const HH_808=['None','Minimal','Balanced','Heavy','Dominant'];
// 트랩/붐뱁 계열 6개뿐이라 Jersey Club·Afrotrap·Hyperpop처럼 리듬 뼈대 자체가 다른 장르는 표현할 어휘가 없었음
// (GENRE_AUTO 주석엔 "four-on-floor kick", "afro rolling percussion", "ghost kicks"라고 의도는 적혀있었는데
// 실제로 고를 수 있는 옵션이 없어서 매번 트랩 옵션으로 대체돼 있었음, 실사용자 피드백으로 확인) — 3개 추가
// Phonk(카우벨)·Westwood(라이브 재즈 드럼)도 같은 종류의 누락이었음 — GENRE_AUTO 주석엔 있었는데 어휘가 없어서
// 매번 Boom Bap kick으로 대체됨. 18개 장르 전체 재대조 결과 이 2개가 마지막 누락(나머지 13개는 실제로 트랩/붐뱁
// 계열이라 기존 어휘가 맞음 — 무차별로 더 추가하지 않음)
const HH_DRUMS_HIPHOP=['Sub-bass punch','Crisp hi-hats','Rolling triplets','Trap rolls','Boom Bap kick','Glitchy breaks','Four-on-the-floor kick','Jersey bounce kick','Afro log drum','Shaker groove','Conga accents','Rimshot snare','Memphis cowbell chop','Live jazz drums','Half-time snare','Layered claps','Ghost-note snares'];
const HH_MELODY_HIPHOP=['Dark synth','Emotional piano','Guitar loop','Sample chop','Ambient pad','Brass stab','Strings','Psychedelic FX','Rhodes keys','Saxophone','Supersaw synth','Flute','Harp','Music box','Organ','Vibraphone','Kalimba','Arp pluck synth','Cello','Sitar','Vocoder synth','Synth bells','Rage synth','Whistle synth','Trumpet','Bass guitar','Acoustic guitar','Electric guitar'];

// 계열별 악기 메뉴 — 힙합 메뉴 하나를 모든 장르가 공유해서 팝·일렉에는 Trap rolls·Sample chop 같은 항목이 보이고, 정작 필요한 악기(어쿠스틱 기타·303·클랩·베이스 등)는 없었음
// HH_DRUMS/HH_MELODY는 "지금 장르 계열의 메뉴"를 담는 배열 — setInstrumentMenus가 제자리에서 바꿔서, 이걸 읽는 기존 코드(칩·추천·검증)는 그대로 계열별 메뉴를 봄
const MENU_BY_FAMILY={
  hiphop:{drums:HH_DRUMS_HIPHOP,melody:HH_MELODY_HIPHOP},
  pop:{
    drums:['Punchy pop kick','Half-time snare','Finger snaps','Clap & snap layers','Tambourine groove','Shuffle groove','Gated snare','Live pop drum kit','Brushed drums','Stomp & clap','Four-on-the-floor kick','Crisp hi-hats','Rolling triplets','Rimshot snare','Shaker groove','Live jazz drums'],
    melody:['Emotional piano','Acoustic guitar','Electric guitar','Rhodes keys','Synth lead','Synth bells','Arp pluck synth','Supersaw synth','Ambient pad','Strings','Violin','Cello','Brass stab','Saxophone','Flute','Harp','Music box','Vibraphone','Kalimba','Marimba','Ukulele','Banjo','Pedal steel','Koto','Organ','Vocoder synth','Psychedelic FX','Dark synth','Bass guitar','Synth bass'],
  },
  elec:{
    drums:['909 kick','Four-on-the-floor kick','Offbeat open hats','Rolling 16th hats','Clap on 2 & 4','Breakbeat (amen break)','Two-step garage shuffle','Half-time snare','Snare roll build','Tribal toms','Afro log drum','Shaker groove','Conga accents','Glitchy breaks','Rimshot snare','Crisp hi-hats','Sub-bass punch'],
    melody:['Synth lead','Supersaw synth','Arp pluck synth','Acid synth (303)','Chord stabs','House piano','Synth bells','Ambient pad','Dark synth','Psychedelic FX','Vocoder synth','Rhodes keys','Emotional piano','Strings','Brass stab','Saxophone','Flute','Harp','Music box','Vibraphone','Kalimba','Marimba','Organ','Sample chop','Reese bass','Wobble bass','Synth bass'],
  },
};
const HH_DRUMS=[],HH_MELODY=[];
function setInstrumentMenus(family){
  const fams=MENU_BY_FAMILY[family]?[family]:Object.keys(MENU_BY_FAMILY);   // 장르 미선택이면 전 계열 합집합
  [['drums',HH_DRUMS],['melody',HH_MELODY]].forEach(([k,a])=>{
    a.length=0;
    fams.forEach(f=>MENU_BY_FAMILY[f][k].forEach(x=>{if(!a.includes(x))a.push(x);}));
  });
}
setInstrumentMenus(null);
const HH_MOODS=[
  {kr:'어둡고 위압적',tag:'dark menacing'},
  {kr:'감각적·관능적',tag:'sensual smooth'},
  {kr:'멜로딕·감성',tag:'melodic emotional'},
  {kr:'에너제틱·하입',tag:'energetic hype'},
  {kr:'사이키델릭·몽환',tag:'psychedelic dreamy'},
  {kr:'칠·그루비',tag:'chill groovy'},
  {kr:'분노·공격적',tag:'aggressive angry'},
  {kr:'내성적·사색',tag:'introspective thoughtful'},
  {kr:'축제·환희',tag:'euphoric festival energy'},
  {kr:'승리감·웅장',tag:'triumphant anthemic'},
  {kr:'슬프고·멜랑콜리',tag:'sad melancholic'},
  {kr:'자신감·플렉스',tag:'confident flexing braggadocio'},
  {kr:'로맨틱·달콤한',tag:'romantic sweet'},
  {kr:'긴장감·서스펜스',tag:'tense suspenseful'},
  {kr:'노스탤직·향수',tag:'nostalgic wistful'},
  {kr:'미스터리·신비',tag:'mysterious enigmatic'},
];
const HH_VOCAL=['No Vocal','Light ad-libs','Heavy hooks','Full rap feature'];
// en 필드는 실제 Suno 프롬프트에 그대로 들어감 — 실존 아티스트/프로듀서 이름을 직접 넣으면
// Suno의 임퍼스네이션 정책(2025년 말 Warner 합의 이후 강화)에 걸릴 수 있어 이름 대신 사운드 특징만 서술한다.
// kr 필드는 화면에만 표시되는 라벨이라 이름을 남겨둬도 무방함.
const HH_REF=[
  {kr:'Metro Boomin',  en:'cinematic orchestral trap production, dark brass stabs, ominous strings, big drum halls',        artists:'Travis Scott · 21 Savage',    vibes:'다크 · 오케스트라 · 영화적'},
  {kr:"Pi'erre Bourne",en:'melodic plugg production, bouncy chiptune-esque synth leads, minimal spacey drums',  artists:'Playboi Carti · SoFaygo',     vibes:'몽환 · 플러그 · 미니멀'},
  {kr:'Pharrell Williams',en:'funky unique snare choice, syncopated grooves, playful percussive bounce',  artists:'Kendrick · Jay-Z · Snoop',    vibes:'펑키 · 유니크 스네어 · 그루비'},
  {kr:'J Dilla',       en:'soulful off-beat boom bap, dusty sample chops, swung MPC drum groove',        artists:'Common · De La Soul',         vibes:'소울 · 오프비트 · 빈티지'},
  {kr:'The Alchemist', en:'sample-based grimy beats, dusty vinyl texture, understated boom bap drums',   artists:'Freddie Gibbs · Boldy James', vibes:'그라이미 · 샘플 · 언더그라운드'},
  {kr:'Wheezy',        en:'melodic trap bangers, spacey atmospheric synth leads, rolling layered 808s',              artists:'Future · Gunna · Young Thug', vibes:'멜로딕 · 스페이시 · 트랩'},
  {kr:'Hit-Boy',       en:'polished grand scale production, cinematic orchestral layers, powerful drums',  artists:'Kendrick · Jay-Z · Big Sean', vibes:'폴리쉬드 · 그랜드 · 파워풀'},
  {kr:'Southside',     en:'hard knocking trap beats, aggressive sliding 808s, dark ATL trap drums',       artists:'Future · Gunna · Young Thug', vibes:'하드 · ATL · 킥하드'},
  {kr:'Tay Keith',     en:'hard 808 stomping beats, aggressive triplet hi-hat rolls, dark energetic trap',        artists:'Drake · BlocBoy JB',          vibes:'하드 · 808 스토핑 · 에너지'},
  {kr:'Harry Fraud',   en:'atmospheric sample-based beats, smoky West Coast vibe, cinematic loop textures',     artists:'Curren$y · Wiz Khalifa',      vibes:'시네마틱 · 웨스트코스트 · 스모키'},
  {kr:'Zaytoven',      en:'ivory keys piano trap, bright melodic piano loops, classic ATL trap drums',           artists:'Gucci Mane · Future',         vibes:'피아노 · ATL · 트랩클래식'},
  {kr:'Timbaland',     en:'rhythmic experimental R&B trap, syncopated futuristic percussion',                   artists:'Missy Elliott · Justin T.',   vibes:'리드믹 · 익스페리멘탈 · 팝R&B'},
  {kr:'Just Blaze',    en:'soulful orchestral samples, golden era boom bap horns, triumphant energy',    artists:'Jay-Z · Kanye West',          vibes:'소울 · 오케스트라 · 골든에라'},
  {kr:'Boi-1da',       en:'hard cinematic beats, dramatic orchestral hits, lyrical trap drum patterns',             artists:'Kendrick · Drake · Eminem',   vibes:'하드 · 시네마틱 · 라이리컬'},
  {kr:'Clams Casino',  en:'hazy ambient cloud rap production, chopped pitched sample fragments, reverb-drenched atmosphere', artists:'A$AP Rocky · Lil B',      vibes:'몽환 · 앰비언트 · 클라우드'},
  {kr:'Madlib',        en:'jazzy dusty sample loops, freeform experimental structure, raw boom bap texture',       artists:'MF DOOM · Freddie Gibbs',     vibes:'재즈 · 더스티 · 실험적'},
  {kr:'Kaytranada',    en:'funky syncopated groove, chopped soul and disco samples, house-inflected bounce',       artists:"Anderson .Paak · SZA",        vibes:'펑키 · 디스코 · 그루비'},
  {kr:'DJ Mustard',    en:'minimal ratchet West Coast bounce, sparse keyboard stabs, heavy syncopated claps',      artists:'YG · Tyga',                    vibes:'미니멀 · 웨스트코스트 · 클럽'},
  {kr:'Whitearmor',    en:'digital distorted rage production, glitchy ambient textures, pitched detuned leads',    artists:'Bladee · Yung Lean',           vibes:'디지털 · 디스토션 · 앰비언트'},
  {kr:'Mike Dean',     en:'cinematic wall-of-synth production, layered psychedelic pads, epic orchestral scale',   artists:'Travis Scott · Kanye West',    vibes:'사이키델릭 · 웅장 · 신스'},
  {kr:'Kenny Beats',   en:'punchy modern boom bap-trap hybrid, playful sound design, energetic drum programming',  artists:'Freddie Gibbs · Vince Staples', vibes:'펀치감 · 플레이풀 · 모던'},
  {kr:'Ronny J',       en:'chaotic distorted 808 production, raw SoundCloud-era energy, aggressive pitched drums', artists:'XXXTentacion · Denzel Curry',  vibes:'카오틱 · 디스토션 · 로우'},
];
// 장르별 프로듀서 레퍼런스 자동 추천 (HH_REF.kr 참조) — 808/드럼/전환효과처럼 장르 고르면 바로 채워지고, 수동으로 바꿀 수도 있음
const GENRE_REF={
  0:['Southside','Wheezy'], 1:['Metro Boomin','Southside'], 2:['Wheezy',"Pi'erre Bourne"],
  3:['Tay Keith','Southside'], 4:['Tay Keith','Metro Boomin'], 5:['Ronny J','The Alchemist'],
  6:['J Dilla','Madlib'], 7:['Clams Casino','Harry Fraud'], 8:['J Dilla','Harry Fraud'],
  9:['DJ Mustard','Timbaland'], 10:["Pi'erre Bourne",'Whitearmor'], 11:['Pharrell Williams','Kaytranada'],
  12:['J Dilla','Just Blaze'], 13:['Zaytoven','Timbaland'], 14:['Ronny J','Mike Dean'],
  15:['Whitearmor','Ronny J'], 16:["Pi'erre Bourne",'Wheezy'], 17:['J Dilla','Harry Fraud'],
  18:['Ronny J','Whitearmor'], 19:['Kaytranada','DJ Mustard'],
};
const HH_TEXTURE=['Lo-fi grain','Vintage tape','Pristine digital','Heavy reverb','Dry intimate','Sidechain pump','Stereo wide','Bass-heavy','Punchy mix','Polished production','Raw sound'];
const HH_ERA=['90s','2000s','2010s','2020s','Timeless'];
const HH_REGION=['Atlanta','New York','LA','UK','Seoul','Miami','Chicago'];
const HH_DENSITY=['Minimalist','Sparse','Balanced','Dense','Maximalist'];
// "Polished production"(HH_TEXTURE)은 믹스 퀄리티 얘기고, 이건 같은 장르 안에서 상업적/언더그라운드 중
// 어느 쪽 색깔인지(예: commercial hyperpop vs underground hyperpop) 짚어주는 축 — 서로 다른 개념이라 분리
const HH_COMMERCIAL=['Commercial/Mainstream','Underground/Experimental'];
const COMMERCIAL_TAG={'Commercial/Mainstream':'commercial','Underground/Experimental':'underground experimental'};
const HH_LENGTH=['1:30','2:00','2:30','3:00','3:30'];

// 무드가 섹션 본문에 거의 영향을 못 줬음(측정: 16개 무드 사이 섹션 문구 겹침 63~70%, 슬픈 무드에서도 "slam in immediately / hitting hard on the downbeat / beat strips back")
// — 무드는 곡의 "다이내믹 성격"(어떻게 들어오고, 훅이 어떻게 치고, 벌스가 어떻게 꺼지고, 브릿지가 어떻게 긴장하고, 어떻게 끝나는지)을 결정하므로 무드별로 5개 슬롯을 둠
// entry=인트로 진입 동사, hook=훅 어택, verse=벌스 거동, bridge=브릿지 긴장 방식, outro=끝맺음
const MOOD_DYNAMICS={
  '어둡고 위압적':{entry:'lurch in heavily',hook:'crushing downbeat impact, low end dominating',peak:'everything crushing at once, low end shaking',verse:'stripped to a menacing low end, long dark silences between hits',bridge:'low-pass filter swallowing the beat, ominous drone rising',outro:'low end lingering as everything else vanishes'},
  '감각적·관능적':{entry:'ease in smoothly',hook:'silky full groove, bass rolling underneath',peak:'groove at its fullest, silky and enveloping',verse:'intimate close pocket, space between the notes',bridge:'filter slowly opening and closing',outro:'groove fading away slowly'},
  '멜로딕·감성':{entry:'roll in gently',hook:'melody soaring over the full beat, emotional lift',peak:'melody at its most emotional peak, everything swelling behind it',verse:'melody thinned to a single line, beat cushioned underneath',bridge:'melody climbing over a held chord, drums pulling out',outro:'melody fading last, one lingering note'},
  '에너제틱·하입':{entry:'slam in immediately',hook:'hard downbeat impact, relentless forward drive',peak:'full-speed peak, every element hitting together',verse:'energy held back and coiled, tight stripped groove',bridge:'riser and snare roll accelerating, filter sweeping up',outro:'last hit ringing then a hard stop'},
  '사이키델릭·몽환':{entry:'swim in',hook:'full but hazy, layers smearing together',peak:'layers widening into a hazy peak',verse:'drums dissolving into reverb, pads floating',bridge:'phaser sweeping, pitch bending downward',outro:'dissolving into a reverb wash'},
  '칠·그루비':{entry:'settle in casually',hook:'relaxed full groove, no hard attack',peak:'groove fully settled in, the richest layers of the track',verse:'loose pocket, drums leaving space',bridge:'gentle filter dip, groove holding steady',outro:'groove fading out unhurried'},
  '분노·공격적':{entry:'crash in aggressively',hook:'violent downbeat hits, distorted and pounding',peak:'maximum aggression, distortion at its peak',verse:'raw and tense, clipped hits, no comfort',bridge:'distortion rising, drums stuttering into a wall',outro:'abrupt cut, distortion ringing out'},
  '내성적·사색':{entry:'creep in quietly',hook:'restrained lift, still spacious',peak:'the loudest the track gets, still restrained',verse:'nearly bare, single sounds against silence',bridge:'a held note with room to breathe',outro:'last note alone with room tone'},
  '축제·환희':{entry:'burst in brightly',hook:'euphoric burst, everything lifting together',peak:'bright celebratory peak, everything lifting together',verse:'bouncy groove kept light and playful',bridge:'clap-along build-up, riser climbing',outro:'celebratory last hit, bright decay'},
  '승리감·웅장':{entry:'march in proudly',hook:'towering full-scale drop, every layer rising',peak:'full anthemic scale, everything at triumphant height',verse:'steady marching pulse, gathering strength',bridge:'swelling crescendo, rolling drums',outro:'majestic final chord ringing'},
  '슬프고·멜랑콜리':{entry:'sink in slowly',hook:'slow heavy full drop, mournful sustained melody over it',peak:'the deepest emotional weight, melody breaking open',verse:'thin and fragile, beat dragging',bridge:'melody sinking, filter closing slowly',outro:'sinking away, last note trailing off'},
  '자신감·플렉스':{entry:'strut in confidently',hook:'confident swagger drop, bass leading',peak:'peak swagger, every element locked in',verse:'cool restrained groove, letting the space breathe',bridge:'tension held with a knowing pause',outro:'nonchalant final hit'},
  '로맨틱·달콤한':{entry:'drift in warmly',hook:'warm full groove, melody swaying',peak:'the warmest fullest moment, melody at its fullest',verse:'soft intimate bed, beat cushioned',bridge:'filter opening slowly',outro:'soft fade, warmth lingering'},
  '긴장감·서스펜스':{entry:'tick in ominously',hook:'tense driving drop, no release',peak:'tension at its breaking point, no release',verse:'sparse and unsettling, gaps of silence',bridge:'tension tightening, pitch rising, sudden silence',outro:'unresolved, cutting off mid-tension'},
  '노스탤직·향수':{entry:'crackle in warmly',hook:'warm full loop, nostalgic sample forward',peak:'the warmest, richest loop of the track',verse:'crackly thin pocket, beat receding',bridge:'tape wobble, filter dipping slowly',outro:'needle-lift fade into static'},
  '미스터리·신비':{entry:'emerge eerily',hook:'cryptic full drop, hidden layers revealing',peak:'hidden layers fully revealed',verse:'sparse with strange gaps, faint melody fragments',bridge:'reversed sounds and a swelling drone, pitch drifting',outro:'fading into dark reverb'},
};
// 기본 생성물의 섹션 텍스트가 장르 무관 범용 문구(Beat strips back, low-pass filter…)뿐이라 "Afro Trap인지 Trap인지" 섹션만 봐선 알 수 없었음 —
// 장르별 섹션 편곡 방향을 기본으로 넣음. {e}=808/베이스만 토큰 — 드럼·악기 이름은 섹션이 따로 나열하니 여기서 또 쓰면 같은 이름이 두세 번 반복됨. 훅은 첫·마지막, 벌스·브릿지는 첫 등장에만 쓰고
// 나머지 반복 구간은 드럼·악기 역할 변주로 달라지게 해서 같은 문구가 복붙되지 않게 함 (GENRES 인덱스 순서)
const GENRE_SECTION_CUE=[
  {hook:'{e} on the downbeat, hi-hat rolls speeding into fills',verse:'{e} pulled back to sub weight, sparse hi-hat pattern, open pocket',bridge:'hi-hats rolling faster, {e} dropping out, tension into the next drop'},
  {hook:'dense {e} wall, eerie layers hanging over it, dark drop',verse:'single drum hits in wide empty space, ghostly bed',bridge:'lead swell rising, cavernous reverb, sudden silence before the drop'},
  {hook:'melody carrying the hook, {e} gliding underneath',verse:'motif softly hinted, intimate melodic feel, drums lighter',bridge:'melody climbing, drums thinning, emotional peak building'},
  {hook:'{e} sliding melodically, monotone drum pattern locked in',verse:'{e} slide continuing, drums sparse, hypnotic repetition',bridge:'{e} slide chromatic tension, drums drilling tighter'},
  {hook:'offbeat snare dominant, cold sliding bass',verse:'offbeat snare reduced, spacious bed, lighter drum variation',bridge:'snare roll building, cold filtered lead, tension before the hook'},
  {hook:'short loop cycling, cowbell pattern locked, {e} grunting',verse:'same loop stripped back, drums lighter',bridge:'loop filtered down, half-time drums, tension before the full reset'},
  {hook:'sample groove riding, punchy kick on the 1 and 3',verse:'deep sample pocket, classic boom bap groove',bridge:'sample chop variation, rhythmic shift'},
  {hook:'wide open space, sparse drums, dreamy melody floating',verse:'drums nearly absent, ambient texture only',bridge:'quiet swell, soft texture shift'},
  {hook:'steady lo-fi loop, gentle groove',verse:'same feel, very subtle drum variation',bridge:'soft continuation, slight texture shift'},
  {hook:'syncopated bounce, chopped sample stabs cutting through',verse:'drum pattern thinned, chops pulled back, light bed',bridge:'drum pattern stuttering, chopped sample echo fading, tension before the drop'},
  {hook:'short loop relentless, {e} distorted and pitched hard',verse:'same loop, drums stripped back',bridge:'filter sweep down, brief drum break, loop resets full'},
  {hook:'syncopated percussion locked in, tropical groove driving',verse:'percussion lighter, tropical layers softly stacked, call-and-response space',bridge:'percussion stripping then rebuilding, tropical tension rising'},
  {hook:'simple sparse beat, open space, room to breathe',verse:'minimal drums staying out of the way, clean open pocket',bridge:'brief swell, drums resolving cleanly'},
  {hook:'{e} pitch-matched to the chords, harmonic melody up front',verse:'{e} carrying the chord melody, drums lighter',bridge:'{e} pitch-bending chromatic tension'},
  {hook:'{e} distorted and punchy, industrial-style drums, layers stacking',peak:'extreme {e} explosion, industrial-peak drums, every element maxed',verse:'near-silence contrast, drums stripped back',bridge:'sudden surge, aggressive build'},
  {hook:'raw bedroom texture, lo-fi DIY drums',verse:'rawer intimate feel, unpolished grain',bridge:'raw texture shifting, imperfect drum swell'},
  {hook:'long slow {e} sustain melody, cloud drift, minimal layers',verse:'ultra slow held notes, hazy dreamy bed, maximum space',bridge:'sustained fading, airy drift'},
  {hook:'unexpected chord stab, gritty jazz-flip drums',verse:'unique chop, dusty grimy pocket',bridge:'chop pivot, unexpected harmonic shift'},
  {hook:'{e} distorted and clipping, riff hammering, drums relentless',verse:'riff stripped to a single line, drums hard and sparse',bridge:'sustained growl swelling, drums stuttering, tension before the crash'},
  {hook:'bouncy kick pattern, chopped R&B sample loop forward, {e} sliding softly',verse:'sample loop stays, drums thinned to kick and hats, relaxed nonchalant pocket',bridge:'sample loop filtered down, drums stuttering, tension before the hook'},
];
// 프로듀서 레퍼런스의 핵심 특징을 섹션에도 — 예전엔 스타일 태그에만 들어가서 "Pharrell의 스네어" 같은 특징이 실제 섹션 사운드에 안 반영됐음
const REF_SIG={
  'Metro Boomin':'ominous brass stabs & big drum halls',"Pi'erre Bourne":'bouncy chiptune-like synth lead','Pharrell Williams':'unique syncopated snare pattern',
  'J Dilla':'off-grid swung MPC drums','The Alchemist':'dusty vinyl sample chops','Wheezy':'rolling layered 808s','Hit-Boy':'grand orchestral layers',
  'Southside':'hard sliding 808s','Tay Keith':'triplet hi-hat rolls & stomping 808','Harry Fraud':'smoky loop textures','Zaytoven':'bright ivory piano loop',
  'Timbaland':'syncopated futuristic percussion','Just Blaze':'soulful horn samples','Boi-1da':'dramatic orchestral hits','Clams Casino':'pitched hazy sample fragments',
  'Madlib':'dusty jazzy sample loops','Kaytranada':'chopped soul samples & house-inflected bounce','DJ Mustard':'sparse ratchet claps',
  'Whitearmor':'detuned glitchy leads','Mike Dean':'wall-of-synth pads','Kenny Beats':'playful punchy drum programming','Ronny J':'distorted pitched drums',
};
// Anti-AI 태그를 장르 공통 문구("organic warm & analog") 대신 그 장르 리듬 요소의 구체적인 불완전함으로 — 리뷰에서 "범용적이라 이 곡만의 디테일이 없다"는 지적이 반복됨 (GENRES 인덱스 순서)
// Anti-AI를 장르 문구 하나로 끝내면 "이 곡만의 디테일이 없다"는 리뷰가 세 장르 모두에서 반복됨 — 실제로 고른 리드 악기의 불완전함도 같이 (스타일 태그 하나에 ' & '로 융합)
const INSTR_HUMAN={
  'Dark synth':'slow filter drift','Emotional piano':'uneven key velocity','Guitar loop':'small pick-timing drift','Sample chop':'chop transients slightly ahead of the grid',
  'Ambient pad':'slow detune drift','Brass stab':'ragged stab timing','Strings':'slight bow-attack variation','Psychedelic FX':'random modulation drift',
  'Rhodes keys':'uneven key velocity','Saxophone':'breath and pitch drift','Supersaw synth':'detune drift between layers','Flute':'breath noise and pitch drift',
  'Harp':'uneven pluck velocity','Music box':'slightly uneven note spacing','Organ':'slow leslie wobble','Vibraphone':'uneven mallet velocity',
  'Kalimba':'uneven pluck velocity','Arp pluck synth':'arp notes slightly off the grid','Cello':'slight bow-attack variation','Sitar':'sympathetic string buzz','Vocoder synth':'formant drift',
};
// 멜로디 2개가 둘 다 저역 지속음이면(예: Dark synth + Ambient pad) 808과 함께 로우~로우미드에 몰려 마스킹 — 리뷰에서 반복 지적. 대역이 겹치지 않게 짝을 고르기 위한 분류
const MELODY_REGISTER={
  'Dark synth':'low','Ambient pad':'low','Strings':'low','Cello':'low','Organ':'low','Sitar':'low',
  'Emotional piano':'mid','Guitar loop':'mid','Sample chop':'mid','Rhodes keys':'mid','Saxophone':'mid','Brass stab':'mid','Vocoder synth':'mid','Psychedelic FX':'mid','Supersaw synth':'mid',
  'Flute':'high','Harp':'high','Music box':'high','Vibraphone':'high','Kalimba':'high','Arp pluck synth':'high',
};
// 둘 다 넓게 깔리는 지속음 계열이면(Supersaw + Ambient pad 등) 대역이 달라도 서로·808과 마스킹 — 짝 중 하나는 짧은 트랜지언트 악기여야 함
const MELODY_SUSTAINED=new Set(['Dark synth','Ambient pad','Strings','Cello','Organ','Supersaw synth','Psychedelic FX','Vocoder synth','Sitar']);
// 새로 추가한 악기의 역할·대역·연주법 — 기존 표(MELODY_ROLE·MELODY_ARTICULATION·INSTR_HUMAN·MELODY_REGISTER·MELODY_SUSTAINED)가 이름으로 조회하므로 빠지면 안 됨
// art: intro/hook/verse/bridge/outro 연주법, human: 이 악기의 불완전함 키워드, sus: 넓게 깔리는 지속음 여부
const NEW_MELODY={
  'Synth bells':{role:'lead',reg:'high',human:'uneven bell velocity',art:{intro:'soft single bell tone',hook:'rhythmic bell melody',verse:'sparse chiming notes',bridge:'rising bell arpeggio',outro:'fading bell tail'}},
  'Rage synth':{role:'lead',reg:'mid',human:'detune drift and pitch wobble',art:{intro:'filtered detuned stab',hook:'aggressive detuned lead riff',verse:'muted stabs',bridge:'rising pitched sweep',outro:'decaying detuned tail'}},
  'Whistle synth':{role:'lead',reg:'high',human:'pitch glide drift',art:{intro:'soft high glide',hook:'catchy gliding lead line',verse:'sparse high notes',bridge:'rising pitch glide',outro:'slow fading glide'}},
  'Trumpet':{role:'lead',reg:'mid',human:'breath and pitch drift',art:{intro:'soft muted held note',hook:'bold melodic lead line',verse:'sparse muted phrase',bridge:'rising melodic run',outro:'slow fading muted note'}},
  'Bass guitar':{role:'background',reg:'low',human:'slightly late finger-plucked notes',art:{intro:'soft sustained root notes',hook:'groovy syncopated bassline',verse:'sparse root-note pulse',bridge:'rising walking line',outro:'slow fading root note'}},
  'Acoustic guitar':{role:'lead',reg:'mid',human:'small pick-timing drift',art:{intro:'gentle fingerpicked notes',hook:'bright rhythmic strumming',verse:'soft fingerpicked pattern',bridge:'muted strum build',outro:'fingerpicked fade-out'}},
  'Electric guitar':{role:'lead',reg:'mid',human:'small pick-timing drift',art:{intro:'clean shimmering chords',hook:'tight rhythmic chord strokes',verse:'sparse clean single notes',bridge:'rising overdriven swell',outro:'ringing clean chord fade'}},
  'Synth lead':{role:'lead',reg:'mid',human:'slight filter drift',art:{intro:'soft filtered lead tone',hook:'bright catchy lead melody',verse:'sparse lead phrase',bridge:'rising filter sweep',outro:'fading lead tone'}},
  'Violin':{role:'lead',reg:'mid',human:'slight bow-attack variation',art:{intro:'soft legato held note',hook:'soaring melodic line',verse:'sparse legato phrase',bridge:'rising tremolo swell',outro:'slow fading bow tone'}},
  'Marimba':{role:'lead',reg:'high',human:'uneven mallet velocity',art:{intro:'soft mallet pattern',hook:'bouncy rhythmic mallet loop',verse:'sparse mallet notes',bridge:'rising mallet roll',outro:'fading mallet ring'}},
  'Ukulele':{role:'lead',reg:'mid',human:'loose strum timing',art:{intro:'gentle plucked chords',hook:'bright rhythmic strumming',verse:'soft plucked pattern',bridge:'muted strum build',outro:'plucked fade-out'}},
  'Banjo':{role:'lead',reg:'mid',human:'loose picking timing',art:{intro:'gentle rolling pluck',hook:'bright rolling picking pattern',verse:'sparse plucked notes',bridge:'rising picked run',outro:'slow fading pluck'}},
  'Pedal steel':{role:'background',reg:'mid',sus:true,human:'slow pitch-bend drift',art:{intro:'soft gliding swell',hook:'wide sustained slides',verse:'quiet sustained bend',bridge:'rising bending swell',outro:'fading sliding tone'}},
  'Koto':{role:'lead',reg:'high',human:'uneven pluck velocity',art:{intro:'soft plucked glissando',hook:'rhythmic plucked melody',verse:'sparse plucked notes',bridge:'rising plucked run',outro:'slow fading pluck'}},
  'Synth bass':{role:'background',reg:'low',human:'slight filter drift',art:{intro:'soft sustained low tone',hook:'punchy pulsing bassline',verse:'sparse low pulse',bridge:'rising filtered bass swell',outro:'fading low tone'}},
  'Acid synth (303)':{role:'lead',reg:'mid',human:'slight cutoff drift',art:{intro:'soft filtered acid line',hook:'squelchy resonant acid line',verse:'sparse muted acid notes',bridge:'rising cutoff sweep',outro:'fading acid line'}},
  'Chord stabs':{role:'lead',reg:'mid',human:'chord stabs slightly off the grid',art:{intro:'soft filtered chord stab',hook:'punchy rhythmic chord stabs',verse:'sparse chord stabs',bridge:'rising filtered stabs',outro:'fading stab echo'}},
  'House piano':{role:'lead',reg:'mid',human:'uneven key velocity',art:{intro:'soft chord pattern',hook:'bouncy rhythmic piano chords',verse:'sparse piano stabs',bridge:'rising chord build',outro:'slow fading chord'}},
  'Reese bass':{role:'background',reg:'low',sus:true,human:'slow detune drift',art:{intro:'soft sustained low growl',hook:'thick rolling detuned bassline',verse:'sparse low drone',bridge:'rising filtered growl',outro:'fading low drone'}},
  'Wobble bass':{role:'background',reg:'low',sus:true,human:'uneven wobble timing',art:{intro:'soft low pulse',hook:'heavy wobbling bass movement',verse:'restrained low pulse',bridge:'rising wobble sweep',outro:'fading low pulse'}},
};
Object.entries(NEW_MELODY).forEach(([n,d])=>{INSTR_HUMAN[n]=d.human;MELODY_REGISTER[n]=d.reg;if(d.sus)MELODY_SUSTAINED.add(n);});
const DENSITY_TAG={'Minimalist':'minimalist arrangement','Sparse':'sparse arrangement','Balanced':'balanced arrangement','Dense':'dense hook layers with stripped-back verses','Maximalist':'maximalist hook layers with stripped-back verses'};
const GROOVE_PEAK={'타이트 그리드':'ghost-note syncopation on every off-beat','살짝 스윙':'swing at its most pronounced','헤비 스윙':'MPC swing at full looseness','레이드백 포켓':'snare dragging at its furthest behind the beat','푸시드 포켓':'kick at its most urgent, ahead of the beat'};
const GENRE_HUMAN=[
  'slightly late snare & uneven hi-hat velocity','irregular 808 decay lengths & loose ghost hats','gently rubato melody timing & uneven chord velocity',
  'slightly early sliding 808 entries & uneven hat rolls','behind-the-beat snare & imperfect hat spacing','unquantized cowbell hits & worn tape wobble',
  'off-grid swung kicks & uneven snare velocity','drifting reverb tails & slightly loose pad timing','wobbly tape pitch drift & uneven dusty drum hits',
  'uneven ghost kick velocity & slightly rushed chops','raw clipping peaks & loose synth timing','slightly late log drum hits & uneven shaker velocity',
  'live-played bass looseness & soft sample noise','slightly loose chord timing & uneven 808 sustain','chaotic pitch drift & glitch timing slips',
  'bedroom noise floor & unquantized lo-fi hits','slow drifting pluck timing & uneven ghost pads','live drummer looseness & quirky off-grid stabs',
  'raw riff timing slips & uneven distorted hits','relaxed behind-the-beat hats & uneven sample chop velocity',
];

// 프로듀서 피드백 → Suno 스타일 태그 매핑 (장르 인덱스 기준)
const ADV_TIP_TAGS={
  0:['sidechain compression','hi-hat velocity automation'],
  1:['long reverb tail','dark empty space'],
  2:['melodic hook focus','emotional melody lead'],
  3:['808 pitch glide','tuned 808 bass'],
  4:['offbeat snare','cold snap snare timing'],
  5:['cowbell pattern','short memphis loop'],
  6:['vinyl crackle','off-grid drums'],
  7:['spacious arrangement','minimal drums','airy mix'],
  8:['vinyl noise','tape warmth','lo-fi texture'],
  9:['ghost kick pattern','pumping sidechain bass'],
  10:['short hypnotic loop','simple addictive hook'],
  11:['afro percussion foundation','trap hi-hats layered','syncopated groove'],
  12:['sparse minimal beat','clean open arrangement'],
  13:['melodic 808 chords','pitched 808 melody'],
  14:['extreme pitch shift','clipping distortion','chaotic glitch'],
  15:['lo-fi glitch texture','bedroom producer aesthetic'],
  16:['long sustained 808 notes','808 as melody'],
  17:['jazzy chord voicings','quirky unconventional samples'],
  18:['distorted 808 growl','downtuned guitar riff','industrial noise texture'],
  19:['chopped R&B sample','jersey club kick bounce','sliding 808 glide'],
};
const HH_NARR=[
  {label:'인트로',icon:'⚡',opts:['콜드 오프닝·임팩트','서서히 빌드업','미니멀 비트 인트로','아카펠라 오프닝','직접적 그루브 시작']},
  {label:'버스/훅',icon:'🎤',opts:['반복 훅 강조','버스 집중형','콜&리스폰스','레이어드 훅','임프로바이제이션']},
  {label:'클라이맥스/드롭',icon:'💥',opts:['풀 드롭·모든 요소 등장','서서히 에너지 증폭','갑작스러운 전환','미니멀 드롭','리프레인 반복']},
  {label:'아웃트로',icon:'🔚',opts:['페이드 아웃','갑작스러운 컷','콜다 마무리','루프 반복 종료','리버스 인트로']},
];
// HH_NARR에서 고른 선택지를 실제 섹션 프롬프트에 넣을 영어 프로덕션 문구로 변환 — 지금까지는 요약표에만 표시되고
// 실제 생성 텍스트엔 반영이 안 됐던 부분 (① 요약엔 뜨는데 ②③엔 반영 안 되는 눈속임이었음)
const HH_NARR_DIR={
  '인트로':{
    '콜드 오프닝·임팩트':'sudden full-force entry with no build-up',
    '서서히 빌드업':'gradual layered build-up across several bars',
    '미니멀 비트 인트로':'stripped-back minimal beat only, other elements withheld',
    '아카펠라 오프닝':'vocal-only opening before the beat drops in',
    '직접적 그루브 시작':'full groove and rhythm section present from bar 1',
  },
  '버스/훅':{
    '반복 훅 강조':'hook motif repeated and emphasized',
    '버스 집중형':'verse carries the melodic focus, hook kept simple',
    '콜&리스폰스':'call-and-response phrasing between layers',
    '레이어드 훅':'multiple harmonized layers stacked on the hook',
    '임프로바이제이션':'loose improvisational feel, less rigid repetition',
  },
  '클라이맥스/드롭':{
    '풀 드롭·모든 요소 등장':'every element hits simultaneously at full force',
    '서서히 에너지 증폭':'energy ramps up gradually rather than hitting all at once',
    '갑작스러운 전환':'abrupt unexpected transition into the drop',
    '미니멀 드롭':'restrained minimal drop, some elements held back',
    '리프레인 반복':'refrain motif repeats through the climax',
  },
  '아웃트로':{
    '페이드 아웃':'slow fade-out to silence',
    '갑작스러운 컷':'abrupt hard cut to silence',
    '콜다 마무리':'extended coda-style resolving ending',
    '루프 반복 종료':'loop repeats and winds down',
    '리버스 인트로':'reversed intro elements bring the track full circle',
  },
};
// 구조의 각 섹션을 유일하게 가리키는 키 — intro/outro는 그대로, 반복되는 타입은 hook1/hook2처럼 번호를 붙임.
// AI가 narrDir을 쓸 때 이 키로 "정확히 몇 번째 훅"을 지목하게 해서, 4개 고정 카테고리로는 못 담던
// "구간마다 다른 다이나믹" 요청(예: 섹션마다 점점 밀도 증가)을 실제 구조 그대로 담을 수 있게 함
function structOccurrenceKeys(){
  const cnt={};
  return st.structSegs.map(type=>{
    if(type==='intro'||type==='outro')return type;
    cnt[type]=(cnt[type]||0)+1;
    return `${type}${cnt[type]}`;
  });
}
// 구조 프리셋 — 예전엔 4개뿐이고 브릿지 없는 구조(Minimal·Hook Heavy)가 마지막 훅 직전 텐션 없이 클라이맥스로 넘어간다는 리뷰가 반복돼서 성격이 다른 6개로:
// 루프형(Minimal→Loop Evolve: 마지막 훅 앞에 브릿지 1개), 훅 중심(Hook Heavy: 마지막 훅 앞 브릿지 추가), 서사형(Standard/Slow Burn/Extended)
const HH_STRUCT_PRESETS=[
  {name:'Minimal',desc:'루프 하나로 짧게 — 훅·벌스 한 번씩',segs:['intro','hook','verse','hook','outro']},
  {name:'Loop Evolve',desc:'루프 중심이지만 마지막 훅 직전에 브릿지로 한 번 꺾어줌',segs:['intro','hook','verse','hook','bridge','hook','outro']},
  {name:'Hook Heavy',desc:'훅이 3번 — 마지막 훅 앞에 브릿지로 텐션을 쌓음',segs:['intro','hook','verse','hook','verse','bridge','hook','outro']},
  {name:'Standard',desc:'벌스-브릿지-훅이 균형 잡힌 정석 구조',segs:['intro','hook','verse','bridge','hook','verse','bridge','hook','outro']},
  {name:'Slow Burn',desc:'벌스로 분위기를 쌓다가 훅에서 터지는 서서히 달아오르는 구조',segs:['intro','verse','hook','verse','bridge','hook','outro']},
  {name:'Extended',desc:'벌스·브릿지·훅을 길게 반복하는 서사형 — 긴 곡용',segs:['intro','hook','verse','bridge','hook','verse','bridge','hook','verse','bridge','hook','outro']},
];
const HH_SEG_PALETTE=['intro','hook','verse','bridge','outro'];
// 장르별 구조 추천 (첫 번째가 1순위, 두 번째가 대안) — 예전엔 장르당 1개라 무드(2점)가 장르(3점)를 절대 못 이겼음
const GENRE_STRUCTURE={
  0:'Standard + Hook Heavy',1:'Hook Heavy + Slow Burn',2:'Standard + Slow Burn',3:'Hook Heavy + Loop Evolve',4:'Hook Heavy + Loop Evolve',
  5:'Loop Evolve + Hook Heavy',6:'Standard + Loop Evolve',7:'Slow Burn + Loop Evolve',8:'Loop Evolve + Slow Burn',9:'Hook Heavy + Loop Evolve',
  10:'Loop Evolve + Hook Heavy',11:'Standard + Hook Heavy',12:'Standard + Slow Burn',13:'Slow Burn + Standard',14:'Extended + Hook Heavy',
  15:'Hook Heavy + Loop Evolve',16:'Slow Burn + Loop Evolve',17:'Standard + Slow Burn',
  18:'Hook Heavy + Loop Evolve',19:'Loop Evolve + Standard',
};
const MOOD_STRUCTURE={
  '어둡고 위압적':['Hook Heavy','Standard'],'감각적·관능적':['Standard','Slow Burn'],'멜로딕·감성':['Standard','Slow Burn'],
  '에너제틱·하입':['Hook Heavy','Standard'],'사이키델릭·몽환':['Slow Burn','Loop Evolve'],'칠·그루비':['Loop Evolve','Standard'],
  '분노·공격적':['Hook Heavy','Standard'],'내성적·사색':['Slow Burn','Standard'],'축제·환희':['Hook Heavy','Standard'],
  '승리감·웅장':['Extended','Standard'],'슬프고·멜랑콜리':['Standard','Slow Burn'],'자신감·플렉스':['Hook Heavy','Standard'],
  '로맨틱·달콤한':['Standard','Slow Burn'],'긴장감·서스펜스':['Slow Burn','Standard'],'노스탤직·향수':['Standard','Loop Evolve'],
  '미스터리·신비':['Slow Burn','Standard'],
};
// 그 밖의 신호 — 장르·무드가 같아도 색깔(커머셜/언더그라운드), 밀도, 보컬 유무, 목표 길이에 따라 어울리는 구조가 다름
const STRUCT_BY_COMMERCIAL={'Commercial/Mainstream':['Hook Heavy','Standard'],'Underground/Experimental':['Slow Burn','Loop Evolve','Extended']};
const STRUCT_BY_DENSITY={'Minimalist':['Minimal','Loop Evolve','Slow Burn'],'Sparse':['Minimal','Loop Evolve','Slow Burn'],'Dense':['Extended','Standard'],'Maximalist':['Extended','Standard']};
const STRUCT_VOCAL=['Standard','Hook Heavy'];   // 보컬이 있으면 벌스가 실제로 할 일이 있는 구조
const LENGTH_SEC={'1:30':90,'2:00':120,'2:30':150,'3:00':180,'3:30':210};

// ---- POP/R&B DATA ----
const POP_GENRES=[
  {kr:'K-Pop',tag:'k-pop'},{kr:'인디팝',tag:'indie pop'},{kr:'드림팝',tag:'dream pop'},
  {kr:'Alt R&B',tag:'alt r&b'},{kr:'네오소울',tag:'neo soul'},{kr:'댄스팝',tag:'dance pop'},
  {kr:'베드룸팝',tag:'bedroom pop'},{kr:'신스팝',tag:'synthpop'},{kr:'어쿠스틱팝',tag:'acoustic pop'},
  {kr:'하이퍼팝',tag:'hyperpop'},
];
const POP_ARTISTS=[
  {name:'The Weeknd',color:'#FF4D6D',songs:[
    {title:'Blinding Lights',tag:'synthpop',bpm:120,key:7},{title:'Starboy',tag:'synthpop',bpm:186,key:11},
    {title:'Save Your Tears',tag:'synthpop',bpm:118,key:7},{title:'Die For You',tag:'r&b',bpm:97,key:9}
  ]},
  {name:'SZA',color:'#9D4EDD',songs:[
    {title:'Kill Bill',tag:'alt r&b',bpm:89,key:10},{title:'Snooze',tag:'neo soul',bpm:95,key:4},
    {title:'Good Days',tag:'indie pop',bpm:86,key:0},{title:'Shirt',tag:'alt r&b',bpm:105,key:7}
  ]},
  {name:'Harry Styles',color:'#00C6FF',songs:[
    {title:'As It Was',tag:'indie pop',bpm:174,key:7},{title:'Watermelon Sugar',tag:'indie pop',bpm:95,key:4},
    {title:'Adore You',tag:'pop',bpm:97,key:3},{title:'Golden',tag:'indie pop',bpm:144,key:0}
  ]},
  {name:'NewJeans',color:'#4DC886',songs:[
    {title:'Hype Boy',tag:'k-pop',bpm:130,key:7},{title:'Super Shy',tag:'k-pop',bpm:128,key:10},
    {title:'OMG',tag:'k-pop',bpm:124,key:8},{title:'ETA',tag:'k-pop',bpm:139,key:10}
  ]},
  {name:'aespa',color:'#A78BFA',songs:[
    {title:'Supernova',tag:'k-pop',bpm:138,key:10},{title:'Drama',tag:'k-pop',bpm:130,key:11},
    {title:'Girls',tag:'k-pop',bpm:128,key:7},{title:'Spicy',tag:'k-pop',bpm:125,key:9}
  ]},
  {name:'Taylor Swift',color:'#F472B6',songs:[
    {title:'Anti-Hero',tag:'indie pop',bpm:97,key:0},{title:'Cruel Summer',tag:'synthpop',bpm:170,key:0},
    {title:'cardigan',tag:'indie folk',bpm:92,key:0},{title:'Bejeweled',tag:'pop',bpm:100,key:0}
  ]},
  {name:'Frank Ocean',color:'#34D399',songs:[
    {title:'Ivy',tag:'indie r&b',bpm:140,key:4},{title:'Pink + White',tag:'neo soul',bpm:94,key:4},
    {title:'Chanel',tag:'r&b',bpm:77,key:7},{title:'Nights',tag:'r&b',bpm:117,key:11}
  ]},
  {name:'Olivia Rodrigo',color:'#FB923C',songs:[
    {title:'drivers license',tag:'pop',bpm:144,key:0},{title:'good 4 u',tag:'pop punk',bpm:166,key:0},
    {title:'vampire',tag:'pop',bpm:138,key:8},{title:'brutal',tag:'alt rock',bpm:138,key:0}
  ]},
];
const POP_GENRE_PRESETS=[
  {name:'드림팝',tag:'dream pop',color:'#A78BFA'},{name:'Alt R&B',tag:'alt r&b',color:'#9D4EDD'},
  {name:'K-Pop',tag:'k-pop',color:'#4DC886'},{name:'인디팝',tag:'indie pop',color:'#60A5FA'},
  {name:'신스팝',tag:'synthpop',color:'#F472B6'},{name:'네오소울',tag:'neo soul',color:'#34D399'},
];
const POP_MOODS=[
  {kr:'로맨틱·설렘',tag:'romantic longing'},{kr:'감성·감각',tag:'sensual emotional'},
  {kr:'자신감·파워풀',tag:'confident powerful'},{kr:'몽환·에테리얼',tag:'dreamy ethereal'},
  {kr:'업비트·댄서블',tag:'upbeat danceable'},{kr:'자책·내면',tag:'introspective melancholic'},
  {kr:'칠·릴렉스',tag:'chill relaxed'},{kr:'에너제틱·하입',tag:'energetic hype'},
];
const POP_INSTR=['피아노','어쿠스틱 기타','일렉 기타','신스','스트링스','브라스','베이스','드럼','보컬 레이어','패드','하프','플루트'];
const POP_VOCAL_STYLES=[
  {kr:'팝 보컬',tag:'pop vocal'},{kr:'R&B 보컬',tag:'r&b vocal'},{kr:'팝 펑크',tag:'pop punk vocals'},
  {kr:'폴세토',tag:'falsetto'},{kr:'드림팝 보컬',tag:'dreamy pop vocal'},
  {kr:'K-Pop 보컬',tag:'k-pop vocal'},{kr:'인디 보컬',tag:'indie vocal'},
];
const POP_NARR=[
  {label:'인트로',icon:'🎵',opts:['감성 빌드업','직접 멜로디','반복 루프','미니멀 피아노']},
  {label:'벌스',icon:'📝',opts:['내러티브 스토리텔링','감성 고백','은유적 표현','직접적 메시지']},
  {label:'프리코러스',icon:'⬆️',opts:['긴장감 고조','에너지 축적','감정 절정 직전','미니멀→풀']},
  {label:'코러스',icon:'🎶',opts:['후크 멜로디 강조','감정 폭발','반복 레이어','업리프팅 에너지']},
  {label:'브릿지',icon:'🌉',opts:['감정 대비','조성 변화','인트로스펙티브','서프라이즈 전환']},
  {label:'아웃트로',icon:'🔚',opts:['페이드 아웃','감성 마무리','루프 엔딩','갑작스러운 컷']},
];
const POP_STRUCT_PRESETS=[
  {name:'Standard',segs:['intro','verse','prechorus','chorus','verse','prechorus','chorus','bridge','chorus','outro']},
  {name:'Verse Heavy',segs:['intro','verse','verse','prechorus','chorus','bridge','chorus','outro']},
  {name:'Simple',segs:['intro','verse','chorus','chorus','outro']},
  {name:'Extended',segs:['intro','verse','prechorus','chorus','verse','prechorus','chorus','bridge','chorus','chorus','outro']},
];
const POP_SEG_PALETTE=['intro','verse','prechorus','chorus','bridge','outro'];
const POP_AUTO={
  'k-pop':{mood:'에너제틱·하입',instruments:['신스','드럼','베이스'],vocalStyle:'K-Pop 보컬',structure:'Extended',narr:{'인트로':'직접 멜로디','벌스':'내러티브 스토리텔링','프리코러스':'에너지 축적','코러스':'후크 멜로디 강조','브릿지':'서프라이즈 전환','아웃트로':'루프 엔딩'}},
  'indie pop':{mood:'업비트·댄서블',instruments:['어쿠스틱 기타','일렉 기타','드럼'],vocalStyle:'인디 보컬',structure:'Standard',narr:{'인트로':'반복 루프','벌스':'내러티브 스토리텔링','프리코러스':'감정 절정 직전','코러스':'업리프팅 에너지','브릿지':'감정 대비','아웃트로':'감성 마무리'}},
  'dream pop':{mood:'몽환·에테리얼',instruments:['일렉 기타','패드','신스'],vocalStyle:'드림팝 보컬',structure:'Simple',narr:{'인트로':'감성 빌드업','벌스':'은유적 표현','프리코러스':'긴장감 고조','코러스':'반복 레이어','브릿지':'인트로스펙티브','아웃트로':'페이드 아웃'}},
  'alt r&b':{mood:'감성·감각',instruments:['신스','베이스','드럼'],vocalStyle:'R&B 보컬',structure:'Simple',narr:{'인트로':'미니멀 피아노','벌스':'감성 고백','프리코러스':'긴장감 고조','코러스':'후크 멜로디 강조','브릿지':'인트로스펙티브','아웃트로':'감성 마무리'}},
  'neo soul':{mood:'칠·릴렉스',instruments:['피아노','베이스','드럼'],vocalStyle:'R&B 보컬',structure:'Standard',narr:{'인트로':'미니멀 피아노','벌스':'감성 고백','프리코러스':'에너지 축적','코러스':'후크 멜로디 강조','브릿지':'감정 대비','아웃트로':'루프 엔딩'}},
  'dance pop':{mood:'업비트·댄서블',instruments:['신스','베이스','드럼'],vocalStyle:'팝 보컬',structure:'Extended',narr:{'인트로':'직접 멜로디','벌스':'감성 고백','프리코러스':'에너지 축적','코러스':'감정 폭발','브릿지':'서프라이즈 전환','아웃트로':'갑작스러운 컷'}},
  'bedroom pop':{mood:'칠·릴렉스',instruments:['일렉 기타','신스','드럼'],vocalStyle:'인디 보컬',structure:'Simple',narr:{'인트로':'미니멀 피아노','벌스':'감성 고백','프리코러스':'미니멀→풀','코러스':'반복 레이어','브릿지':'인트로스펙티브','아웃트로':'페이드 아웃'}},
  'synthpop':{mood:'노스탤직·향수',instruments:['신스','베이스','드럼'],vocalStyle:'팝 보컬',structure:'Standard',narr:{'인트로':'반복 루프','벌스':'내러티브 스토리텔링','프리코러스':'긴장감 고조','코러스':'후크 멜로디 강조','브릿지':'감정 대비','아웃트로':'루프 엔딩'}},
  'acoustic pop':{mood:'로맨틱·설렘',instruments:['어쿠스틱 기타','피아노','드럼'],vocalStyle:'팝 보컬',structure:'Standard',narr:{'인트로':'직접 멜로디','벌스':'내러티브 스토리텔링','프리코러스':'감정 절정 직전','코러스':'업리프팅 에너지','브릿지':'감정 대비','아웃트로':'감성 마무리'}},
  hyperpop:{mood:'에너제틱·하입',instruments:['신스','드럼','보컬 레이어'],vocalStyle:'팝 보컬',structure:'Extended',narr:{'인트로':'직접 멜로디','벌스':'직접적 메시지','프리코러스':'에너지 축적','코러스':'감정 폭발','브릿지':'서프라이즈 전환','아웃트로':'갑작스러운 컷'}},
};
const POP_INSTR_SOUND={
  '피아노':'warm electric piano and clear piano voicings','어쿠스틱 기타':'intimate acoustic guitar strums','일렉 기타':'clean muted guitar accents','신스':'glossy synth chords and a signature synth motif','스트링스':'restrained cinematic string swells','브라스':'short bright brass accents','베이스':'elastic melodic bass','드럼':'tight punchy pop drums','보컬 레이어':'layered backing vocals','패드':'wide atmospheric pads','하프':'delicate harp-like plucks','플루트':'airy flute phrases'
};

// ---- ELECTRONIC DATA ----
const ELEC_GENRES=[
  {kr:'House',tag:'house'},{kr:'Techno',tag:'techno'},{kr:'UK Garage',tag:'uk garage'},
  {kr:'Drum & Bass',tag:'drum and bass'},{kr:'Ambient',tag:'ambient'},{kr:'Trance',tag:'trance'},
  {kr:'Future Bass',tag:'future bass'},{kr:'Melodic Techno',tag:'melodic techno'},
  {kr:'Afro House',tag:'afro house'},{kr:'IDM',tag:'IDM'},
];
const ELEC_ARTISTS=[
  {name:'Fred Again..',color:'#00C6FF',songs:[
    {title:'Marea',tag:'house',bpm:124,key:7},{title:'Delilah',tag:'house',bpm:128,key:10},
    {title:'Bleed',tag:'house',bpm:126,key:11}
  ]},
  {name:'Fisher',color:'#FF6B35',songs:[
    {title:'Losing It',tag:'tech house',bpm:128,key:9},{title:'You Little Beauty',tag:'tech house',bpm:130,key:12},
    {title:'Take It',tag:'house',bpm:126,key:10}
  ]},
  {name:'Charlotte de Witte',color:'#9D4EDD',songs:[
    {title:'Doppler',tag:'techno',bpm:140,key:9},{title:'Romancer',tag:'techno',bpm:138,key:7},
    {title:'Doppler (Dark)',tag:'dark techno',bpm:142,key:10}
  ]},
  {name:'Bicep',color:'#4DC886',songs:[
    {title:'Glue',tag:'house',bpm:130,key:7},{title:'Infinity',tag:'house',bpm:128,key:10},
    {title:'Atlas',tag:'techno',bpm:135,key:12}
  ]},
  {name:'Peggy Gou',color:'#F472B6',songs:[
    {title:'I Go',tag:'uk garage',bpm:130,key:7},{title:'(It Goes Like) Nanana',tag:'house',bpm:127,key:11},
    {title:'Lobster Telephone',tag:'house',bpm:126,key:9}
  ]},
  {name:'Four Tet',color:'#34D399',songs:[
    {title:'Baby',tag:'ambient house',bpm:110,key:0},{title:'Teenage Birdsong',tag:'idm',bpm:115,key:7},
    {title:'Love Cry',tag:'house',bpm:117,key:10}
  ]},
  {name:'Jamie xx',color:'#A78BFA',songs:[
    {title:'Loud Places',tag:'house',bpm:120,key:7},{title:'In Colour',tag:'house',bpm:122,key:4},
    {title:'Gosh',tag:'uk garage',bpm:119,key:10}
  ]},
  {name:'John Summit',color:'#FACC15',songs:[
    {title:'La Danza',tag:'tech house',bpm:130,key:7},{title:'Human',tag:'house',bpm:128,key:10},
    {title:'Where You Are',tag:'house',bpm:126,key:11}
  ]},
];
const ELEC_GENRE_PRESETS=[
  {name:'House',tag:'house',color:'#F472B6'},{name:'Techno',tag:'techno',color:'#9D4EDD'},
  {name:'UK Garage',tag:'uk garage',color:'#00C6FF'},{name:'Future Bass',tag:'future bass',color:'#4DC886'},
  {name:'Melodic Techno',tag:'melodic techno',color:'#A78BFA'},{name:'Ambient',tag:'ambient',color:'#34D399'},
];
const ELEC_MOODS=[
  {kr:'황홀·유포리아',tag:'euphoric'},{kr:'어둡고 그루비',tag:'dark groovy'},
  {kr:'미니멀·하이프노틱',tag:'minimal hypnotic'},{kr:'에너제틱·댄스플로어',tag:'energetic dancefloor'},
  {kr:'드림·에테리얼',tag:'dreamy ethereal'},{kr:'테크노이드·인더스트리얼',tag:'techno industrial'},
  {kr:'칠·릴렉스',tag:'chill ambient'},{kr:'익스플로시브·드롭',tag:'explosive drop'},
];
const ELEC_INSTR=['신스 리드','서브 베이스','패드','아르페지에이터','보코더','퍼커션','하이햇','킥','보컬 촙','리버브 기타','스트링스','피아노'];
const ELEC_VOCAL_STYLES=[
  {kr:'인스트루멘털',tag:'instrumental'},{kr:'보코더/신스 보컬',tag:'vocoder synth vocal'},
  {kr:'미니멀 보컬',tag:'minimal vocal'},{kr:'하우스 보컬',tag:'house vocal'},
  {kr:'게스트 보컬',tag:'guest vocal'},{kr:'일렉트로닉 보컬',tag:'electronic vocal'},
];
const ELEC_NARR=[
  {label:'인트로',icon:'🌅',opts:['롱 어택 빌드','미니멀 텍스처','아카펠라 오프닝','앰비언트 스웰']},
  {label:'빌드업',icon:'📈',opts:['필터 스윕 상승','퍼커션 레이어','에너지 축적','긴장감 드라이브']},
  {label:'드롭',icon:'💥',opts:['풀 에너지 릴리즈','하드 드롭','소프트 드롭','리듬 드롭']},
  {label:'브레이크다운',icon:'🔄',opts:['스트리핑 다운','멜로딕 인터루드','하프 타임','재빌드']},
  {label:'아웃트로',icon:'🔚',opts:['롱 페이드','급격한 컷','루프 엔딩','앰비언트 마무리']},
];
const ELEC_STRUCT_PRESETS=[
  {name:'Standard',segs:['intro','build','drop','breakdown','drop','outro']},
  {name:'Extended',segs:['intro','build','drop','breakdown','drop','breakdown','drop','outro']},
  {name:'Minimal',segs:['intro','drop','breakdown','drop','outro']},
  {name:'Journey',segs:['intro','build','drop','breakdown','build','drop','drop','outro']},
];
const ELEC_SEG_PALETTE=['intro','build','drop','breakdown','outro'];

// ---- ROCK DATA ----
const ROCK_GENRES=[
  {kr:'인디록',tag:'indie rock'},{kr:'포스트펑크',tag:'post-punk'},{kr:'슈게이징',tag:'shoegaze'},
  {kr:'이모',tag:'emo'},{kr:'드림팝',tag:'dream pop'},{kr:'매쓰록',tag:'math rock'},
  {kr:'얼터너티브',tag:'alternative rock'},{kr:'포스트록',tag:'post-rock'},
];
const ROCK_ARTISTS=[
  {name:'Arctic Monkeys',color:'#FF4D6D',songs:[
    {title:"Do I Wanna Know?",tag:'alt rock',bpm:85,key:14},{title:"R U Mine?",tag:'alt rock',bpm:96,key:7},
    {title:"505",tag:'indie rock',bpm:74,key:10},{title:"Fluorescent Adolescent",tag:'alt rock',bpm:170,key:4}
  ]},
  {name:'Radiohead',color:'#9D4EDD',songs:[
    {title:'Creep',tag:'alt rock',bpm:92,key:4},{title:'Karma Police',tag:'alt rock',bpm:76,key:0},
    {title:'Paranoid Android',tag:'alt rock',bpm:76,key:0},{title:'Fake Plastic Trees',tag:'alt rock',bpm:67,key:0}
  ]},
  {name:'Paramore',color:'#FF6B35',songs:[
    {title:'Misery Business',tag:'pop punk',bpm:172,key:0},{title:'Still Into You',tag:'pop punk',bpm:145,key:2},
    {title:'Decode',tag:'alt rock',bpm:96,key:8},{title:'The Only Exception',tag:'indie pop',bpm:98,key:0}
  ]},
  {name:'The 1975',color:'#34D399',songs:[
    {title:'The Sound',tag:'indie pop',bpm:131,key:0},{title:'Somebody Else',tag:'indie rock',bpm:136,key:4},
    {title:"If You're Too Shy",tag:'indie pop',bpm:125,key:0},{title:'Chocolate',tag:'indie rock',bpm:120,key:4}
  ]},
  {name:'Wet Leg',color:'#84CC16',songs:[
    {title:'Chaise Longue',tag:'indie rock',bpm:136,key:10},{title:'Ur Mum',tag:'indie rock',bpm:128,key:4},
    {title:'Oh No',tag:'post-punk',bpm:132,key:7}
  ]},
  {name:'Beabadoobee',color:'#60A5FA',songs:[
    {title:'I Wish I Was Stephen Malkmus',tag:'indie rock',bpm:150,key:0},{title:'Coffee',tag:'indie pop',bpm:90,key:4},
    {title:'Last Day on Earth',tag:'dream pop',bpm:88,key:0}
  ]},
  {name:'MUNA',color:'#F472B6',songs:[
    {title:'Silk Chiffon',tag:'indie pop',bpm:122,key:0},{title:'Kind of Girl',tag:'indie pop',bpm:128,key:0},
    {title:'Anything But Me',tag:'synth pop',bpm:114,key:9}
  ]},
  {name:'Bloc Party',color:'#A78BFA',songs:[
    {title:'Banquet',tag:'post-punk',bpm:142,key:7},{title:'Helicopter',tag:'post-punk',bpm:115,key:10},
    {title:'This Modern Love',tag:'indie rock',bpm:130,key:4}
  ]},
];
const ROCK_GENRE_PRESETS=[
  {name:'인디록',tag:'indie rock',color:'#FF4D6D'},{name:'포스트펑크',tag:'post-punk',color:'#9D4EDD'},
  {name:'슈게이징',tag:'shoegaze',color:'#A78BFA'},{name:'이모',tag:'emo',color:'#FF6B35'},
  {name:'드림팝',tag:'dream pop',color:'#60A5FA'},{name:'매쓰록',tag:'math rock',color:'#34D399'},
];
const ROCK_MOODS=[
  {kr:'에너제틱·파워풀',tag:'energetic powerful'},{kr:'감성·멜랑콜리',tag:'emotional melancholy'},
  {kr:'다크·인트로스펙티브',tag:'dark introspective'},{kr:'드림·슈게이징',tag:'dreamy shoegaze'},
  {kr:'앵스티·이모',tag:'angsty emo'},{kr:'업비트·인디',tag:'upbeat indie'},
  {kr:'포스트펑크·콜드',tag:'post-punk cold'},{kr:'서정적·어쿠스틱',tag:'lyrical acoustic'},
];
const ROCK_INSTR=['일렉 기타','어쿠스틱 기타','베이스 기타','드럼','키보드/신스','피아노','리드 기타','리듬 기타','보컬 하모니','페달 스틸','현악기','관악기'];
const ROCK_VOCAL_STYLES=[
  {kr:'인디 록 보컬',tag:'indie rock vocal'},{kr:'쇼게이징 보컬',tag:'shoegaze vocal'},
  {kr:'팝펑크 보컬',tag:'pop punk vocal'},{kr:'드림팝 보컬',tag:'dreamy pop vocal'},
  {kr:'포스트펑크 보컬',tag:'post-punk vocal'},{kr:'그런지 보컬',tag:'grunge vocal'},
  {kr:'감성 보컬',tag:'emotional vocal'},
];
const ROCK_NARR=[
  {label:'인트로',icon:'🎸',opts:['기타 리프 오프닝','앰비언트 빌드','직접적 에너지','드럼 오프닝']},
  {label:'벌스',icon:'📝',opts:['스토리텔링','감성 고백','포스트펑크 리듬','어쿠스틱 텍스처']},
  {label:'코러스',icon:'🎶',opts:['파워풀 훅','감정 폭발','레이어드 기타','업리프팅 에너지']},
  {label:'브릿지',icon:'🌉',opts:['대조적 섹션','악기 전환','감정 피크','인트로스펙티브']},
  {label:'솔로',icon:'🎵',opts:['리드 기타 솔로','키보드 솔로','포스트록 스웰','임프로바이제이션']},
  {label:'아웃트로',icon:'🔚',opts:['페이드 아웃','갑작스러운 컷','포스트록 스웰','크레센도']},
];
const ROCK_STRUCT_PRESETS=[
  {name:'Standard',segs:['intro','verse','chorus','verse','chorus','bridge','solo','chorus','outro']},
  {name:'Classic',segs:['intro','verse','chorus','verse','chorus','bridge','chorus','outro']},
  {name:'Simple',segs:['intro','verse','chorus','chorus','outro']},
  {name:'Extended',segs:['intro','verse','chorus','verse','chorus','bridge','solo','chorus','chorus','outro']},
];
const ROCK_SEG_PALETTE=['intro','verse','chorus','bridge','solo','outro'];


// ===== AI 작성기 · 리뷰 루브릭 상수 =====
// 섹션 박스(Suno 가사칸) 5000자, 스타일 박스 1000자
const WRITE_LIMITS={section:5000,sectionVocal:5000,style:1000};   // 보컬은 연출+가사 합계 5000자. 상한까지 채울 필요는 없다.
// 사용자 공유 대화의 최종 압축·역할 분담 원칙. 예시 장르나 보컬을 고정하지 않는다.
// https://chatgpt.com/share/6ab61453-cdec-83e8-a54a-075fcdc10006
const STYLE_BUDGET_GUIDE=`[스타일의 핵심과 글자 예산]
처음부터 공백·문장부호 포함 1000자 안에서 음악적 핵심을 설계해. 700~900자는 여유를 위한 목표일 뿐 최소 분량도 상한도 아니야. 핵심에 필요하면 1000자까지 쓰고, 충분히 전달되면 더 짧아도 돼.
반드시 보존할 의미: 장르·중심 무드·보컬 유무·지정한 BPM/Key, 곡의 정체성인 모티프 또는 그루브, 주요 악기의 주법·역할·응답과 쉼, 훅이나 브리지의 중요한 변화, 사용자가 확정한 조건과 적용된 프로듀서 피드백. 미지정 수치나 새로운 악기는 지어내지 마.
분량이 부족하면 중복 형용사와 같은 의미의 반복부터 없애고, 섹션에서 이미 설명한 부차적인 순간 연출은 스타일에서 덜어내. 섹션에 있다는 이유로 곡 전체의 중심 패턴·악기 관계·핵심 전개까지 빼지 마.
태그 나열이나 모호한 형용사 요약으로 바꾸지 말고, 무엇이 어떻게 연주되고 언제 응답·변화하는지 연결된 영어 자연어 한 문단으로 유지해. 적용된 피드백과 삭제·제외 조건은 압축 후에도 유효해야 해. 핵심 정보의 누락·반전이 없는지 제출 전에 원문과 선택 의도를 대조해.`;

const REFERENCE_DEVELOPMENT_GUIDE=`[작성 목적 분기]
- designMode 또는 작성 목적이 reference-type-beat이면 레퍼런스 반주 기반 설계다. 알려진 그루브·음색·악기 역할·여백·에너지 범위를 우선 보존하고, 새로운 선율도 그 반주 역할 안에서 설계해. 보컬이 빠진 자리를 솔로 악기곡으로 바꾸지 마. 명시적으로 보컬을 선택하면 그 선택은 존중해.
- original-song이면 장르·무드·사용자 설명의 조합으로 좋은 새 곡을 설계하는 작업이다. 존재하지 않는 레퍼런스에 맞추려 하지 마. 미선택 악기와 전개는 의도에 어울리면 추천할 수 있고, 중심 아이디어와 연주 관계를 새로 설계해. 다만 사용자가 확정한 편성·제외·보컬·BPM/Key는 지켜. 어두운 무드를 밝은 절정으로 바꾸는 등 의도 이탈은 이 경로에서도 금지다.
- 리뷰도 같은 분기를 따른다. 타입비트는 반주 정체성 보존과 그 안의 개선, 새 곡은 선택 조합의 적합성과 음악적 완성도를 평가한다. 어느 경로든 발전은 선택 의도를 더 잘 실현하는 것이며 제안 개수를 채우지 마.

[발전의 기준: 의도 보존]
- brief.uncertainFields는 분석에서 확신이 낮아 제외한 정보다. 레퍼런스에 실제 있는 악기·편곡이라고 복원하거나 추측으로 채우지 마. 제목 기반 모델 분석을 검증된 사실로 표현하지 마. 사용자가 직접 선택한 조건은 이 불확실성과 별개로 존중해.
- 레퍼런스 곡이 있으면 그 반주의 무드·그루브·악기 역할·여백·에너지 범위를 유지하는 것이 발전의 기준이다. 더 밝고 풍성하거나 극적인 곡이 되는 것 자체는 개선이 아니다. 사용자가 명시적으로 바꾼 조건은 우선하되 나머지 정체성은 보존해. 레퍼런스가 없으면 선택한 장르·무드·편성이 기준이다.
- 무보컬 전환은 보컬 제거다. 원래 반주 악기를 보컬 톱라인 대체용 singable melody로 승격시키거나 imaginary vocal lines를 만들어 응답시키지 마. 기존 반주 모티프와 역할을 유지해. 사용자가 악기 솔로나 새로운 멜로디를 요청한 경우만 예외다.
- Strings 선택은 상승하는 카운터멜로디·유니즌 절정의 요청이 아니며, Stereo wide는 패드 추가 요청이 아니고, Balanced는 마지막 최대 밀도 요청이 아니다. 선택 악기는 레퍼런스에서 확실히 아는 역할로 배치하고 모르면 절제해. 배경 악기를 주역으로 바꾸거나 새 악기·상승 선율·하프타임·축제 같은 절정을 넣으려면 선택값 또는 확실한 반주 분석에 근거가 있어야 한다.
- 반복과 일정한 에너지가 정체성이면 그대로 유지해. 변화가 필요할 때만 기존 악기의 짧은 쉼·강세·진입·절제된 변주로 해결해. 모든 구간에 변화를 넣거나 마지막 훅을 가장 크고 밝게 만들지 마. 분석된 에너지 범위 밖으로 벗어나는 지시는 제거해.
- AI 티 방지는 의도에 맞는 연주 자연스러움과 불필요한 지시 정리다. 새 필인·스트링·패드·화성 상승·스윙을 강제하는 옵션이 아니다. 기계적으로 타이트한 원곡이면 타이밍도 유지해.
- 피드백은 레퍼런스/선택 의도에서 벗어난 지시의 삭제·완화를 추가보다 먼저 검토해. 이미 충실하면 변화를 권하지 마. 모르는 반주 디테일은 사실로 단정하지 말고 실제 음원을 들었다고 주장하지 마.`;

const PROMPT_ROLE_GUIDE=`${REFERENCE_DEVELOPMENT_GUIDE}

[스타일과 섹션의 역할 분담 — 생성·피드백 적용·압축에 공통]
- 스타일은 전체 악기 설명서가 아니야. 정체성·중심 패턴·악기 관계를 먼저 설계하고 중요한 전개만 짧게 연결해. 모든 악기의 주법·음역·믹스·등장 구간을 빠짐없이 열거하지 마. 1000자 예산에서 주변 묘사보다 중심 아이디어를 우선해.
- 섹션에는 해당 구간에서 달라지거나 반드시 유지할 것만 써. 스타일의 장르·무드·악기 목록·전체 모티프 설명을 반복하지 마. 변화가 없으면 짧은 유지 지시로 충분해. 디테일 개수나 문장 수는 고정하지 마.
- tight rhythmic turns 같은 추상어만 쓰지 말고 짧은 구절 뒤 쉼과 응답처럼 구별되는 연주 동작을 설명해. 사용자 지정 패턴은 보존하고 레퍼런스에서 확인하지 못한 음형을 원곡의 사실로 만들지 마.
- 선택 BPM은 유지해. 178 BPM과 89 BPM 하프타임 체감처럼 둘의 관계가 의도에 주어졌을 때만 함께 설명해. 수치만 보고 자동으로 절반 템포를 만들지 마. 체감을 모르면 mid-tempo 같은 단정을 빼.
- 스타일과 섹션의 같은 대상·시점을 대조해 모순을 없애. 기타가 주도하되 브리지에서 스트링에 넘기면 always on top이라고 쓰지 마. 연결되는 베이스음과 여백을 함께 원하면 기타 응답 직전에 쉰다는 식으로 시점을 연결해. 이 악기·전개는 예시이며 선택에 없으면 추가하지 마.
- 섹션은 [헤더]를 별도 줄에, 아래 연주·편곡 설명은 (자연어 연출)로 써. 실제 가사는 괄호 밖에 둬. 이는 앱의 표시·병합 형식이며 괄호만으로 보컬 방지를 보장하지 않아. 무보컬 조건은 별도로 지켜.
- 피드백 적용과 압축에서도 이 자연어 문체와 역할 분담을 유지해. 보완 하나 때문에 모든 구간에 악기 설명을 다시 늘리지 마. 제출 전 핵심 의도 보존·중복·시점 모순·스타일 1000자 및 섹션과 가사 합계 5000자 예산을 점검해.

[역할과 여백으로 설계하기]
- 먼저 이 곡에서 기억할 중심 패턴과 핵심 대비 하나를 정해. 박을 받치는 요소, 주도하는 악기, 쉬는 자리에 응답하는 요소, 프레이즈 끝을 강조하는 요소 중 현재 편성에 필요한 역할만 배정해. 역할을 채우려고 악기를 추가하지 마. 베이스가 주인공이면 멜로디를 주인공으로 강제하지 마.
- 악기 이름 나열 대신 누가 먼저 치고, 누가 쉬고, 무엇이 그 빈칸에 응답하는지를 연결해. 예: A steady kick anchors the pulse while clipped bass notes land late; a short synth accent answers only after the bass rests. 이 문장은 관계 설명의 예일 뿐이며 실제 악기·그루브는 사용자 선택과 레퍼런스에 맞춰.
- 미니멀·리듬 중심 곡은 여백과 교대 진입을 활용해. 모든 악기를 동시에 치지 말라는 규칙을 모든 장르에 강요하지 마. 유니즌이나 풍성한 레이어가 의도면 함께 연주해도 돼. 속삭임·보컬찹은 예시 때문에 추가하지 말고 보컬 허용 범위를 따라.
- 박자 좌표·16분음표·의성어를 모든 악기에 빽빽하게 지정하지 마. 정확한 위치가 중심 패턴을 구별할 때만 쓰고 나머지는 steady pulse, late syncopation, short answer, deliberate rest처럼 들리는 관계로 설명해. 사용자 지정 박자·음형은 보존해.
- 훅에서도 중심 패턴은 알아볼 수 있게 유지해. 의도에 따라 저음 무게·음역·응답·공간 중 필요한 변화로 대비를 만들고, 새 멜로디·거대한 드롭·4마디마다 변형을 의무처럼 넣지 마. 섹션에는 해당 구간의 진입·유지·비움·변화만 써.
- 스타일은 공백 포함 1000자 이내 한 문단. 길면 중복 감정어·마지막 수식어 나열·부차적 박자 설명부터 삭제하고 사용자 고정값, 중심 패턴, 연주 관계와 핵심 훅 대비를 보존해. 문장을 중간에서 자르거나 디테일을 섹션에 전부 떠넘기지 마. 섹션과 가사 합계는 5000자 이내이며 최대 길이를 채울 필요는 없어.`;
// 리뷰 채점 루브릭 — 예전엔 "냉정하게, 후하게 주지 말고, 약점 위주"라 첫 리뷰가 55·58·58·58·59로 상수에 가까웠음(바닥 효과). 항목별 0~10점(앵커 제시)을 받고 합계는 코드가 가중합으로 계산
const REVIEW_RUBRIC=[
  {key:'arc',label:'구조·전개 아크',w:15,def:'곡의 중심 아이디어가 의도에 맞게 제시·변형·비움·회수되는가. 지속 상승을 모든 곡에 강요하지 않음'},
  {key:'variety',label:'반복·변주',w:15,def:'핵심 패턴의 정체성과 반복을 지키면서 의미 있는 순간에 변화하는가. 같은 악기 이름이나 의도적인 반복은 감점하지 않음'},
  {key:'genre',label:'장르 특이성',w:15,def:'다른 장르에 붙여도 되는 범용 문구가 아니라 이 장르의 기법이 섹션에 드러나는가'},
  {key:'coherence',label:'믹스·문구 일관성',w:15,def:'스타일 개요와 섹션별 상세 지시가 같은 곡을 설명하는가. 지속 편성과 순간 이벤트의 범위가 명확한가. 다른 구간·악기에 배정된 감정이나 밀도의 대비는 모순으로 보지 않음'},
  {key:'roles',label:'악기 역할·마스킹',w:10,def:'악기·주법·처리·등장 시점이 구체적인가. 순간 이벤트의 악기가 팔레트에 있고 리드나 보컬의 쉼에 응답하는가. 형용사만으로 역할을 대신하지 않는가'},
  {key:'human',label:'인간미',w:10,def:'시그니처 시작·침묵·응답 관계·선택적인 변화가 개성을 만드는가. 피치·타이밍 흔들림은 필수가 아님'},
  {key:'reference',label:'레퍼런스 부합',w:10,def:'타겟 레퍼런스 곡·프로듀서의 성격과 방향이 맞는가'},
  {key:'parse',label:'Suno 파싱 적합',w:10,def:'악기·행동·시점·유지 조건이 명확하고 불필요한 중복 없이 출력 예산 안에 드는가. 자연어 문장과 키워드 모두 허용하며 쉼표 수·형용사 유무·문장 형식으로 감점하지 않음'},
];
function rubricScore(criteria){
  if(!criteria||typeof criteria!=='object')return null;
  let sum=0,wsum=0;
  for(const r of REVIEW_RUBRIC){
    const v=Number(criteria[r.key]);
    if(!Number.isFinite(v))continue;             // 없는 항목(예: 레퍼런스 곡 없음)은 가중치에서 제외해 재정규화
    sum+=r.w*Math.min(10,Math.max(0,v))/10;wsum+=r.w;
  }
  return wsum>=60?Math.round(100*sum/wsum):null;   // 최소 6개 항목은 있어야 유효
}

// ============================================================
// 실제로 Suno에서 잘 나온 프롬프트(사용자 제공 예시 4개)에서 뽑은 패턴 — hh-examples.js 참고
// 스타일: 장르 융합 라벨 + 상업적 매력 어휘 / 헤더: 장르·에너지를 말해주는 이름 / 무보컬 벌스: 랩·멜로디가 들어올 자리
// ============================================================
// 첫 훅 헤더 — GENRES 순서와 1:1
const GENRE_HOOK_NAME=['Trap Drop','Dark Trap Drop','Melodic Trap Bounce','NY Drill Drop','UK Drill Drop','Phonk Drift Drop','Boom Bap Hook','Cloud Rap Hook','Lo-fi Hook','Jersey Bounce Drop','Rage Drop','Afro Trap Bounce','Conscious Hook','Trap Soul Hook','Hyperpop Bounce','Digicore Bounce','PluggNB Bounce','Westwood Hook','Metal Drop','Sexy Drill Drop'];
// 스타일의 장르 태그 = "{tag} meets {with} & {label}" — 예: "UK drill meets bronx drill & pop-drill" (GENRES 순서와 1:1)
const GENRE_FUSION=[['pop rap','radio-ready pop-trap'],['cinematic horror synths','dark pop-trap'],['sung r&b hooks','pop-trap crossover'],['UK drill','pop-drill'],['bronx drill','pop-drill'],['club bounce','mainstream phonk'],['soulful jazz samples','polished modern boom bap'],['dream pop','airy pop-cloud'],['jazzy chillhop','cozy polished beats'],['pop dance','club-pop bounce'],['hyperpop synths','pop-rage'],['afrobeats pop','afro-pop trap'],['neo-soul','warm polished neo-soul rap'],['smooth r&b','radio-ready r&b trap'],['club pop','commercial hyperpop'],['futuristic pop','pop-infused digicore'],['romantic r&b','trendy smooth r&b trap'],['funk-tinged alt-pop','left-field pop-rap'],['industrial metal','heavy crossover'],['pop r&b','glossy drill-pop']];
// 무드별 헤더 단어(energy=중간 훅 "Full X Energy", climax=마지막 훅, verse="Stripped & X")와 상업적 매력 어휘(lead=훅 리드 수식, style=스타일 태그에 융합) — HH_MOODS 순서와 1:1
const MOOD_HEADER=[
  {energy:'Dark',climax:'Maximum Menace',verse:'Cold'},{energy:'Smooth',climax:'Climax & Silky Space',verse:'Intimate'},
  {energy:'Melodic',climax:'Climax & Lush Space',verse:'Airy'},{energy:'Club',climax:'Maximum Bounce',verse:'Tight'},
  {energy:'Dreamy',climax:'Climax & Hazy Space',verse:'Hazy'},{energy:'Groovy',climax:'Peak Groove',verse:'Laid-back'},
  {energy:'Aggressive',climax:'Maximum Impact',verse:'Raw'},{energy:'Reflective',climax:'Climax & Quiet Weight',verse:'Spacious'},
  {energy:'Festival',climax:'Maximum Party',verse:'Bright'},{energy:'Anthemic',climax:'Triumphant Climax',verse:'Marching'},
  {energy:'Emotional',climax:'Climax & Heavy Space',verse:'Sparse'},{energy:'Swagger',climax:'Maximum Flex',verse:'Cocky'},
  {energy:'Romantic',climax:'Climax & Sweet Space',verse:'Tender'},{energy:'Tense',climax:'Maximum Tension',verse:'Coiled'},
  {energy:'Nostalgic',climax:'Climax & Warm Space',verse:'Wistful'},{energy:'Mystic',climax:'Climax & Hidden Space',verse:'Eerie'},
];
const MOOD_APPEAL=[
  {lead:'menacing hypnotic',style:'hard-hitting & hypnotic hook-driven melody & cinematic polish'},
  {lead:'seductive catchy',style:'sultry & silky & catchy understated hook'},
  {lead:'catchy emotional',style:'melodic & hook-driven & lush polished mix'},
  {lead:'catchy high-energy',style:'hyper-catchy & danceable & punchy polished mix'},
  {lead:'dreamy hypnotic',style:'dreamy & hypnotic & shimmering high-end'},
  {lead:'warm catchy',style:'laid-back & groovy & catchy smooth polished mix'},
  {lead:'aggressive memorable',style:'aggressive & hard-hitting & punchy raw mix'},
  {lead:'wistful memorable',style:'introspective & melodic & intimate clean mix'},
  {lead:'bright euphoric catchy',style:'euphoric & danceable & bright polished mix'},
  {lead:'triumphant anthemic',style:'triumphant & anthemic & big polished mix'},
  {lead:'mournful memorable',style:'melancholic & melodic & emotional clean mix'},
  {lead:'confident bouncy catchy',style:'confident swagger & bouncy & glossy punchy mix'},
  {lead:'sweet catchy',style:'sweet & romantic & glossy smooth mix'},
  {lead:'tense hypnotic',style:'tense & hypnotic & cold clean mix'},
  {lead:'nostalgic catchy',style:'nostalgic & warm & soft polished mix'},
  {lead:'eerie hypnotic',style:'mysterious & hypnotic & atmospheric polished mix'},
];
// 무보컬 벌스에 넣는 "랩/멜로디가 들어올 자리" — 'vocal' 단어는 무보컬 규칙(검사기)에 걸리니 쓰지 않음. 0=랩 자리, 1=멜로디 탑라인 자리, 2=리드 멜로디 자리
// 보컬 곡의 섹션별 "보컬 연출" — 창법·전달 방식을 섹션마다 달리해 곡에 극적인 아크를 줌 (규칙 초안용, AI 작성기는 같은 종류의 어휘를 스스로 고름)
// 키: 보컬 유형(sung=노래/후크 중심, rap=랩 중심, adlib=애드립 조각). 배열은 회차 순서(마지막 훅은 배열의 마지막 항목)
const VOCAL_DELIVERY={
  sung:{
    intro:['airy breathy first line'],
    verse:['intimate close-mic breathy delivery, soft restrained tone','more confident conversational phrasing with a slight rasp','tense clipped phrasing building pressure','fragile half-whispered phrasing'],
    hook:['belted full-voice chorus, soaring high notes, stacked harmonies','bigger layered harmonies with melismatic vocal runs on the title line','climactic powerful belt, final sustained high note and ad-libs'],
    outro:['whispered final line fading out'],
  },
  rap:{
    intro:['low spoken-word ad-lib tag'],
    verse:['confident punchy rap flow with tight internal rhymes','switched-up double-time rapid-fire flow','laid-back half-time flow with whispered menacing ad-libs','slow deliberate spoken-word rap'],
    hook:['catchy chanted melodic hook with gang vocal doubles','pitched sung-rap hook with stacked ad-libs','anthemic shouted hook, crowd-style gang vocals'],
    outro:['muttered ad-libs fading out'],
  },
  adlib:{
    intro:['single breathy ad-lib'],
    verse:['sparse breathy ad-libs, minimal vocal presence','short whispered fragments echoing in the gaps'],
    hook:['short catchy hook fragments with echoing ad-libs','layered ad-lib chants building','call-and-response ad-libs at full intensity'],
    outro:['faint whispered ad-lib echo'],
  },
};
const VOCAL_SLOT_KIND=[0,0,1,0,0,0,0,1,2,0,0,1,0,1,1,1,1,0,0,0];
const VOCAL_SLOT_TEXT=[['wide open pocket for rhythmic rap','leaving maximum space for the artist'],['perfect pocket for melodic rap flows','leaving space for a top-line melody'],['leaving space for a lead melody','open room for a topline']];

// ============================================================
// 일렉·클럽 계열 장르 — 힙합 파이프라인(AI 작성기)에 합류. 인덱스 20~31, family로 필터
// 세부 표(GENRE_AUTO 등)는 app.js의 extendGenreTables()가 가장 가까운 힙합 장르 값을 기본으로 채움(AI 작성 경로에서는 참고값일 뿐)
// ============================================================
GENRES.forEach(g=>{g.family='hiphop';});
const GENRE_FAMILIES=[['all','전체'],['hiphop','힙합'],['elec','일렉·클럽']];
GENRES.push(
  {kr:'하우스',en:'House',tag:'house',family:'elec',bpm:124,bpmR:[118,130],instr:['four-on-the-floor kick','offbeat hi-hats','warm bassline'],vocal:'sung topline or none',pts:['steady four-on-the-floor','groovy bassline','filtered chords'],sound:'groovy warm',energy:'mid-high',drum:'house drums'},
  {kr:'테크노',en:'Techno',tag:'techno',family:'elec',bpm:132,bpmR:[125,140],instr:['hard kick','rolling bass','industrial percussion'],vocal:'none',pts:['relentless kick','hypnotic loop','dark warehouse'],sound:'hypnotic driving',energy:'high',drum:'techno drums'},
  {kr:'UK 개러지',en:'UK Garage',tag:'uk garage',family:'elec',bpm:132,bpmR:[128,138],instr:['skippy 2-step drums','sub bass','chopped pads'],vocal:'sung or chopped',pts:['2-step shuffle','sub bass wobble','late-night'],sound:'skippy nocturnal',energy:'mid',drum:'2-step drums'},
  {kr:'드럼 앤 베이스',en:'Drum & Bass',tag:'drum and bass',family:'elec',bpm:174,bpmR:[168,180],instr:['fast breakbeat','reese bass','atmospheric pads'],vocal:'none or MC',pts:['rapid breakbeats','rolling reese bass','high energy'],sound:'fast rolling',energy:'intense',drum:'breakbeat drums'},
  {kr:'앰비언트',en:'Ambient',tag:'ambient',family:'elec',bpm:80,bpmR:[60,100],instr:['evolving pads','soft textures','minimal pulse'],vocal:'none',pts:['slow evolving pads','spacious','beatless or faint pulse'],sound:'spacious calm',energy:'low',drum:'minimal pulse'},
  {kr:'트랜스',en:'Trance',tag:'trance',family:'elec',bpm:138,bpmR:[132,144],instr:['supersaw lead','rolling bass','arpeggios'],vocal:'ethereal topline or none',pts:['long build-ups','euphoric supersaw','arpeggiated'],sound:'euphoric uplifting',energy:'high',drum:'trance drums'},
  {kr:'퓨처 베이스',en:'Future Bass',tag:'future bass',family:'elec',bpm:150,bpmR:[140,160],instr:['supersaw chords','vocal chops','half-time drums'],vocal:'chopped or sung',pts:['wobbly supersaw chords','bright drops','half-time'],sound:'bright emotional',energy:'high',drum:'half-time drums'},
  {kr:'멜로딕 테크노',en:'Melodic Techno',tag:'melodic techno',family:'elec',bpm:124,bpmR:[120,128],instr:['pulsing bass','arpeggio synth','cinematic pads'],vocal:'none',pts:['emotional arpeggios','driving pulse','cinematic'],sound:'dark emotional',energy:'mid-high',drum:'techno drums'},
  {kr:'아프로 하우스',en:'Afro House',tag:'afro house',family:'elec',bpm:122,bpmR:[118,126],instr:['percussion loops','deep bass','organic drums'],vocal:'chanted or none',pts:['tribal percussion','deep groove','warm and organic'],sound:'organic groovy',energy:'mid',drum:'afro percussion'},
  {kr:'IDM',en:'IDM',tag:'IDM',family:'elec',bpm:140,bpmR:[110,170],instr:['glitchy breaks','detailed textures','odd meters'],vocal:'none',pts:['intricate glitch drums','evolving textures','experimental'],sound:'intricate experimental',energy:'mid',drum:'glitch breaks'},
  {kr:'아마피아노',en:'Amapiano',tag:'amapiano',family:'elec',bpm:112,bpmR:[108,115],instr:['log drum bass','shakers','jazzy keys'],vocal:'sung or chanted',pts:['bouncy log drum','shaker groove','jazzy piano'],sound:'bouncy sunny',energy:'mid',drum:'amapiano drums'},
  {kr:'테크 하우스',en:'Tech House',tag:'tech house',family:'elec',bpm:126,bpmR:[122,130],instr:['punchy kick','rolling bass','percussive loops'],vocal:'vocal snippets or none',pts:['tight groove','percussive loops','club-ready'],sound:'tight club',energy:'mid-high',drum:'tech house drums'},
);
GENRE_FEEL.push(
  '규칙적인 "쿵-쿵-쿵-쿵" 킥 위에 따뜻하고 그루비한 베이스가 흐르는 클럽 음악. 몸이 자연스럽게 흔들리는 느낌',
  '끝없이 반복되는 무거운 킥과 어두운 창고 분위기. 최면에 걸린 듯 계속 빠져드는 느낌',
  '"타-타닥" 튀는 리듬에 묵직한 저음. 늦은 밤 도시 드라이브 같은 세련된 클럽 사운드',
  '엄청 빠른 브레이크비트에 굵은 베이스가 굴러가는 음악. 숨 가쁘게 달리는 에너지',
  '비트가 거의 없이 넓고 잔잔한 소리가 천천히 퍼지는 음악. 명상이나 집중할 때 어울리는 느낌',
  '길게 차오르다가 한 번에 터지는 화려한 신스. 벅차고 황홀한 클라이맥스가 있는 느낌',
  '반짝이고 출렁이는 신스 코드가 터지는 감성적인 EDM. 밝은데 살짝 아련한 느낌',
  '어둡고 감성적인 아르페지오가 규칙적인 펄스 위에 쌓이는 음악. 영화 같은 긴장감과 여운',
  '타악기 리듬이 살아 있는 따뜻하고 유기적인 하우스. 햇볕 아래 춤추는 듯한 느낌',
  '잘게 쪼개진 글리치 리듬과 정교한 소리 조각들. 실험적이고 복잡한 느낌',
  '통통 튀는 로그 드럼 베이스와 셰이커, 재즈풍 건반. 밝고 여유로운 파티 분위기',
  '탄탄하게 조여진 킥과 타악 루프로 이어지는 클럽용 하우스. 세련되고 절제된 그루브',
);
GENRE_HOOK_NAME.push('House Groove Drop','Techno Pulse Drop','Garage Skip Drop','Jungle Roll Drop','Ambient Bloom','Trance Lift Drop','Future Bass Drop','Melodic Techno Rise','Afro House Groove','IDM Glitch Drop','Amapiano Bounce','Tech House Groove');
GENRE_FUSION.push(['deep disco funk','club-pop house'],['industrial noise','dark warehouse techno'],['2-step garage','late-night club-pop'],['jungle breaks','rolling dnb'],['cinematic drones','spacious ambient'],['uplifting pop','euphoric trance'],['pop toplines','radiant future bass'],['cinematic synthwave','emotional melodic techno'],['tribal percussion','sunny afro house'],['glitch pop','playful idm'],['jazzy lounge','bouncy amapiano'],['minimal groove','polished tech house']);
// 무드 → 장르 가이드에 일렉 장르 추가 (20~31)
[['에너제틱·하입',[20,29,25,26]],['축제·환희',[25,26,28,30]],['사이키델릭·몽환',[24,27,21]],['칠·그루비',[20,28,30,31]],['긴장감·서스펜스',[21,27]],['어둡고 위압적',[21,23,27]],['감각적·관능적',[22,20]],['노스탤직·향수',[22,20]],['로맨틱·달콤한',[26,20]],['미스터리·신비',[24,27,21]],['멜로딕·감성',[26,27]],['자신감·플렉스',[31,22]],['분노·공격적',[23,21]],['내성적·사색',[24,27]],['슬프고·멜랑콜리',[24,26]],['승리감·웅장',[25,26]]]
  .forEach(([m,ids])=>{MOOD_GENRE_GUIDE[m]=[...(MOOD_GENRE_GUIDE[m]||[]),...ids.filter(i=>!(MOOD_GENRE_GUIDE[m]||[]).includes(i))];});
// 새 장르 → 표 기본값을 빌려 올 가장 가까운 힙합 장르(인덱스)
const GENRE_ALIAS={20:9,21:5,22:9,23:10,24:7,25:14,26:14,27:7,28:11,29:15,30:11,31:9};
// 보컬 옵션: 일렉·팝 계열은 랩이 아니라 노래하는 리드가 기본
HH_VOCAL.push('Sung lead vocal');

// ============================================================
// 팝·R&B 계열 — 인덱스 32~42. 훅=코러스로 취급(가사 헤더는 [Chorus]), 보컬 곡이 기본이라 선택 시 Sung lead vocal을 제안
// ============================================================
GENRES.push(
  {kr:'팝',en:'Pop',tag:'pop',family:'pop',bpm:110,bpmR:[95,128],instr:['catchy synth hooks','punchy drums','warm bass'],vocal:'sung lead',pts:['big singable chorus','bright hooks','polished'],sound:'bright catchy',energy:'mid-high',drum:'pop drums'},
  {kr:'R&B',en:'R&B',tag:'r&b',family:'pop',bpm:90,bpmR:[70,105],instr:['smooth keys','warm bass','laid-back drums'],vocal:'sung, smooth',pts:['smooth vocals','laid-back groove','sensual'],sound:'smooth sensual',energy:'low-mid',drum:'laid-back drums'},
  {kr:'댄스팝',en:'Dance Pop',tag:'dance pop',family:'pop',bpm:120,bpmR:[110,130],instr:['four-on-the-floor kick','synth bass','bright synths'],vocal:'sung, energetic',pts:['danceable groove','catchy chorus','glossy synths'],sound:'glossy danceable',energy:'high',drum:'dance drums'},
  {kr:'K-Pop',en:'K-Pop',tag:'k-pop',family:'pop',bpm:115,bpmR:[100,130],instr:['layered synths','tight drums','punchy bass'],vocal:'sung, layered harmonies',pts:['polished production','dynamic sections','catchy hooks'],sound:'polished layered',energy:'high',drum:'tight pop drums'},
  {kr:'인디팝',en:'Indie Pop',tag:'indie pop',family:'pop',bpm:105,bpmR:[90,125],instr:['jangly guitar','light drums','soft synths'],vocal:'sung, airy',pts:['light and airy','charming melody','lo-fi charm'],sound:'light charming',energy:'mid',drum:'light drums'},
  {kr:'드림팝',en:'Dream Pop',tag:'dream pop',family:'pop',bpm:95,bpmR:[75,115],instr:['reverb-soaked guitars','shimmering pads','soft drums'],vocal:'sung, ethereal',pts:['hazy reverb','ethereal vocals','floating'],sound:'hazy ethereal',energy:'low',drum:'soft drums'},
  {kr:'얼트 알앤비',en:'Alt R&B',tag:'alt r&b',family:'pop',bpm:85,bpmR:[65,100],instr:['moody pads','sparse drums','deep sub bass'],vocal:'sung, intimate',pts:['moody atmosphere','sparse groove','intimate vocals'],sound:'moody intimate',energy:'low',drum:'sparse drums'},
  {kr:'네오소울',en:'Neo Soul',tag:'neo soul',family:'pop',bpm:88,bpmR:[70,100],instr:['rhodes chords','live-feel drums','warm bass'],vocal:'sung, soulful',pts:['jazzy chords','soulful vocals','organic groove'],sound:'warm soulful',energy:'low-mid',drum:'live-feel drums'},
  {kr:'베드룸팝',en:'Bedroom Pop',tag:'bedroom pop',family:'pop',bpm:100,bpmR:[80,120],instr:['lo-fi guitar','soft synths','drum machine'],vocal:'sung, close and quiet',pts:['lo-fi intimacy','homemade feel','soft melody'],sound:'intimate lo-fi',energy:'low-mid',drum:'drum machine'},
  {kr:'신스팝',en:'Synthpop',tag:'synthpop',family:'pop',bpm:118,bpmR:[100,130],instr:['analog synths','gated drums','arpeggios'],vocal:'sung, bright',pts:['retro synths','catchy melody','driving beat'],sound:'retro bright',energy:'mid-high',drum:'gated drums'},
  {kr:'어쿠스틱 팝',en:'Acoustic Pop',tag:'acoustic pop',family:'pop',bpm:100,bpmR:[80,120],instr:['acoustic guitar','soft percussion','warm piano'],vocal:'sung, warm',pts:['warm acoustic','heartfelt melody','simple arrangement'],sound:'warm heartfelt',energy:'low-mid',drum:'soft percussion'},
);
GENRE_FAMILIES.splice(2,0,['pop','팝·R&B']);
GENRE_FEEL.push(
  '누구나 따라 부를 수 있는 큰 후렴과 반짝이는 신스. 라디오에서 흘러나오는 대중적이고 밝은 느낌',
  '부드럽고 관능적인 보컬과 여유로운 그루브. 늦은 밤 분위기의 매끄러운 느낌',
  '몸이 저절로 움직이는 4박자 킥과 화려한 신스. 파티 플레이리스트 같은 신나는 느낌',
  '여러 겹으로 쌓인 화음과 완성도 높은 편곡, 곡 안에서 확 바뀌는 전개. 화려하고 세련된 느낌',
  '가볍고 산뜻한 기타와 귀여운 멜로디. 소소하고 매력적인 느낌',
  '리버브 가득한 아련한 소리와 몽환적인 보컬. 구름 위를 떠다니는 느낌',
  '어둡고 은밀한 분위기에 성긴 비트와 깊은 베이스. 혼자 있는 밤 같은 친밀한 느낌',
  '재즈풍 코드와 영혼이 담긴 보컬, 사람이 연주하는 듯한 따뜻한 그루브',
  '집에서 혼자 녹음한 듯한 조용하고 친밀한 소리. 꾸밈없고 포근한 느낌',
  '80년대 감성의 반짝이는 신스와 또렷한 멜로디. 복고풍인데 세련된 느낌',
  '어쿠스틱 기타와 피아노 중심의 따뜻하고 진솔한 곡. 소박하고 마음에 와닿는 느낌',
);
GENRE_HOOK_NAME.push('Pop Chorus Lift','R&B Chorus Glow','Dance Pop Chorus','K-Pop Chorus Peak','Indie Pop Chorus','Dream Pop Bloom','Alt R&B Chorus','Neo Soul Chorus','Bedroom Pop Chorus','Synthpop Chorus','Acoustic Chorus');
GENRE_FUSION.push(['radio-ready synth hooks','mainstream pop'],['modern trap soul','smooth contemporary r&b'],['club house pulse','glossy dance pop'],['edm drops','polished k-pop'],['jangly bedroom guitars','charming indie pop'],['shoegaze washes','ethereal dream pop'],['dark trap textures','moody alt r&b'],['jazz chords','warm neo soul'],['lo-fi textures','intimate bedroom pop'],['80s new wave','glossy synthpop'],['folk warmth','heartfelt acoustic pop']);
[['로맨틱·달콤한',[33,32,40,42]],['감각적·관능적',[33,38,39]],['멜로딕·감성',[32,42,37]],['에너제틱·하입',[34,35,32]],['축제·환희',[34,35,36]],['사이키델릭·몽환',[37,38]],['칠·그루비',[39,33,40]],['슬프고·멜랑콜리',[38,42,37]],['노스탤직·향수',[41,39,36]],['내성적·사색',[40,42,37]]]
  .forEach(([m,ids])=>{MOOD_GENRE_GUIDE[m]=[...(MOOD_GENRE_GUIDE[m]||[]),...ids.filter(i=>!(MOOD_GENRE_GUIDE[m]||[]).includes(i))];});
Object.assign(GENRE_ALIAS,{32:14,33:13,34:9,35:14,36:8,37:7,38:16,39:13,40:8,41:14,42:8});

// 컨트리 팝(43) · J-Pop(44) — 팝·R&B 계열. J-Pop은 가사 일본어를, K-Pop은 한국어를 제안
GENRES.push(
  {kr:'컨트리 팝',en:'Country Pop',tag:'country pop',family:'pop',bpm:105,bpmR:[85,125],instr:['acoustic guitar','pedal steel','snappy drums','warm bass'],vocal:'sung, warm twang',pts:['storytelling chorus','acoustic guitar with polished pop drums','pedal steel accents'],sound:'warm anthemic',energy:'mid',drum:'live-feel country drums'},
  {kr:'J-Pop',en:'J-Pop',tag:'j-pop',family:'pop',bpm:135,bpmR:[110,170],instr:['bright synths','driving drums','melodic bass','piano'],vocal:'sung, bright and dynamic',pts:['dynamic melody','soaring chorus','energetic arrangement'],sound:'bright dynamic',energy:'high',drum:'driving pop-rock drums'},
);
GENRE_FEEL.push(
  '어쿠스틱 기타와 페달 스틸 소리에 대중적인 팝 후렴이 얹힌 곡. 이야기를 들려주는 듯 따뜻하고 시원하게 뻗는 느낌',
  '밝고 화려한 멜로디에 곡 중간에 분위기가 확 바뀌는 전개. 애니 오프닝처럼 감정이 벅차오르는 느낌',
);
GENRE_HOOK_NAME.push('Country Pop Chorus','J-Pop Chorus Lift');
GENRE_FUSION.push(['pedal steel and banjo textures','radio-ready country pop'],['city pop grooves','bright j-pop']);
[['노스탤직·향수',[43,44]],['로맨틱·달콤한',[43,44]],['칠·그루비',[43]],['축제·환희',[43,44]],['에너제틱·하입',[44]],['멜로딕·감성',[44,43]],['승리감·웅장',[44]]]
  .forEach(([m,ids])=>{MOOD_GENRE_GUIDE[m]=[...(MOOD_GENRE_GUIDE[m]||[]),...ids.filter(i=>!(MOOD_GENRE_GUIDE[m]||[]).includes(i))];});
Object.assign(GENRE_ALIAS,{43:8,44:14});
const GENRE_LYRIC_LANG={35:'한국어',44:'日本語'};
const GENRE_LYRIC_LANG_FIXED={44:'日本語'};   // J-Pop은 가사를 반드시 일본어로 — 바꿀 수 없음   // 장르를 고를 때 제안하는 가사 언어(직접 바꾸면 더는 제안하지 않음)

// 추가 장르는 끝에 붙여 기존 저장 기록의 장르 인덱스를 유지한다.
const RHYTHM_POP_PROFILES=[
  {kr:'라틴 팝',en:'Latin Pop',tag:'latin pop',bpm:100,bpmR:[85,120],drums:['Latin syncopated kick & snare','Shaker groove'],melody:['Nylon-string guitar','Bass guitar'],feel:'라틴 타악기와 엇박 리듬, 따뜻한 기타가 대중적인 후렴을 받치는 느낌',moods:['감각적·관능적','로맨틱·달콤한','축제·환희'],pop:['나일론 기타','라틴 리듬','베이스']},
  {kr:'레게톤',en:'Reggaeton',tag:'reggaeton',bpm:95,bpmR:[85,110],drums:['Dembow kick & snare','Shaker groove'],melody:['Arp pluck synth','Synth bass'],feel:'반복되는 뎀보 킥·스네어와 둥근 저음이 이끄는 관능적이고 탄력적인 댄스 리듬',moods:['감각적·관능적','자신감·플렉스','축제·환희'],pop:['신스','뎀보 리듬','베이스']},
  {kr:'댄스홀',en:'Dancehall',tag:'dancehall',bpm:100,bpmR:[85,115],drums:['Dancehall kick & rimshot','Shaker groove'],melody:['Electric guitar','Synth bass'],feel:'엇박 기타와 간결한 킥·림숏, 탄력적인 베이스 사이의 여백이 만드는 느긋한 바운스',moods:['칠·그루비','감각적·관능적','자신감·플렉스'],pop:['일렉 기타','댄스홀 리듬','베이스']},
  {kr:'아프로비츠',en:'Afrobeats',tag:'afrobeats',bpm:108,bpmR:[95,120],drums:['Afrobeats syncopated kick','Interlocking percussion'],melody:['Electric guitar','Marimba'],feel:'서로 맞물리는 퍼커션과 부드러운 기타, 엇박 베이스가 만드는 가볍고 유연한 그루브',moods:['칠·그루비','축제·환희','로맨틱·달콤한'],pop:['일렉 기타','아프로비츠 리듬','베이스']},
];
for(const p of RHYTHM_POP_PROFILES){
  p.index=GENRES.length;
  GENRES.push({kr:p.kr,en:p.en,tag:p.tag,family:'pop',bpm:p.bpm,bpmR:p.bpmR,instr:[...p.drums,...p.melody],vocal:'sung or rhythmic delivery',pts:[p.drums[0],'recognizable repeating groove','space between instrumental phrases'],sound:'rhythmic danceable',energy:'mid-high',drum:p.drums[0]});
  GENRE_FEEL.push(p.feel);GENRE_HOOK_NAME.push(p.en+' Groove');GENRE_FUSION.push([p.tag,p.tag+' groove']);
  p.moods.forEach(m=>MOOD_GENRE_GUIDE[m].push(p.index));
  for(const d of p.drums)if(!MENU_BY_FAMILY.pop.drums.includes(d))MENU_BY_FAMILY.pop.drums.push(d);
  POP_GENRES.push({kr:p.kr,tag:p.tag});
  POP_AUTO[p.tag]={mood:'업비트·댄서블',instruments:p.pop,vocalStyle:'팝 보컬',structure:'Standard',narr:{}};
}
Object.assign(POP_INSTR_SOUND,{'나일론 기타':'warm nylon-string guitar plucks','쿠아트로':'bright Puerto Rican cuatro picking','라틴 리듬':'syncopated Latin kick and snare with light percussion','뎀보 리듬':'repeating dembow kick and snare groove','댄스홀 리듬':'sparse dancehall kick and rimshot bounce','아프로비츠 리듬':'syncopated Afrobeats kick with interlocking percussion'});
for(const name of ['나일론 기타','쿠아트로','라틴 리듬','뎀보 리듬','댄스홀 리듬','아프로비츠 리듬'])POP_INSTR.push(name);
for(const [name,reg,hook] of [['Nylon-string guitar','mid','warm fingerpicked rhythmic motif'],['Puerto Rican cuatro','high','bright ringing picked response'],['Muted guitar','mid','short offbeat muted chord strokes']]){
  MENU_BY_FAMILY.pop.melody.push(name);
  NEW_MELODY[name]={role:'lead',reg,human:'subtle picking dynamics',art:{intro:'isolated picked motif',hook,verse:'sparse picked responses',bridge:'reduced motif with space between notes',outro:'return to the opening motif'}};
  MELODY_REGISTER[name]=reg;INSTR_HUMAN[name]='subtle picking dynamics';
}
setInstrumentMenus(null);

// 클럽 제작용 선택지. 실시간 인기 순위가 아니라 서로 다른 소리를 구분하는 팔레트.
const CLUB_PROFILES=[
  {tag:'electroclash',kr:'일렉트로클래시',en:'Electroclash',bpm:128,bpmR:[115,135],drums:['Four-on-the-floor kick','Dry drum-machine clap'],melody:['Distorted mono synth bass','Metallic synth stab'],texture:['Saturated bass / clean drums','Dry upfront club mix'],tone:'디스토티드·그릿',groove:'정박 킥·엇박 베이스',feel:'거칠고 짧은 신스 베이스 리프와 건조한 드럼. 차갑고 도발적인 작은 클럽 느낌'},
  {tag:'electro house',kr:'일렉트로 하우스',en:'Electro House',bpm:128,bpmR:[122,132],drums:['Four-on-the-floor kick','Clap on 2 & 4'],melody:['Distorted mono synth bass','Chord stabs'],texture:['Saturated bass / clean drums','Sidechain pump'],tone:'디스토티드·그릿',groove:'정박 킥·엇박 베이스',feel:'단단한 4박자 킥과 거친 베이스 리프가 주고받는 힘 있는 전자 클럽 사운드'},
  {tag:'bassline',kr:'베이스라인 / UK 베이스',en:'Bassline',bpm:138,bpmR:[130,145],drums:['Swung four-on-the-floor kick','Clap on 2 & 4'],melody:['Rubbery FM bass','Metallic synth stab'],texture:['Punchy mix','Dry upfront club mix'],tone:'브라이트·클린',groove:'살짝 스윙',feel:'통통 튀고 구부러지는 베이스가 멜로디 역할을 하는 빠르고 장난스러운 클럽 리듬'},
  {tag:'jungle',kr:'정글',en:'Jungle',bpm:165,bpmR:[155,175],drums:['Chopped jungle break','Ghost-note snares'],melody:['Reese bass','Chord stabs'],texture:['Vintage tape','Punchy mix'],tone:'빈티지·러프',groove:'브레이크비트·싱코페이션',feel:'잘게 잘라 재배치한 드럼 브레이크와 깊은 저음. 빠르지만 드럼 사이에 탄력과 여백이 있는 느낌'},
  {tag:'uk garage',melody:['Organ bass','Chord stabs'],drums:['Two-step garage shuffle','Crisp hi-hats'],texture:['Punchy mix','Dry upfront club mix'],tone:'웜·아날로그',groove:'살짝 스윙'},
  {tag:'afro house',melody:['Marimba','Synth bass'],drums:['Four-on-the-floor kick','Interlocking percussion'],texture:['Punchy mix','Stereo wide'],tone:'웜·아날로그',groove:'정박 킥·엇박 베이스'},
  {tag:'amapiano',melody:['Log drum bass','Rhodes keys'],drums:['Shaker groove','Rimshot snare'],texture:['Bass-heavy','Punchy mix'],tone:'웜·아날로그',groove:'레이드백 포켓'},
  {tag:'tech house',melody:['Rubbery FM bass','Metallic synth stab'],drums:['Four-on-the-floor kick','Offbeat open hats'],texture:['Dry upfront club mix','Punchy mix'],tone:'브라이트·클린',groove:'정박 킥·엇박 베이스'},
];
for(const p of CLUB_PROFILES){
  p.index=GENRES.findIndex(g=>g.tag===p.tag);
  if(p.index<0){
    p.index=GENRES.length;
    GENRES.push({kr:p.kr,en:p.en,tag:p.tag,family:'elec',bpm:p.bpm,bpmR:p.bpmR,instr:[...p.melody,...p.drums],vocal:'optional',pts:['recognizable repeating groove','interlocking instrumental phrases'],sound:p.tag+' club groove',energy:'high',drum:p.drums[0]});
    GENRE_FEEL.push(p.feel);GENRE_HOOK_NAME.push(p.en+' Groove');GENRE_FUSION.push([p.tag,p.tag+' groove']);
  }
  if(!ELEC_GENRES.some(g=>g.tag===p.tag))ELEC_GENRES.push({kr:GENRES[p.index].kr,tag:p.tag});
  for(const name of p.drums)if(!MENU_BY_FAMILY.elec.drums.includes(name))MENU_BY_FAMILY.elec.drums.push(name);
}
const CLUB_INSTRUMENTS={
  'Distorted mono synth bass':{kr:'디스토션 모노 베이스',reg:'low',role:'lead',hook:'short distorted bass riff with deliberate rests'},
  'Rubbery FM bass':{kr:'탄력적인 FM 베이스',reg:'low',role:'lead',hook:'elastic syncopated bass replies with short pitch bends'},
  'Organ bass':{kr:'오르간 베이스',reg:'low',role:'lead',hook:'rounded organ-bass pattern with bouncing offbeat notes'},
  'Log drum bass':{kr:'로그드럼 베이스',reg:'low',role:'lead',hook:'pitched log-drum bass answering the percussion gaps'},
  'Metallic synth stab':{kr:'메탈릭 신스 스탭',reg:'high',role:'background',hook:'short metallic accents only in the bass gaps'},
};
for(const [name,d] of Object.entries(CLUB_INSTRUMENTS)){
  for(const family of ['elec','pop'])MENU_BY_FAMILY[family].melody.push(name);
  NEW_MELODY[name]={role:d.role,reg:d.reg,human:'subtle accent variation without changing the rhythmic grid',art:{intro:'expose a fragment of the central pattern',hook:d.hook,verse:'keep the same pattern with fewer accents',bridge:'briefly strip back the pattern before its return',outro:'return to the stripped central pattern'}};
  MELODY_REGISTER[name]=d.reg;INSTR_HUMAN[name]=NEW_MELODY[name].human;
  ELEC_INSTR.push(d.kr);POP_INSTR.push(d.kr);POP_INSTR_SOUND[d.kr]=d.hook;
}
HH_TEXTURE.push('Saturated bass / clean drums','Dry upfront club mix');
for(const mood of [{kr:'차갑고·도발적',tag:'cold chic provocative'},{kr:'장난스럽고·탄력적',tag:'playful elastic bouncy'}]){
  HH_MOODS.push(mood);ELEC_MOODS.push(mood);POP_MOODS.push(mood);
  MOOD_GENRE_GUIDE[mood.kr]=CLUB_PROFILES.filter(p=>['electroclash','electro house','bassline','uk garage','tech house'].includes(p.tag)).map(p=>p.index);
}
setInstrumentMenus(null);

MOOD_HEADER.push({energy:'Cool',climax:'Cool Groove Return',verse:'Dry'},{energy:'Bouncy',climax:'Playful Groove Return',verse:'Light'});
MOOD_APPEAL.push({lead:'cool rhythmic',style:'cold confident club groove'},{lead:'playful rhythmic',style:'elastic playful bounce'});

// 밴드·록도 결과물 중심의 두 제작 화면에서 고를 수 있게 기존 인덱스 뒤에 합류한다.
MENU_BY_FAMILY.rock={drums:['Live pop drum kit','Half-time snare','Ghost-note snares','Brushed drums'],melody:['Electric guitar','Acoustic guitar','Bass guitar','Organ','Emotional piano','Strings','Ambient pad']};
const ROCK_SOUNDS={
  'indie rock':['jangly guitar riffs','light live drums','가벼운 기타 리프와 생드럼의 소박한 밴드 사운드'],
  'post-punk':['angular muted guitar','driving live drums','각진 기타와 반복 베이스가 만드는 차갑고 긴장된 그루브'],
  shoegaze:['layered reverb guitars','steady live drums','겹겹이 번지는 기타와 흐릿한 공간감의 몽환적인 사운드'],
  emo:['dynamic distorted guitar','driving live drums','조용한 구간과 거친 기타가 대비되는 감정적인 밴드 사운드'],
  'math rock':['interlocking tapped guitar','syncopated live drums','엇갈리는 기타 패턴과 복잡한 리듬이 맞물리는 연주'],
  'alternative rock':['distorted guitar riffs','punchy live drums','뚜렷한 기타 리프와 힘 있는 생드럼 중심의 록'],
  'post-rock':['evolving guitar textures','gradually building live drums','반복하는 기타 모티프를 천천히 쌓아 올리는 긴 전개'],
};
for(const g of ROCK_GENRES){
  if(GENRES.some(x=>x.tag===g.tag))continue;
  const [guitar,drum,feel]=ROCK_SOUNDS[g.tag];
  GENRES.push({...g,en:g.tag,family:'rock',bpm:110,bpmR:[70,170],instr:[guitar,'electric bass',drum],vocal:'optional',pts:[guitar,'dynamic band arrangement'],sound:feel,energy:'mid-high',drum});
  GENRE_FEEL.push(feel);GENRE_HOOK_NAME.push('Band Peak');GENRE_FUSION.push([g.tag,g.tag+' band arrangement']);
}
for(const g of GENRES)if(!POP_GENRES.some(p=>p.tag===g.tag))POP_GENRES.push({kr:g.kr,tag:g.tag});
for(const m of HH_MOODS)if(!POP_MOODS.some(p=>p.kr===m.kr))POP_MOODS.push(m);
POP_VOCAL_STYLES.push({kr:'리듬 중심 랩',tag:'rhythmic rap'},{kr:'멜로딕 랩',tag:'melodic rap'},{kr:'록 보컬',tag:'rock vocals'},{kr:'절제된 토크싱',tag:'restrained rhythmic talk-singing'});
Object.assign(POP_INSTR_SOUND,{'드럼 머신':'dry electronic drum machine','디스토션 기타':'distorted electric guitar riffs','생드럼':'dynamic live drum kit','808 베이스':'controlled 808 bass','하이햇':'crisp hi-hats','샘플':'chopped instrumental samples'});
for(const [k,v] of Object.entries(MENU_BY_FAMILY))for(const name of v.melody)if(!POP_INSTR_SOUND[name])POP_INSTR_SOUND[name]=name;
setInstrumentMenus(null);
