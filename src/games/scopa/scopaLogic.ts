import {
	createNeapolitanDeck,
	type NeapolitanCard,
	shuffle,
} from "../../core/deck";
import { addEvent, type GameEvent, type Mood } from "../../core/gameEvents";
import {
	captureOptions,
	isSettebello,
	type SideScore,
	scoreRound,
} from "./scopaRules";

export type ScopaTarget = 11 | 16 | 21;
/** Scopa: 3 carte a testa e 4 in tavola. Scopone: tutte le carte in mano, tavola vuota */
export type ScopaVariant = "scopa" | "scopone";
const HAND_SIZE = 3;

export interface ScopaPlayer {
	name: string;
	isHuman: boolean;
	hand: NeapolitanCard[];
	/** Lato di appartenenza: in quattro si gioca a coppie (0-2 contro 1-3) */
	side: number;
}

export interface ScopaSide {
	captured: NeapolitanCard[];
	scope: number;
	score: number;
}

/** Giocata in corso: la carta resta un attimo in tavola prima della presa */
export interface PendingPlay {
	player: number;
	card: NeapolitanCard;
	take: NeapolitanCard[];
}

export interface ScopaState {
	players: ScopaPlayer[];
	sides: ScopaSide[];
	table: NeapolitanCard[];
	deck: NeapolitanCard[];
	dealer: number;
	current: number;
	lastTaker: number;
	pending: PendingPlay | null;
	phase: "gioco" | "presa" | "fineSmazzata" | "finePartita";
	summary: SideScore[] | null;
	target: ScopaTarget;
	variant: ScopaVariant;
	message: string;
	events: GameEvent[];
}

export const sideCount = (players: number) => (players === 4 ? 2 : players);
export const sideName = (s: ScopaState, side: number) =>
	s.players
		.filter((p) => p.side === side)
		.map((p) => p.name)
		.join(" e ");
const humanSide = (s: ScopaState) => s.players[0].side;

export function createGame(
	names: string[],
	target: ScopaTarget,
	variant: ScopaVariant = "scopa",
): ScopaState {
	const sides = sideCount(names.length);
	return dealRound({
		players: names.map((name, i) => ({
			name,
			isHuman: i === 0,
			hand: [],
			side: i % sides,
		})),
		sides: Array.from({ length: sides }, () => ({
			captured: [],
			scope: 0,
			score: 0,
		})),
		table: [],
		deck: [],
		dealer: names.length - 1,
		current: 0,
		lastTaker: 0,
		pending: null,
		phase: "gioco",
		summary: null,
		target,
		variant,
		message: "",
		events: [],
	});
}

const dealHands = (players: ScopaPlayer[], deck: NeapolitanCard[]) =>
	players.map((p) => ({ ...p, hand: deck.splice(-HAND_SIZE) }));

/** Scopone: tutte le 40 carte divise tra i giocatori, tavola vuota */
function dealScopone(players: ScopaPlayer[]) {
	const deck = shuffle(createNeapolitanDeck());
	const perPlayer = deck.length / players.length;
	return {
		players: players.map((p) => ({ ...p, hand: deck.splice(-perPlayer) })),
		table: [] as NeapolitanCard[],
		deck,
	};
}

/** Scopa: 4 carte in tavola (si rimescola se ci sono 3 o più Re) e 3 a testa */
function dealScopa(players: ScopaPlayer[]) {
	let deck: NeapolitanCard[];
	let table: NeapolitanCard[];
	do {
		deck = shuffle(createNeapolitanDeck());
		table = deck.splice(-4);
	} while (table.filter((c) => c.rank === 10).length >= 3);
	return { players: dealHands(players, deck), table, deck };
}

/** Nuova smazzata secondo la variante */
export function dealRound(state: ScopaState): ScopaState {
	const { players, table, deck } =
		state.variant === "scopone"
			? dealScopone(state.players)
			: dealScopa(state.players);
	const dealer = (state.dealer + 1) % state.players.length;
	const current = (dealer + 1) % state.players.length;
	return {
		...state,
		players,
		sides: state.sides.map((s) => ({ ...s, captured: [], scope: 0 })),
		table,
		deck,
		dealer,
		current,
		pending: null,
		phase: "gioco",
		summary: null,
		message: `Mazziere: ${state.players[dealer].name}`,
	};
}

