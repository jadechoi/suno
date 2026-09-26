# Product intent

The goal is the best prompt for each song's intended sound: suitable instruments,
roles, performance techniques, and arrangement, grounded in the user's intention
and reference when supplied. Do not optimize for less guitar, fewer instruments,
shorter prompts, or minimal arrangements as ends in themselves.

For type beats, preserve the reference's intended mood, perceived groove, timbral
character and energy range while allowing a new composition. A prominent guitar,
bass-led hook, lush arrangement, or restrained texture can each be correct.
Judge musical fit, not the mere presence of a lead instrument or arrangement detail.
Never describe title-based model knowledge as audio-verified analysis.

Style and section prompts should express the same musical design, including
purposeful section-specific role changes. Producer feedback should improve that
intention, explain the concrete musical benefit, and propose no changes when none
are warranted. Keep explicit user choices and instrumental defaults intact.

Verify behavioral changes with relevant tests. Distinguish offline fixture tests,
real API prompt checks, and listening to actual Suno output in reports.
