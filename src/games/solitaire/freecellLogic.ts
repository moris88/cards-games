import type { FrenchCard, FrenchSuit } from "../../core/deck";
import { addEvent, type GameEvent } from "../../core/gameEvents";
import {
	canFound,
	canStack,
	foundationFor,
	isSequence,
	type Location,
	MAX_HISTORY,
} from "./solitaireRules";

export const MAX_DEAL = 1_000_000;

interface FreeCellSnapshot {
	cells: (FrenchCard | null)[];
	foundations: FrenchCard[][];
	tableau: FrenchCard[][];
	moves: number;
}

export interface FreeCellState extends FreeCellSnapshot {
	dealNumber: number;
	elapsed: number;
	won: boolean;
	history: FreeCellSnapshot[];
	events: GameEvent[];
}

type Target = { kind: Location["kind"]; index: number };

const DEAL_SUITS: FrenchSuit[] = ["fiori", "quadri", "cuori", "picche"];

/**
 * Distribuzione numerata con il classico generatore lineare congruenziale:
 * lo stesso numero di partita produce sempre la stessa distribuzione.
 */
export function dealFreeCell(dealNumber: number): FrenchCard[][] {
	let seed = dealNumber;
	const deck = Array.from({ length: 52 }, (_, i) => i);
	const tableau: FrenchCard[][] = Array.from({ length: 8 }, () => []);
	for (let left = 52; left > 0; left--) {
		seed = (seed * 214013 + 2531011) % 2 ** 31;
		const j = Math.floor(seed / 2 ** 16) % left;
		const n = deck[j];
		deck[j] = deck[left - 1];
		const suit = DEAL_SUITS[n % 4];
		const rank = Math.floor(n / 4) + 1;
		tableau[(52 - left) % 8].push({ id: `${suit}-${rank}-p`, suit, rank });
	}
	return tableau;
}

export const randomDeal = () => 1 + Math.floor(Math.random() * MAX_DEAL);

export function createFreeCell(dealNumber: number): FreeCellState {
	return {
		cells: [null, null, null, null],
		foundations: [[], [], [], []],
		tableau: dealFreeCell(dealNumber),
		moves: 0,
		dealNumber,
		elapsed: 0,
		won: false,
		history: [],
		events: [],
	};
}

/** Quante carte si possono spostare insieme, usando celle e colonne vuote */
export function maxMovable(s: FreeCellState, toEmptyColumn: boolean): number {
	const freeCells = s.cells.filter((c) => c === null).length;
	const emptyColumns =
		s.tableau.filter((c) => c.length === 0).length - (toEmptyColumn ? 1 : 0);
	return (freeCells + 1) * 2 ** Math.max(0, emptyColumns);
}

function takeCards(s: FreeCellState, from: Location): FrenchCard[] {
	if (from.kind === "cell") {
		const card = s.cells[from.index];
		return card ? [card] : [];
	}
	if (from.kind === "foundation") return s.foundations[from.index].slice(-1);
	if (from.kind !== "tableau") return [];
	const cards = s.tableau[from.index].slice(from.cardIndex);
	return isSequence(cards) ? cards : [];
}

export function moveCards(
	s: FreeCellState,
	from: Location,
	to: Target,
): FreeCellState | null {
	const cards = takeCards(s, from);
	if (cards.length === 0 || s.won) return null;
	if (from.kind === to.kind && "index" in from && from.index === to.index)
		return null;

	if (to.kind === "foundation") {
		if (cards.length !== 1 || !canFound(s.foundations[to.index], cards[0]))
			return null;
	} else if (to.kind === "cell") {
		if (cards.length !== 1 || s.cells[to.index] !== null) return null;
	} else if (to.kind === "tableau") {
		const column = s.tableau[to.index];
		const top = column[column.length - 1];
		if (top && !canStack(top, cards[0])) return null;
		if (cards.length > maxMovable(s, !top)) return null;
	} else return null;

	const tableau = s.tableau.map((col) => [...col]);
	const foundations = s.foundations.map((f) => [...f]);
	const cells = [...s.cells];

	if (from.kind === "cell") cells[from.index] = null;
	else if (from.kind === "foundation") foundations[from.index].pop();
	else if (from.kind === "tableau") tableau[from.index].splice(from.cardIndex);

	if (to.kind === "foundation") foundations[to.index].push(cards[0]);
	else if (to.kind === "cell") cells[to.index] = cards[0];
	else tableau[to.index].push(...cards);

	const won = foundations.every((f) => f.length === 13);
	return {
		...s,
		tableau,
		foundations,
		cells,
		moves: s.moves + 1,
		won,
		history: [
			...s.history,
			{
				cells: s.cells,
				foundations: s.foundations,
				tableau: s.tableau,
				moves: s.moves,
			},
		].slice(-MAX_HISTORY),
		events: won
			? addEvent(s.events, `Partita #${s.dealNumber} vinta!`, "win")
			: s.events,
	};
}

/** Doppio clic: in fondazione se possibile, altrimenti in una cella libera */
export function quickMove(
	s: FreeCellState,
	from: Location,
): FreeCellState | null {
	const [card] = takeCards(s, from).slice(-1);
	if (!card) return null;
	const foundation = foundationFor(s.foundations, card);
	if (foundation >= 0)
		return moveCards(s, from, { kind: "foundation", index: foundation });
	const cell = s.cells.indexOf(null);
	return cell >= 0 && from.kind === "tableau"
		? moveCards(s, from, { kind: "cell", index: cell })
		: null;
}

export function undo(s: FreeCellState): FreeCellState {
	const previous = s.history[s.history.length - 1];
	if (!previous || s.won) return s;
	return { ...s, ...previous, history: s.history.slice(0, -1) };
}
