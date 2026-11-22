import { describe, expect, it } from "vitest";
import { cartellaNumbers, createCartella } from "./cartella";
import { createGame, drawNumber, humanClaim, startGame } from "./tombolaLogic";

describe("tombola", () => {
	it("una cartella ha 15 numeri, 5 per riga, nelle colonne giuste", () => {
		for (let k = 0; k < 50; k++) {
			const card = createCartella();
			expect(cartellaNumbers(card)).toHaveLength(15);
			expect(new Set(cartellaNumbers(card)).size).toBe(15);
			for (const row of card)
				expect(row.filter((n) => n !== null)).toHaveLength(5);
			for (const row of card)
				for (const [col, n] of row.entries()) {
					if (n !== null) expect(Math.min(Math.floor(n / 10), 8)).toBe(col);
				}
		}
	});
	it("una chiamata sbagliata costa fiches", () => {
		let s = startGame(createGame(["Tu", "A"]), [createCartella()]);
		const chips = s.players[0].chips;
		s = humanClaim(s, "ambo");
		expect(s.players[0].chips).toBe(chips - 2);
		expect(s.events.at(-1)?.tone).toBe("lose");
	});
	it("le CPU arrivano alla tombola", () => {
		let s = startGame(createGame(["Tu", "A", "B"]), [createCartella()]);
		for (let i = 0; i < 100 && s.phase === "gioco"; i++)
			s = drawNumber(s, "difficile");
		expect(s.phase).toBe("fine");
		expect(s.awarded.tombola).toBeGreaterThan(0);
	});
});
