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
];

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
const HH_DRUMS=['Sub-bass punch','Crisp hi-hats','Rolling triplets','Trap rolls','Boom Bap kick','Glitchy breaks'];
const HH_MELODY=['Dark synth','Emotional piano','Guitar loop','Sample chop','Ambient pad','Brass stab','Strings','Psychedelic FX'];
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
];
const HH_TEXTURE=['Lo-fi grain','Vintage tape','Pristine digital','Heavy reverb','Dry intimate','Sidechain pump','Stereo wide','Bass-heavy'];
const HH_ERA=['90s','2000s','2010s','2020s','Timeless'];
const HH_REGION=['Atlanta','New York','LA','UK','Seoul','Miami','Chicago'];
const HH_DENSITY=['Minimalist','Sparse','Balanced','Dense','Maximalist'];
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
};
const HH_NARR=[
  {label:'인트로',icon:'⚡',opts:['콜드 오프닝·임팩트','서서히 빌드업','미니멀 비트 인트로','아카펠라 오프닝','직접적 그루브 시작']},
  {label:'버스/훅',icon:'🎤',opts:['반복 훅 강조','버스 집중형','콜&리스폰스','레이어드 훅','임프로바이제이션']},
  {label:'클라이맥스/드롭',icon:'💥',opts:['풀 드롭·모든 요소 등장','서서히 에너지 증폭','갑작스러운 전환','미니멀 드롭','리프레인 반복']},
  {label:'아웃트로',icon:'🔚',opts:['페이드 아웃','갑작스러운 컷','콜다 마무리','루프 반복 종료','리버스 인트로']},
];
const HH_STRUCT_PRESETS=[
  {name:'Standard',segs:['intro','hook','verse','bridge','hook','verse','bridge','hook','outro']},
  {name:'Hook Heavy',segs:['intro','hook','verse','hook','verse','hook','outro']},
  {name:'Minimal',segs:['intro','hook','verse','hook','outro']},
  {name:'Extended',segs:['intro','hook','verse','bridge','hook','verse','bridge','hook','verse','bridge','hook','outro']},
];
const HH_SEG_PALETTE=['intro','hook','verse','bridge','outro'];

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

// ============================================================
// STATE
// ============================================================
const st={
  genre:null,key:7,bpm:140,
  _808:'Balanced',drums:[],melody:[],mood:null,vocal:'No Vocal',
  refs:[],texture:[],era:null,region:null,density:null,length:null,
  narrSt:{},structSegs:['intro','hook','verse','hook','outro'],structIdx:null,
  extraTags:[],transitionFx:[],melodyLeadIdx:0,groove:null,
  _appliedAdvTipGenre:null,_appliedArrangeTipGenre:null,sectionArrangeExtras:{},refAf:null,
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
      st.genre=p.genre;st.bpm=p.bpm;st.key=p.key;
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

  renderHhGenres();
  chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,null);
  chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,null);
  chipGrid(document.getElementById('hh-melody'),HH_MELODY,st,'melody',2,renderMelodyRoleUI);
  renderMelodyRoleUI();
  moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',null);
  chipGrid(document.getElementById('hh-vocal'),HH_VOCAL,st,'vocal',1,null);
  renderProducerRef();
  chipGrid(document.getElementById('hh-texture'),HH_TEXTURE,st,'texture',2,null);
  chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,null);
  chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,null);
  chipGrid(document.getElementById('hh-era'),HH_ERA,st,'era',1,null);
  chipGrid(document.getElementById('hh-region'),HH_REGION,st,'region',1,null);
  chipGrid(document.getElementById('hh-density'),HH_DENSITY,st,'density',1,null);
  chipGrid(document.getElementById('hh-length'),HH_LENGTH,st,'length',1,null);
  renderArtists('hh-artists-typeBeat',HH_ARTISTS,'hh');
  renderHhNarr();
  renderStructBuilder('hh',HH_STRUCT_PRESETS,HH_SEG_PALETTE,st);
  renderPromptHistory();
}

// 장르별 레퍼런스 곡 추천 (인덱스 = GENRES 인덱스)
// ⚠️ UPDATE NOTE: HH_ARTISTS 업데이트 시 이 배열도 함께 갱신 (각 장르 핫 곡 5개)
const HH_GENRE_SONGS=[
  ['Travis Scott - FE!N','Future & Metro Boomin - We Still Don\'t Trust You','Drake - Rich Flex','21 Savage - redrum','Gunna - fukumean'],          // 0 Trap
  ['Travis Scott - SICKO MODE','Drake - Knife Talk','Playboi Carti - Vamp Anthem','Lil Durk - All My Life','Fredo Bang - Slide'],                    // 1 Dark Trap
  ['Rod Wave - Tombstone','Don Toliver - No Idea','Polo G - Hall of Fame','Drake - Rich Baby Daddy','Lil Uzi Vert - Just Wanna Rock'],               // 2 Melodic Trap
  ['Ice Spice - Munch','Pop Smoke - Welcome to the Party','Fivio Foreign - Big Drip','Lil TJay - Calling My Phone','Coi Leray - Players'],          // 3 NY Drill
  ['Central Cee - Doja','Dave - Sprinter','Headie One - Ain\'t It Different','Digga D - Chinaman','Unknown T - Jungle'],                             // 4 UK Drill
  ['Kordhell - Murder In My Mind','SHADXWBXRN - VILLAIN','Ghostemane - Mercury','Night Lovell - Dark Light','$uicideboy$ - Paris'],                  // 5 Phonk
  ['Kendrick Lamar - Not Like Us','J. Cole - No Role Modelz','Drake - Fear','J.I.D - Surround Sound','Little Simz - Gorilla'],                      // 6 Boom Bap
  ['Lil Uzi Vert - XO Tour Llif3','Don Toliver - After Party','Trippie Redd - Miss The Rage','Juice WRLD - Lucid Dreams','Carti - Magnolia'],        // 7 Cloud Rap
  ['Joji - Glimpse of Us','Keshi - Right Here','Powfu - death bed','Still Woozy - Goodie Bag','Rex Orange County - Loving is Easy'],                // 8 Lo-fi
  ['Ice Spice - In Ha Mood','Ken Carson - A Great Chaos','Destroy Lonely - BANE','Flo Milli - Conceited','BIA - WHOLE LOTTA MONEY'],                // 9 Jersey Club
  ['Playboi Carti - Sky','Ken Carson - ikon','Destroy Lonely - BANE','Yeat - Rich Minion','Summrs - Outside'],                                       // 10 Rage/Plugg
  ['Burna Boy - Last Last','Rema & Selena Gomez - Calm Down','WizKid - Essence ft. Tems','Asake - Organise','Davido - UNAVAILABLE'],                 // 11 Afrotrap
  ['Kendrick Lamar - euphoria','J. Cole - Middle Child','Cordae - The Parables','Lil Baby - The Bigger Picture','Noname - Song 33'],                 // 12 Conscious
  ['Summer Walker - No Love','SZA - Shirt','Kehlani - Nights Like This','The Weeknd - Sacrifice','Don Toliver - Tore Up'],                           // 13 Trap Soul
  ['Charli XCX - 360','Ericdoa - Fool Around','glaive - 1984','100 gecs - Hand Crushed by a Mallet','Jane Remover - Haunted'],                      // 14 Hyperpop
  ['glaive - astrid','midwxst - no effort','Ericdoa - nostalgia shit','Lil Tracy - Like a Glock','bbno$ - edamame'],                                 // 15 Digicore
  ['Summrs - Right Now','Homixide Gang - 2am','Autumn! - Wasted','Lil Seeto - Closer','Destroy Lonely - Bane (Slowed)'],                            // 16 Pluggnb
  ['Tyler the Creator - EARFQUAKE','Earl Sweatshirt - Grief','Brockhampton - SUGAR','Injury Reserve - Knees','Frank Ocean - Ivy'],                   // 17 Westwood
];

