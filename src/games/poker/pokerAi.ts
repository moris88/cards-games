import { createFrenchDeck, type FrenchCard, shuffle } from "../../core/deck";
import type { Difficulty } from "../../core/settings";
import { evaluateHand } from "./handEval";
import {
	BIG_BLIND,
	type PokerAction,
	type PokerState,
	pot,
} from "./pokerLogic";

const SIMULATIONS = 250;
const value = (c: FrenchCard) => (c.rank === 1 ? 14 : c.rank);

/** Forza delle carte iniziali tra 0 e 1 */
function preflopStrength([a, b]: FrenchCard[]): number {
	const hi = Math.max(value(a), value(b));
	const lo = Math.min(value(a), value(b));
	if (hi === lo) return 0.5 + hi / 28;
	const suited = a.suit === b.suit ? 0.06 : 0;
	const connected = hi - lo <= 2 ? 0.04 : 0;
	return Math.min(0.95, (hi + lo) / 40 + suited + connected);
}

/** Probabilità di vincere stimata giocando a caso le carte ignote (Monte Carlo) */
export function equity(
	hole: FrenchCard[],
	board: FrenchCard[],
	opponents: number,
): number {
	const known = new Set([...hole, ...board].map((c) => `${c.suit}${c.rank}`));
	const unknown = createFrenchDeck().filter(
		(c) => !known.has(`${c.suit}${c.rank}`),
	);
	let wins = 0;
	for (let s = 0; s < SIMULATIONS; s++) {
		const deck = shuffle(unknown);
		const fullBoard = [...board, ...deck.splice(0, 5 - board.length)];
		const mine = evaluateHand([...hole, ...fullBoard]).score;
		let best = true;
		for (let o = 0; o < opponents && best; o++) {
			if (evaluateHand([...deck.splice(0, 2), ...fullBoard]).score > mine)
				best = false;
		}
		if (best) wins++;
	}
	return wins / SIMULATIONS;
}

/** Forza della mano: Medio guarda solo la combinazione, Difficile simula */
function strength(state: PokerState, difficulty: Difficulty): number {
	const me = state.players[state.current];
	const opponents = state.players.filter(
		(p, i) => i !== state.current && !p.out && !p.folded,
	).length;
	if (difficulty === "difficile")
		return equity(me.hole, state.board, opponents);
	if (state.board.length === 0) return preflopStrength(me.hole);
	const category = Math.floor(
		evaluateHand([...me.hole, ...state.board]).score / 15 ** 5,
	);
	return Math.min(0.95, 0.25 + category * 0.17);
}

export function decide(state: PokerState, difficulty: Difficulty): PokerAction {
	const me = state.players[state.current];
	const toCall = state.currentBet - me.bet;
	const potSize = pot(state);
	const potOdds = toCall / (potSize + toCall || 1);
	const minRaiseTo = state.currentBet + state.minRaise;
	const raiseTo = (fraction: number) => ({
		type: "raise" as const,
		to: Math.min(
			me.bet + me.chips,
			Math.max(
				minRaiseTo,
				state.currentBet + Math.round((potSize * fraction) / 5) * 5,
			),
		),
	});
	const passive: PokerAction =
		toCall > 0 ? { type: "fold" } : { type: "check" };

	if (difficulty === "facile") {
		// Prevedibile: vede quasi sempre, rilancia di rado
		const r = Math.random();
		if (r < 0.1) return raiseTo(0.5);
		if (toCall === 0 || r < 0.75)
			return toCall > 0 ? { type: "call" } : { type: "check" };
		return passive;
	}

	const s = strength(state, difficulty);
	// A Difficile ogni tanto bluffa quando nessuno ha puntato
	if (difficulty === "difficile" && toCall === 0 && Math.random() < 0.12)
		return raiseTo(0.6);
	if (s > 0.72) return raiseTo(difficulty === "difficile" ? 0.75 : 0.5);
	if (s > potOdds + 0.08 || (toCall <= BIG_BLIND && s > 0.3)) {
		return toCall > 0 ? { type: "call" } : { type: "check" };
	}
	return passive;
}
