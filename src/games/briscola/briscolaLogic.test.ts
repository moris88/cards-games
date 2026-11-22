import { describe, expect, it } from "vitest";
import type { NeapolitanCard } from "../../core/deck";
import {
	beats,
	cardPoints,
	createGame,
	playCard,
	resolveTrick,
} from "./briscolaLogic";

const c = (suit: NeapolitanCard["suit"], rank: number): NeapolitanCard => ({
	id: `${suit}-${rank}`,
	suit,
	rank,
});

describe("briscola", () => {
	it("il mazzo totalizza 120 punti", () => {
		const game = createGame();
		const all = [...game.deck, ...game.hands[0], ...game.hands[1]];
		expect(all.reduce((s, x) => s + cardPoints(x), 0)).toBe(120);
	});
	it("il tre batte il re, la briscola batte gli altri semi", () => {
		expect(beats(c("coppe", 10), c("coppe", 3), "spade")).toBe(true);
		expect(beats(c("coppe", 1), c("spade", 2), "spade")).toBe(true);
		expect(beats(c("coppe", 2), c("denari", 1), "spade")).toBe(false);
	});
	it("una partita completa termina con 120 punti assegnati", () => {
		let s = createGame();
		while (s.phase !== "fine") {
			s =
				s.phase === "presa"
					? resolveTrick(s)
					: playCard(s, s.hands[s.turn][0].id);
		}
		expect(s.points[0] + s.points[1]).toBe(120);
		const last = s.events[s.events.length - 1];
		expect(last.text).toMatch(/vinto|perso|pareggio/);
		expect(s.events.some((e) => e.text.startsWith("Mano presa"))).toBe(true);
	});
});
