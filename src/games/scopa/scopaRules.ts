import type { NeapolitanCard } from "../../core/deck";

/** Valore di presa: 1-7, Fante 8, Cavallo 9, Re 10 */
export const captureValue = (c: NeapolitanCard) => c.rank;

const sum = (cards: NeapolitanCard[]) =>
	cards.reduce((s, c) => s + captureValue(c), 0);

/**
 * Prese possibili giocando `card`. Se in tavola c'è una carta dello stesso
 * valore va presa quella (obbligo della carta uguale); altrimenti ogni
 * combinazione di carte la cui somma è uguale al valore giocato.
 */
export function captureOptions(
	table: NeapolitanCard[],
	card: NeapolitanCard,
): NeapolitanCard[][] {
	const value = captureValue(card);
	const equal = table.filter((c) => captureValue(c) === value);
	if (equal.length > 0) return equal.map((c) => [c]);
	const options: NeapolitanCard[][] = [];
	const n = table.length;
	for (let mask = 1; mask < 1 << n; mask++) {
		const subset = table.filter((_, i) => mask & (1 << i));
		if (subset.length > 1 && sum(subset) === value) options.push(subset);
	}
	return options;
}

/** Valori della primiera: 7 → 21, 6 → 18, Asso → 16, 5 → 15, 4 → 14, 3 → 13, 2 → 12, figure → 10 */
const PRIMIERA: Record<number, number> = {
	7: 21,
	6: 18,
	1: 16,
	5: 15,
	4: 14,
	3: 13,
	2: 12,
	8: 10,
	9: 10,
	10: 10,
};

/** Primiera: migliore carta per seme; senza tutti e quattro i semi non vale (0) */
export function primiera(cards: NeapolitanCard[]): number {
	const best = new Map<string, number>();
	for (const c of cards)
		best.set(c.suit, Math.max(best.get(c.suit) ?? 0, PRIMIERA[c.rank]));
	if (best.size < 4) return 0;
	return [...best.values()].reduce((s, v) => s + v, 0);
}

export const isSettebello = (c: NeapolitanCard) =>
	c.suit === "denari" && c.rank === 7;

export interface SideScore {
	carte: number;
	denari: number;
	settebello: number;
	primiera: number;
	scope: number;
	total: number;
}

/** Il punto va al solo lato con il valore più alto; in caso di parità nessuno lo prende */
function awardBest(values: number[]): number[] {
	const max = Math.max(...values);
	const winners = values.filter((v) => v === max).length;
	return values.map((v) => (v === max && winners === 1 && max > 0 ? 1 : 0));
}

/** Punti della smazzata per ogni lato (giocatore o coppia) */
export function scoreRound(
	captured: NeapolitanCard[][],
	scope: number[],
): SideScore[] {
	const carte = awardBest(captured.map((c) => c.length));
	const denari = awardBest(
		captured.map((c) => c.filter((x) => x.suit === "denari").length),
	);
	const prim = awardBest(captured.map(primiera));
	return captured.map((cards, i) => {
		const settebello = cards.some(isSettebello) ? 1 : 0;
		const score = {
			carte: carte[i],
			denari: denari[i],
			settebello,
			primiera: prim[i],
			scope: scope[i],
		};
		return {
			...score,
			total:
				score.carte +
				score.denari +
				score.settebello +
				score.primiera +
				score.scope,
		};
	});
}
