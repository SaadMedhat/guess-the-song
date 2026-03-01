# CLAUDE.md — Guess The Song

## Identità del Progetto

Gioco web "indovina la canzone" dove l'utente ascolta un preview audio e deve indovinare titolo e artista.
Usa Deezer API come data source (gratuita, no auth, no API key).
L'app deve sentirsi come un gioco vero — coinvolgente, veloce, con feedback immediato e un loop di gioco che ti fa venire voglia di rigiocare.
NON è un quiz statico con domande e risposte. È un'esperienza audio-first, ritmica, con tensione e gratificazione.

---

## Stack

- **Next.js 15 (App Router) + TypeScript**
- **shadcn/ui + Tailwind CSS**
- **TanStack React Query** per data fetching e caching
- **Framer Motion** per animazioni
- **Zustand** per game state e statistiche persistenti
- Package manager: **pnpm**
- API: Deezer (api.deezer.com)
- Audio: HTML5 Audio API nativa

---

## Regole Dure (Ban)

- **No `let`**, **no `var`** — sempre `const`
- **No `else`** — early returns
- **No `switch`** — object maps o if/return chains
- **No loop imperativi**: `for`, `for...of`, `for...in`, `while`, `do...while` → `.map()`, `.filter()`, `.reduce()`, `.forEach()`
- **No `any`**, **no `unknown`**
- **No colori hex hardcoded** — tutto via CSS variables in `globals.css`
- **No colori Tailwind arbitrari** (es. `text-[#ff0000]`) — solo design tokens
- **No `console.log`** — logger utility se serve
- **No fetch in useEffect** — sempre TanStack Query (eccezione: audio playback)
- **No default exports** (eccezione: Next.js pages/layouts)
- **No class components**

---

## Anti-Vibecodato — Regole di Design Obbligatorie

### Identità visiva
- L'app è un GIOCO — deve avere energia, tensione, ritmo visivo
- Riferimenti: Heardle (RIP), Spotify Wrapped, Wordle — interfacce minimali ma con personalità forte
- L'audio è protagonista — la UI deve amplificare l'esperienza di ascolto, non distrarla
- Feedback visivi immediati: risposta corretta = celebrazione, sbagliata = feedback chiaro ma non punitivo

### Tipografia
- Display font bold e impattante per titoli e score (Syne, Space Grotesk, Clash Display, o simile)
- Body: sans-serif pulito
- I numeri (score, timer, round) devono essere grandi e leggibili — sono informazione critica durante il gioco
- Tabular numbers (font-variant-numeric: tabular-nums) per timer e score — evita il "ballare" delle cifre

### Layout
- Game-first: lo schermo di gioco è il cuore, deve essere pulito e focalizzato
- Nessun elemento distrae durante il gameplay — niente sidebar, niente header pesante
- Mobile-first: il gioco DEVE funzionare perfettamente su mobile, è il caso d'uso primario
- Le interazioni chiave (play, risposta, skip) devono essere raggiungibili col pollice

### Colori
- Palette vivace ma controllata — energia senza caos
- Background scuro (il mood "ascolto musica" è notturno)
- Accent color energico: verde neon, viola elettrico, o arancio caldo — UNO solo, usato per le azioni primarie e il feedback positivo
- Rosso/corallo per errori, verde/teal per successi
- Le cover degli album aggiungono colore naturalmente — la UI non compete

### Animazioni (Framer Motion)
- Il TIMER è il cuore dell'esperienza — deve avere un'animazione visiva che comunica urgenza (barra che si svuota, cerchio che si chiude, pulse che accelera)
- Risposta corretta: celebrazione esplosiva ma breve (confetti, flash, scale-up del punteggio)
- Risposta sbagliata: shake sottile + reveal dell'artwork/titolo
- Transizione tra round: veloce e fluida, non interrompere il ritmo
- Audio visualizer: barra o waveform animata che mostra che l'audio sta suonando
- Skip: slide-out del round corrente, slide-in del successivo

### Micro-interazioni
- Bottone play: pulse/glow mentre l'audio suona
- Input risposta: autocomplete con animazione
- Score counter: incremento animato quando si guadagnano punti
- Streak counter con animazione crescente
- Round indicator (1/10, 2/10) con progress visivo

### Cosa NON fare mai
- Quiz statico con 4 bottoni di risposta allineati (troppo Trivia Crack)
- Layout centrato con domanda + risposte + next (troppo Google Forms)
- Risultati finali come una tabella
- Animazioni lente che rallentano il loop di gioco
- Pop-up modali per ogni feedback