// 장르별 808·드럼 자동 추천 (프로덕션 가이드 리서치 기반)
// Sources: emastered.com, attackmagazine.com, beatkey.app, melodigging.com, orphiq.com, routenote, wikipedia/phonk/plugg
const GENRE_AUTO=[
  {a808:'Heavy',    aDrums:['Trap rolls','Crisp hi-hats'],           fx:['임팩트/크래시','라이저'],       groove:'타이트 그리드'}, // 0 Trap      — hi-hats "most defining feature", 808 heavy support (emastered)
  {a808:'Dominant', aDrums:['Trap rolls','Sub-bass punch'],          fx:['리버스 심벌','순간 정적'],       groove:'타이트 그리드'}, // 1 Dark Trap  — distorted dominant 808, dense trap rolls
  {a808:'Balanced', aDrums:['Trap rolls','Crisp hi-hats'],           fx:['라이저','필터 스윕다운'],        groove:'살짝 스윙'},    // 2 Melodic Trap — softer trap pattern, emotional focus
  {a808:'Heavy',    aDrums:['Rolling triplets','Crisp hi-hats'],     fx:['순간 정적','필터 스윕다운'],     groove:'타이트 그리드'}, // 3 NY Drill  — hard-hitting, sliding 808, rolling hi-hat triplets
  {a808:'Heavy',    aDrums:['Rolling triplets','Crisp hi-hats'],     fx:['스네어 롤','임팩트/크래시'],     groove:'타이트 그리드'}, // 4 UK Drill  — "sharper hi-hat triplets", sliding 808 basslines (attackmagazine)
  {a808:'Heavy',    aDrums:['Boom Bap kick','Sub-bass punch'],       fx:['테이프 스탑','필터 스윕다운'],   groove:'헤비 스윙'},    // 5 Phonk     — TR-808 cowbell+boom bap roots, distorted 808 (wikipedia)
  {a808:'Minimal',  aDrums:['Boom Bap kick','Crisp hi-hats'],        fx:['테이프 스탑','스네어 롤'],       groove:'헤비 스윙'},    // 6 Boom Bap  — "swung drums off the grid", sampled breakbeats, no 808 (orphiq)
  {a808:'Balanced', aDrums:['Crisp hi-hats'],                        fx:['화이트노이즈 스윕','순간 정적'], groove:'살짝 스윙'},    // 7 Cloud Rap — "808s present but not overpowering", minimal drums (routenote)
  {a808:'Minimal',  aDrums:['Boom Bap kick'],                        fx:['테이프 스탑','순간 정적'],       groove:'레이드백 포켓'}, // 8 Lo-fi     — warm analog, dusty boom bap drums, minimal bass
  {a808:'Balanced', aDrums:['Rolling triplets','Crisp hi-hats'],     fx:['임팩트/크래시','스네어 롤'],     groove:'푸시드 포켓'},  // 9 Jersey Club — syncopated ghost kicks + eighth-note hats, sidechained 808 (beatkey)
  {a808:'Dominant', aDrums:['Trap rolls','Glitchy breaks'],          fx:['필터 스윕다운','임팩트/크래시'], groove:'타이트 그리드'}, // 10 Rage/Plugg — "heavy distorted sliding 808", 1/16–1/32 hi-hat rolls (melodigging)
  {a808:'Balanced', aDrums:['Rolling triplets','Crisp hi-hats'],     fx:['스네어 롤','임팩트/크래시'],     groove:'살짝 스윙'},    // 11 Afrotrap  — afro rolling percussion, balanced bass
  {a808:'None',     aDrums:['Boom Bap kick','Crisp hi-hats'],        fx:['순간 정적','테이프 스탑'],       groove:'헤비 스윙'},    // 12 Conscious — organic soulful samples, no 808 (orphiq)
  {a808:'Heavy',    aDrums:['Sub-bass punch','Crisp hi-hats'],       fx:['필터 스윕다운','라이저'],        groove:'레이드백 포켓'}, // 13 Trap Soul — "808 IS the melody", sparse slow 8th hi-hats (beatkey)
  {a808:'Heavy',    aDrums:['Glitchy breaks','Rolling triplets'],    fx:['화이트노이즈 스윕','임팩트/크래시'], groove:'타이트 그리드'}, // 14 Hyperpop  — four-on-floor kick + glitchy chaotic elements
  {a808:'Balanced', aDrums:['Glitchy breaks','Crisp hi-hats'],       fx:['화이트노이즈 스윕','순간 정적'], groove:'타이트 그리드'}, // 15 Digicore  — bedroom digital aesthetic, lo-fi glitch texture
  {a808:'Dominant', aDrums:['Sub-bass punch'],                       fx:['필터 스윕다운','순간 정적'],     groove:'살짝 스윙'},    // 16 Pluggnb   — Zaytoven: "808 bumping, everything else is just extra" (wikipedia)
  {a808:'Minimal',  aDrums:['Boom Bap kick','Crisp hi-hats'],        fx:['테이프 스탑','스네어 롤'],       groove:'헤비 스윙'},    // 17 Westwood  — jazz-influenced live drums, quirky organic feel
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
];

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
    el.onclick=()=>selectGenre(i);
    container.appendChild(el);
  });
}

