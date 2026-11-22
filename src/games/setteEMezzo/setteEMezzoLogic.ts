import {
	createNeapolitanDeck,
	type NeapolitanCard,
	shuffle,
} from "../../core/deck";
import { addEvent, type GameEvent } from "../../core/gameEvents";

export const STARTING_CHIPS = 100;
export const BET = 10;
const TARGET = 7.5;
/** Sotto questa soglia la CPU chiede carta */
const CPU_STAND_AT = 5;

export type SevenStatus = "inGioco" | "stai" | "sballato" | "eliminato";

export interface SevenPlayer {
	name: string;
	isHuman: boolean;
	chips: number;
	hand: NeapolitanCard[];
	status: SevenStatus;
	/** Esito dell'ultima mano in fiches (positivo = vinto) */
	lastDelta: number;
}

export interface SevenState {
	players: SevenPlayer[];
	bankerIndex: number;
	/** Ordine di gioco della mano corrente (banco per ultimo) */
	order: number[];
	turn: number;
	deck: NeapolitanCard[];
	phase: "turni" | "fineMano" | "finePartita";
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

export const cpuWantsCard = (hand: NeapolitanCard[]) =>
	handScore(hand) < CPU_STAND_AT;

/** Fiches vinte (positive) o perse (negative) dal giocatore contro il banco */
export function settle(
	player: NeapolitanCard[],
	banker: NeapolitanCard[],
): number {
	if (isBust(player)) return -BET;
	if (isBust(banker)) return isReale(player) ? BET * 2 : BET;
	const p = handScore(player);
	const b = handScore(banker);
	// A parità vince il banco
	if (p <= b) return -BET;
	return isReale(player) ? BET * 2 : BET;
}

export function createGame(cpuCount: number): SevenState {
	const players: SevenPlayer[] = [
		{ name: "Tu", isHuman: true },
		...Array.from({ length: cpuCount }, (_, i) => ({
			name: `CPU ${i + 1}`,
			isHuman: false,
		})),
	].map((p) => ({
		...p,
		chips: STARTING_CHIPS,
		hand: [],
		status: "inGioco",
		lastDelta: 0,
	}));
	return dealRound({
		players,
		bankerIndex: players.length - 1,
		order: [],
		turn: 0,
		deck: [],
		phase: "turni",
		message: "",
		events: [],
	});
}

/** Nuova mano: mazzo rimescolato, una carta a testa */
export function dealRound(state: SevenState): SevenState {
	const deck = shuffle(createNeapolitanDeck());
	const players = state.players.map((p) => ({
		...p,
		hand: p.status === "eliminato" ? [] : [deck.pop() as NeapolitanCard],
		status: p.status === "eliminato" ? p.status : ("inGioco" as const),
		lastDelta: 0,
	}));
	const n = players.length;
	const order = Array.from(
		{ length: n },
		(_, i) => (state.bankerIndex + 1 + i) % n,
	).filter((i) => players[i].status !== "eliminato");
	return {
		...state,
		players,
		deck,
		order,
		turn: 0,
		phase: "turni",
		message: `Mazziere: ${players[state.bankerIndex].name}`,
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
			: addEvent(events, `${name} sballa!`);
	} else if (isHuman && handScore(hand) === TARGET) {
		events = addEvent(
			events,
			isReale(hand) ? "Sette e mezzo reale!" : "Sette e mezzo!",
			"win",
		);
	}
	const next = { ...state, deck, players, events };
	return isBust(hand) ? endTurn(next, "sballato") : next;
}

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
		if (i === state.bankerIndex || p.status === "eliminato") return p;
		const delta = settle(p.hand, bankerHand);
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
	while (checked[newBanker].status === "eliminato") {
		newBanker = (newBanker + 1) % checked.length;
	}
	const human = checked[0];
	const cpuAlive = checked.some((p) => !p.isHuman && p.status !== "eliminato");
	const gameOver = human.status === "eliminato" || !cpuAlive;
	let events = state.events;
	if (human.lastDelta > 0)
		events = addEvent(events, `Hai vinto! +${human.lastDelta}`, "win");
	if (human.lastDelta < 0)
		events = addEvent(events, `Hai perso ${human.lastDelta}`, "lose");
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
			? human.status === "eliminato"
				? "Hai finito le fiches: hai perso!"
				: "Hai sbancato tutti: hai vinto!"
			: "Mano terminata",
	};
}
