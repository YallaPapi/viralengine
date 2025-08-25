# Claude Code Instructions

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

Got it — I’ll rewrite your **Claude Ops Manual** for this **Viral Video Generator** project, keeping the **TaskMaster** and **Context7** integration exactly as in your Snowflake Engine doc. Basically: same rigor, but instead of novels → pipeline for viral listicle videos (using your PDFs #1–29 as the methodology backbone).

Here’s a first full draft:

---

# CLAUDE OPERATIONS MANUAL — Auto-Viral Listicle Engine

NOTE: Always refer to *Instant Viral Templates #1–#14: Dopamine Listicles* and *Instant Viral Templates #15–#29: Lazy Viral Templates*. They are the single sources of truth regarding viral video structure, hook formulas, and dopamine pacing. Never hallucinate, never assume, never improvise formats. Always check the templates first.

---

## Scope

This manual defines how to operate, extend, and troubleshoot the Auto-Viral Listicle Engine that generates complete viral short-form videos end to end using the provided templates. It standardizes step gates, prompt packs, validation, error cycles, and export protocols.

The engine consumes a minimal brief (topic + template selection) and returns a complete asset pack:

* **script (countdown/listicle format)**
* **voiceover**
* **B-roll/video assembly**
* **captions**
* **music/FX overlay**

Artifacts are stored as JSON with human-readable mirrors.

---

## System overview

Pipeline tiers:

1. **Planner** → Selects viral template + topic
2. **Script Engine** → Generates dopamine-pacing script (countdown, lazy scroll, etc.)
3. **Voiceover Engine** → Generates AI voice timed to script
4. **Visual Assembly** → Auto-pulls stock/B-roll/clips, attaches captions
5. **Conformance Validator** → Persistent at every gate (ensures dopamine rules)

---

## Mandatory methodology

* Never bypass or merge template steps.
* No ad-hoc scripts outside the provided template set.
* Every downstream change can only come from revision of upstream artifact (script → voiceover → video).

Error handling:

1. Start from current repo + schema.
2. If error → begin an **Error Cycle**:

   * Use **TaskMaster** to research failure mode.
   * Use **Context7** to load SDK docs (FFmpeg, Whisper, captioning libs).
   * Apply patch, retest, increment cycle counter.
   * After 20 failed cycles: mark Blocked + escalate.

---

## Session startup checklist

1. Confirm branch synced with main.

2. Load environment variables:
   • `OPENAI_API_KEY` (for script + voice)
   • `ELEVENLABS_API_KEY` or `XTTS_PATH` (voice engine)
   • `FFMPEG_PATH`
   • `BROLL_LIBRARY_URL`
   • `MUSIC_LIBRARY_URL`

3. Run smoke tests:
   • Model reachability
   • JSON schema validation for script + assets
   • Test run on a micro-topic ("3 Fun Facts About Coffee")

4. Open TaskMaster and load **viral-template task list**.

5. Review Blocked items.

---

## TaskMaster integration

All technical research is initiated via TaskMaster. Example commands:

```bash
task-master init
task-master parse-prd docs/prd.md --research
task-master list
task-master research "Script validator rejects hook not in template #4"
task-master research "FFmpeg overlay mis-timing captions"
```

---

## Context7 integration

Use Context7 to retrieve:

* FFmpeg command references
* Captioning schema (SRT, WebVTT)
* JSON schema for script artifacts
* MCP parameters for Claude-Flow hooks

Connect Claude Code to Context7:

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

---

## Development rules

1. Template fidelity is absolute. Must follow hook formula, pacing rules, listicle beats.
2. No freeform script outside a template.
3. Each video must pass dopamine pacing checks:
   • Hook in 0–3s
   • Intrigue maintained every 5–6s
   • Payoff at end.
4. Respect countdown/list order integrity.
5. Captions must sync to voice within 100ms.
6. Draft only from frozen script artifact.
7. Keep validators versioned.

---

## Artifacts and formats

Project bundle includes:

* `project.json` (topic, template ID, style)
* `script.json` (structured by beats)
* `voiceover.wav`
* `captions.srt` and `captions.json`
* `broll_manifest.json`
* `video.mp4`

Script JSON required fields:

`index, hook, body, payoff, timestamp, pacing_flag`

---

## Step gates and acceptance checks

**Step 1 — Template + Topic**

* Required: template\_id, topic, length\_target
* Gate: template exists, topic string < 12 words

**Step 2 — Script Generation**

* Required: hook, 3–10 body beats, payoff
* Gate: passes dopamine pacing (hook < 3s, intrigue per 5s)

**Step 3 — Voiceover**

* Required: TTS timing matches script length
* Gate: per-line timing stored in JSON

**Step 4 — Visual Assembly**

* Required: b-roll match for every beat, captions aligned
* Gate: no missing assets

**Step 5 — Final Video**

* Required: exports to MP4 with captions and audio
* Gate: length within ±10% of target, passes validator (hook, payoff, pacing)

---

## Prompt pack blueprint

Every step has canonical prompts. Example for **Step 2 Script**:

```
System:
You are the Viral Script Agent. Only produce listicle scripts conforming to the selected template.

User:
Context:
- Template: {{template_id}}
- Topic: {{topic}}

Task:
Write script beats following the template.
Enforce:
- Hook in 0–3s
- Intrigue spike every 5–6s
- Final payoff at last beat
Return JSON:
[{ "index": 1, "text": "...", "role": "hook", "timestamp": 0.0, "pacing_flag": true }, ...]
```

---

## Validators

Examples:

* `validate_hook(script)` → must be first line, <15 words.
* `validate_pacing(script)` → intrigue every 5–6s.
* `validate_countdown_integrity(script)` → list order intact.
* `validate_caption_alignment(captions, voiceover)` → offset <100ms.

---

## Drafting rules

* Voiceover must match script JSON exactly.
* Captions locked to script JSON, not raw audio.
* Video assembly must respect beat order.
* Music overlay at -12 LUFS max.

---

## Error recovery workflow

1. Identify failing tier: Script, Voiceover, Visual, Export.
2. Start fix cycle: TaskMaster research, Context7 lookup, patch, retest.
3. Log cycle number. Reset if fixed.
4. Escalate after 20 cycles.

---

## QA and benchmarks

Automated:

* Validate dopamine pacing on every output.
* Script beat count within template bounds.
* Voiceover <1s drift vs captions.
* Export MP4 <120s.

Manual:

* Spot check hook strength.
* Verify b-roll relevance.

---

## Build and run

```bash
make setup
make test:smoke
make run:tiny  # generates 15s demo clip
```

Full generation:

```bash
make run:viral PROJECT=cats_funny TEMPLATE=4 LENGTH=60
```

Exports:

```bash
make export:mp4
make export:json
make export:srt
```

---

## Task Master AI instructions

Import Task Master development workflow commands and guidelines.

`@./.taskmaster/CLAUDE.md`