function selectGenre(i){
  const deselect=st.genre===i;
  st.genre=deselect?null:i;
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
      chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,null);
      chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,null);
      chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,null);
      chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,null);
      setAutoHint('hh-808-hint','808: '+auto.a808);
      setAutoHint('hh-drums-hint',auto.aDrums.join(', '));
      setAutoHint('hh-fx-hint',auto.fx.join(', '));
      setAutoHint('hh-groove-hint',auto.groove);
    }
  } else {
    _grsToken++;// 진행 중이던 실시간 인기곡 요청 무효화
    const sg=document.getElementById('hh-ref-suggestions');
    if(sg)sg.innerHTML='';
    clearAutoHint('hh-808-hint');
    clearAutoHint('hh-drums-hint');
    clearAutoHint('hh-fx-hint');
    clearAutoHint('hh-groove-hint');
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

// 장르명으로 트랙 검색하면 "DARK TRAP 2016" 같은 컴필레이션/비트팩만 잡히고 popularity도 안 내려옴(실측 확인).
// 대신 HH_GENRE_SONGS에 큐레이션된 "대표 아티스트"들을 실제로 검색해서 그들의 최신곡을 라이브로 가져온다
// (트렌딩 아티스트에서 검증된 이름검색→Musicae top-tracks 파이프라인 재사용, 1 아티스트 = 1곡으로 5명분)
async function fetchGenreHotTracks(genreIdx){
  const tok=await getSpotifyToken();
  if(!tok)return null;
  const seedNames=(HH_GENRE_SONGS[genreIdx]||[]).map(s=>s.split(' - ')[0].trim()).filter(Boolean);
  if(!seedNames.length)return null;
  try{
    const resolved=(await Promise.all(seedNames.map(n=>resolveArtistIdByName(n,tok)))).filter(Boolean);
    if(!resolved.length)return[];
    const withTrack=await Promise.all(resolved.map(async a=>{
      const tracks=await fetchArtistTopTracksRaw(a.id);
      return tracks[0]?{id:tracks[0].id,name:tracks[0].name,artist:a.name}:null;
    }));
    return withTrack.filter(Boolean).slice(0,5);
  }catch(e){console.warn('fetchGenreHotTracks error',e);return null;}
}

let _grsToken=0;
async function renderGenreRefSuggestions(genreIdx){
  const sg=document.getElementById('hh-ref-suggestions');
  if(!sg)return;
  const myToken=++_grsToken;
  sg.innerHTML='<div style="width:100%;font-size:10px;color:var(--text-3)">🔥 실시간 인기곡 불러오는 중…</div>';

  const tracks=await fetchGenreHotTracks(genreIdx);
  if(myToken!==_grsToken)return;// 그 사이 다른 장르를 클릭했으면 버림

  sg.innerHTML='';
  const label=document.createElement('div');
  label.style.cssText='width:100%;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--text-3);margin-bottom:2px';
  sg.appendChild(label);

  if(tracks&&tracks.length){
    label.textContent='🔥 대표 아티스트 최신곡 · 클릭 시 Key·BPM·무드 자동 적용';
    tracks.forEach(t=>{
      sg.appendChild(suggestionChip(`${t.artist} - ${t.name}`,()=>applySpotifyTrack(t.id,`${t.artist} - ${t.name}`)));
    });
  } else {
    label.textContent='추천 레퍼런스 곡'+(tracks===null?' (Spotify 미연결 — 참고용)':'');
    (HH_GENRE_SONGS[genreIdx]||[]).forEach(song=>{
      sg.appendChild(suggestionChip(song,e=>{
        const btn=e.currentTarget;
        const refEl=document.getElementById('hh-ref-song');
        if(refEl)refEl.value=song;
        sg.querySelectorAll('button').forEach(b=>{b.style.background='var(--surface-3)';b.style.borderColor='var(--border)';});
        btn.style.background='var(--accent-dim)';
        btn.style.borderColor='var(--accent)';
        btn.style.color='var(--accent-text)';
      }));
    });
  }
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

function renderProducerRef(){
  const container=document.getElementById('hh-ref');
  if(!container)return;
  container.innerHTML='';
  container.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px';
  HH_REF.forEach(p=>{
    const selected=st.refs.includes(p.kr);
    const el=document.createElement('div');
    el.style.cssText=`background:${selected?'rgba(157,78,221,.18)':'var(--surface-2)'};border:1px solid ${selected?'var(--accent)':'var(--border)'};border-radius:var(--r);padding:10px 12px;cursor:pointer;transition:.15s`;
    el.innerHTML=`<div style="font-size:13px;font-weight:600;color:${selected?'var(--accent-text)':'var(--text-1)'};margin-bottom:4px">${p.kr}</div><div style="font-size:11px;color:var(--text-2);margin-bottom:3px">${p.vibes}</div><div style="font-size:10px;color:var(--text-3)">${p.artists}</div>`;
    el.onclick=()=>{
      if(st.refs.includes(p.kr)){st.refs=st.refs.filter(x=>x!==p.kr);}
      else if(st.refs.length<2){st.refs.push(p.kr);}
      else{st.refs.shift();st.refs.push(p.kr);}
      renderProducerRef();
    };
    container.appendChild(el);
  });
}

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
      chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,null);
      chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,null);
      chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,null);
      chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,null);
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
      btn.onclick=()=>{
        state.structSegs=[...p.segs];state.structIdx=i;
        presetsEl.querySelectorAll('.struct-preset-btn').forEach((b,bi)=>b.classList.toggle('active',bi===i));
        renderSeq(prefix,state,seqEl);
      };
      if(state.structIdx===i)btn.classList.add('active');
      presetsEl.appendChild(btn);
    });
  }

  if(palEl){
    palEl.innerHTML='';
    palette.forEach(seg=>{
      const btn=document.createElement('button');
      btn.className='struct-seg-btn';
      btn.textContent=seg;
      btn.onclick=()=>{state.structSegs.push(seg);state.structIdx=null;if(presetsEl)presetsEl.querySelectorAll('.struct-preset-btn').forEach(b=>b.classList.remove('active'));renderSeq(prefix,state,seqEl);};
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
}

function removeStructSeg(prefix,idx){
  const stRef=prefix==='hh'?st:VTS[prefix];
  stRef.structSegs.splice(idx,1);
  stRef.structIdx=null;
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
  const intHook=boomLvl>=3
    ?'all layers hitting from bar 1 — instant drop, no build'
    :boomLvl<=1
    ?'layers entering one by one over first 4 bars, slow build into drop'
    :'drop at bar 3 after 2-bar setup, mid-intensity entry';
  // Verse contrast: high 808 means hook was massive → verse needs dramatic strip-down
  const intVerse=boomLvl>=3
    ?'strip to skeleton — kick and hi-hat only, 808 pulled back, wide empty space for contrast'
    :boomLvl<=1
    ?'verse stays airy, no heavy bass, just rhythmic texture bed'
    :'verse pulls 808 back by half, lighter drum hit, spacious clean pocket';
  // BPM-based timing advice
  const loopWord=slowBpm
    ?'slow hypnotic loop, let notes ring long, wide reverb tail'
    :fastBpm
    ?'tight short loop, fast attack drums, aggressive forward momentum'
    :'medium rolling groove, steady rhythmic drive';
  // Tone: read from hookEng (already derived from mood)
  const toneWord=hookEng.includes('dark')||hookEng.includes('aggressive')||hookEng.includes('hard')
    ?'dark brooding tone maintained throughout, no brightness'
    :hookEng.includes('melodic')||hookEng.includes('soulful')||hookEng.includes('conscious')
    ?'warm melodic tone, emotional resonance forward'
    :'neutral energetic tone, consistent intensity';
  // genre-specific templates — interpolate song descriptors + ref audio feature modifiers
  const map={
    0:{hook:`${eDesc} ${intHook}, ${dDesc} at peak, ${toneWord}`,
       verse:`${eDesc} stripped back, ${dDesc} lighter pattern, ${intVerse}`,
       bridge:`${dDesc} dropping out, ${toneWord}, tension building into next drop`},
    1:{hook:`dense ${eDesc} wall, ${mDesc} atmospheric layers ${intHook}, dramatic dark drop`,
       verse:`ultra sparse — single ${dDesc} hit, ghostly ${mDesc} bed only, ${intVerse}`,
       bridge:`dark ${mDesc} swell rising, eerie reverb, ${toneWord}`},
    2:{hook:`${mDesc} lead melody dominant, ${hookEng} emotional drop, ${intHook}`,
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
    9:{hook:`${dDesc} syncopated bounce ${intHook}, chopped vocal chops cutting through, ${loopWord}`,
       verse:`${dDesc} pattern thinned, vocal chops pulled back, ${mDesc} light bed, ${intVerse}`,
       bridge:`${dDesc} pattern stuttering, chopped vocal echo fading, ${toneWord}, tension before drop`},
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
  const eDesc=(eightOh&&eightOh!=='None')?eightOh+' 808 bass':'booming 808 bass';
  const dDesc=drums?drums.split(',')[0].trim():'crisp trap drums';
  const grooveTag=GROOVE_TAG[st.groove]||'consistent rhythmic pocket';
  const mDesc=(melody&&melody.length)?melody.join(', '):'dark synthesizers';

  const hookSubMap=['Dark Drop','Melodic Chorus','Hard Drop','Conscious Peak','Hype Drop','Chill Peak','Cinematic Drop','Soulful Chorus','Euphoric Anthem','Triumphant Peak'];
  const hookEngMap=['dark explosive','melodic euphoric','aggressive hard','conscious peak','maximum hype','smooth peak','cinematic climax','soulful peak','euphoric explosive','triumphant anthemic'];
  const verseSubMap=['Grimy Pocket','Melodic Pocket','Hard Pocket','Deep Pocket','Energetic Verse','Chill Pocket','Cinematic Build','Conscious Flow','Building Hype','Rising Anthem'];
  const hookSub=moodIdx>=0?hookSubMap[moodIdx%hookSubMap.length]:'Euphoric Drop';
  const hookEng=moodIdx>=0?hookEngMap[moodIdx%hookEngMap.length]:'euphoric';
  const verseSub=moodIdx>=0?verseSubMap[moodIdx%verseSubMap.length]:'Stripped Pocket';

  const cnt={hook:0,verse:0,bridge:0};
  const totalHooks=segs.filter(s=>s==='hook').length;
  const totalBridges=segs.filter(s=>s==='bridge').length;
  const sAE=st.sectionArrangeExtras||{};
  const _ctx={eDesc,dDesc,mDesc,hookEng,bpmNum};
  const lines=[];

  // 멜로디 악기명은 처음 2번(Intro·첫 Hook)만 명시하고, 이후엔 "같은 악기" 콜백으로 순환 — 섹션마다 문구 그대로 반복되는 것 방지
  // 멜로디 2개 선택 시 맨 처음 등장은 리드/배경 역할까지 명시해서 입체감 부여
  const melodyRoles=computeMelodyRoles(melody);
  const mDescFull=melodyRoles?`${melodyRoles.lead} lead melody, ${melodyRoles.bg} layered softly beneath`:mDesc;
  const mDescCallbacks=['matching synth layers','consistent instrumentation','the same tonal palette'];
  let mDescUses=0;
  const melodyRef=()=>{
    const ref=mDescUses===0?mDescFull:(mDescUses===1?mDesc:mDescCallbacks[(mDescUses-2)%mDescCallbacks.length]);
    mDescUses++;
    return ref;
  };

  segs.forEach(type=>{
    if(type==='intro'){
      lines.push('[Intro]');
      lines.push(`(Warm opening in ${keyName} — ${melodyRef()}, low-pass filter smoothly rising, subtle hi-hats creeping in, ${grooveTag}, no bass yet)`);
    } else if(type==='hook'){
      cnt.hook++;
      const isLast=cnt.hook===totalHooks;
      const sub=isLast?'Maximum Anthemic Climax':hookSub;
      const energy=isLast
        ?`Maximum ${hookEng} energy, all layers activated, heaviest impact`
        :`${hookEng.charAt(0).toUpperCase()+hookEng.slice(1)} drop, full energy`;
      lines.push(`[Instrumental Hook ${cnt.hook}: ${sub}]`);
      lines.push(`(${bH} Bars: ${energy}, ${eDesc}, ${dDesc}, ${melodyRef()}, completely instrumental, ZERO vocal chops${sAE.hook?`, ${genArrangeDir(st.genre,'hook',_ctx)}`:''})`);
    } else if(type==='verse'){
      cnt.verse++;
      const sub=cnt.verse===1?`Stripped & ${verseSub}`:`Rhythmic Switch & ${verseSub}`;
      const desc=cnt.verse===1
        ?`Beat strips back, sparse 808s, lighter drum pattern, ${melodyRef()} softened, spacious and clean arrangement`
        :`Slightly varied drum bounce, deeper continuous sub-bass, ${melodyRef()} layered in background, intimate groove`;
      lines.push(`[Instrumental Verse ${cnt.verse}: ${sub}]`);
      lines.push(`(${bV} Bars: ${desc}, purely instrumental pocket${sAE.verse?`, ${genArrangeDir(st.genre,'verse',_ctx)}`:''})`);
    } else if(type==='bridge'){
      cnt.bridge++;
      const isLastB=cnt.bridge===totalBridges;
      const sub=isLastB?'Fast Build-up':'Tension Build';
      // 전환 효과 — 사용자가 고른 게 있으면 그걸로, 없으면 기본값
      const fxPhrase=(st.transitionFx&&st.transitionFx.length)
        ?st.transitionFx.map(f=>TRANSITION_FX_TAG[f]||f).join(', ')
        :'reverse cymbal swell, low-pass filter sweep down';
      const desc=isLastB
        ?`Quick break, isolated ${melodyRef()} chord echoing, ${fxPhrase}, maximum tension`
        :`Heavy low-pass filter muffles the beat, ${fxPhrase}, ${melodyRef()} building anticipation`;
      lines.push(`[Instrumental Bridge ${cnt.bridge}: ${sub}]`);
      lines.push(`(${bB} Bars: ${desc}${sAE.bridge?`, ${genArrangeDir(st.genre,'bridge',_ctx)}`:''})`);
    } else if(type==='outro'){
      lines.push('[Outro]');
      lines.push(`(Beat resolves cleanly, warm ${melodyRef()} chords echoing out in ${keyName}, smooth fade out)`);
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
    const mellowMoods=[2,4,5,7]; // melodic, psychedelic, chill, introspective
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
  const melodyTips={
    0:'Dark synth + Guitar loop', 1:'Dark synth + Ambient pad',
    2:'Emotional piano + Ambient pad', 3:'Dark synth + Strings',
    4:'Strings + Dark synth', 5:'Dark synth + Psychedelic FX',
    6:'Sample chop + Brass stab', 7:'Ambient pad + Emotional piano',
    8:'Emotional piano + Guitar loop', 9:'Sample chop + Guitar loop',
    10:'Dark synth + Psychedelic FX', 11:'Guitar loop + Ambient pad',
    12:'Sample chop + Emotional piano', 13:'Emotional piano + Ambient pad',
    14:'Psychedelic FX + Dark synth', 15:'Psychedelic FX + Dark synth',
    16:'Ambient pad + Emotional piano', 17:'Guitar loop + Sample chop',
  };
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
  const emotionalMoods=[2,5,7];
  const mIdx2=HH_MOODS.findIndex(m=>m.kr===st.mood);
  if(emotionalMoods.includes(mIdx2)&&!st.melody.length){
    const moodMelMap={2:'Dark synth + Guitar loop',5:'Mellow keys + Flute',7:'Soft piano + Ambient pad'};
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
  // English Suno-compatible arrange directives per genre × section
  const ARRANGE_SEC_TAGS={
    0:{hook:'massive 808 explosion, all layers activated, maximum bass impact trap drop',verse:'808 pulls back, stripped minimal drums, sparse clean arrangement',bridge:'layers stripping, tension rising into next 808 drop'},
    1:{hook:'full dense atmospheric layers, heavy 808 wall, dramatic dark drop',verse:'ultra sparse, single hi-hat, ghostly atmospheric bed only, extreme empty space',bridge:'dark atmospheric swell, eerie reverb build, tension cresting'},
    2:{hook:'lead melodic hook dominant, emotional melody line prominent, heartfelt melodic drop',verse:'melodic motif softly hinted, stripped bed supporting hook melody, intimate feel',bridge:'emotional melodic tension rising, melodic theme intensifying, peak before resolution'},
    3:{hook:'808 slide melody dominant, monotone chromatic slide repeating, hard drill drop',verse:'808 slide continuous, sparse hi-hat only, hypnotic monotone repetition',bridge:'808 slide chromatic tension, drill pattern tightening before hook'},
    4:{hook:'heavy offbeat snare dominant, UK drill drop, syncopated snare pattern full intensity',verse:'drum pattern variation, lighter offbeat snare, spacious dark atmospheric bed',bridge:'snare roll building, offbeat pattern intensifying, tension before hook return'},
    5:{hook:'2 bar loop repeating hard, hypnotic Memphis phonk loop cycling, distorted 808 grunt',verse:'same 2 bar loop stripped back, lighter elements only, loop cycling sparse',bridge:'loop half-time filtered down, tension before loop resets full'},
    6:{hook:'sample groove driving full, punchy boom bap drums prominent, soulful sample up front',verse:'deep sample pocket, classic boom bap groove, verse-centered structure',bridge:'sample chop rhythmic variation, groove shift, building back into verse pocket'},
    7:{hook:'maximum wide space, sparse minimal drums, dreamy warm lo-fi atmosphere',verse:'drums nearly absent, pure spacious ambient texture, extreme breathing room',bridge:'quiet ambient swell, soft texture shift, gentle dreamlike transition'},
    8:{hook:'consistent lo-fi loop mood maintained, gentle groove, warm tape texture steady',verse:'same consistent lo-fi feel, very subtle variation, calm unbroken mood',bridge:'soft mood continuation, slight texture shift, seamless smooth flow'},
    9:{hook:'syncopated club kick bounce driving hard, chopped vocal chops cutting through, high energy club drop',verse:'kick pattern thinned out, vocal chops pulled back, light club bounce, spacious pocket',bridge:'kick pattern stuttering, chopped vocal echo fading out, tension building before drop'},
    10:{hook:'1 bar loop repeated relentlessly, distorted pitched synths blaring, addictive hypnotic hook',verse:'same loop driving, slightly stripped kit, continuous minimal energy',bridge:'loop filter sweep down, brief break, tension before loop drops back full'},
    11:{hook:'afro percussion locked in, tropical syncopated groove driving, bouncy energetic drop',verse:'afro percussion lighter, tropical melody softly layered, groove simplified',bridge:'percussion stripping then rebuilding, tropical tension rising before hook return'},
    12:{hook:'simple sparse beat, wide open space for expression, soulful sample breathing room',verse:'minimal minimal minimal, beat stays completely out of the way, clean open pocket',bridge:'brief instrumental breath, soul sample swell, resolves cleanly before verse'},
    13:{hook:'808 pitch-matched to chords, 808 melody prominent, harmonic melodic trap drop',verse:'808 chord melody continuing, lighter kit, melodic 808 carries the track alone',bridge:'808 chromatic tension, 808 pitch bending, harmonic build before chorus'},
    14:{hook:'extreme maximum energy explosion, industrial hard-hitting drop, every element at peak',verse:'near silence contrast, extremely stripped, dramatic stark emptiness after hook',bridge:'sudden aggressive energy surge, industrial tension build, explosion imminent'},
    15:{hook:'raw bedroom texture intentional, lo-fi DIY recording feel, imperfect organic drop',verse:'rawer intimate feel, bedroom recording aesthetic, unpolished intentional grain',bridge:'raw texture shifting, imperfect chord swell, DIY emotional transition'},
    16:{hook:'long slow 808 sustain melody, cloud rap drift, extreme minimal elements, pure space',verse:'ultra slow held 808 notes, hazy dreamy bed only, maximum empty space',bridge:'sustained 808 fading into silence, airy texture drift, slow cloud transition'},
    17:{hook:'unexpected chord stab, gritty jazz sample flipped hard, cinematic boom bap drop',verse:'unique sample chopped, dusty grimy pocket, unconventional syncopated groove',bridge:'sample chop pivot, unexpected harmonic shift, hard cinematic transition'},
  };
  window.ARRANGE_SEC_TAGS=ARRANGE_SEC_TAGS;
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
      return `<button onclick="applyArrangeTipToSection('${s}')" style="${sBtnStyle}background:${applied?'var(--accent-dim)':'var(--surface-3)'};color:${applied?'var(--accent-text)':'var(--text-2)'};">${applied?'✓ ':''} ${label}</button>`;
    }).join('');
    const dimBtn=`<button onclick="dismissArrangeTip()" style="${sBtnStyle}background:transparent;color:var(--text-3);border-color:var(--border)">✕</button>`;
    const feedback=dynamicArrangeFeedback(st.genre,bH,st.melody.length,st.texture.length);
    tips.push({html:`🎼 <strong>편곡 포인트</strong> — ${arrangeQualityTips[st.genre]}${feedback}`,btnHtml:`<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-left:8px;flex-shrink:0">${secBtns}${dimBtn}</div>`});
  }

  return{warns,tips};
}

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
  const val=document.getElementById('rapidapi-key')?.value.trim()||'';
  const msgEl=document.getElementById('rapidapi-status');
  if(!val){
    if(msgEl){msgEl.textContent='❌ Key를 입력하세요';msgEl.hidden=false;msgEl.style.color='var(--danger)';}
    return;
  }
  try{localStorage.setItem('rapidapi_key',val);}catch(_){}
  if(msgEl){msgEl.textContent='✅ 저장됨 — 다음 곡 클릭부터 자동으로 사용됩니다';msgEl.hidden=false;msgEl.style.color='var(--success)';}
}

// ---- AI 추천 (Anthropic API — 고른 요소를 보고 멜로디·믹스 텍스처 추천) ----
function getAnthropicKey(){
  try{return localStorage.getItem('anthropic_api_key')||'';}catch(_){return'';}
}
function saveAnthropicKey(){
  const val=document.getElementById('anthropic-key')?.value.trim()||'';
  const msgEl=document.getElementById('anthropic-key-status');
  if(!val){
    if(msgEl){msgEl.textContent='❌ Key를 입력하세요';msgEl.hidden=false;msgEl.style.color='var(--danger)';}
    return;
  }
  try{localStorage.setItem('anthropic_api_key',val);}catch(_){}
  if(msgEl){msgEl.textContent='✅ 저장됨 — MELODY 섹션의 🤖 AI 추천받기 버튼을 눌러보세요';msgEl.hidden=false;msgEl.style.color='var(--success)';}
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
      `808: ${st._808}`,
      st.drums.length?`드럼: ${st.drums.join(', ')}`:null,
      st.era?`시대감: ${st.era}`:null,
      st.region?`지역색: ${st.region}`:null,
      st.density?`밀도: ${st.density}`:null,
      `BPM ${st.bpm} / Key ${KEYS[st.key]}`,
    ].filter(Boolean).join('\n');
    const prompt=`너는 힙합 비트 프로듀서야. 아래 선택된 요소들을 보고, 이 비트에 가장 잘 어울리는 멜로디 리드 악기 1개, 배경 악기 1개, 믹스 텍스처 2개를 추천해줘. 매번 똑같이 고르지 말고 맥락에 맞게 창의적으로 — 단, 아래 목록에 있는 이름만 정확히 그대로 사용해.

[현재 선택]
${ctx}

[멜로디 악기 목록]
${HH_MELODY.join(', ')}

[믹스 텍스처 목록]
${HH_TEXTURE.join(', ')}

다른 텍스트 없이 아래 JSON 형식으로만 답해:
{"melodyLead":"...","melodyBackground":"...","texture":["...","..."],"reason":"한 문장 한국어 이유"}`;

    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'content-type':'application/json',
        'x-api-key':key,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true',
      },
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:300,
        messages:[{role:'user',content:prompt}],
      }),
    });
    if(!res.ok){
      const errText=await res.text().catch(()=>'');
      throw new Error(`API 오류 (${res.status}) ${errText.slice(0,150)}`);
    }
    const data=await res.json();
    const raw=data.content?.[0]?.text||'';
    const parsed=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
    const lead=parsed.melodyLead,bg=parsed.melodyBackground;
    if(!HH_MELODY.includes(lead)||!HH_MELODY.includes(bg)||lead===bg)throw new Error('AI가 목록에 없는 멜로디를 반환했습니다');
    const tex=(parsed.texture||[]).filter(t=>HH_TEXTURE.includes(t)).slice(0,2);
    if(!tex.length)throw new Error('AI가 목록에 없는 텍스처를 반환했습니다');

    st.melody=[lead,bg];
    st.melodyLeadIdx=(MELODY_ROLE[lead]!=='lead'&&MELODY_ROLE[bg]==='lead')?1:0;
    st.texture=tex;
    chipGrid(document.getElementById('hh-melody'),HH_MELODY,st,'melody',2,renderMelodyRoleUI);
    renderMelodyRoleUI();
    chipGrid(document.getElementById('hh-texture'),HH_TEXTURE,st,'texture',2,null);

    if(statusEl){
      statusEl.hidden=false;statusEl.style.color='var(--success)';
      statusEl.textContent='✅ '+(parsed.reason||'추천 완료');
    }
  }catch(e){
    fail(e.message);
  }finally{
    btn.disabled=false;btn.textContent='🤖 AI 추천받기';
  }
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
      if(d){
        return{
          tempo:d.tempo??d.bpm??140,
          key:d.key??7,
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

// Fallback: derive pseudo audio-features from genre index
function genreFallbackFeatures(genreIdx){
  // [energy, valence, danceability, tempo, key, mode, 808level]
  const tbl={
    0:[0.85,0.35,0.80,140,5,0,'Heavy'],    // Trap
    1:[0.75,0.50,0.78,90,0,0,'Deep'],      // Boom Bap
    2:[0.80,0.60,0.82,95,2,1,'Balanced'],  // Drill
    3:[0.78,0.42,0.75,145,7,0,'Heavy'],    // Rage/Plugg
    4:[0.65,0.55,0.80,130,9,0,'Punchy'],   // Cloud
    5:[0.70,0.48,0.77,140,5,1,'Balanced'], // Phonk
    6:[0.60,0.65,0.72,85,0,1,'Light'],     // Jazz Rap
    7:[0.68,0.58,0.82,140,7,1,'Balanced'], // Afrobeats
    8:[0.72,0.62,0.83,120,5,1,'Balanced'], // Latin Trap
    9:[0.75,0.55,0.79,145,9,0,'Heavy'],    // Melodic Drill
   10:[0.80,0.40,0.76,138,2,0,'Heavy'],    // Detroit/Flint
   11:[0.65,0.60,0.75,95,7,1,'Light'],     // Lo-fi
  };
  const row=tbl[genreIdx]||[0.72,0.50,0.78,140,7,0,'Balanced'];
  return{energy:row[0],valence:row[1],danceability:row[2],tempo:row[3],key:row[4],mode:row[5],_808:row[6]};
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

let _spSearchTimer=null;
function onRefSongInput(val){
  clearTimeout(_spSearchTimer);
  if(val.length<3){hideSpotifyDropdown();return;}
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
  if(keyIdx!=null){st.key=keyIdx;document.getElementById('hh-key').value=keyIdx;}
  // BPM (일부 곡은 실제의 2배로 인식 — 에너지 낮으면 절반)
  let bpm=Math.round(af.tempo);
  if(bpm>170&&af.energy<0.55)bpm=Math.round(bpm/2);
  if(bpm<70&&af.energy>0.6)bpm=bpm*2;
  st.bpm=Math.min(220,Math.max(60,bpm));
  document.getElementById('hh-bpm').value=st.bpm;
  // 808
  const level=af._808||sp808FromEnergy(af.energy);
  st._808=level;
  chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,null);
  setAutoHint('hh-808-hint',(_spAudioFeaturesBlocked?'장르 기반: ':'Spotify: ')+level);
  // Mood
  const moodKr=spMoodFromFeatures(af.energy,af.valence,af.danceability);
  st.mood=moodKr;
  moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',null);
  if(statusEl){
    const keyStr=KEYS[st.key]||'?';
    const sfx=_spAudioFeaturesBlocked?' (장르 기반 추정)':'';
    statusEl.textContent=`✅ Key: ${keyStr} · BPM: ${st.bpm} · 무드: ${moodKr} · 808: ${level}${sfx}`;
    statusEl.hidden=false;
  }
}

// ============================================================
// PRODUCER ADVICE — APPLY ACTIONS
// ============================================================
function applyAdvBPM(bpm){
  st.bpm=bpm;
  document.getElementById('hh-bpm').value=bpm;
  hhGenerate();
}
function applyAdv808(level){
  st._808=level;
  chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,null);
  setAutoHint('hh-808-hint','808: '+level);
  hhGenerate();
}
function applyAdvKey(){
  st.key=7; // A minor
  document.getElementById('hh-key').value=7;
  hhGenerate();
}
function applyAdvMelody(melStr){
  const parts=melStr.split(' + ');
  st.melody=[...parts];
  chipGrid(document.getElementById('hh-melody'),HH_MELODY,st,'melody',null,null);
  renderMelodyRoleUI();
  hhGenerate();
}
function applyAdvMood(moodKr){
  st.mood=moodKr;
  moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',null);
  hhGenerate();
}
function applyAdvTagsIdx(idx){
  const tags=(window._advTagSets||[])[idx]||[];
  tags.forEach(t=>{if(!st.extraTags.includes(t))st.extraTags.push(t);});
  st._appliedAdvTipGenre=st.genre;
  showToast(`✅ 스타일 태그 ${tags.length}개 반영됨 — 피드백 적용 완료`);
  hhGenerate();
}
function applyArrangeTipToSection(sectionType){
  st.sectionArrangeExtras=st.sectionArrangeExtras||{};
  // store true flag only — direction is generated dynamically in buildHHSectionPrompt
  st.sectionArrangeExtras[sectionType]=true;
  const label={hook:'Hook',verse:'Verse',bridge:'Bridge'}[sectionType]||sectionType;
  showToast(`✅ ${label} 섹션에 편곡 포인트 반영됨`);
  hhGenerate();
}
function dismissArrangeTip(){
  st._appliedArrangeTipGenre=st.genre;
  hhGenerate();
}
function removeAdvTag(tag){
  st.extraTags=st.extraTags.filter(t=>t!==tag);
  hhGenerate();
}

function hhGenerate(){
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
  if(st.length)summaryRows.push(['⏱ 길이',st.length]);
  const narrEntries=Object.entries(st.narrSt).filter(([,v])=>v);
  narrEntries.forEach(([k,v])=>summaryRows.push(['🎬 '+k,v]));
  let tableHTML='<table style="width:100%;border-collapse:collapse">';
  summaryRows.forEach((row,i)=>{
    const bg=i%2===0?'rgba(255,255,255,0.035)':'transparent';
    tableHTML+=`<tr style="background:${bg}"><td style="padding:6px 10px;color:var(--text-2);font-size:11px;white-space:nowrap;width:42%">${row[0]}</td><td style="padding:6px 10px;color:var(--text-1);font-size:12px">${escHtml(row[1])}</td></tr>`;
  });
  tableHTML+='</table>';
  container.appendChild(makeOutBlock('① 선택 내용 요약',tableHTML,null,'#3B82F6'));

  // ② 섹션 프롬프트
  const sectText=buildHHSectionPrompt(
    g?g.tag:'trap',moodIdx,keyStr,bpmVal,st._808,
    st.drums.length?st.drums[0]:null,st.melody,st.region
  );
  const sectBlock=makeOutBlock('② 섹션 프롬프트',
    `<textarea class="output-ta" id="hh-sect-ta" rows="14" readonly style="display:block;width:100%">${escHtml(sectText)}</textarea>`,
    'hh-sect-ta','#8B5CF6');
  if(antiAI){
    const badge=document.createElement('span');
    badge.className='output-badge';
    badge.style.marginLeft='8px';
    badge.textContent='✦ Anti-AI ON';
    sectBlock.querySelector('.output-box-label').after(badge);
  }
  container.appendChild(sectBlock);

  // ③ 스타일 프롬프트
  // 순서: [Instrumental] → no vocals → genre → producer ref → mood → melody → 808/drums → Key → BPM → texture → anti-AI
  const tags=[];
  tags.push('[Instrumental]');
  tags.push('no vocals');                                           // 보컬 억제 보완 태그
  if(g)tags.push(g.tag);
  // 프로듀서 레퍼런스 — 장르 바로 뒤 (가중치 최대화)
  if(st.refs.length){
    const refEns=st.refs.map(kr=>{const p=HH_REF.find(r=>r.kr===kr);return p?p.en:kr;});
    tags.push(refEns.join(', '));
  }
  if(mood)tags.push(mood.tag);
  if(st.melody.length){
    const roles=computeMelodyRoles(st.melody);
    if(roles)tags.push(`${roles.lead.toLowerCase()} lead melody`,`${roles.bg.toLowerCase()} background layer`);
    else tags.push(...st.melody.map(m=>m.toLowerCase()));
  }
  if(st._808&&st._808!=='None')tags.push(`${st._808} 808`);
  if(st.groove)tags.push(GROOVE_TAG[st.groove]);
  // g.drum은 드럼 칩 미선택 시 fallback으로만 사용
  if(st.drums.length)tags.push(...st.drums.map(d=>d.toLowerCase()));
  else if(g)tags.push(g.drum);
  if(st.vocal&&st.vocal!=='No Vocal')tags.push(st.vocal.toLowerCase());
  tags.push(`Key of ${keyStr}`);
  tags.push(`${bpmVal} BPM`);
  if(st.texture.length)tags.push(...st.texture.map(t=>t.toLowerCase()));
  if(st.era)tags.push(st.era+' era');
  if(st.region)tags.push(st.region+' sound');
  if(st.density)tags.push(st.density.toLowerCase()+' arrangement');
  if(st.extraTags.length)tags.push(...st.extraTags);              // 피드백에서 적용된 태그
  if(antiAI)tags.push('organic, warm, human-feel, analog imperfections, natural dynamics');
  const styleText=tags.join(', ');
  const charCount=styleText.length;
  const charColor=charCount>1000?'var(--danger)':charCount>800?'#F59E0B':'var(--success)';
  // 적용된 extraTags 칩
  const extraChipsHtml=st.extraTags.length
    ?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:10px">${st.extraTags.map(t=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;background:rgba(157,78,221,0.12);border:1px solid rgba(157,78,221,0.35);color:var(--accent-text);font-size:11px">${escHtml(t)}<span onclick="removeAdvTag('${t.replace(/'/g,"\\'")}')" style="cursor:pointer;opacity:.7;font-size:10px;line-height:1" title="제거">✕</span></span>`).join('')}</div>`
    :'';
  container.appendChild(makeOutBlock('③ 스타일 프롬프트',
    `<div style="display:flex;justify-content:flex-end;margin-bottom:4px"><span style="font-size:11px;font-family:'Space Mono',monospace;color:${charColor}">${charCount}/1000자</span></div><textarea class="output-ta" id="hh-style-ta" rows="4" readonly style="display:block;width:100%">${escHtml(styleText)}</textarea>${extraChipsHtml}`,
    'hh-style-ta','#14B8A6'));

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
  const adv=buildProducerAdvice(g,st,mood,bpmVal,keyStr);
  const advBtn=(label,fn)=>fn?`<button onclick="${fn}" style="margin-left:10px;padding:4px 10px;border-radius:20px;border:1px solid var(--border-hi);background:var(--surface-3);color:var(--accent-text);font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:.15s" onmouseover="this.style.background='var(--accent-dim)'" onmouseout="this.style.background='var(--surface-3)'">${label}</button>`:'';
  let advHtml='';
  if(adv.warns.length||adv.tips.length){
    advHtml=`<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-hi)">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--accent-text);margin-bottom:10px;font-style:normal">🎧 프로듀서 피드백</div>
      ${adv.warns.map(w=>`<div style="margin-bottom:7px;padding:9px 11px;background:rgba(255,77,109,.08);border:1px solid rgba(255,77,109,.3);border-radius:6px;font-size:12px;font-style:normal;color:var(--text-1);line-height:1.6;display:flex;align-items:center;justify-content:space-between;gap:8px"><span>${w.html}</span>${advBtn(w.btnLabel,w.btnFn)}</div>`).join('')}
      ${adv.tips.map(t=>`<div style="margin-bottom:7px;padding:9px 11px;background:rgba(0,198,255,.07);border:1px solid rgba(0,198,255,.22);border-radius:6px;font-size:12px;font-style:normal;color:var(--text-1);line-height:1.6;display:flex;align-items:center;justify-content:space-between;gap:8px"><span>${t.html}</span>${t.btnHtml||advBtn(t.btnLabel,t.btnFn)}</div>`).join('')}
    </div>`;
  }

  container.appendChild(makeOutBlock('⑦ 프로듀서 노트',
    `<div style="font-size:12px;line-height:1.8;color:var(--text-2);font-style:italic;padding:4px 0">${noteLines.map(l=>`<p style="margin-bottom:5px">${l}</p>`).join('')}</div>${advHtml}`,
    null,'#6B7280'));

  // Reset link
  const resetWrap=document.createElement('div');
  resetWrap.style.cssText='text-align:center;padding:10px 0 4px';
  resetWrap.innerHTML='<a href="#" style="color:var(--text-2);font-size:12px;text-decoration:none;transition:.15s" onmouseover="this.style.color=\'var(--text-1)\'" onmouseout="this.style.color=\'var(--text-2)\'" onclick="hhReset();return false">↑ 처음부터 다시 선택하기</a>';
  container.appendChild(resetWrap);
  setTimeout(()=>{container.scrollIntoView({behavior:'smooth',block:'start'});},50);
  updateFloatSummary();
  savePromptHistoryEntry({genre:g?g.kr:'-',bpm:bpmVal,key:keyStr,mood:st.mood||'-',refSong,summaryRows,section:sectText,style:styleText});
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
  list.unshift({id:Date.now()+'-'+Math.random().toString(36).slice(2,7),ts:Date.now(),label:'',...entry});
  if(list.length>PROMPT_HISTORY_MAX)list.length=PROMPT_HISTORY_MAX;
  try{localStorage.setItem(PROMPT_HISTORY_KEY,JSON.stringify(list));}catch(e){}
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
      <div style="display:flex;align-items:center;gap:8px;cursor:pointer" class="ph-header">
        <span style="font-size:10px;color:var(--text-3);font-family:'Space Mono',monospace">${dateStr}</span>
        <span style="font-size:12px;font-weight:600">${e.genre} · ${e.bpm}BPM · ${e.key}</span>
        <span style="font-size:11px;color:var(--text-3);margin-left:auto">▼</span>
      </div>
      <div class="ph-body" hidden style="margin-top:8px;flex-direction:column;gap:6px">
        <input type="text" placeholder="메모 (예: Cinematic Drop 곡)" value="${escHtml(e.label||'')}" style="width:100%;padding:5px 8px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface-1);color:var(--text-1);font-size:11px" class="ph-label-input">
        <table style="width:100%;border-collapse:collapse">
          ${(e.summaryRows||[]).map(([k,v],i)=>`<tr style="background:${i%2===0?'rgba(255,255,255,0.035)':'transparent'}"><td style="padding:4px 8px;color:var(--text-3);font-size:11px;white-space:nowrap;width:42%">${k}</td><td style="padding:4px 8px;color:var(--text-1);font-size:11px">${escHtml(v)}</td></tr>`).join('')}
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11px;color:var(--accent-text);cursor:pointer;text-decoration:underline" class="ph-prompt-toggle">프롬프트 보기 ▾</span>
          <button style="padding:3px 9px;border-radius:20px;border:1px solid var(--border);background:transparent;color:var(--text-3);font-size:10px;cursor:pointer" class="ph-delete">삭제</button>
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
    row.querySelector('.ph-delete').onclick=()=>deletePromptHistoryEntry(e.id);
    el.appendChild(row);
  });
}

