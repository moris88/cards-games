import { describe, expect, it } from "vitest";
import type { FrenchCard } from "../../core/deck";
import { playCpuTurn } from "./scala40Ai";
import { createGame } from "./scala40Logic";
import { analyzeMeld } from "./scala40Melds";

const c = (suit: FrenchCard["suit"], rank: number, n = 0): FrenchCard => ({
	id: `${suit}-${rank}-${n}`,
	suit,
	rank,
});
const jolly = c("jolly", 0);

describe("scala 40 combinazioni", () => {
	it("tris e poker", () => {
		expect(
			analyzeMeld([c("cuori", 13), c("fiori", 13), c("picche", 13)])?.value,
		).toBe(30);
		expect(analyzeMeld([c("cuori", 1), c("fiori", 1), jolly])?.value).toBe(33);
		expect(
			analyzeMeld([c("cuori", 5), c("cuori", 5, 1), c("fiori", 5)]),
		).toBeNull();
	});
	it("scale con asso basso o alto", () => {
		expect(
			analyzeMeld([c("cuori", 1), c("cuori", 2), c("cuori", 3)])?.value,
		).toBe(6);
		expect(
			analyzeMeld([c("cuori", 12), c("cuori", 13), c("cuori", 1)])?.value,
		).toBe(31);
		expect(
			analyzeMeld([c("cuori", 13), c("cuori", 1), c("cuori", 2)]),
		).toBeNull();
	});
	it("il jolly colma un buco e vale la carta sostituita", () => {
		const meld = analyzeMeld([c("picche", 5), jolly, c("picche", 7)]);
		expect(meld?.value).toBe(18);
		expect(meld?.ordered[1]).toBe(jolly);
	});
	it("non si usano due jolly", () => {
		expect(analyzeMeld([c("picche", 5), jolly, c("jolly", 0, 1)])).toBeNull();
	});
});

describe("scala 40 partita tra CPU", () => {
	it("le CPU giocano molti turni senza bloccarsi", () => {
		let s = createGame(3);
		s = { ...s, players: s.players.map((p) => ({ ...p, isHuman: false })) };
		for (
			let i = 0;
			i < 400 && s.phase !== "finePartita" && s.phase !== "fineMano";
			i++
		) {
			s = playCpuTurn(s);
			const cards =
				s.deck.length +
				s.discard.length +
				s.melds.flatMap((m) => m.cards).length +
				s.players.flatMap((p) => p.hand).length;
			expect(cards).toBe(108);
		}
	});
});
