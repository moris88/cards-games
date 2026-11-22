import type { FrenchCard } from "../../core/deck";

/** Posizione di una carta o di una pila sul tavolo del solitario */
export type Location =
	| { kind: "waste" }
	| { kind: "cell"; index: number }
	| { kind: "foundation"; index: number }
	| { kind: "tableau"; index: number; cardIndex: number };

export const isRed = (c: FrenchCard) =>
	c.suit === "cuori" || c.suit === "quadri";

/** In colonna: valore inferiore di uno e colore alternato */
export const canStack = (below: FrenchCard, card: FrenchCard) =>
	below.rank === card.rank + 1 && isRed(below) !== isRed(card);

/** In fondazione: stesso seme, dall'Asso al Re */
export function canFound(foundation: FrenchCard[], card: FrenchCard): boolean {
	const top = foundation[foundation.length - 1];
	return top
		? top.suit === card.suit && top.rank + 1 === card.rank
		: card.rank === 1;
}

/** Una sequenza è trascinabile se scende di uno a colori alterni */
export const isSequence = (cards: FrenchCard[]) =>
	cards.every((c, i) => i === 0 || canStack(cards[i - 1], c));

/** Fondazione che accetta la carta, oppure -1 */
export const foundationFor = (foundations: FrenchCard[][], card: FrenchCard) =>
	foundations.findIndex((f) => canFound(f, card));

/** Codifica di una posizione come attributo del DOM per il drag & drop */
export const dropId = (kind: Location["kind"], index = 0) => `${kind}:${index}`;

export function parseDropId(
	id: string,
): { kind: Location["kind"]; index: number } | null {
	const [kind, index] = id.split(":");
	if (
		kind !== "waste" &&
		kind !== "cell" &&
		kind !== "foundation" &&
		kind !== "tableau"
	)
		return null;
	return { kind, index: Number(index) };
}

/** Trova la zona di rilascio sotto il puntatore */
export function dropTargetAt(x: number, y: number) {
	for (const el of document.elementsFromPoint(x, y)) {
		const id = el instanceof HTMLElement ? el.dataset.drop : undefined;
		if (id) return parseDropId(id);
	}
	return null;
}

export const MAX_HISTORY = 100;

export const formatTime = (seconds: number) =>
	`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