function hhReset(){
  st.genre=null;st.key=7;st.bpm=140;
  st._808='Balanced';st.drums=[];st.melody=[];st.mood=null;st.vocal='No Vocal';
  st.refs=[];st.texture=[];st.era=null;st.region=null;st.density=null;st.length=null;
  st.narrSt={};st.structSegs=['intro','hook','verse','hook','outro'];st.structIdx=null;
  const refSongEl=document.getElementById('hh-ref-song');
  if(refSongEl)refSongEl.value='';
  document.getElementById('hh-bpm').value=140;
  document.getElementById('hh-key').value=7;
  const outBlocks=document.getElementById('hh-out-blocks');
  if(outBlocks){outBlocks.style.display='none';outBlocks.innerHTML='';}
  renderHhGenres();
  chipGrid(document.getElementById('hh-808'),HH_808,st,'_808',1,null);
  chipGrid(document.getElementById('hh-drums'),HH_DRUMS,st,'drums',null,null);
  chipGrid(document.getElementById('hh-melody'),HH_MELODY,st,'melody',2,renderMelodyRoleUI);
  renderMelodyRoleUI();
  moodGrid(document.getElementById('hh-mood'),HH_MOODS,st,'mood',null);
  chipGrid(document.getElementById('hh-vocal'),HH_VOCAL,st,'vocal',1,null);
  renderProducerRef();
  chipGrid(document.getElementById('hh-texture'),HH_TEXTURE,st,'texture',2,null);
  chipGrid(document.getElementById('hh-fx'),HH_TRANSITION_FX,st,'transitionFx',2,null);
  chipGrid(document.getElementById('hh-groove'),HH_GROOVE,st,'groove',1,null);
  chipGrid(document.getElementById('hh-era'),HH_ERA,st,'era',1,null);
  chipGrid(document.getElementById('hh-region'),HH_REGION,st,'region',1,null);
  chipGrid(document.getElementById('hh-density'),HH_DENSITY,st,'density',1,null);
  chipGrid(document.getElementById('hh-length'),HH_LENGTH,st,'length',1,null);
  renderHhNarr();
  renderStructBuilder('hh',HH_STRUCT_PRESETS,HH_SEG_PALETTE,st);
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
// TRENDING ARTISTS
// ============================================================
// genre:"tag" 아티스트 검색 — popularity 붙은 아티스트 객체를 바로 돌려줌 (플레이리스트 스크래핑 불필요)
// genre: 필드 필터는 이 앱 등급에서 사실상 무의미한(popularity 0, 무명 아티스트) 결과만 줘서
// 평문 키워드 검색으로 대체 — Spotify 자체 relevance 랭킹이 훨씬 낫다 (실측 확인됨).
const isKoreanName=name=>/[가-힣]/.test(name);

// 실제 Billboard 주간 Hip-Hop/R&B 차트 — RapidAPI billboard-charts-api. 순위 자체가 진짜 트렌드 신호.
// id="r-b-hip-hop-songs" 는 실측으로 확인된 값 (카테고리 목록이 주는 id는 도메인 접두사가 깨져있어 못 씀)
async function fetchBillboardHipHopChart(){
  const key=getRapidApiKey();
  if(!key)return[];
  try{
    const r=await fetch('https://billboard-charts-api.p.rapidapi.com/chart.php?id=r-b-hip-hop-songs',{
      headers:{'X-RapidAPI-Key':key,'X-RapidAPI-Host':'billboard-charts-api.p.rapidapi.com'}
    });
    if(!r.ok){console.warn('Billboard chart HTTP',r.status);return[];}
    const d=await r.json();
    return d.songs||[];
  }catch(e){console.warn('fetchBillboardHipHopChart error',e);return[];}
}

// Billboard 차트엔 Spotify ID가 없어서 아티스트 이름으로 정확히 검색해 ID를 리졸브
async function resolveArtistIdByName(name,tok){
  try{
    const r=await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&market=US&limit=1`,{headers:{Authorization:'Bearer '+tok}});
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

async function fetchArtistTopTrack(artistId,tok){
  const tracks=await fetchArtistTopTracksRaw(artistId);
  return tracks[0]||null;
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
    const r=await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(`${artist} ${title}`)}&type=track&market=US&limit=1`,{headers:{Authorization:'Bearer '+tok}});
    if(!r.ok)return null;
    const d=await r.json();
    const t=(d.tracks?.items||[])[0];
    return t?{id:t.id,name:t.name,popularity:t.popularity||0,year:(t.album?.release_date||'').slice(0,4)}:null;
  }catch(e){return null;}
}

