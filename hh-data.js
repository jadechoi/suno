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
  {kr:'플럭gnb',en:'Pluck & B',tag:'pluggnb',bpm:72,bpmR:[65,80],instr:['melodic pluck','slow 808','ghostly pad'],vocal:'melodic ad-libs/hum',pts:['slow hypnotic pluck melody','ultra slow tempo','ghostly atmospheric'],sound:'hypnotic slow',energy:'low',drum:'minimal slow drums'},
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
  {name:'UK Garage',genre:4,bpm:132,key:2,color:'#06B6D4'},
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
const HH_DRUMS=['Sub-bass punch','Crisp hi-hats','Rolling triplets','Trap rolls','Boom Bap kick','Glitchy breaks','Four-on-the-floor kick','Jersey bounce kick','Afro log drum','Memphis cowbell chop','Live jazz drums'];
const HH_MELODY=['Dark synth','Emotional piano','Guitar loop','Sample chop','Ambient pad','Brass stab','Strings','Psychedelic FX','Rhodes keys','Saxophone','Supersaw synth','Flute','Harp','Music box','Organ','Vibraphone','Kalimba','Arp pluck synth','Cello','Sitar','Vocoder synth'];
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
const HH_STRUCT_PRESETS=[
  {name:'Standard',segs:['intro','hook','verse','bridge','hook','verse','bridge','hook','outro']},
  {name:'Hook Heavy',segs:['intro','hook','verse','hook','verse','hook','outro']},
  {name:'Minimal',segs:['intro','hook','verse','hook','outro']},
  {name:'Extended',segs:['intro','hook','verse','bridge','hook','verse','bridge','hook','verse','bridge','hook','outro']},
];
const HH_SEG_PALETTE=['intro','hook','verse','bridge','outro'];
// 장르별 구조 프리셋 자동 추천 (HH_STRUCT_PRESETS.name 참조) — 훅 반복이 잦은 장르는 Hook Heavy, 루프 중심 장르는 Minimal 등
const GENRE_STRUCTURE={
  0:'Hook Heavy',1:'Hook Heavy',2:'Standard',3:'Hook Heavy',4:'Hook Heavy',
  5:'Minimal',6:'Minimal',7:'Minimal',8:'Minimal',9:'Hook Heavy',
  10:'Minimal',11:'Standard',12:'Standard',13:'Standard',14:'Extended',
  15:'Hook Heavy',16:'Minimal',17:'Standard',
  18:'Hook Heavy',19:'Minimal',
};
const MOOD_STRUCTURE={
  '어둡고 위압적':['Hook Heavy'],'감각적·관능적':['Standard'],'멜로딕·감성':['Standard'],
  '에너제틱·하입':['Hook Heavy'],'사이키델릭·몽환':['Minimal'],'칠·그루비':['Minimal'],
  '분노·공격적':['Hook Heavy'],'내성적·사색':['Minimal'],'축제·환희':['Hook Heavy'],
  '승리감·웅장':['Extended'],'슬프고·멜랑콜리':['Standard'],'자신감·플렉스':['Hook Heavy'],
  '로맨틱·달콤한':['Standard'],'긴장감·서스펜스':['Extended'],'노스탤직·향수':['Standard'],
  '미스터리·신비':['Minimal'],
};

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

