import { shuffle } from "../../core/deck";

/** Cartella: 3 righe × 9 colonne, 5 numeri per riga; null = casella vuota */
export type Cartella = (number | null)[][];

export const PRIZES = [
	"ambo",
	"terno",
	"quaterna",
	"cinquina",
	"tombola",
] as const;
export type Prize = (typeof PRIZES)[number];

/** Numeri sulla stessa riga necessari per ogni premio (tombola = cartella intera) */
export const PRIZE_SIZE: Record<Prize, number> = {
	ambo: 2,
	terno: 3,
	quaterna: 4,
	cinquina: 5,
	tombola: 15,
};

/** Quota del piatto per ogni premio */
export const PRIZE_SHARE: Record<Prize, number> = {
	ambo: 0.1,
	terno: 0.15,
	quaterna: 0.2,
	cinquina: 0.25,
	tombola: 0.3,
};

/** Numeri ammessi in una colonna: 1-9, 10-19, …, 80-90 */
function columnRange(col: number): number[] {
	const from = col === 0 ? 1 : col * 10;
	const to = col === 8 ? 90 : col * 10 + 9;
	return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

export function createCartella(): Cartella {
	const rows = [0, 1, 2].map(() =>
		shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 5),
	);
	const grid: Cartella = rows.map(() => Array(9).fill(null));
	for (let col = 0; col < 9; col++) {
		const rowsWithCol = [0, 1, 2].filter((r) => rows[r].includes(col));
		// Numeri della colonna in ordine crescente dall'alto in basso
		const numbers = shuffle(columnRange(col))
			.slice(0, rowsWithCol.length)
			.sort((a, b) => a - b);
		rowsWithCol.forEach((r, i) => {
			grid[r][col] = numbers[i];
		});
	}
	return grid;
}

export const cartellaNumbers = (c: Cartella) =>
	c.flat().filter((n): n is number => n !== null);

/**
 * Verifica un premio: `isMarked` indica se un numero è stato segnato (e uscito).
 * Ambo…cinquina: almeno N numeri segnati sulla stessa riga; tombola: tutti i 15.
 */
export function hasPrize(
	cards: Cartella[],
	prize: Prize,
	isMarked: (cardIndex: number, n: number) => boolean,
): boolean {
	return cards.some((card, ci) => {
		if (prize === "tombola")
			return cartellaNumbers(card).every((n) => isMarked(ci, n));
		return card.some(
			(row) =>
				row.filter((n) => n !== null && isMarked(ci, n)).length >=
				PRIZE_SIZE[prize],
		);
	});
}
