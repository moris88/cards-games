import { shuffle } from "../../core/deck";
import { addEvent, type GameEvent, type Mood } from "../../core/gameEvents";
import type { Difficulty } from "../../core/settings";
import {
	type Cartella,
	createCartella,
	hasPrize,
	PRIZE_SHARE,
	PRIZES,
	type Prize,
} from "./cartella";

export const CARD_COST = 2;
export const WRONG_CALL_PENALTY = 2;
export const MAX_CARDS = 6;
const STARTING_CHIPS = 100;
/** Estrazioni di ritardo prima che la CPU chiami un premio */
const CPU_LAG: Record<Difficulty, number> = {
	facile: 2,
	medio: 1,
	difficile: 0,
};

export interface TombolaPlayer {
	name: string;
	isHuman: boolean;
	chips: number;
	cards: Cartella[];
	/** Numeri segnati dal giocatore umano, come "indiceCartella-numero" */
	marks: string[];
	/** Per la CPU: a quale estrazione ha raggiunto ciascun premio */
	readyAt: Partial<Record<Prize, number>>;
}

export interface TombolaState {
	phase: "scelta" | "gioco" | "fine";
	players: TombolaPlayer[];
	remaining: number[];
	drawn: number[];
	pot: number;
	awarded: Partial<Record<Prize, number>>;
	events: GameEvent[];
	message: string;
}

export const markKey = (cardIndex: number, n: number) => `${cardIndex}-${n}`;

export function createGame(names: string[]): TombolaState {
	const players: TombolaPlayer[] = names
		.map((name, i) => ({ name, isHuman: i === 0 }))
		.map((p) => ({
			...p,
			chips: STARTING_CHIPS,
			cards: [],
			marks: [],
			readyAt: {},
		}));
	return toSetup({
		phase: "scelta",
		players,
		remaining: [],
		drawn: [],
		pot: 0,
		awarded: {},
		events: [],
		message: "",
	});
}

/** Torna alla scelta delle cartelle mantenendo le fiches */
export function toSetup(state: TombolaState): TombolaState {
	return {
		...state,
		phase: "scelta",
		players: state.players.map((p) => ({
			...p,
			cards: [],
			marks: [],
			readyAt: {},
		})),
		drawn: [],
		awarded: {},
		pot: 0,
		message: "Scegli le tue cartelle",
	};
}

/** Il giocatore compra le cartelle scelte; le CPU ne prendono da 1 a 6 a caso */
export function startGame(
	state: TombolaState,
	chosen: Cartella[],
): TombolaState {
	const players = state.players.map((p) => {
		const wanted = p.isHuman
			? chosen.length
			: 1 + Math.floor(Math.random() * MAX_CARDS);
		const count = Math.min(wanted, Math.floor(p.chips / CARD_COST));
		const cards = p.isHuman
			? chosen.slice(0, count)
			: Array.from({ length: count }, createCartella);
		return { ...p, cards, chips: p.chips - cards.length * CARD_COST };
	});
	const pot = players.reduce((s, p) => s + p.cards.length * CARD_COST, 0);
	return {
		...state,
		phase: "gioco",
		players,
		pot,
		remaining: shuffle(Array.from({ length: 90 }, (_, i) => i + 1)),
		drawn: [],
		awarded: {},
		message: `Piatto: ${pot} fiches`,
	};
}

const prizeValue = (state: TombolaState, prize: Prize) =>
	Math.floor(state.pot * PRIZE_SHARE[prize]);

function award(
	state: TombolaState,
	playerIndex: number,
	prize: Prize,
): TombolaState {
	const winner = state.players[playerIndex];
	const value = prizeValue(state, prize);
	const players = state.players.map((p, i) =>
		i === playerIndex ? { ...p, chips: p.chips + value } : p,
	);
	const moods: Record<string, Mood> = {};
	for (const p of players)
		if (!p.isHuman)
			moods[p.name] = p === players[playerIndex] ? "happy" : "sad";
	const label = prize.charAt(0).toUpperCase() + prize.slice(1);
	const finished = prize === "tombola";
	return {
		...state,
		players,
		awarded: { ...state.awarded, [prize]: playerIndex },
		phase: finished ? "fine" : state.phase,
		events: addEvent(
			state.events,
			winner.isHuman ? `${label}! +${value}` : `${winner.name}: ${label}!`,
			winner.isHuman ? "win" : "lose",
			moods,
		),
		message: finished
			? `${winner.isHuman ? "Hai fatto" : `${winner.name} fa`} tombola!`
			: state.message,
	};
}

/** Chiamata manuale del giocatore: verificata sui numeri segnati e usciti */
export function humanClaim(state: TombolaState, prize: Prize): TombolaState {
	if (state.phase !== "gioco") return state;
	if (state.awarded[prize] !== undefined)
		return {
			...state,
			events: addEvent(state.events, `${prize} già assegnato`),
		};
	const human = state.players[0];
	const valid = hasPrize(
		human.cards,
		prize,
		(ci, n) => human.marks.includes(markKey(ci, n)) && state.drawn.includes(n),
	);
	if (valid) return award(state, 0, prize);
	const penalty = Math.min(WRONG_CALL_PENALTY, human.chips);
	return {
		...state,
		pot: state.pot + penalty,
		players: state.players.map((p, i) =>
			i === 0 ? { ...p, chips: p.chips - penalty } : p,
		),
		events: addEvent(state.events, `Chiamata sbagliata! -${penalty}`, "lose"),
	};
}

export function toggleMark(state: TombolaState, key: string): TombolaState {
	const players = state.players.map((p, i) =>
		i === 0
			? {
					...p,
					marks: p.marks.includes(key)
						? p.marks.filter((k) => k !== key)
						: [...p.marks, key],
				}
			: p,
	);
	return { ...state, players };
}

/** Le CPU chiamano i premi raggiunti da abbastanza estrazioni (in base alla difficoltà) */
function cpuClaims(state: TombolaState, difficulty: Difficulty): TombolaState {
	let next = state;
	for (const prize of PRIZES) {
		if (next.awarded[prize] !== undefined || next.phase !== "gioco") continue;
		const claimer = next.players.findIndex(
			(p) =>
				!p.isHuman &&
				p.readyAt[prize] !== undefined &&
				next.drawn.length - (p.readyAt[prize] ?? 0) >= CPU_LAG[difficulty],
		);
		if (claimer >= 0) next = award(next, claimer, prize);
	}
	return next;
}

/** Estrazione del prossimo numero */
export function drawNumber(
	state: TombolaState,
	difficulty: Difficulty,
): TombolaState {
	const claimed = cpuClaims(state, difficulty);
	if (claimed.phase !== "gioco" || claimed.remaining.length === 0)
		return claimed;
	const [n, ...remaining] = claimed.remaining;
	const drawn = [...claimed.drawn, n];
	// Le CPU segnano da sole e annotano quando raggiungono un premio
	const players = claimed.players.map((p) => {
		if (p.isHuman) return p;
		const readyAt = { ...p.readyAt };
		for (const prize of PRIZES) {
			if (
				readyAt[prize] === undefined &&
				hasPrize(p.cards, prize, (_, x) => drawn.includes(x))
			)
				readyAt[prize] = drawn.length;
		}
		return { ...p, readyAt };
	});
	return { ...claimed, players, remaining, drawn };
}
