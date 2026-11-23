import {
	createNeapolitanDeck,
	type NeapolitanCard,
	shuffle,
} from "../../core/deck";
import { addEvent, type GameEvent, type Mood } from "../../core/gameEvents";
import type { Difficulty } from "../../core/settings";

export const STARTING_CHIPS = 100;
export const MIN_BET = 5;
const TARGET = 7.5;

export type SevenStatus = "inGioco" | "stai" | "sballato" | "eliminato";

export interface SevenPlayer {
	name: string;
	isHuman: boolean;
	chips: number;
	bet: number;
	hand: NeapolitanCard[];
	status: SevenStatus;
	/** Esito dell'ultima mano in fiches (positivo = vinto) */
	lastDelta: number;
	/** Ha già cambiato il 4 in questa mano (assente nei salvataggi precedenti) */
	swappedFour?: boolean;
}

export interface SevenState {
	players: SevenPlayer[];
	bankerIndex: number;
	/** Ordine di gioco della mano corrente (banco per ultimo) */
	order: number[];
	turn: number;
	deck: NeapolitanCard[];
	/** Carte raccolte a fine mano, che tornano nel mazzo */
	pile: NeapolitanCard[];
	phase: "puntate" | "turni" | "fineMano" | "raccolta" | "finePartita";
	message: string;
	events: GameEvent[];
}

export const isMatta = (card: NeapolitanCard) =>
	card.suit === "denari" && card.rank === 10;

export const cardValue = (card: NeapolitanCard) =>
	card.rank <= 7 ? card.rank : 0.5;

/** Punteggio della mano: la matta assume il valore migliore tra ½ e 7 */
export function handScore(hand: NeapolitanCard[]): number {
	const others = hand.filter((c) => !isMatta(c));
	const base = others.reduce((sum, c) => sum + cardValue(c), 0);
	if (others.length === hand.length) return base;
	if (others.length === 0) return 0.5;
	for (const value of [7, 6, 5, 4, 3, 2, 1, 0.5]) {
		if (base + value <= TARGET) return base + value;
	}
	return base + 0.5;
}

/** Sette e mezzo reale: due sole carte, la matta e un sette */
export const isReale = (hand: NeapolitanCard[]) =>
	hand.length === 2 && hand.some(isMatta) && hand.some((c) => c.rank === 7);

export const isBust = (hand: NeapolitanCard[]) => handScore(hand) > TARGET;

/** Decisione della CPU: Facile azzarda, Medio si ferma a 5, Difficile calcola la probabilità di sballare */
export function cpuWantsCard(
	hand: NeapolitanCard[],
	deck: NeapolitanCard[],
	difficulty: Difficulty,
): boolean {
	const score = handScore(hand);
	if (difficulty === "facile")
		return score < 4 || (score < 6 && Math.random() < 0.5);
	if (difficulty === "medio") return score < 5;
	const busting = deck.filter((c) => isBust([...hand, c])).length;
	return score < TARGET && busting / Math.max(deck.length, 1) < 0.45;
}

export function cpuBet(chips: number, difficulty: Difficulty): number {
	const round5 = (n: number) => Math.max(MIN_BET, Math.round(n / 5) * 5);
	const wanted =
		difficulty === "facile"
			? round5(5 + Math.random() * 20)
			: difficulty === "medio"
				? 10
				: round5(chips * 0.12);
	return Math.min(wanted, chips);
}

/** Fiches vinte (positive) o perse (negative) dal giocatore contro il banco */
export function settle(
	player: NeapolitanCard[],
	banker: NeapolitanCard[],
	bet: number,
): number {
	if (isBust(player)) return -bet;
	const win = isReale(player) ? bet * 2 : bet;
	if (isBust(banker)) return win;
	// A parità vince il banco
	return handScore(player) <= handScore(banker) ? -bet : win;
}

export function createGame(
	names: string[],
	difficulty: Difficulty,
): SevenState {
	const players: SevenPlayer[] = names
		.map((name, i) => ({ name, isHuman: i === 0 }))
		.map((p) => ({
			...p,
			chips: STARTING_CHIPS,
			bet: 0,
			hand: [],
			status: "inGioco",
			lastDelta: 0,
		}));
	return startRound(
		{
			players,
			bankerIndex: players.length - 1,
			order: [],
			turn: 0,
			deck: [],
			pile: [],
			phase: "puntate",
			message: "",
			events: [],
		},
		difficulty,
	);
}

const alive = (p: SevenPlayer) => p.status !== "eliminato";

/** Nuova mano: mazzo rimescolato, le CPU puntano, il giocatore sceglie la puntata */
export function startRound(
	state: SevenState,
	difficulty: Difficulty,
): SevenState {
	const players = state.players.map((p, i) => ({
		...p,
		hand: [],
		status: alive(p) ? ("inGioco" as const) : p.status,
		lastDelta: 0,
		swappedFour: false,
		bet:
			!alive(p) || i === state.bankerIndex || p.isHuman
				? 0
				: cpuBet(p.chips, difficulty),
	}));
	const banker = players[state.bankerIndex];
	return {
		...state,
		players,
		deck: shuffle(createNeapolitanDeck()),
		pile: [],
		phase: "puntate",
		message: banker.isHuman
			? "Sei il mazziere: dai le carte"
			: `Mazziere: ${banker.name}. Quanto punti?`,
	};
}

