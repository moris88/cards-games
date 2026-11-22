import { describe, expect, it } from "vitest";
import { normalizeSettings } from "./settings";

describe("impostazioni", () => {
	it("completa le opzioni mancanti dei salvataggi vecchi", () => {
		const s = normalizeSettings({ cpuCount: 2, playerName: "Mario" });
		expect(s.klondikeDraw).toBe(1);
		expect(s.scopaTarget).toBe(11);
		expect(s.difficulty.piramide).toBe("medio");
		expect(s.playerName).toBe("Mario");
	});
	it("corregge valori non validi", () => {
		const s = normalizeSettings({ cpuCount: 99 });
		expect(s.cpuCount).toBe(5);
		expect(normalizeSettings(null).cpuNames).toHaveLength(5);
	});
});
