import type { NeapolitanCard } from "../../core/deck";
import type { Difficulty } from "../../core/settings";
import type { ScopaState } from "./scopaLogic";
import { captureOptions, isSettebello } from "./scopaRules";

export interface ScopaMove {
	cardId: string;
	take: NeapolitanCard[];
}

const sum = (cards: NeapolitanCard[]) => cards.reduce((s, c) => s + c.rank, 0);

/** Valore di una presa: scopa, settebello, denari, sette e numero di carte */
function captureWorth(
	card: NeapolitanCard,
	take: NeapolitanCard[],
	tableAfter: NeapolitanCard[],
): number {
	const all = [card, ...take];
	return (
		(tableAfter.length === 0 ? 50 : 0) +
		(all.some(isSettebello) ? 30 : 0) +
		all.filter((c) => c.suit === "denari").length * 4 +
		all.filter((c) => c.rank === 7).length * 5 +
		all.length * 2
	);
}

/** Rischio di lasciare una scopa: tavolo con somma fino a 10 */
const scopaRisk = (table: NeapolitanCard[]) =>
	table.length > 0 && sum(table) <= 10 ? 25 : 0;

export function chooseMove(
	state: ScopaState,
	difficulty: Difficulty,
): ScopaMove {
	const hand = state.players[state.current].hand;
	const moves = hand.flatMap((card) => {
		const options = captureOptions(state.table, card);
		return options.length > 0
			? options.map((take) => ({ card, take }))
			: [{ card, take: [] as NeapolitanCard[] }];
	});

	if (difficulty === "facile") {
		const pick = moves[Math.floor(Math.random() * moves.length)];
		return { cardId: pick.card.id, take: pick.take };
	}

	const scored = moves.map(({ card, take }) => {
		const tableAfter =
			take.length > 0
				? state.table.filter((c) => !take.includes(c))
				: [...state.table, card];
		let score = take.length > 0 ? captureWorth(card, take, tableAfter) : 0;
		// Scartando si preferiscono carte basse e di poco valore
		if (take.length === 0)
			score -=
				(card.rank === 7 ? 15 : 0) +
				(card.suit === "denari" ? 6 : 0) +
				card.rank * 0.5;
		// A Difficile si evita di lasciare una scopa facile all'avversario
		if (difficulty === "difficile") score -= scopaRisk(tableAfter);
		return { card, take, score };
	});
	const best = scored.sort((a, b) => b.score - a.score)[0];
	return { cardId: best.card.id, take: best.take };
}
