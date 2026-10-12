# Lúcid

**Train what AI is making you forget.**

Lúcid is a daily brain-training web app. Every day it suggests four short exercises from different areas (maths, memory, attention, language, spatial reasoning…) to keep the habit of thinking for yourself. It's free, needs no sign-up and runs in any mobile or desktop browser.

👉 **[mpampols.github.io/lucid](https://mpampols.github.io/lucid/)**

## Features

- **Daily training** of 4 exercises, the same for everyone each day, with a streak of consecutive days.
- **9 games** with adaptive difficulty:

  | Game | Area | What it trains |
  |---|---|---|
  | Mental maths | Maths | Number fluency and working memory |
  | Ink | Attention | Inhibitory control (Stroop effect) |
  | Digits | Memory | Digit span |
  | Constellation | Spatial | Visuospatial memory (Corsi-style blocks) |
  | Anagrams | Language | Vocabulary and verbal flexibility |
  | Which is bigger? | Speed | Estimation and quick maths |
  | Switch | Flexibility | Task switching |
  | Echo | Memory | Working memory (n-back) |
  | Mirror | Spatial | Mental rotation |

- **Mental check-up** (3 minutes): standard spatial span (Corsi blocks), digit span and reaction time tests. Spatial span is compared with people of the same age and education using published norms; the other two are shown against classic references. Results can be shared and repeated over time.
- **Progress**: activity heatmap, score history per game, personal bests, trend and games per area.
- **Sharing**: a Wordle-style summary of the day (one row of squares per game, rated against your own best, without revealing the scores), image cards for social media, and challenge links: whoever opens yours is challenged to beat your score in that day's training.
- **Three languages**: Spanish, Catalan and English. Picked automatically from the browser language and can be changed manually.
- Light and dark mode, sounds and small animations (countdown, combos, praise, count-ups), keyboard controls, and layouts for phones in portrait and landscape.

## How it works

Plain HTML, CSS and JavaScript, with no frameworks and no build step. The JavaScript uses native browser modules (`import`/`export`), so GitHub Pages serves the files as they are. The only external resources are two Google Fonts.

- **Data** is stored in the browser's `localStorage` (key `lucid.v2`). Nothing is sent to any server. The *Progress* tab lets you copy a backup and restore it in another browser.
- **Sounds** are generated with the Web Audio API, with no audio files.
- **Daily plan** is derived from the date with a seeded pseudo-random generator, so it's the same for every user without a backend.

### Project structure

```
index.html            Page markup
assets/               Favicon
css/
  tokens.css          Colours, typefaces and light/dark themes
  base.css            Base styles, header, tabs and buttons
  home.css            Home screen
  progress.css        Progress screen
  play.css            Game shell: timer bar, intro and results
  games.css           Game-specific styles
  share.css           Share sheet and challenge banner
  check.css           Mental check-up
  responsive.css      Small phones and landscape layout
  animations.css      Animations and reduced motion
js/
  main.js             Entry point and global events
  state.js            App state
  store.js            Persistence (localStorage), migrations and backups
  daily.js            Daily training and streak
  engine.js           Game engine: timer, scoring, results
  nav.js              Navigation between views
  sound.js            Sound effects
  icons.js            SVG icons
  confetti.js         Confetti
  check.js            Mental check-up (tests, results, age chart)
  norms.js            Reference data and percentile maths
  fx.js               Feedback effects: glow, haptics, count-up, praise
  share.js            Share texts, share sheet and challenge links
  share-cards.js      Image cards drawn on a canvas
  config.js           Public URL and day numbering
  utils.js            Utilities
  i18n/               Texts in es, ca and en, plus language detection
  games/              One file per game + registry (index.js)
  views/              Header, home and progress views
```

### Adding a game

1. Create `js/games/mygame.js` exporting `initMyGame(stage, api)`. It receives the container element and a small API: `api.correct(points)`, `api.wrong()`, `api.later(fn, ms)`, `api.key(fn)` and `api.t()` for the current texts.
2. Register it in `js/games/index.js` (area, duration or lives) and add it to `ORDER`.
3. Add its texts to `js/i18n/es.js`, `ca.js` and `en.js`, under `games`.
4. Put any styles it needs in `css/games.css`.

All persistence goes through `js/store.js`, so adding a backend later only means changing that module.

## Running locally

Because it uses ES modules, browsers won't run it by double-clicking `index.html`; you need a local server. With Python:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

`npx serve` or the VS Code Live Server extension work too.

## Roadmap

- More games, including "no-AI" challenges (estimation, everyday maths, orientation).
- Installable app (PWA) with offline support.
- Native mobile app for iOS and Android.
- Optional sync across devices.

## A note on the science

The exercises are based on classic cognitive psychology tasks (Stroop, n-back, Corsi blocks, mental rotation, task switching). Even so, the evidence that brain training improves abilities beyond the games themselves is limited. Lúcid doesn't promise miracles: the goal is to keep the habit of making a small mental effort every day.

### References used by the check-up

- Spatial span percentile: [Regression-based normative data for Corsi Span and Supraspan learning and recall among Italian adults](https://pmc.ncbi.nlm.nih.gov/articles/PMC11554723/) (N = 340, ages 21–89). Expected span = 4.97 − 0.7616·(ln age − 3.864) + 0.4229·(√years of education − 3.555), residual SD ≈ 0.90.
- Reaction time context: Der & Deary (2006), UK Health and Lifestyle Survey (N = 7,130), as summarised in [Woodley et al. (2015)](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2015.00452/full).
- Digit span context: Miller, G. A. (1956), *The magical number seven, plus or minus two*.

These comparisons are indicative only: the reference samples, devices and procedures differ from a phone or browser.

## Author

Made by [Marc Pàmpols](https://marcpampols.net).

## License

[MIT](LICENSE)
