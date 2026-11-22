import { describe, expect, it } from "vitest";
import type { NeapolitanCard } from "../../core/deck";
import { createClock, placeCurrent, remainingDown } from "./clockLogic";
import {
	createPyramid,
	drawStock,
	isFree,
	PYRAMID_SIZE,
	removeCards,
} from "./pyramidLogic";

const c = (suit: NeapolitanCard["suit"], rank: number): NeapolitanCard => ({
	id: `${suit}-${rank}`,
	suit,
	rank,
});

describe("piramide", () => {
	it("21 carte nella piramide e 19 nel mazzo", () => {
		const s = createPyramid();
		expect(s.pyramid).toHaveLength(PYRAMID_SIZE);
		expect(s.stock).toHaveLength(19);
	});
	it("solo l'ultima fila è libera all'inizio", () => {
		const s = createPyramid();
		const free = s.pyramid.map((_, i) => isFree(s.pyramid, i));
		expect(free.filter(Boolean)).toHaveLength(6);
		expect(free.slice(15)).toEqual([true, true, true, true, true, true]);
	});
	it("elimina coppie da 10 e rifiuta le altre", () => {
		const base = createPyramid();
		const pyramid = [...base.pyramid];
		pyramid[15] = c("coppe", 3);
		pyramid[16] = c("spade", 7);
		pyramid[17] = c("denari", 10);
		pyramid[18] = c("bastoni", 4);
		const s = { ...base, pyramid };
		const after = removeCards(s, ["coppe-3", "spade-7"]);
		expect(after?.pyramid[15]).toBeNull();
		expect(removeCards(s, ["denari-10"])?.pyramid[17]).toBeNull();
		expect(removeCards(s, ["coppe-3", "bastoni-4"])).toBeNull();
	});
	it("il mazzo non si rigira: finito il mazzo resta vuoto", () => {
		let s = createPyramid();
		for (let i = 0; i < 200; i++) s = drawStock(s);
		expect(s.stock).toHaveLength(0);
		expect(s.waste.length).toBeGreaterThan(0);
	});
});

describe("orologio", () => {
	it("finisce sempre e scopre carte", () => {
		let s = createClock();
		for (let i = 0; i < 100 && s.phase === "gioco"; i++) s = placeCurrent(s);
		expect(s.phase).not.toBe("gioco");
		const faceUp = s.piles.reduce((n, p) => n + p.up.length, 0);
		expect(faceUp + remainingDown(s)).toBe(40);
		if (s.phase === "vinto") expect(remainingDown(s)).toBe(0);
	});
});
