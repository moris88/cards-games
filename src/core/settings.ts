import { loadJson, saveJson } from "./storage";

export type Difficulty = "facile" | "medio" | "difficile";
export type GameId =
	| "setteEMezzo"
	| "briscola"
	| "scala40"
	| "tombola"
	| "poker"
	| "scopa"
	| "solitario"
	| "freecell"
	| "piramide"
	| "orologio";

export const DIFFICULTIES: Difficulty[] = ["facile", "medio", "difficile"];

/** Giochi senza avversari: la difficoltà non si applica */
export const SOLO_GAMES: GameId[] = [
	"solitario",
	"freecell",
	"piramide",
	"orologio",
];
export const MAX_OPPONENTS = 5;

export interface Settings {
	difficulty: Record<GameId, Difficulty>;
	cpuCount: number;
	playerName: string;
	cpuNames: string[];
	/** Solitario: carte girate dal mazzo */
	klondikeDraw: 1 | 3;
	/** Scopa: punti per vincere la partita */
	scopaTarget: 11 | 16 | 21;
}

const KEY = "settings";

export const DEFAULT_SETTINGS: Settings = {
	difficulty: {
		setteEMezzo: "medio",
		briscola: "medio",
		scala40: "medio",
		tombola: "medio",
		poker: "medio",
		scopa: "medio",
		solitario: "medio",
		freecell: "medio",
		piramide: "medio",
		orologio: "medio",
	},
	klondikeDraw: 1,
	scopaTarget: 11,
	cpuCount: 2,
	playerName: "Tu",
	cpuNames: ["Gennaro", "Concetta", "Totò", "Nunzia", "Pasquale"],
};

/**
 * Completa le impostazioni con i valori predefiniti: quelle salvate da
 * versioni precedenti possono non avere le opzioni aggiunte dopo.
 */
export function normalizeSettings(saved: Partial<Settings> | null): Settings {
	const merged = { ...DEFAULT_SETTINGS, ...saved };
	return {
		...merged,
		difficulty: { ...DEFAULT_SETTINGS.difficulty, ...saved?.difficulty },
		klondikeDraw: merged.klondikeDraw === 3 ? 3 : 1,
		scopaTarget: [11, 16, 21].includes(merged.scopaTarget)
			? merged.scopaTarget
			: DEFAULT_SETTINGS.scopaTarget,
		cpuCount: Math.min(
			Math.max(Number(merged.cpuCount) || 1, 1),
			MAX_OPPONENTS,
		),
		cpuNames: DEFAULT_SETTINGS.cpuNames.map(
			(name, i) => merged.cpuNames?.[i] ?? name,
		),
	};
}

export const loadSettings = (): Settings =>
	normalizeSettings(loadJson<Partial<Settings>>(KEY));

export const saveSettings = (settings: Settings) => saveJson(KEY, settings);

/**
 * Nomi dei partecipanti: [giocatore, cpu1, cpu2, …].
 * Nomi vuoti o ripetuti tornano al valore predefinito (servono unici per gli avatar).
 */
export function playerNames(settings: Settings, cpuCount: number): string[] {
	const names: string[] = [];
	const wanted = [settings.playerName, ...settings.cpuNames.slice(0, cpuCount)];
	const defaults = [DEFAULT_SETTINGS.playerName, ...DEFAULT_SETTINGS.cpuNames];
	wanted.forEach((name, i) => {
		const clean = name.trim().slice(0, 16);
		names.push(clean && !names.includes(clean) ? clean : `${defaults[i]} ${i}`);
	});
	return names;
}

/** Chiave del salvataggio automatico di una partita */
export const saveKey = (game: GameId) => `save:${game}`;