/** Puntata del giocatore (ignorata se è il mazziere) e distribuzione della prima carta */
export function placeBet(state: SevenState, amount: number): SevenState {
	const deck = [...state.deck];
	const players = state.players.map((p, i) => ({
		...p,
		bet: p.isHuman && i !== state.bankerIndex ? amount : p.bet,
		hand: alive(p) ? [deck.pop() as NeapolitanCard] : [],
	}));
	const n = players.length;
	const order = Array.from(
		{ length: n },
		(_, i) => (state.bankerIndex + 1 + i) % n,
	).filter((i) => alive(players[i]));
	return {
		...state,
		players,
		deck,
		order,
		turn: 0,
		phase: "turni",
		message: "",
	};
}

export const currentPlayerIndex = (state: SevenState) =>
	state.order[state.turn];

export function drawCard(state: SevenState): SevenState {
	const index = currentPlayerIndex(state);
	const deck = [...state.deck];
	const card = deck.pop() as NeapolitanCard;
	const hand = [...state.players[index].hand, card];
	const players = state.players.map((p, i) =>
		i === index ? { ...p, hand } : p,
	);
	const { isHuman, name } = state.players[index];
	let events = state.events;
	if (isBust(hand)) {
		events = isHuman
			? addEvent(events, "Sballato!", "lose")
			: addEvent(events, `${name} sballa!`, "info", { [name]: "sad" });
	} else if (handScore(hand) === TARGET && isHuman) {
		events = addEvent(
			events,
			isReale(hand) ? "Sette e mezzo reale!" : "Sette e mezzo!",
			"win",
		);
	}
	const next = { ...state, deck, players, events };
	return isBust(hand) ? endTurn(next, "sballato") : next;
}

/** Il giocatore di turno può cambiare il 4 ricevuto come prima carta */
export function canSwapFour(state: SevenState): boolean {
	if (state.phase !== "turni") return false;
	const p = state.players[currentPlayerIndex(state)];
	return p.hand.length === 1 && p.hand[0].rank === 4 && !p.swappedFour;
}

/** Scarta il 4 e riceve una nuova carta (una sola volta per mano) */
export function swapFour(state: SevenState): SevenState {
	if (!canSwapFour(state)) return state;
	const index = currentPlayerIndex(state);
	const deck = [...state.deck];
	const card = deck.pop() as NeapolitanCard;
	const { isHuman, name } = state.players[index];
	const players = state.players.map((p, i) =>
		i === index ? { ...p, hand: [card], swappedFour: true } : p,
	);
	const events = isHuman
		? state.events
		: addEvent(state.events, `${name} cambia il 4`, "info");
	return { ...state, deck, players, events };
}

/** La CPU Facile cambia il 4 a caso, le altre sempre */
export const cpuWantsSwap = (difficulty: Difficulty) =>
	difficulty !== "facile" || Math.random() < 0.5;

export function endTurn(
	state: SevenState,
	status: SevenStatus = "stai",
): SevenState {
	const index = currentPlayerIndex(state);
	const players = state.players.map((p, i) =>
		i === index ? { ...p, status } : p,
	);
	const next = { ...state, players, turn: state.turn + 1 };
	return next.turn >= next.order.length ? settleRound(next) : next;
}

function settleRound(state: SevenState): SevenState {
	const bankerHand = state.players[state.bankerIndex].hand;
	let bankerDelta = 0;
	let newBanker = state.bankerIndex;
	const players = state.players.map((p, i) => {
		if (i === state.bankerIndex || !alive(p)) return p;
		const delta = settle(p.hand, bankerHand, p.bet);
		bankerDelta -= delta;
		// Chi fa sette e mezzo reale diventa mazziere
		if (isReale(p.hand) && !isReale(bankerHand)) newBanker = i;
		return { ...p, chips: p.chips + delta, lastDelta: delta };
	});
	const banker = players[state.bankerIndex];
	players[state.bankerIndex] = {
		...banker,
		chips: banker.chips + bankerDelta,
		lastDelta: bankerDelta,
	};
	const checked = players.map((p) =>
		p.chips <= 0 ? { ...p, chips: 0, status: "eliminato" as const } : p,
	);
	while (!alive(checked[newBanker])) {
		newBanker = (newBanker + 1) % checked.length;
	}
	const human = checked[0];
	const cpuAlive = checked.some((p) => !p.isHuman && alive(p));
	const gameOver = !alive(human) || !cpuAlive;

	const moods: Record<string, Mood> = {};
	for (const p of checked) {
		if (!p.isHuman && p.lastDelta !== 0)
			moods[p.name] = p.lastDelta > 0 ? "happy" : "sad";
	}
	let events = state.events;
	if (human.lastDelta > 0)
		events = addEvent(events, `Hai vinto! +${human.lastDelta}`, "win", moods);
	else if (human.lastDelta < 0)
		events = addEvent(events, `Hai perso ${human.lastDelta}`, "lose", moods);
	else events = addEvent(events, "Mano terminata", "info", moods);
	if (gameOver)
		events = cpuAlive
			? addEvent(events, "Partita persa!", "lose")
			: addEvent(events, "Partita vinta!", "win");

	return {
		...state,
		events,
		players: checked,
		bankerIndex: newBanker,
		phase: gameOver ? "finePartita" : "fineMano",
		message: gameOver
			? alive(human)
				? "Hai sbancato tutti: hai vinto!"
				: "Hai finito le fiches: hai perso!"
			: "Mano terminata",
	};
}

/** Le carte tornano al mazzo prima della nuova mano */
export function collectCards(state: SevenState): SevenState {
	return {
		...state,
		pile: state.players.flatMap((p) => p.hand),
		players: state.players.map((p) => ({ ...p, hand: [] })),
		phase: "raccolta",
	};
}
