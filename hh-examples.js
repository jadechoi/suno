// 사용자가 Suno에서 실제로 잘 나왔다고 준 프롬프트 — AI 작성기에 "밀도와 어휘 수준"을 보여주는 예시로만 씀(문구 복사 금지).
// 공통 패턴: 스타일에 장르 융합 라벨("A meets B", "pop-drill") + 상업적 매력 어휘 + 금지어 1회 / 의미 있는 헤더 / 무보컬 벌스의 랩·멜로디 자리
const PROMPT_EXAMPLES=[
{
  title:'UK x Bronx drill 크로스오버 (무보컬, 154 BPM)',
  style:`[Instrumental], UK drill meets bronx drill, pop-drill, C# major, 154 BPM, bouncy 808 glides, fast syncopated hi-hats, hard drill kicks, catchy bright synth pluck, pristine club mix, purely instrumental, ZERO vocal chops, no vocal samples, energetic bounce`,
  section:`[Intro]
(Bright minimal synth pluck loop in C# major, UK drill hi-hats rolling in, building anticipation, no bass)

[Instrumental Hook 1: UK x Bronx Drill Drop]
(8 Bars: Explosive drop, heavy sliding 808 glides, hard-hitting drill kicks, fast syncopated hi-hats, catchy bright synth lead, purely instrumental bounce, ZERO vocal chops)

[Instrumental Verse 1: Stripped & Spacious]
(12 Bars: Beat strips down, 808 glides become minimal, kicks drop out, crisp rimshots, wide open pocket for rhythmic rap, cold and clean)

[Instrumental Bridge 1: 4-Bar Tension]
(4 Bars: Short transition, heavy low-pass filter muffles the beat, fast snare roll, rising digital sweep, sudden silence right before the drop)

[Instrumental Hook 2: Full Club Energy]
(8 Bars: Return of the aggressive 808 glides and hard kicks, hypnotic synth loop in C# major, high-energy pop-drill bounce)

[Instrumental Verse 2: Rhythmic Switch]
(12 Bars: Slightly different hi-hat pattern, muted synth plucks, deep continuous sub-bass instead of glides, leaving maximum space for the artist)

[Instrumental Bridge 2: Fast Build-up]
(4 Bars: Short break, isolated synth pluck echoing, heavy reverse crash pulling into the final drop)

[Instrumental Hook 3: Maximum Bounce]
(8 Bars: Maximum drill energy, perfectly saturated 808s, all elements hitting together, aggressive but playful pop-drill climax)

[Outro]
(Beat stops suddenly, lone synth pluck echoing in C# major, clean fade out)`,
},
{
  title:'PluggNB 로맨틱 (무보컬, 140 BPM)',
  style:`[Instrumental], trendy romantic pluggnb, smooth r&b trap, bouncy short plugg 808s, fast rolling triplet hi-hats, dreamy electric piano chords, soft synth bells, 140 BPM, pristine mix, purely instrumental, ZERO vocal chops, NO guitars, extremely melodic and chill`,
  section:`[Intro]
(Dreamy electric piano playing jazzy r&b chords, soft synth bell melody introducing the theme, faint vinyl warmth, no bass)

[Instrumental Hook 1: PluggNB Bounce]
(Explosive romantic energy, bouncy short plugg 808 bass, fast rolling triplet hi-hats, catchy and sweet synth bell lead, lush electric piano, purely instrumental, ZERO vocal chops)

[Instrumental Verse 1: Stripped & Intimate]
(Drums become minimal, deep smooth sub-bass, muted rhodes chords, very airy and spacious, perfect pocket for melodic r&b rap)

[Instrumental Hook 2: Full Dreamy Energy]
(Return of the bouncy 808s, added soft digital flute or ethereal synth pad in the background, highly melodic and trendy plugg bounce)

[Instrumental Verse 2: Smooth R&B Switch]
(Half-time drum pattern, extremely smooth and warm electric piano comping, rhythmic trap claps, intimate late-night drive atmosphere)

[Pre-Chorus Build-up]
(Fast trap snare roll, gentle sweeping riser effect, main synth bell getting brighter, building anticipation)

[Instrumental Hook 3: Climax & Lush Space]
(Maximum romantic bounce, all melodic synths and EP playing together beautifully, perfectly saturated short 808s, lush and euphoric pluggnb climax)

[Outro]
(Beat stops suddenly, lone dreamy electric piano chord echoing with delay, slow and sweet fade out)`,
},
{
  title:'팝 디지코어 (무보컬, 155 BPM)',
  style:`[Instrumental], pop-infused digicore, futuristic pop, glossy synth production, ultra-clean punchy 808s, melodic hook-driven lead, 155 BPM, shimmering high-end, tight rhythmic glitch, polished mainstream aesthetic, hyper-catchy synth melody`,
  section:`[Intro]
(Sweet melodic bell-synth melody, crisp digital snare, light atmospheric haze)

[Instrumental Hook 1: Pop-Digicore Bounce]
(Explosive bright synth chords, highly memorable and catchy pop lead melody, punchy clean 808s, driving danceable beat, polished digicore energy)

[Instrumental Verse 1: Tight & Spacious]
(Beat becomes rhythmic and snappy, vocal-like synth stabs, wide bass pulse, leaving perfect space for top-line vocal melody)

[Instrumental Hook 2: Mainstream Peak]
(Adding bright sparkling arpeggios, melodic synth layering, full-frequency pop production, high-energy digicore bounce)

[Instrumental Verse 2: Dynamic Shift]
(Rhythm switches to a slick half-time groove, dreamy pop chord progression, sharp glitchy stutters, clean and melodic bassline)

[Build-up]
(Fast drum rolls, rising synth filter, energetic riser, building to a euphoric pop moment)

[Instrumental Hook 3: Polished Climax]
(Ultimate pop-digicore payoff, all melodic layers playing together, heavy but clean 808s, subtle and tasteful glitch effects, triumphant and bright)

[Outro]
(Beat stops suddenly, shimmering synth echo, clean digital tail-off)`,
},
{
  title:'커머셜 하이퍼팝 (무보컬, 135 BPM)',
  style:`[Instrumental], commercial hyperpop, upbeat synth-pop, bright catchy synth lead, clean punchy bass, sparkling arpeggios, fast hi-hats, 135 BPM, pristine production, mainstream appeal, melodic and energetic, nostalgic pop chords`,
  section:`[Intro]
(Soft filtered synth chords, bright sparkling arpeggios building up, four-on-the-floor kick drum teasing the rhythm)

[Instrumental Hook 1: Massive Pop Energy]
(Explosive entry, wide commercial synth-pop chords, catchy and memorable lead synth melody, clean punchy bassline, upbeat 135 BPM danceable groove)

[Instrumental Verse 1: Tight & Groovy]
(Bass becomes tight and syncopated, staccato pop synth plucks, fast trap-influenced hi-hats, very clean and spacious arrangement)

[Instrumental Hook 2: Full Stadium Pop]
(Return of the massive synth layers, added vocal-chop style synth effects, high energy mainstream hyperpop bounce)

[Instrumental Verse 2: Dance-Pop Switch]
(Rhythm switches to a driving four-on-the-floor house beat, deep rolling bass, shimmering atmospheric pads, energetic but controlled)

[Pre-Chorus Build-up]
(Snare roll building up rapidly, sweeping white noise riser, synth chords opening up the filter)

[Instrumental Hook 3: Hyperpop Glitch Climax]
(Maximum pop energy, main melody accompanied by subtle hyperpop glitch stutters, sparkling high-end frequencies, euphoric and triumphant climax)

[Outro]
(Beat drops out instantly, main pop chord echoing softly, sweeping filter fade out)`,
},
];
// 장르별로 가장 가까운 예시 2개(첫 번째가 가장 가까운 것) — GENRES 순서와 1:1
const EXAMPLE_FOR_GENRE=[[0,1],[0,3],[1,2],[0,3],[0,3],[0,3],[1,0],[1,2],[1,2],[3,0],[2,0],[1,0],[1,0],[1,2],[3,2],[2,3],[1,2],[1,3],[0,2],[0,1]];
function pickPromptExamples(genreIdx){return (EXAMPLE_FOR_GENRE[genreIdx]||[0,1]).map(i=>PROMPT_EXAMPLES[i]);}
