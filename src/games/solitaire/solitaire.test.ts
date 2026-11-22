import { describe, expect, it } from "vitest";
import type { FrenchCard } from "../../core/deck";
import {
	createFreeCell,
	dealFreeCell,
	maxMovable,
	moveCards as moveFC,
} from "./freecellLogic";
import { createKlondike, drawStock, moveCards, undo } from "./klondikeLogic";
import { canStack, isSequence } from "./solitaireRules";

const c = (suit: FrenchCard["suit"], rank: number): FrenchCard => ({
	id: `${suit}-${rank}-p`,
	suit,
	rank,
});

describe("regole comuni", () => {
	it("colori alterni e ordine decrescente", () => {
		expect(canStack(c("picche", 8), c("cuori", 7))).toBe(true);
		expect(canStack(c("picche", 8), c("fiori", 7))).toBe(false);
		expect(isSequence([c("picche", 8), c("cuori", 7), c("fiori", 6)])).toBe(
			true,
		);
	});
});

describe("solitario", () => {
	it("distribuzione: 28 carte sul tavolo, 24 nel mazzo", () => {
		const s = createKlondike(1);
		expect(s.tableau.map((col) => col.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
		expect(s.stock).toHaveLength(24);
		expect(s.faceDown).toEqual([0, 1, 2, 3, 4, 5, 6]);
	});
	it("gira 3 carte e annulla", () => {
		const s = drawStock(createKlondike(3));
		expect(s.waste).toHaveLength(3);
		expect(undo(s).waste).toHaveLength(0);
	});
	it("solo un Re va in una colonna vuota", () => {
		const s = {
			...createKlondike(1),
			tableau: [[], [c("cuori", 13)], [], [], [], [], []],
			faceDown: [0, 0, 0, 0, 0, 0, 0],
		};
		const moved = moveCards(
			s,
			{ kind: "tableau", index: 1, cardIndex: 0 },
			{ kind: "tableau", index: 0 },
		);
		expect(moved?.tableau[0]).toHaveLength(1);
		const queen = { ...s, waste: [c("picche", 12)] };
		expect(
			moveCards(queen, { kind: "waste" }, { kind: "tableau", index: 2 }),
		).toBeNull();
	});
});

describe("freecell", () => {
	it("la partita #1 ha la distribuzione classica", () => {
		const firstRow = dealFreeCell(1).map((col) => col[0]);
		const label = (card: FrenchCard) => `${card.rank}${card.suit[0]}`;
		expect(firstRow.map(label)).toEqual([
			"11q",
			"2q",
			"9c",
			"11f",
			"5q",
			"7c",
			"7f",
			"5c",
		]);
	});
	it("tutte le 52 carte, diverse, in 8 colonne", () => {
		const cards = dealFreeCell(617).flat();
		expect(new Set(cards.map((x) => x.id)).size).toBe(52);
	});
	it("limite di carte spostabili insieme", () => {
		const s = createFreeCell(1);
		expect(maxMovable(s, false)).toBe(5);
		const full = {
			...s,
			cells: [c("cuori", 1), c("cuori", 2), c("cuori", 3), null],
		};
		expect(maxMovable(full, false)).toBe(2);
	});
	it("una carta va in una cella libera", () => {
		const s = createFreeCell(1);
		const last = s.tableau[0].length - 1;
		const moved = moveFC(
			s,
			{ kind: "tableau", index: 0, cardIndex: last },
			{ kind: "cell", index: 0 },
		);
		expect(moved?.cells[0]).not.toBeNull();
	});
});