/** Il giocatore di turno cala una carta, eventualmente con la presa scelta */
export function playCard(
	state: ScopaState,
	cardId: string,
	take: NeapolitanCard[] = [],
): ScopaState {
	const player = state.players[state.current];
	const card = player.hand.find((c) => c.id === cardId);
	if (!card || state.phase !== "gioco") return state;
	const options = captureOptions(state.table, card);
	const valid =
		options.length === 0
			? take.length === 0
			: options.some(
					(o) =>
						o.length === take.length &&
						o.every((c) => take.some((t) => t.id === c.id)),
				);
	if (!valid) return state;
	const players = state.players.map((p, i) =>
		i === state.current
			? { ...p, hand: p.hand.filter((c) => c.id !== cardId) }
			: p,
	);
	return {
		...state,
		players,
		pending: { player: state.current, card, take },
		phase: "presa",
	};
}

/** Completa la giocata: presa (con eventuale scopa) o carta lasciata in tavola */
export function resolvePlay(state: ScopaState): ScopaState {
	const { pending } = state;
	if (!pending) return state;
	const player = state.players[pending.player];
	const lastCardOfRound =
		state.deck.length === 0 && state.players.every((p) => p.hand.length === 0);
	let { table, sides, events, lastTaker } = state;

	if (pending.take.length === 0) {
		table = [...table, pending.card];
	} else {
		table = table.filter((c) => !pending.take.some((t) => t.id === c.id));
		const isScopa = table.length === 0 && !lastCardOfRound;
		lastTaker = player.side;
		sides = sides.map((s, i) =>
			i === player.side
				? {
						...s,
						captured: [...s.captured, pending.card, ...pending.take],
						scope: s.scope + (isScopa ? 1 : 0),
					}
				: s,
		);
		const mine = player.side === humanSide(state);
		const mood: Record<string, Mood> = player.isHuman
			? {}
			: { [player.name]: "happy" };
		if (isScopa)
			events = addEvent(
				events,
				player.isHuman ? "Scopa!" : `Scopa di ${player.name}!`,
				mine ? "win" : "lose",
				mood,
			);
		else if ([pending.card, ...pending.take].some(isSettebello))
			events = addEvent(
				events,
				`Settebello a ${player.name}!`,
				mine ? "win" : "info",
				mood,
			);
	}

	const next = { ...state, table, sides, events, lastTaker, pending: null };
	return advance(next, pending.player);
}

/** Turno successivo, nuova distribuzione o fine smazzata */
function advance(state: ScopaState, from: number): ScopaState {
	const n = state.players.length;
	if (state.players.some((p) => p.hand.length > 0))
		return { ...state, phase: "gioco", current: (from + 1) % n };
	if (state.deck.length > 0) {
		const deck = [...state.deck];
		return {
			...state,
			players: dealHands(state.players, deck),
			deck,
			phase: "gioco",
			current: (from + 1) % n,
		};
	}
	return endRound(state);
}

function endRound(state: ScopaState): ScopaState {
	// Le carte rimaste vanno a chi ha preso per ultimo (senza scopa)
	const sides = state.sides.map((s, i) =>
		i === state.lastTaker
			? { ...s, captured: [...s.captured, ...state.table] }
			: s,
	);
	const summary = scoreRound(
		sides.map((s) => s.captured),
		sides.map((s) => s.scope),
	);
	const scored = sides.map((s, i) => ({
		...s,
		score: s.score + summary[i].total,
	}));
	const best = Math.max(...scored.map((s) => s.score));
	const leaders = scored.filter((s) => s.score === best).length;
	const gameOver = best >= state.target && leaders === 1;
	const winner = scored.findIndex((s) => s.score === best);
	const humanWins = winner === humanSide(state);

	let events = addEvent(state.events, "Fine smazzata", "info");
	if (gameOver) {
		const moods: Record<string, Mood> = {};
		for (const p of state.players)
			if (!p.isHuman) moods[p.name] = p.side === winner ? "happy" : "sad";
		events = addEvent(
			events,
			humanWins ? "Hai vinto la partita!" : `Vince ${sideName(state, winner)}`,
			humanWins ? "win" : "lose",
			moods,
		);
	}
	return {
		...state,
		sides: scored,
		table: [],
		summary,
		events,
		phase: gameOver ? "finePartita" : "fineSmazzata",
		message: gameOver
			? `Vince ${sideName(state, winner)} con ${best} punti`
			: "Fine smazzata",
	};
}
