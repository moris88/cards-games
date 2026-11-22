import { createFrenchDeck, type FrenchCard, shuffle } from "../../core/deck";
import { addEvent, type GameEvent } from "../../core/gameEvents";
import {
	canFound,
	canStack,
	foundationFor,
	isSequence,
	type Location,
	MAX_HISTORY,
} from "./solitaireRules";

export type DrawCount = 1 | 3;

interface KlondikeSnapshot {
	stock: FrenchCard[];
	waste: FrenchCard[];
	foundations: FrenchCard[][];
	tableau: FrenchCard[][];
	/** Carte coperte in cima a ogni colonna */
	faceDown: number[];
	score: number;
	moves: number;
}

export interface KlondikeState extends KlondikeSnapshot {
	drawCount: DrawCount;
	elapsed: number;
	won: boolean;
	history: KlondikeSnapshot[];
	events: GameEvent[];
}

type Target = { kind: Location["kind"]; index: number };

/** Punteggio standard */
const POINTS = {
	wasteToTableau: 5,
	toFoundation: 10,
	turnOver: 5,
	foundationToTableau: -15,
	recycle: { 1: -100, 3: -20 },
} as const;

/** Carte da girare, con 1 come valore di sicurezza per salvataggi incompleti */
export const drawCountOf = (s: KlondikeState): DrawCount =>
	s.drawCount === 3 ? 3 : 1;

export function createKlondike(drawCount: DrawCount): KlondikeState {
	const deck = shuffle(createFrenchDeck());
	const tableau = Array.from({ length: 7 }, (_, i) => deck.splice(-(i + 1)));
	return {
		stock: deck,
		waste: [],
		foundations: [[], [], [], []],
		tableau,
		faceDown: tableau.map((col) => col.length - 1),
		score: 0,
		moves: 0,
		drawCount: drawCount === 3 ? 3 : 1,
		elapsed: 0,
		won: false,
		history: [],
		events: [],
	};
}

const snapshot = (s: KlondikeState): KlondikeSnapshot => ({
	stock: s.stock,
	waste: s.waste,
	foundations: s.foundations,
	tableau: s.tableau,
	faceDown: s.faceDown,
	score: s.score,
	moves: s.moves,
});

/** Registra la mossa nella cronologia (per Annulla) e controlla la vittoria */
function commit(prev: KlondikeState, next: KlondikeState): KlondikeState {
	const won = next.foundations.every((f) => f.length === 13);
	return {
		...next,
		score: Math.max(0, next.score),
		moves: prev.moves + 1,
		won,
		history: [...prev.history, snapshot(prev)].slice(-MAX_HISTORY),
		events:
			won && !prev.won
				? addEvent(next.events, "Solitario completato!", "win")
				: next.events,
	};
}

export function drawStock(s: KlondikeState): KlondikeState {
	if (s.stock.length === 0) {
		if (s.waste.length === 0) return s;
		// Il pozzo torna nel mazzo, girato
		return commit(s, {
			...s,
			stock: [...s.waste].reverse(),
			waste: [],
			score: s.score + POINTS.recycle[drawCountOf(s)],
		});
	}
	const drawn = s.stock.slice(-drawCountOf(s)).reverse();
	return commit(s, {
		...s,
		stock: s.stock.slice(0, -drawn.length),
		waste: [...s.waste, ...drawn],
	});
}

/** Carte prese da una posizione (per la colonna: dalla carta indicata in giù) */
function takeCards(s: KlondikeState, from: Location): FrenchCard[] {
	if (from.kind === "waste") return s.waste.slice(-1);
	if (from.kind === "foundation") return s.foundations[from.index].slice(-1);
	if (from.kind !== "tableau" || from.cardIndex < s.faceDown[from.index])
		return [];
	const cards = s.tableau[from.index].slice(from.cardIndex);
	return isSequence(cards) ? cards : [];
}

function scoreFor(from: Location, to: Target): number {
	if (to.kind === "foundation")
		return from.kind === "foundation" ? 0 : POINTS.toFoundation;
	if (from.kind === "waste") return POINTS.wasteToTableau;
	if (from.kind === "foundation") return POINTS.foundationToTableau;
	return 0;
}

export function moveCards(
	s: KlondikeState,
	from: Location,
	to: Target,
): KlondikeState | null {
	const cards = takeCards(s, from);
	if (cards.length === 0 || s.won) return null;
	if (to.kind === "foundation") {
		if (cards.length !== 1 || !canFound(s.foundations[to.index], cards[0]))
			return null;
	} else if (to.kind === "tableau") {
		if (from.kind === "tableau" && from.index === to.index) return null;
		const top = s.tableau[to.index][s.tableau[to.index].length - 1];
		if (top ? !canStack(top, cards[0]) : cards[0].rank !== 13) return null;
	} else return null;

	const tableau = s.tableau.map((col) => [...col]);
	const foundations = s.foundations.map((f) => [...f]);
	let waste = s.waste;
	const faceDown = [...s.faceDown];
	let score = s.score + scoreFor(from, to);

	if (from.kind === "waste") waste = waste.slice(0, -1);
	else if (from.kind === "foundation") foundations[from.index].pop();
	else if (from.kind === "tableau") {
		tableau[from.index].splice(from.cardIndex);
		// Si scopre la carta rimasta in cima alla colonna
		const length = tableau[from.index].length;
		if (length > 0 && faceDown[from.index] >= length) {
			faceDown[from.index] = length - 1;
			score += POINTS.turnOver;
		}
	}
	if (to.kind === "foundation") foundations[to.index].push(cards[0]);
	else tableau[to.index].push(...cards);

	return commit(s, { ...s, tableau, foundations, waste, faceDown, score });
}

/** Doppio clic: manda la carta in fondazione se possibile */
export function sendToFoundation(
	s: KlondikeState,
	from: Location,
): KlondikeState | null {
	const [card] = takeCards(s, from).slice(-1);
	if (!card) return null;
	const index = foundationFor(s.foundations, card);
	return index < 0 ? null : moveCards(s, from, { kind: "foundation", index });
}

export const canAutoComplete = (s: KlondikeState) =>
	!s.won &&
	s.stock.length === 0 &&
	s.waste.length === 0 &&
	s.faceDown.every((n) => n === 0);

/** Un passo del completamento automatico: la carta più bassa va in fondazione */
export function autoStep(s: KlondikeState): KlondikeState | null {
	const candidates = s.tableau
		.map((col, index) => ({ index, card: col[col.length - 1] }))
		.filter((c) => c.card)
		.sort((a, b) => a.card.rank - b.card.rank);
	for (const { index } of candidates) {
		const next = sendToFoundation(s, {
			kind: "tableau",
			index,
			cardIndex: s.tableau[index].length - 1,
		});
		if (next) return next;
	}
	return null;
}

export function undo(s: KlondikeState): KlondikeState {
	const previous = s.history[s.history.length - 1];
	if (!previous || s.won) return s;
	return { ...s, ...previous, history: s.history.slice(0, -1) };
}
