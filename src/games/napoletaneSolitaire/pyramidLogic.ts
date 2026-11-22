import {
	createNeapolitanDeck,
	type NeapolitanCard,
	shuffle,
} from "../../core/deck";
import { addEvent, type GameEvent } from "../../core/gameEvents";

export const ROWS = 6;
export const PYRAMID_SIZE = (ROWS * (ROWS + 1)) / 2;
const TARGET = 10;
const MAX_HISTORY = 100;

interface PyramidSnapshot {
	/** Carte della piramide riga per riga (null = già eliminata) */
	pyramid: (NeapolitanCard | null)[];
	stock: NeapolitanCard[];
	waste: NeapolitanCard[];
	moves: number;
}

export interface PyramidState extends PyramidSnapshot {
	elapsed: number;
	won: boolean;
	stuck: boolean;
	history: PyramidSnapshot[];
	events: GameEvent[];
}

/** Valore: dall'Asso (1) al 7, Fante 8, Cavallo 9, Re 10 */
export const cardValue = (c: NeapolitanCard) => c.rank;

/** Riga e posizione di un indice della piramide */
export function position(index: number): { row: number; col: number } {
	let row = 0;
	while (((row + 1) * (row + 2)) / 2 <= index) row++;
	return { row, col: index - (row * (row + 1)) / 2 };
}

const indexOf = (row: number, col: number) => (row * (row + 1)) / 2 + col;

/** Una carta è libera quando le due carte sotto di lei sono state eliminate */
export function isFree(
	pyramid: (NeapolitanCard | null)[],
	index: number,
): boolean {
	if (!pyramid[index]) return false;
	const { row, col } = position(index);
	if (row === ROWS - 1) return true;
	return !pyramid[indexOf(row + 1, col)] && !pyramid[indexOf(row + 1, col + 1)];
}

export function createPyramid(): PyramidState {
	const deck = shuffle(createNeapolitanDeck());
	return {
		pyramid: deck.splice(-PYRAMID_SIZE),
		stock: deck,
		waste: [],
		moves: 0,
		elapsed: 0,
		won: false,
		stuck: false,
		history: [],
		events: [],
	};
}

/** Carte giocabili: quelle libere della piramide e la cima del pozzo */
export function playableCards(s: PyramidState): NeapolitanCard[] {
	const free = s.pyramid.filter(
		(c, i): c is NeapolitanCard => c !== null && isFree(s.pyramid, i),
	);
	const top = s.waste[s.waste.length - 1];
	return top ? [...free, top] : free;
}

/** Esiste ancora una mossa? (coppia da 10, un Re, o carte da girare) */
function hasMoves(s: PyramidState): boolean {
	if (s.stock.length > 0) return true;
	const cards = playableCards(s);
	return cards.some(
		(a, i) =>
			cardValue(a) === TARGET ||
			cards.some((b, j) => j > i && cardValue(a) + cardValue(b) === TARGET),
	);
}

function commit(prev: PyramidState, next: PyramidSnapshot): PyramidState {
	const won = next.pyramid.every((c) => c === null);
	const state: PyramidState = {
		...prev,
		...next,
		moves: prev.moves + 1,
		won,
		history: [...prev.history, snapshot(prev)].slice(-MAX_HISTORY),
	};
	const stuck = !won && !hasMoves(state);
	let events = prev.events;
	if (won) events = addEvent(events, "Piramide completata!", "win");
	else if (stuck) events = addEvent(events, "Nessuna mossa possibile", "lose");
	return { ...state, stuck, events };
}

const snapshot = (s: PyramidState): PyramidSnapshot => ({
	pyramid: s.pyramid,
	stock: s.stock,
	waste: s.waste,
	moves: s.moves,
});

/** Gira una carta dal mazzo al pozzo; il mazzo si passa una volta sola */
export function drawStock(s: PyramidState): PyramidState {
	if (s.won || s.stuck || s.stock.length === 0) return s;
	return commit(s, {
		...snapshot(s),
		stock: s.stock.slice(0, -1),
		waste: [...s.waste, s.stock[s.stock.length - 1]],
	});
}

/** Elimina un Re da solo o una coppia di carte giocabili che fa 10 */
export function removeCards(
	s: PyramidState,
	ids: string[],
): PyramidState | null {
	const playable = playableCards(s);
	const cards = ids.map((id) => playable.find((c) => c.id === id));
	if (cards.some((c) => !c)) return null;
	const total = cards.reduce((sum, c) => sum + (c ? cardValue(c) : 0), 0);
	if (total !== TARGET || cards.length > 2) return null;
	return commit(s, {
		...snapshot(s),
		pyramid: s.pyramid.map((c) => (c && ids.includes(c.id) ? null : c)),
		waste: s.waste.filter((c) => !ids.includes(c.id)),
	});
}

export function undo(s: PyramidState): PyramidState {
	const previous = s.history[s.history.length - 1];
	if (!previous || s.won) return s;
	return { ...s, ...previous, stuck: false, history: s.history.slice(0, -1) };
}
