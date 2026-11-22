import { createFrenchDeck, type FrenchCard, shuffle } from "../../core/deck";
import { addEvent, type GameEvent, type Mood } from "../../core/gameEvents";
import { evaluateHand } from "./handEval";

export const STARTING_CHIPS = 1000;
export const SMALL_BLIND = 5;
export const BIG_BLIND = 10;

export type Street = "preflop" | "flop" | "turn" | "river";
export type PokerAction =
	| { type: "fold" }
	| { type: "check" }
	| { type: "call" }
	/** Rilancio: `to` è la puntata totale del giro */
	| { type: "raise"; to: number };

export interface PokerPlayer {
	name: string;
	isHuman: boolean;
	chips: number;
	hole: FrenchCard[];
	/** Puntata nel giro corrente */
	bet: number;
	/** Totale messo nel piatto in questa mano */
	totalBet: number;
	folded: boolean;
	acted: boolean;
	out: boolean;
	lastAction: string;
}

export interface PokerState {
	players: PokerPlayer[];
	deck: FrenchCard[];
	board: FrenchCard[];
	dealer: number;
	current: number;
	street: Street;
	currentBet: number;
	minRaise: number;
	phase: "gioco" | "fineMano" | "finePartita";
	/** Carte mostrate allo showdown */
	showdown: boolean;
	message: string;
	events: GameEvent[];
}

export const pot = (s: PokerState) =>
	s.players.reduce((sum, p) => sum + p.totalBet, 0);
const inHand = (p: PokerPlayer) => !p.out && !p.folded;
const canAct = (p: PokerPlayer) => inHand(p) && p.chips > 0;

function nextIndex(
	players: PokerPlayer[],
	from: number,
	ok: (p: PokerPlayer) => boolean,
) {
	for (let step = 1; step <= players.length; step++) {
		const i = (from + step) % players.length;
		if (ok(players[i])) return i;
	}
	return from;
}

export function createGame(names: string[]): PokerState {
	const players: PokerPlayer[] = names
		.map((name, i) => ({ name, isHuman: i === 0 }))
		.map((p) => ({
			...p,
			chips: STARTING_CHIPS,
			hole: [],
			bet: 0,
			totalBet: 0,
			folded: false,
			acted: false,
			out: false,
			lastAction: "",
		}));
	return startHand({
		players,
		deck: [],
		board: [],
		dealer: 0,
		current: 0,
		street: "preflop",
		currentBet: 0,
		minRaise: BIG_BLIND,
		phase: "gioco",
		showdown: false,
		message: "",
		events: [],
	});
}

function pay(p: PokerPlayer, amount: number): PokerPlayer {
	const paid = Math.min(amount, p.chips);
	return {
		...p,
		chips: p.chips - paid,
		bet: p.bet + paid,
		totalBet: p.totalBet + paid,
	};
}

export function startHand(state: PokerState): PokerState {
	const deck = shuffle(createFrenchDeck());
	let players = state.players.map((p) => ({
		...p,
		hole: p.out ? [] : [deck.pop() as FrenchCard, deck.pop() as FrenchCard],
		bet: 0,
		totalBet: 0,
		folded: false,
		acted: false,
		lastAction: "",
	}));
	const alive = (p: PokerPlayer) => !p.out;
	const dealer = nextIndex(players, state.dealer, alive);
	const headsUp = players.filter(alive).length === 2;
	// Testa a testa il mazziere mette lo small blind
	const sb = headsUp ? dealer : nextIndex(players, dealer, alive);
	const bb = nextIndex(players, sb, alive);
	players = players.map((p, i) =>
		i === sb
			? { ...pay(p, SMALL_BLIND), lastAction: "small blind" }
			: i === bb
				? { ...pay(p, BIG_BLIND), lastAction: "big blind" }
				: p,
	);
	return {
		...state,
		players,
		deck,
		board: [],
		dealer,
		street: "preflop",
		currentBet: BIG_BLIND,
		minRaise: BIG_BLIND,
		current: nextIndex(players, bb, canAct),
		phase: "gioco",
		showdown: false,
		message: `Mazziere: ${players[dealer].name}`,
	};
}

const ACTION_LABELS = { fold: "passa", check: "check", call: "vede" } as const;

