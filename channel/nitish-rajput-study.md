# Study: how Nitish Rajput's videos hold attention

Source: vidIQ's video watcher run on three of his videos (Eli Cohen `MgBZpKV3AMM`, Nirav Modi scam `_bCsyYMuy-E`, Flydubai `Ce43Rt_h5jw`). Five passes, 125 vidIQ credits.

**Reliability.** The watcher is an AI describing the video. The first-minutes shot logs agree across all three videos and can be trusted. The 12:00 to 16:00 log of the Eli Cohen video is suspiciously regular (and stops at 14:00), so treat its exact timings as approximate. Narration paraphrases from Hindi are loose.

## What he does

### 1. The hook is a trailer, not a first scene
- First words at 0:00 state the most extreme fact of the whole story. No greeting, no context.
- The next 60 to 75 seconds flash the 8 to 10 best moments from anywhere in the story, out of order, each as a 1 to 3 second shot with its own sound.
- About 30 shots in the first minute: 2 seconds a shot. He then slows to about 4 seconds in minute two and 5 to 7 seconds once the story starts.
- Only after the trailer does the title appear and the timeline start ("1901", "January 1962").

### 2. The pictures are mostly generated stills, not real footage
- Eli Cohen: about 90% generated re-enactment images, 10% real archive photos. Flydubai: no real footage in the first three minutes.
- The stills are photoreal and graded like a film (noir light, smoke, red or teal tint), not painted.
- Almost every still moves: slow push-in, parallax between layers, a light sweep, a shake on impact, grain on top. A few are short generated video clips.
- Every image is on screen 2 to 4 seconds.

### 3. Four picture types rotate so no two neighbours match
Re-enactment image → document with a highlighted line → map → presenter → re-enactment. In the middle of the video he returns to camera every 30 to 40 seconds as the reset.

### 4. Proof is shown, with the source on screen
- Book pages and newspaper cuttings with a yellow highlighter stroke drawn over the one line that matters.
- A source box under it: book title, chapter, website.
- This appears every 20 to 30 seconds in explanatory stretches. It is what makes a generated picture feel like a documentary.

### 5. Maps
- Dark 3D relief or satellite look, muted browns, near-black sea.
- Borders draw on, the country pulses red or blue, a dashed route line travels with a small plane or ship icon, white capital labels.
- 3 to 10 seconds each, about once every 2 to 3 minutes, always when the story changes place.

### 6. Fraud mechanisms (Nirav Modi video)
- Round icons for each party, joined by animated dashed lines carrying money and goods icons.
- Legitimate route and fraud route side by side, green tick against red cross.
- One step added per sentence; never a finished diagram shown at once.
- Money figures punch in large with a shake and a thud.
- Real people: photo in a circle or polaroid, duotone, name and role on a lower-third bar; a red target ring for the culprits.
- A timeline bar along the bottom ticks to each new year.

### 7. Sound
- Every shot has its own sound: whoosh on a move, bass hit on a name or number, paper rustle on a document, the object's own sound on a re-enactment (Morse key, pen, engine, stamp).
- A low suspense drone runs from the first second, with a continuous room tone or crackle under the voice.
- The music changes character every 5 to 7 minutes and at each new phase (ticking beat for history, pulse for technical explanation).
- Music cuts to silence for 1 to 2 seconds just before a reveal, then a hit.

### 8. Script
- A new question is planted roughly every 45 to 60 seconds.
- Dry background is framed as a risk ("one wrong word and...").
- Before returning to slow history he flashes a later, violent moment as a reminder of where the story is going.

## What we do not copy
- The presenter. He is on screen for about a third of the hook and is the reset every 30 to 40 seconds. A faceless film needs another reset: the source card, the map, the mechanism diagram and the big-number card take that job.
- Generated likenesses of real people and mocked-up newspaper front pages carrying real names. Ours stay labelled as illustration, with real people shown only in properly licensed photographs.
- Glitch effects on every cut. They suit his news tone; a 1963 story wants film-era devices (projector flicker, flash bulb, paper tear).

## Where our review cut differs
| | His | Ours (v5) |
|---|---|---|
| Hook | Trailer of best moments, about 30 shots a minute | One scene told in order, about 12 shots a minute |
| Image style | Photoreal film still | Painted |
| Motion inside the image | Parallax, light sweeps, some clips | Camera push only |
| Proof on screen | Highlighted source every 20 to 30 s | Mock cuttings, no source cited |
| Sound | One sound per shot, silence before reveals | Sounds on about a third of shots |
| Timeline | Bar on screen | Year cards only |
| Mechanism | Node diagram built step by step | Cut-away tank only |

## Changes for the Salad Oil pilot
1. Rewrite the cold open as a 60-second trailer of about 25 shots (draft below). Re-record: about 900 ElevenLabs credits.
2. Switch the image style line to photoreal and regenerate the ten existing scenes.
3. Motion: Grok image-to-video for about a dozen hero shots; layered parallax in code for the rest.
4. Source cards: typed quotation, yellow highlight, citation (Miller, *The Great Salad Oil Swindle*, 1965; named newspapers with dates).
5. Timeline bar, 1915 to 1972.
6. Receipt mechanism as a step-by-step node diagram: oil → warehouse → receipt → bank → cash, then the fraud route beside it.
7. One sound per shot, one second of silence before each reveal, a different music cue per chapter.
8. A planted question at least once a minute in the narration.

### Draft trailer hook (about 150 words)
> In November 1963, men drained a storage tank in New Jersey that was supposed to hold a fortune in salad oil. It was full of sea water.
>
> On paper, this one yard held as much vegetable oil as existed in the entire United States.
>
> Fifty-one banks and companies had lent against it. American Express had vouched for it.
>
> Somebody phoned to warn them. Twice.
>
> One tank on the books did not exist at all.
>
> In five weeks, one man wrote himself thirty-nine million dollars on a stolen pad of receipts.
>
> A Wall Street firm with twenty thousand customers went under, on the afternoon the President was shot.
>
> In the company's office, they found six dollars.
>
> And a thirty-three-year-old in Omaha made the bet of his life.
>
> The man behind it was a butcher from the Bronx. This is how he fooled all of them. And why, for six years, nobody looked down.

### Photoreal style line (replaces the painted one)
```text
Photorealistic 1960s film still, shot on 35mm Kodak film, wide 16:9, natural film grain, shallow depth of field, moody low-key lighting with deep teal shadows and warm amber practical lights, documentary realism. People are seen from behind or in silhouette with no recognisable faces. No text, no readable signs, no logos. Not a painting, not an illustration.
```
