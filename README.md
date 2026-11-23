# Cards Games

Raccolta di giochi di carte e da tavolo italiani da giocare nel browser contro avversari controllati dal computer. Funziona anche su telefono e tablet.

## Giochi

**Carte napoletane**

- Scopa e Scopone
- Briscola
- Sette e mezzo
- Solitari Piramide e Orologio

**Carte francesi**

- Scala 40
- Poker (Texas Hold'em con fiches)
- Solitario (Klondike) e FreeCell

**Altro**

- Tombola con smorfia napoletana

Dal menu principale si scelgono il numero di avversari, i nomi dei giocatori e la difficoltà di ciascun gioco. Il regolamento di ogni gioco è consultabile dal menu.

La partita in corso viene salvata automaticamente nel browser (`localStorage`) e si può riprendere in seguito. Non serve alcun server.

## Tecnologie

React 19, TypeScript, Vite, Tailwind CSS 4, framer-motion. Biome per lint e formattazione, Vitest per i test.

## Sviluppo

```bash
npm install
npm run dev        # server di sviluppo su http://localhost:3000
npm run build      # controllo dei tipi e build di produzione in dist/
npm run preview    # anteprima della build
npm run lint       # controllo con Biome
npm run format     # correzioni automatiche con Biome
npm test           # test con Vitest
```

## Struttura

- `src/core/`: mazzi, impostazioni, salvataggio delle partite ed eventi di gioco
- `src/components/`: componenti condivisi (tavolo, mano, carte, avversari, fiches)
- `src/games/<gioco>/`: logica pura del gioco, IA, hook di stato e componenti
- `src/menu/`: menu principale, opzioni e regolamenti

## Crediti

Le immagini delle carte sono in `public/cards/`. Le fonti e le licenze sono in [`public/cards/CREDITS.md`](public/cards/CREDITS.md).
