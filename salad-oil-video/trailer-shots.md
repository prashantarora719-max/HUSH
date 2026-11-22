# Trailer hook: shot list and Grok prompts

Narration is recorded (`audio/full/ch0.mp3`, 54 s). 21 shots plus the title, about 2.5 seconds each.
Paste the **style line** at the end of every prompt. **Clip** = also make a 5-second image-to-video from the finished image.

**Style line**
```text
Photorealistic 1960s film still, shot on 35mm Kodak film, wide 16:9, natural film grain, shallow depth of field, moody low-key lighting with deep teal shadows and warm amber practical lights, documentary realism. People are seen from behind or in silhouette with no recognisable faces. No text, no readable signs, no logos. Not a painting, not an illustration.
```

**Clip instruction** (paste when turning an image into video)
```text
Slow cinematic push-in, 5 seconds. Keep the composition and the people exactly as they are. Only subtle natural movement: [movement listed for the shot]. No new objects, no text, no camera shake, no faces turning to camera.
```

| # | Time | Narration | Picture | Source |
|---|---|---|---|---|
| T1 | 0.0 | In November 1963 | Tank yard at grey dawn | Grok, **clip** |
| T2 | 2.4 | men drained a storage tank in New Jersey | Gloved hands turning a valve wheel, liquid gushing | Grok, **clip** |
| T3 | 5.0 | supposed to hold a fortune in salad oil | Golden oil pouring, close | Grok |
| T4 | 7.7 | It was full of sea water. | Men ankle-deep inside the drained tank | Grok, **clip** |
| T5 | 9.8 | On paper, this one yard held | The yard from the air | Grok |
| G1 | 12.0 | as much vegetable oil as existed in the entire United States | Map of the United States draining into one dot at Bayonne | built in code |
| T6 | 15.8 | Fifty-one banks and companies had lent against it | Bank vault door; counter runs to 51 | Grok + code |
| T7 | 18.6 | American Express had vouched for it | Rubber stamp coming down on a certificate | Grok, **clip** |
| T8 | 21.0 | Somebody phoned to warn them. | Phone booth at night in rain | Grok, **clip** |
| T9 | 22.8 | Twice. | Telephone ringing on an executive desk, nobody there | Grok |
| T10 | 24.0 | One tank on the books did not exist at all | Empty weed-grown concrete pad between tanks; ghost outline drawn on | Grok + code |
| T11 | 27.0 | In five weeks, one man wrote himself | Hand signing a certificate under a desk lamp | Grok, **clip** |
| G2 | 29.3 | thirty-nine million dollars | $39,000,000 punches in over T11 | built in code |
| T12 | 31.1 | on a stolen pad of receipts | Open drawer, pad of blank certificates | Grok |
| T13 | 33.2 | A Wall Street firm with twenty thousand customers went under | Trading floor in uproar | Grok, **clip** |
| T14 | 36.4 | on the afternoon the President was shot | Men in hats crowded round a teletype machine | Grok |
| T15 | 38.6 | In the company's office | Stripped office, open empty safe | Grok |
| T16 | 40.0 | they found six dollars | Tin cash box, a few bills and coins | Grok |
| T17 | 41.8 | a thirty-three-year-old in Omaha made the bet of his life | Young man from behind at a plain desk of newspapers | Grok |
| P | 45.7 | The man behind it was a butcher from the Bronx | The De Angelis photograph (public domain), name on screen | have it |
| T18 | 47.0 | (same line) | Butcher's hands, cleaver on a block | Grok |
| G3 | 48.9 | This is how he fooled all of them | Rapid flashback of six earlier shots | built in code |
| T19 | 51.1 | And why, for six years, nobody looked down | Looking straight down into a black open hatch | Grok, **clip** |

## Prompts
- **T1** `Set in November 1963: a yard of large cylindrical steel storage tanks on the New Jersey waterfront at grey dawn, mist, wet gravel, a single work lamp still burning.` Clip movement: drifting mist, lamp flicker.
- **T2** `Set in 1963: close-up of a worker's gloved hands turning a large iron valve wheel at the base of a storage tank, dark liquid gushing from a wide pipe into a concrete channel.` Clip movement: wheel turning, liquid flowing.
- **T3** `Extreme close-up of golden vegetable oil pouring in a thick glossy stream into a steel drum, warm light glinting through it.`
- **T4** `Set in 1963: the inside of a huge empty steel storage tank seen from the floor, three men in overcoats and hats standing ankle-deep in dark water, flashlight beams on the rusted walls, a small circle of daylight from the hatch far above.` Clip movement: rippling water, moving flashlight beams.
- **T5** `Set in 1963: high aerial view of an industrial tank yard on the Bayonne, New Jersey waterfront, dozens of round storage tanks in rows, rail sidings, the harbour beyond, overcast light.`
- **T6** `Set in the early 1960s: a massive round steel bank vault door standing half open in a marble basement, a guard in silhouette beside it.`
- **T7** `Set in the early 1960s: close-up of a man's hand bringing a wooden rubber stamp down onto a printed certificate on a desk, ink pad beside it, brass desk lamp.` Clip movement: the stamp pressing down and lifting.
- **T8** `Set in 1960: a man in a hat inside a public telephone booth at night, seen from behind through rain-streaked glass, holding the receiver, a street lamp glowing outside.` Clip movement: rain running down the glass.
- **T9** `Set in 1960: a black rotary telephone on a large polished executive desk in an empty wood-panelled office at dusk, the leather chair turned away and empty.`
- **T10** `Set in 1963: an empty circular concrete foundation pad overgrown with weeds in a gap between two large storage tanks, puddles, a rusted pipe ending in mid-air.`
- **T11** `Set in 1963: close-up of a heavy man's hand signing a printed certificate with a fountain pen under a single desk lamp at night, the rest of the room in darkness.` Clip movement: the pen moving.
- **T12** `Set in 1963: close-up looking down into an open wooden desk drawer at night, a thick pad of blank printed certificates inside, lit by a desk lamp.`
- **T13** `Set in 1963: a stock exchange trading floor in uproar seen from a balcony, a dense crowd of men in suits waving paper slips, backs and raised arms only, paper littering the floor.` Clip movement: the crowd surging, arms waving.
- **T14** `Set in November 1963: a tight group of men in suits and hats seen from behind, crowded around a teletype machine spilling paper tape in a brokerage office, cold window light.`
- **T15** `Set in 1963: a stripped, abandoned industrial office, filing drawers hanging open and empty, papers on the floor, a small steel safe standing open and empty.`
- **T16** `Close-up of a small open tin cash box on a bare desk holding only a few crumpled dollar bills and some coins, harsh single lamp.`
- **T17** `Set in 1964: a young man in shirtsleeves seen from behind at a plain desk piled with newspapers and annual reports, one telephone, afternoon sun through blinds.`
- **T18** `Set in the 1930s: close-up of a butcher's thick hands in a stained apron resting a cleaver on a scarred wooden block, cold white light.`
- **T19** `Looking straight down from above into the round open hatch on the roof of a steel storage tank, pure black inside, a thin measuring line hanging down into the dark.` Clip movement: the camera slowly descending toward the hatch, the line swaying.

Save them as `t01.jpg` … `t19.jpg` (clips as `t01.mp4` etc.) so I can drop them straight in.
