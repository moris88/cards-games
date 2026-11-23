import { describe, expect, it } from "vitest";
import type { NeapolitanCard } from "../../core/deck";
import {
	createGame,
	drawCard,
	handScore,
	isReale,
	placeBet,
	settle,
	swapFour,
} from "./setteEMezzoLogic";

const c = (suit: NeapolitanCard["suit"], rank: number): NeapolitanCard => ({
	id: `${suit}-${rank}`,
	suit,
	rank,
});
const matta = c("denari", 10);

describe("sette e mezzo", () => {
	it("le figure valgono mezzo punto", () => {
		expect(handScore([c("coppe", 8), c("spade", 5)])).toBe(5.5);
	});
	it("la matta assume il valore migliore", () => {
		expect(handScore([matta])).toBe(0.5);
		expect(handScore([matta, c("coppe", 3)])).toBe(7);
		expect(handScore([matta, c("coppe", 7)])).toBe(7.5);
		expect(handScore([matta, c("coppe", 7), c("spade", 1)])).toBe(8.5);
	});
	it("riconosce il sette e mezzo reale", () => {
		expect(isReale([matta, c("coppe", 7)])).toBe(true);
		expect(isReale([c("spade", 8), c("coppe", 7)])).toBe(false);
	});
	it("a parità vince il banco, reale paga doppio", () => {
		expect(settle([c("coppe", 5)], [c("spade", 5)], 10)).toBe(-10);
		expect(settle([c("coppe", 6)], [c("spade", 5)], 10)).toBe(10);
		expect(settle([matta, c("coppe", 7)], [c("spade", 5)], 10)).toBe(20);
		expect(settle([c("coppe", 7), c("spade", 7)], [c("spade", 2)], 10)).toBe(
			-10,
		);
	});
});

describe("sette e mezzo eventi", () => {
	it("annuncia lo sballo del giocatore", () => {
		let s = placeBet(createGame(["Tu", "A"], "medio"), 10);
		// Il giocatore umano gioca per primo: gli diamo un 7 e peschiamo un 5
		s = {
			...s,
			players: s.players.map((p, i) =>
				i === 0 ? { ...p, hand: [c("coppe", 7)] } : p,
			),
			deck: [...s.deck, c("spade", 5)],
		};
		s = drawCard(s);
		expect(s.events.some((e) => e.text === "Sballato!")).toBe(true);
	});
	it("il 4 come prima carta si cambia una sola volta", () => {
		const state = placeBet(createGame(["Tu", "Cpu"], "medio"), 10);
		const index = state.order[0];
		const withFour = {
			...state,
			deck: [c("coppe", 4), c("spade", 6)],
			players: state.players.map((p, i) =>
				i === index ? { ...p, hand: [c("denari", 4)] } : p,
			),
		};
		const once = swapFour(withFour);
		expect(once.players[index].hand).toEqual([c("spade", 6)]);
		const again = swapFour({
			...once,
			players: once.players.map((p, i) =>
				i === index ? { ...p, hand: [c("bastoni", 4)] } : p,
			),
		});
		expect(again.players[index].hand).toEqual([c("bastoni", 4)]);
		const twoCards = {
			...withFour,
			players: withFour.players.map((p, i) =>
				i === index ? { ...p, hand: [c("denari", 4), c("spade", 1)] } : p,
			),
		};
		expect(swapFour(twoCards)).toBe(twoCards);
	});
});
