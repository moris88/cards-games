import { createScala40Deck, type FrenchCard, shuffle } from "../../core/deck";
import { addEvent, type GameEvent, type Mood } from "../../core/gameEvents";
import { analyzeMeld, OPENING_POINTS, penaltyValue } from "./scala40Melds";

export const HAND_SIZE = 13;
export const ELIMINATION_SCORE = 101;

export interface S40Player {
	name: string;
	isHuman: boolean;
	hand: FrenchCard[];
	opened: boolean;
	score: number;
	eliminated: boolean;
}

export interface TableMeld {
	id: number;
	cards: FrenchCard[];
}

export interface S40State {
	players: S40Player[];
	melds: TableMeld[];
	/** Combinazioni preparate per l'apertura, non ancora confermate */
	pending: FrenchCard[][];
	deck: FrenchCard[];
	discard: FrenchCard[];
	current: number;
	dealer: number;
	phase: "pesca" | "gioco" | "fineMano" | "finePartita";
	message: string;
	events: GameEvent[];
	nextMeldId: number;
}

type Result = S40State | string;

export function createGame(names: string[]): S40State {
	const players: S40Player[] = names
		.map((name, i) => ({ name, isHuman: i === 0 }))
		.map((p) => ({
			...p,
			hand: [],
			opened: false,
			score: 0,
			eliminated: false,
		}));
	return dealRound({
		players,
		melds: [],
		pending: [],
		deck: [],
		discard: [],
		current: 0,
		dealer: players.length - 1,
		phase: "pesca",
		message: "",
		events: [],
		nextMeldId: 1,
	});
}

const nextActive = (players: S40Player[], from: number) => {
	let i = from;
	do i = (i + 1) % players.length;
	while (players[i].eliminated);
	return i;
};

export function dealRound(state: S40State): S40State {
	const deck = shuffle(createScala40Deck());
	const players = state.players.map((p) => ({
		...p,
		opened: false,
		hand: p.eliminated ? [] : deck.splice(-HAND_SIZE),
	}));
	const discard = [deck.pop() as FrenchCard];
	const current = nextActive(players, state.dealer);
	return {
		...state,
		players,
		deck,
		discard,
		melds: [],
		pending: [],
		current,
		phase: "pesca",
		message: `Inizia ${players[current].name}`,
	};
}

const updatePlayer = (
	state: S40State,
	change: (p: S40Player) => S40Player,
): S40Player[] =>
	state.players.map((p, i) => (i === state.current ? change(p) : p));

const withoutCards = (hand: FrenchCard[], cards: FrenchCard[]) =>
	hand.filter((c) => !cards.some((x) => x.id === c.id));

export function drawFromDeck(state: S40State): S40State {
	let deck = [...state.deck];
	let discard = state.discard;
	// Mazzo esaurito: si rimescolano gli scarti tranne l'ultimo
	if (deck.length === 0) {
		deck = shuffle(discard.slice(0, -1));
		discard = discard.slice(-1);
	}
	const card = deck.pop() as FrenchCard;
	return {
		...state,
		deck,
		discard,
		players: updatePlayer(state, (p) => ({ ...p, hand: [...p.hand, card] })),
		phase: "gioco",
	};
}

/** Si può raccogliere lo scarto solo dopo aver aperto */
export function drawFromDiscard(state: S40State): Result {
	if (!state.players[state.current].opened)
		return "Puoi prendere dagli scarti solo dopo aver aperto";
	const card = state.discard[state.discard.length - 1];
	if (!card) return "Non ci sono scarti";
	return {
		...state,
		discard: state.discard.slice(0, -1),
		players: updatePlayer(state, (p) => ({ ...p, hand: [...p.hand, card] })),
		phase: "gioco",
	};
}

/** In mano deve sempre restare almeno una carta da scartare */
const leavesDiscard = (state: S40State, count: number) =>
	state.players[state.current].hand.length - count >= 1;

export function meld(state: S40State, cards: FrenchCard[]): Result {
	const analysis = analyzeMeld(cards);
	if (!analysis) return "Combinazione non valida";
	if (!leavesDiscard(state, cards.length))
		return "Devi tenere una carta da scartare";
	const players = updatePlayer(state, (p) => ({
		...p,
		hand: withoutCards(p.hand, cards),
	}));
	if (!state.players[state.current].opened) {
		return { ...state, players, pending: [...state.pending, analysis.ordered] };
	}
	return {
		...state,
		players,
		melds: [...state.melds, { id: state.nextMeldId, cards: analysis.ordered }],
		nextMeldId: state.nextMeldId + 1,
	};
}