/** Applica l'azione del giocatore di turno */
export function act(state: PokerState, action: PokerAction): PokerState {
	const i = state.current;
	const me = state.players[i];
	const toCall = state.currentBet - me.bet;
	let { currentBet, minRaise } = state;
	let players = [...state.players];

	if (action.type === "fold") players[i] = { ...me, folded: true };
	else if (action.type === "check" && toCall <= 0) players[i] = me;
	else if (action.type === "raise" && action.to > state.currentBet) {
		const to = Math.min(action.to, me.bet + me.chips);
		minRaise = Math.max(minRaise, to - currentBet);
		currentBet = to;
		players[i] = pay(me, to - me.bet);
		// Dopo un rilancio gli altri devono parlare di nuovo
		players = players.map((p, j) => (j === i ? p : { ...p, acted: false }));
	} else players[i] = pay(me, toCall);

	const label =
		action.type === "raise"
			? players[i].chips === 0
				? "all-in"
				: `rilancia a ${currentBet}`
			: ACTION_LABELS[
					action.type === "check" && toCall > 0 ? "call" : action.type
				];
	players[i] = { ...players[i], acted: true, lastAction: label };
	const next = { ...state, players, currentBet, minRaise };

	const remaining = players.filter(inHand);
	if (remaining.length === 1)
		return finishHand(next, [players.indexOf(remaining[0])]);

	const needs = (p: PokerPlayer) =>
		canAct(p) && (!p.acted || p.bet < currentBet);
	if (players.some(needs))
		return { ...next, current: nextIndex(players, i, needs) };
	return advanceStreet(next);
}

const STREETS: Street[] = ["preflop", "flop", "turn", "river"];

function advanceStreet(state: PokerState): PokerState {
	if (state.street === "river") return showdown(state);
	const street = STREETS[STREETS.indexOf(state.street) + 1];
	const deck = [...state.deck];
	const dealt = street === "flop" ? 3 : 1;
	const board = [...state.board, ...deck.splice(-dealt)];
	const players = state.players.map((p) => ({
		...p,
		bet: 0,
		acted: false,
		lastAction: p.folded ? p.lastAction : "",
	}));
	const next = {
		...state,
		deck,
		board,
		street,
		players,
		currentBet: 0,
		minRaise: BIG_BLIND,
	};
	// Se al massimo uno può ancora puntare, si scoprono le carte fino al river
	if (players.filter(canAct).length < 2) return advanceStreet(next);
	return { ...next, current: nextIndex(players, state.dealer, canAct) };
}

function showdown(state: PokerState): PokerState {
	const contenders = state.players
		.map((p, i) => ({ i, p }))
		.filter(({ p }) => inHand(p));
	const scores = new Map(
		contenders.map(({ i, p }) => [
			i,
			evaluateHand([...p.hole, ...state.board]).score,
		]),
	);
	// Piatti laterali: ogni livello di puntata è conteso da chi l'ha coperto
	const levels = [...new Set(contenders.map(({ p }) => p.totalBet))].sort(
		(a, b) => a - b,
	);
	const winnings = new Map<number, number>();
	let previous = 0;
	for (const level of levels) {
		const amount = state.players.reduce(
			(s, p) =>
				s + Math.min(p.totalBet, level) - Math.min(p.totalBet, previous),
			0,
		);
		const eligible = contenders
			.filter(({ p }) => p.totalBet >= level)
			.map(({ i }) => i);
		const best = Math.max(...eligible.map((i) => scores.get(i) ?? 0));
		const winners = eligible.filter((i) => scores.get(i) === best);
		winners.forEach((w, k) => {
			const share =
				Math.floor(amount / winners.length) +
				(k === 0 ? amount % winners.length : 0);
			winnings.set(w, (winnings.get(w) ?? 0) + share);
		});
		previous = level;
	}
	return finishHand(
		{ ...state, showdown: true },
		[...winnings.keys()],
		winnings,
	);
}

function finishHand(
	state: PokerState,
	winners: number[],
	winnings = new Map([[winners[0], pot(state)]]),
): PokerState {
	const players = state.players.map((p, i) => {
		const chips = p.chips + (winnings.get(i) ?? 0);
		return { ...p, chips, out: p.out || chips === 0 };
	});
	const human = players[0];
	const humanWon = winnings.has(0);
	const gameOver = human.out || players.filter((p) => !p.out).length === 1;
	const hand = (i: number) =>
		state.showdown
			? ` con ${evaluateHand([...players[i].hole, ...state.board]).name}`
			: "";
	const names = winners.map((w) => `${players[w].name}${hand(w)}`).join(", ");
	const moods: Record<string, Mood> = {};
	for (const [i, p] of players.entries())
		if (!p.isHuman && !p.out) moods[p.name] = winnings.has(i) ? "happy" : "sad";

	let events = addEvent(
		state.events,
		humanWon ? `Hai vinto ${winnings.get(0)}${hand(0)}!` : `Vince ${names}`,
		humanWon ? "win" : "lose",
		moods,
	);
	if (gameOver)
		events = addEvent(
			events,
			human.out ? "Sei eliminato!" : "Hai sbancato il tavolo!",
			human.out ? "lose" : "win",
		);
	return {
		...state,
		players,
		events,
		phase: gameOver ? "finePartita" : "fineMano",
		message: `Vince ${names}`,
	};
}