async function applySpotifyTrackSong(artistId,artistName,genres,trackId,trackName){
  const statusEl=document.getElementById('trending-status');
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
  if(keyIdx!=null){st.key=keyIdx;document.getElementById('hh-key').value=keyIdx;}
  // BPM
  let bpm=Math.round(af.tempo);
  if(bpm>170&&af.energy<0.55)bpm=Math.round(bpm/2);
  if(bpm<70&&af.energy>0.6)bpm=bpm*2;
  st.bpm=Math.min(220,Math.max(60,bpm));
  document.getElementById('hh-bpm').value=st.bpm;
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
    artists.slice(0,15).forEach((a,i)=>{
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
      // 비동기로 트랙 fetch — Billboard에서 확인된 "지금 차트인 곡"을 최우선으로 꽂는다
      fetchArtistTopTracks(a.id,tok,5).then(async tracks=>{
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
      });
    });
  },0);
}

// Spotify genres → GENRES index (best-effort)
const SP_GENRE_MAP=[
  {pats:['dark trap'],idx:1},{pats:['melodic rap','melodic trap'],idx:2},
  {pats:['ny drill','new york drill'],idx:3},{pats:['uk drill','british drill'],idx:4},
  {pats:['phonk','memphis'],idx:5},{pats:['boom bap','east coast hip hop','underground hip hop'],idx:6},
  {pats:['cloud rap','witch house'],idx:7},{pats:['lo-fi','chillhop'],idx:8},
  {pats:['jersey club'],idx:9},{pats:['plugg','rage'],idx:10},{pats:['afrobeats','afropop','afro trap'],idx:11},
  {pats:['conscious hip hop'],idx:12},{pats:['trap soul','r&b','soul'],idx:13},
  {pats:['hyperpop'],idx:14},{pats:['trap','rap','hip hop'],idx:0},
];
function detectGenreFromSpotify(genres){
  const joined=(genres||[]).join(' ').toLowerCase();
  for(const{pats,idx}of SP_GENRE_MAP){
    if(pats.some(p=>joined.includes(p)))return idx;
  }
  return null;
}

