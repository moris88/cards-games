import { describe, expect, it } from "vitest";
import type { FrenchCard } from "../../core/deck";
import { evaluateHand } from "./handEval";
import { decide } from "./pokerAi";
import { act, createGame, pot, startHand } from "./pokerLogic";

const c = (suit: FrenchCard["suit"], rank: number): FrenchCard => ({
	id: `${suit}-${rank}`,
	suit,
	rank,
});

describe("valutazione mani", () => {
	it("riconosce le combinazioni", () => {
		const royal = [
			c("cuori", 1),
			c("cuori", 13),
			c("cuori", 12),
			c("cuori", 11),
			c("cuori", 10),
			c("fiori", 2),
			c("picche", 3),
		];
		expect(evaluateHand(royal).name).toBe("Scala reale");
		const wheel = [
			c("cuori", 1),
			c("fiori", 2),
			c("picche", 3),
			c("quadri", 4),
			c("cuori", 5),
			c("fiori", 9),
			c("picche", 13),
		];
		expect(evaluateHand(wheel).name).toBe("Scala");
		const full = [
			c("cuori", 9),
			c("fiori", 9),
			c("picche", 9),
			c("quadri", 4),
			c("cuori", 4),
			c("fiori", 2),
			c("picche", 13),
		];
		expect(evaluateHand(full).name).toBe("Full");
	});
	it("confronta i kicker", () => {
		const pairAceKing = evaluateHand([
			c("cuori", 1),
			c("fiori", 1),
			c("picche", 13),
			c("quadri", 7),
			c("cuori", 4),
		]);
		const pairAceQueen = evaluateHand([
			c("cuori", 1),
			c("fiori", 1),
			c("picche", 12),
			c("quadri", 7),
			c("cuori", 4),
		]);
		expect(pairAceKing.score).toBeGreaterThan(pairAceQueen.score);
	});
});

describe("partita di poker tra CPU", () => {
	it("le fiches si conservano mano dopo mano", () => {
		let s = createGame(["A", "B", "C", "D"]);
		s = { ...s, players: s.players.map((p) => ({ ...p, isHuman: false })) };
		let hands = 0;
		for (
			let step = 0;
			step < 3000 && s.phase !== "finePartita" && hands < 15;
			step++
		) {
			if (s.phase === "fineMano") {
				expect(s.players.reduce((t, p) => t + p.chips, 0)).toBe(4000);
				hands++;
				s = startHand(s);
				continue;
			}
			s = act(s, decide(s, step % 2 ? "medio" : "facile"));
			expect(pot(s)).toBeGreaterThanOrEqual(0);
		}
		expect(hands).toBeGreaterThan(0);
	});
});
