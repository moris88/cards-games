import type { FrenchCard } from "../../core/deck";

export const HAND_NAMES = [
	"Carta alta",
	"Coppia",
	"Doppia coppia",
	"Tris",
	"Scala",
	"Colore",
	"Full",
	"Poker",
	"Scala colore",
	"Scala reale",
];

export interface HandValue {
	/** Punteggio confrontabile: più alto = mano migliore */
	score: number;
	name: string;
}

/** Asso alto: vale 14 */
const value = (c: FrenchCard) => (c.rank === 1 ? 14 : c.rank);

/** Codifica categoria e carte decisive in un unico numero confrontabile */
const encode = (category: number, kickers: number[]) =>
	[category, ...kickers, 0, 0, 0, 0, 0]
		.slice(0, 6)
		.reduce((acc, v) => acc * 15 + v, 0);

/** Carta più alta della scala (5 per A-2-3-4-5), oppure 0 */
function straightHigh(values: number[]): number {
	const unique = [...new Set(values)].sort((a, b) => b - a);
	if (unique.includes(14)) unique.push(1);
	for (let i = 0; i + 4 < unique.length; i++) {
		if (unique[i] - unique[i + 4] === 4) return unique[i];
	}
	return 0;
}

function evaluate5(cards: FrenchCard[]): number {
	const values = cards.map(value).sort((a, b) => b - a);
	const flush = cards.every((c) => c.suit === cards[0].suit);
	const straight = straightHigh(values);
	const counts = new Map<number, number>();
	for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
	// Gruppi ordinati per numerosità e poi per valore
	const groups = [...counts.entries()].sort(
		(a, b) => b[1] - a[1] || b[0] - a[0],
	);
	const byGroup = groups.map(([v]) => v);
	const shape = groups.map(([, n]) => n).join("");

	if (straight && flush) return encode(straight === 14 ? 9 : 8, [straight]);
	if (shape === "41") return encode(7, byGroup);
	if (shape === "32") return encode(6, byGroup);
	if (flush) return encode(5, values);
	if (straight) return encode(4, [straight]);
	if (shape === "311") return encode(3, byGroup);
	if (shape === "221") return encode(2, byGroup);
	if (shape === "2111") return encode(1, byGroup);
	return encode(0, values);
}

/** Miglior mano di 5 carte tra quelle disponibili (fino a 7) */
export function evaluateHand(cards: FrenchCard[]): HandValue {
	let best = -1;
	const n = cards.length;
	for (let a = 0; a < n; a++)
		for (let b = a + 1; b < n; b++)
			for (let c = b + 1; c < n; c++)
				for (let d = c + 1; d < n; d++)
					for (let e = d + 1; e < n; e++) {
						best = Math.max(
							best,
							evaluate5([cards[a], cards[b], cards[c], cards[d], cards[e]]),
						);
					}
	const category = Math.floor(best / 15 ** 5);
	return { score: best, name: HAND_NAMES[category] };
}