---

## Struttura Repository

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # Landing → scegli modalità
│   ├── play/
│   │   ├── classic/
│   │   │   └── page.tsx                # Single player classico
│   │   ├── timed/
│   │   │   └── page.tsx                # Modalità a tempo (audio progressivo)
│   │   ├── challenge/
│   │   │   └── page.tsx                # Sfida per genere/decennio
│   │   └── local/
│   │       └── page.tsx                # Multiplayer locale
│   ├── results/
│   │   └── page.tsx                    # Schermata risultati post-partita
│   └── stats/
│       └── page.tsx                    # Statistiche personali
├── components/
│   ├── ui/                             # shadcn components
│   ├── layout/                         # Header minimal, Navigation
│   ├── game/
│   │   ├── audio-player.tsx            # Player audio con visualizer
│   │   ├── answer-input.tsx            # Input con autocomplete
│   │   ├── timer-bar.tsx               # Barra timer animata
│   │   ├── round-indicator.tsx         # Progresso round (1/10)
│   │   ├── score-display.tsx           # Score animato
│   │   ├── streak-counter.tsx          # Streak con animazione
│   │   ├── song-reveal.tsx             # Reveal canzone (cover + titolo + artista)
│   │   ├── result-feedback.tsx         # Feedback corretto/sbagliato
│   │   └── game-over.tsx              # Schermata fine partita
│   ├── modes/
│   │   ├── mode-card.tsx               # Card selezione modalità nella landing
│   │   ├── genre-picker.tsx            # Selezione genere per challenge mode
│   │   └── player-setup.tsx            # Setup giocatori per multiplayer locale
│   └── stats/
│       ├── stats-overview.tsx          # Panoramica statistiche
│       └── history-list.tsx            # Storico partite
├── hooks/
│   ├── use-audio-player.ts            # Gestione HTML5 Audio (play, pause, seek, time)
│   ├── use-game-engine.ts             # Logica core del gioco (round, scoring, state machine)
│   ├── use-timer.ts                   # Timer con callback
│   └── use-debounce.ts               # Debounce per search autocomplete
├── lib/
│   ├── api/
│   │   ├── deezer-client.ts           # Client Deezer API
│   │   ├── queries.ts                 # React Query hooks
│   │   └── track-pool.ts             # Logica per costruire pool di brani per ogni modalità
│   ├── stores/
│   │   ├── game-store.ts              # Zustand — stato partita in corso
│   │   └── stats-store.ts            # Zustand + persist — statistiche e storico
│   ├── utils/
│   │   ├── scoring.ts                 # Calcolo punteggio (tempo, streak, difficulty)
│   │   ├── fuzzy-match.ts            # Matching fuzzy per le risposte (tolleranza typo)
│   │   └── shuffle.ts                # Fisher-Yates shuffle per randomizzare brani
│   ├── motion.ts                      # Framer Motion variants e presets
│   └── constants.ts                   # Generi Deezer, decenni, configurazione modalità
├── types/
│   ├── deezer.ts                      # Tipi response Deezer
│   ├── game.ts                        # Tipi game state, round, player
│   └── stats.ts                       # Tipi statistiche
└── styles/
    └── globals.css
```

Cartelle: **kebab-case**. Componenti/Tipi: **PascalCase**. Variabili/funzioni: **camelCase**. Costanti: **SCREAMING_SNAKE_CASE** con `as const`.

---

## TypeScript

- `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`
- Sempre `type` in favore di `interface`
- Sempre `readonly` per proprietà di primo livello
- Tipi espliciti per return di funzioni
- No prefisso `I` o `T`
- Boolean: prefisso `is` (es. `isPlaying`, `isCorrect`, `isGameOver`)
- Path aliases: `@/components`, `@/lib`, `@/types`, `@/hooks`

---

## Deezer API

Base URL: `https://api.deezer.com`
Nessuna autenticazione richiesta. Nessuna API key.

CORS: Deezer API NON supporta CORS dal browser. Serve un API route proxy in Next.js.

### API Route Proxy
Crea `src/app/api/deezer/[...path]/route.ts`:
- Riceve qualsiasi path, lo inoltra a `https://api.deezer.com/{path}`
- Passa tutti i query params
- Ritorna la response JSON
- Il client chiama `/api/deezer/search?q=...`

### Endpoint

