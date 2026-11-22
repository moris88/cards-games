import { describe, expect, it } from "vitest";
import type { NeapolitanCard } from "../../core/deck";
import { chooseMove } from "./scopaAi";
import { createGame, playCard, resolvePlay } from "./scopaLogic";
import { captureOptions, primiera, scoreRound } from "./scopaRules";

const c = (suit: NeapolitanCard["suit"], rank: number): NeapolitanCard => ({
	id: `${suit}-${rank}`,
	suit,
	rank,
});

describe("prese", () => {
	it("obbligo della carta uguale", () => {
		const table = [c("coppe", 7), c("spade", 3), c("bastoni", 4)];
		expect(captureOptions(table, c("denari", 7))).toEqual([[c("coppe", 7)]]);
	});
	it("somme possibili", () => {
		const table = [
			c("coppe", 2),
			c("spade", 3),
			c("bastoni", 5),
			c("denari", 1),
		];
		const options = captureOptions(table, c("denari", 10));
		expect(options).toHaveLength(1);
		expect(captureOptions(table, c("coppe", 6))).toHaveLength(2);
	});
});

describe("punteggio", () => {
	it("primiera richiede tutti i semi", () => {
		expect(
			primiera([c("denari", 7), c("coppe", 7), c("spade", 7), c("bastoni", 7)]),
		).toBe(84);
		expect(primiera([c("denari", 7), c("coppe", 7)])).toBe(0);
	});
	it("assegna carte, denari, settebello e scope", () => {
		const a = [
			c("denari", 7),
			c("denari", 1),
			c("denari", 2),
			c("denari", 3),
			c("denari", 4),
			c("denari", 5),
		];
		const b = [c("coppe", 1)];
		const [sa, sb] = scoreRound([a, b], [2, 0]);
		expect(sa).toMatchObject({ carte: 1, denari: 1, settebello: 1, scope: 2 });
		expect(sb.total).toBe(0);
	});
});

describe("partita tra CPU", () => {
	it("tutte le 40 carte vengono prese a fine smazzata", () => {
		for (const players of [2, 3, 4]) {
			let s = createGame(
				Array.from({ length: players }, (_, i) => `G${i}`),
				11,
			);
			for (
				let i = 0;
				i < 200 && s.phase !== "fineSmazzata" && s.phase !== "finePartita";
				i++
			) {
				if (s.phase === "presa") s = resolvePlay(s);
				else {
					const move = chooseMove(s, "difficile");
					s = playCard(s, move.cardId, move.take);
				}
			}
			expect(s.sides.reduce((t, side) => t + side.captured.length, 0)).toBe(40);
			expect(s.summary).not.toBeNull();
		}
	});
});
