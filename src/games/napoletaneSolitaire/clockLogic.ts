import {
	createNeapolitanDeck,
	type NeapolitanCard,
	shuffle,
} from "../../core/deck";
import { addEvent, type GameEvent } from "../../core/gameEvents";

/** Mazzetti dell'orologio: uno per valore, dall'Asso (indice 0) al Re (indice 9, al centro) */
export interface ClockPile {
	down: NeapolitanCard[];
	up: NeapolitanCard[];
}

export interface ClockState {
	piles: ClockPile[];
	/** Carta appena girata, da mettere sotto il mazzetto del suo valore */
	current: NeapolitanCard | null;
	moves: number;
	elapsed: number;
	phase: "gioco" | "vinto" | "perso";
	events: GameEvent[];
}

export const KING_PILE = 9;
export const pileFor = (card: NeapolitanCard) => card.rank - 1;

export function createClock(): ClockState {
	const deck = shuffle(createNeapolitanDeck());
	const piles = Array.from({ length: 10 }, () => ({
		down: deck.splice(-4),
		up: [] as NeapolitanCard[],
	}));
	// Si comincia girando la prima carta del mazzetto centrale (Re)
	const current = piles[KING_PILE].down.pop() ?? null;
	return { piles, current, moves: 0, elapsed: 0, phase: "gioco", events: [] };
}

/**
 * Mette la carta corrente scoperta sotto il mazzetto del suo valore e gira
 * la prima carta coperta di quel mazzetto. Finite le carte coperte del
 * mazzetto (succede con il quarto Re) la partita finisce.
 */
export function placeCurrent(s: ClockState): ClockState {
	const card = s.current;
	if (!card || s.phase !== "gioco") return s;
	const target = pileFor(card);
	const piles = s.piles.map((p, i) =>
		i === target ? { down: [...p.down], up: [...p.up, card] } : p,
	);
	const next = piles[target].down.pop() ?? null;
	if (next) return { ...s, piles, current: next, moves: s.moves + 1 };

	const won = piles.every((p) => p.down.length === 0);
	return {
		...s,
		piles,
		current: null,
		moves: s.moves + 1,
		phase: won ? "vinto" : "perso",
		events: addEvent(
			s.events,
			won ? "Orologio completato!" : "Quarto Re: partita persa",
			won ? "win" : "lose",
		),
	};
}

/** Carte ancora coperte */
export const remainingDown = (s: ClockState) =>
	s.piles.reduce((n, p) => n + p.down.length, 0);