```
GET /search?q={query}                      # Cerca brani → ritorna lista con preview URL
GET /chart                                 # Top brani del momento
GET /chart/{genre_id}                      # Top brani per genere
GET /genre                                 # Lista generi
GET /genre/{id}/artists                    # Artisti per genere
GET /artist/{id}/top                       # Top brani di un artista
GET /playlist/{id}/tracks                  # Brani di una playlist
GET /track/{id}                            # Dettaglio brano
```

### Campi chiave nella response track
```
id: number
title: string
title_short: string              # Titolo senza "(feat. ...)" → USARE QUESTO per il matching
artist: { id, name }
album: { id, title, cover_medium, cover_big }
preview: string                  # URL MP3 30 secondi → IL CUORE DEL GIOCO
duration: number                 # Durata totale in secondi
```

### Attenzione
- `preview` è un URL a un file MP3 di 30 secondi → funziona con HTML5 Audio direttamente
- Non tutti i brani hanno un preview (raro ma possibile) → filtrare `track.preview !== ""`
- Il campo `title_short` è più pulito per il matching → non include "(feat. ...)" etc.
- La search ritorna max 25 risultati per pagina → usare `&index=25` per paginare
- I generi Deezer hanno ID fissi (132 = Pop, 116 = Rap, 152 = Rock, etc.)
- Le cover album sono disponibili in varie size: `cover_small`, `cover_medium`, `cover_big`, `cover_xl`

---

## Modalità di Gioco

### 1. Classic (Single Player)
- 10 round
- Pool di brani: chart del momento (top brani popolari)
- L'utente ascolta il preview (30s) e deve indovinare titolo O artista
- Input libero con autocomplete (cerca su Deezer in tempo reale)
- Risposta corretta = punti (base 100, bonus tempo, bonus streak)
- 3 skip disponibili
- Alla fine: score totale, recap dei round, share

### 2. Timed (Audio Progressivo)
- 10 round
- Pool di brani: chart del momento
- L'audio parte con solo 2 secondi di preview
- Se non indovini, si sblocca più audio: 2s → 5s → 10s → 15s → 30s
- Meno audio usi, più punti guadagni (indovinare a 2s = punteggio massimo)
- Un timer globale di 15 secondi per tentativo ad ogni step
- Più difficile e teso del Classic

### 3. Challenge (Genere/Decennio)
- 10 round
- L'utente sceglie: genere (Pop, Rock, Rap, Elettronica, etc.) O decennio (80s, 90s, 2000s, 2010s, 2020s)
- Pool di brani filtrato per la scelta
- Stesse meccaniche del Classic
- Alla fine: score + classifica per genere/decennio

### 4. Local Multiplayer
- 2-4 giocatori sullo stesso schermo
- Setup: inserisci nomi dei giocatori
- 10 round, si alternano i turni (o tutti rispondono contemporaneamente — scegli la versione più divertente)
- Versione suggerita: tutti ascoltano, il primo che risponde correttamente prende i punti. Buzzer per ciascun giocatore.
- Alla fine: classifica dei giocatori

---

## Game Engine (`hooks/use-game-engine.ts`)

State machine del gioco:

```
IDLE → LOADING_TRACKS → READY → PLAYING_AUDIO → WAITING_ANSWER →
  → CORRECT (feedback) → NEXT_ROUND
  → WRONG (feedback) → NEXT_ROUND
  → SKIPPED → NEXT_ROUND
  → TIME_UP → NEXT_ROUND
NEXT_ROUND → PLAYING_AUDIO (se round < max)
NEXT_ROUND → GAME_OVER (se round === max)
```

Il game engine è un hook che gestisce tutto lo stato della partita:
- Round corrente, score, streak, skip rimanenti
- Stato corrente della state machine
- Brano corrente dal pool
- Funzioni: `startGame()`, `submitAnswer(answer)`, `skip()`, `nextRound()`

Il game engine NON gestisce l'audio — quello è `use-audio-player.ts`.

---

## Audio Player (`hooks/use-audio-player.ts`)

Wrapper attorno a HTML5 Audio API:
- `play(url)`, `pause()`, `stop()`, `seek(time)`
- Stato: `isPlaying`, `currentTime`, `duration`
- Per la modalità Timed: `playSegment(url, startTime, endTime)` → riproduce solo un segmento
- Cleanup: fermare l'audio quando il componente smonta
- Preload: precaricare il prossimo brano durante il round corrente

---

## Fuzzy Matching (`lib/utils/fuzzy-match.ts`)