async function fetchTrendingArtists(){
  const btn=document.getElementById('trending-refresh-btn');
  const statusEl=document.getElementById('trending-status');
  const chipsEl=document.getElementById('hh-trending-chips');
  const lastEl=document.getElementById('trending-last-update');
  if(btn)btn.textContent='로딩 중...';
  if(statusEl){statusEl.textContent='📊 Billboard Hip-Hop/R&B 차트 조회 중…';statusEl.hidden=false;}

  const tok=await getSpotifyToken();
  if(!tok){
    const isNet=(_spLastError||'').includes('fetch')||(_spLastError||'').includes('네트워크');
    if(chipsEl)chipsEl.innerHTML=isNet
      ?`<span style="font-size:11px;color:var(--danger)">⚠️ 네트워크 오류 — 인터넷 연결을 확인하세요</span>`
      :`<span style="font-size:11px;color:var(--danger)">⚠️ ${_spLastError||'미연결'} — 상단 🎧 SPOTIFY 연동 패널에서 설정하세요</span>`;
    if(btn)btn.textContent='↻ 새로고침';
    return;
  }

  const chart=await fetchBillboardHipHopChart();
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
  // Billboard엔 Spotify ID가 없어서 이름으로 리졸브 (병렬)
  const resolved=(await Promise.all(chartEntries.slice(0,15).map(async s=>{
    const a=await resolveArtistIdByName(s.artist,tok);
    return a?{...a,chartSong:{name:s.name,position:s.position}}:null;
  }))).filter(Boolean);
  const scoredTop=resolved.filter(a=>!isKoreanName(a.name)).slice(0,15);

  if(!scoredTop.length){
    if(chipsEl)chipsEl.innerHTML='<span style="font-size:11px;color:var(--danger)">⚠️ Billboard 아티스트를 Spotify에서 찾지 못했습니다.</span>';
    if(statusEl){statusEl.textContent='아티스트 리졸브 실패';statusEl.hidden=false;}
    if(btn)btn.textContent='↻ 새로고침';
    return;
  }
  if(statusEl)statusEl.textContent=`Billboard Hip-Hop/R&B 차트 기준 ${scoredTop.length}명 (실제 이번 주 순위)`;

  // genres 채워넣기 — 서브장르 집계용 (Spotify가 안 주니 Musicae로)
  const genreMap=await fetchArtistGenresViaRapidAPI(scoredTop.map(a=>a.id));
  scoredTop.forEach(a=>{if(genreMap[a.id]&&genreMap[a.id].length)a.genres=genreMap[a.id];});

  // 세션 캐시
  try{sessionStorage.setItem('sp_trending',JSON.stringify(scoredTop));
    sessionStorage.setItem('sp_trending_ts',Date.now());}catch(e){}

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


// 세션 캐시 복원
(function restoreTrendingCache(){
  try{
    const ts=+(sessionStorage.getItem('sp_trending_ts')||0);
    if(Date.now()-ts>3600000)return; // 1시간 이후 만료
    const cached=sessionStorage.getItem('sp_trending');
    if(!cached)return;
    const data=JSON.parse(cached);
    renderTrendingChips(data);
    const lastEl=document.getElementById('trending-last-update');
    if(lastEl){const d=new Date(ts);lastEl.textContent=`캐시: ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;}
  }catch(e){}
})();

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
