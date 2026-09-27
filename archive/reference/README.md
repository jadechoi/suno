# Retired reference pipelines

V2/V3 analysis, design and experimental writing code is preserved here for historical comparisons and regression fixtures. The current page does not load these files. `supplement-sources.js` is the retired web-source enrichment function extracted from `hh-ai.js`.

Current reference generation uses `writeReferenceDirect` in `hh-ai.js`. Original-song intent generation still uses `buildMusicPlan`, `refineMusicPlan` and `writeOnce`; do not remove them as obsolete reference code.

The immutable `versions/v1` and `versions/v2` snapshots remain unchanged. Some shared profile/format helpers in the current code also support older saved data and the original-song path; they are intentionally retained.