L'utente scrive a mano il titolo → serve tolleranza per typo e variazioni.
Regole di matching:
- Case insensitive
- Ignorare punteggiatura e caratteri speciali
- Tolleranza: Levenshtein distance ≤ 2 per parole corte, ≤ 3 per parole lunghe
- Matchare anche se l'utente scrive solo una parte significativa del titolo
- Matchare sia `title_short` che `artist.name` → se uno dei due matcha, è corretto
- Autocomplete dalla search Deezer come aiuto

---

## Scoring (`lib/utils/scoring.ts`)

- Base: 100 punti per risposta corretta
- Bonus tempo: `Math.round(100 * (tempoRimanente / tempoTotale))` punti extra
- Bonus streak: 10 punti extra per ogni risposta consecutiva corretta (capped a 50)
- Modalità Timed: moltiplicatore basato sullo step (2s = x5, 5s = x3, 10s = x2, 15s = x1.5, 30s = x1)
- Skip: 0 punti, interrompe la streak

---

## Track Pool (`lib/api/track-pool.ts`)

Funzioni per costruire il pool di brani per ogni modalità:
- `getClassicPool()`: top chart → shuffle → prendi 10
- `getTimedPool()`: stessa cosa del classic
- `getChallengePool(genreId)`: chart per genere → shuffle → prendi 10
- `getDecadePool(decade)`: search brani per anno range → shuffle → prendi 10

Ogni funzione deve:
- Filtrare brani senza preview
- Evitare duplicati
- Shufflare con Fisher-Yates
- Ritornare esattamente N brani (con fallback se ne trova meno)

---

## Data Fetching

- Pool brani: fetch al momento dell'inizio partita con React Query
- Autocomplete search: client-side con React Query + debounce 200ms
- `staleTime: 1000 * 60 * 30` per chart (non cambiano spesso)
- `staleTime: 0` per search (sempre fresh)
- Prefetch del prossimo brano durante il round corrente

---

## Stato — Zustand

### Game Store (`lib/stores/game-store.ts`)
- Stato runtime della partita in corso (NON persistente)
- Round, score, streak, pool, modalità, giocatori (multiplayer)

### Stats Store (`lib/stores/stats-store.ts`)
- Persistente (localStorage via Zustand persist)
- Statistiche: partite giocate, vinte, punteggio medio, best score, streak migliore
- Storico: ultime N partite con risultati
- Stats per modalità

---

## Tailwind & shadcn

- Mobile-first
- Dark mode only
- `cn()` per classi condizionali
- Mai valori arbitrari per colori
- `font-variant-numeric: tabular-nums` per tutti i numeri in gioco (timer, score)

---

## Animazioni (Framer Motion)

- `lib/motion.ts` con variants e presets riutilizzabili
- Timer bar: `motion.div` con `animate={{ scaleX }}` legato al tempo rimanente
- Risposta corretta: combinazione di scale + colore + confetti
- Risposta sbagliata: shake (x oscillation con spring)
- Song reveal: flip o slide-up della cover + titolo
- Score increment: counter animato (0 → 150)
- Round transition: slide-out / slide-in
- Streak counter: scale bounce quando incrementa
- Audio visualizer: barre che oscillano (può essere finto, driven da un interval, non da analyser reale)
- `AnimatePresence` per mount/unmount di tutto
- `prefers-reduced-motion`: ridurre a fade/opacity only

---

## Accessibilità

- WCAG AA contrast
- Keyboard: Tab tra opzioni, Enter per rispondere, Space per play/pause
- `aria-label` su tutti i controlli audio
- `aria-live="polite"` per annunciare score, round, risultato
- Timer: aria-valuenow per screen reader
- Focus-visible coerente
- HTML semantico

---

## Loading & Error States

- Caricamento pool brani: schermata di loading con animazione tematica (non spinner generico)
- Errore Deezer: messaggio con retry
- Preview non disponibile: skip automatico al prossimo brano
- Autocomplete: skeleton inline

---

## Performance

- Preload audio del prossimo brano
- Debounce autocomplete 200ms
- Tree-shakeable imports
- Code splitting per modalità di gioco
- No `useMemo`/`useCallback` senza motivo

---

## Git

- Conventional commits: `type(scope): description`
- Tipi: `feat`, `fix`, `refactor`, `chore`
- Subject < 72 char, imperativo

---

## Build

```bash
pnpm dev        # next dev
pnpm build      # next build
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
```