export const pendingPoints = (state: S40State) =>
	state.pending.reduce((sum, m) => sum + (analyzeMeld(m)?.value ?? 0), 0);

export function confirmOpening(state: S40State): Result {
	const points = pendingPoints(state);
	if (points < OPENING_POINTS)
		return `Servono almeno ${OPENING_POINTS} punti (ne hai ${points})`;
	let nextMeldId = state.nextMeldId;
	const melds = [
		...state.melds,
		...state.pending.map((cards) => ({ id: nextMeldId++, cards })),
	];
	return {
		...state,
		melds,
		nextMeldId,
		pending: [],
		players: updatePlayer(state, (p) => ({ ...p, opened: true })),
		message: `${state.players[state.current].name} apre con ${points} punti`,
		events: addEvent(
			state.events,
			state.players[state.current].isHuman
				? `Hai aperto con ${points} punti!`
				: `${state.players[state.current].name} apre con ${points}`,
			"info",
			{ [state.players[state.current].name]: "happy" },
		),
	};
}

export function cancelOpening(state: S40State): S40State {
	const cards = state.pending.flat();
	return {
		...state,
		pending: [],
		players: updatePlayer(state, (p) => ({
			...p,
			hand: [...p.hand, ...cards],
		})),
	};
}

export function attach(
	state: S40State,
	meldId: number,
	cards: FrenchCard[],
): Result {
	if (!state.players[state.current].opened)
		return "Puoi attaccare solo dopo aver aperto";
	const target = state.melds.find((m) => m.id === meldId);
	const analysis = target && analyzeMeld([...target.cards, ...cards]);
	if (!analysis) return "Le carte non si attaccano a questa combinazione";
	if (!leavesDiscard(state, cards.length))
		return "Devi tenere una carta da scartare";
	return {
		...state,
		melds: state.melds.map((m) =>
			m.id === meldId ? { ...m, cards: analysis.ordered } : m,
		),
		players: updatePlayer(state, (p) => ({
			...p,
			hand: withoutCards(p.hand, cards),
		})),
	};
}

export function discardCard(state: S40State, cardId: string): Result {
	if (state.pending.length > 0)
		return "Conferma o annulla l'apertura prima di scartare";
	const player = state.players[state.current];
	const card = player.hand.find((c) => c.id === cardId);
	if (!card) return "Carta non trovata";
	const players = updatePlayer(state, (p) => ({
		...p,
		hand: p.hand.filter((c) => c.id !== cardId),
	}));
	const next = { ...state, players, discard: [...state.discard, card] };
	if (players[state.current].hand.length === 0) return endRound(next);
	const current = nextActive(players, state.current);
	return {
		...next,
		current,
		phase: "pesca",
		message: `Tocca a ${players[current].name}`,
	};
}

function endRound(state: S40State): S40State {
	const winner = state.players[state.current];
	const players = state.players.map((p) => {
		if (p.eliminated) return p;
		// Chi non ha aperto paga 100 punti
		const penalty = p.opened
			? p.hand.reduce((s, c) => s + penaltyValue(c), 0)
			: p.hand.length > 0
				? 100
				: 0;
		const score = p.score + penalty;
		return { ...p, score, eliminated: score >= ELIMINATION_SCORE };
	});
	const alive = players.filter((p) => !p.eliminated);
	const humanOut = players[0].eliminated;
	const gameOver = humanOut || alive.length <= 1;
	let events = addEvent(
		state.events,
		winner.isHuman ? "Hai chiuso la mano!" : `${winner.name} chiude!`,
		winner.isHuman ? "win" : "lose",
		Object.fromEntries(
			players.map((p, i): [string, Mood] => [
				p.name,
				i === state.current ? "happy" : "sad",
			]),
		),
	);
	for (const [i, p] of players.entries()) {
		if (!p.isHuman && p.eliminated && !state.players[i].eliminated)
			events = addEvent(events, `${p.name} eliminato!`);
	}
	if (gameOver)
		events = humanOut
			? addEvent(events, "Hai perso la partita!", "lose")
			: addEvent(events, "Hai vinto la partita!", "win");
	return {
		...state,
		events,
		players,
		phase: gameOver ? "finePartita" : "fineMano",
		dealer: gameOver ? state.dealer : nextActive(players, state.dealer),
		message: gameOver
			? humanOut
				? "Hai superato 101 punti: sei eliminato!"
				: "Hai vinto la partita!"
			: `${winner.name} chiude la mano!`,
	};
}
