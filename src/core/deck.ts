export type NeapolitanSuit = "denari" | "coppe" | "spade" | "bastoni";
export type FrenchSuit = "cuori" | "quadri" | "fiori" | "picche";

/** Carta napoletana: rank 1-7 numeriche, 8 Fante, 9 Cavallo, 10 Re */
export interface NeapolitanCard {
	id: string;
	suit: NeapolitanSuit;
	rank: number;
}

/** Carta francese: rank 1 (Asso) - 13 (Re); il jolly ha suit "jolly" e rank 0 */
export interface FrenchCard {
	id: string;
	suit: FrenchSuit | "jolly";
	rank: number;
}

export const NEAPOLITAN_SUITS: NeapolitanSuit[] = [
	"denari",
	"coppe",
	"spade",
	"bastoni",
];
export const FRENCH_SUITS: FrenchSuit[] = [
	"cuori",
	"quadri",
	"fiori",
	"picche",
];

export function shuffle<T>(items: T[]): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export function createNeapolitanDeck(): NeapolitanCard[] {
	return NEAPOLITAN_SUITS.flatMap((suit) =>
		Array.from({ length: 10 }, (_, i) => ({
			id: `${suit}-${i + 1}`,
			suit,
			rank: i + 1,
		})),
	);
}

/** Due mazzi da 52 carte più 4 jolly (108 carte) */
export function createScala40Deck(): FrenchCard[] {
	const cards: FrenchCard[] = [];
	for (const copy of [0, 1]) {
		for (const suit of FRENCH_SUITS) {
			for (let rank = 1; rank <= 13; rank++) {
				cards.push({ id: `${suit}-${rank}-${copy}`, suit, rank });
			}
		}
		cards.push({ id: `jolly-a-${copy}`, suit: "jolly", rank: 0 });
		cards.push({ id: `jolly-b-${copy}`, suit: "jolly", rank: 0 });
	}
	return cards;
}

const NEAPOLITAN_NAMES: Record<number, string> = {
	1: "Asso",
	8: "Fante",
	9: "Cavallo",
	10: "Re",
};

export function neapolitanName(card: NeapolitanCard): string {
	return `${NEAPOLITAN_NAMES[card.rank] ?? card.rank} di ${card.suit}`;
}
