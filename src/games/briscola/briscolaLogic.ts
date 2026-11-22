import {
	createNeapolitanDeck,
	type NeapolitanCard,
	type NeapolitanSuit,
	shuffle,
} from "../../core/deck";
import { addEvent, type GameEvent } from "../../core/gameEvents";
import type { Difficulty } from "../../core/settings";

/** Punti: Asso 11, Tre 10, Re 4, Cavallo 3, Fante 2, lisci 0 */
const POINTS: Record<number, number> = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2 };
/** Forza di presa: Asso > Tre > Re > Cavallo > Fante > 7 > ... > 2 */
const STRENGTH: Record<number, number> = {
	1: 10,
	3: 9,
	10: 8,
	9: 7,
	8: 6,
	7: 5,
	6: 4,
	5: 3,
	4: 2,
	2: 1,
};

export const cardPoints = (card: NeapolitanCard) => POINTS[card.rank] ?? 0;

export interface PlayedCard {
	player: number;
	card: NeapolitanCard;
}

export interface BriscolaState {
	/** 0 = umano, 1 = CPU */
	hands: [NeapolitanCard[], NeapolitanCard[]];
	deck: NeapolitanCard[];
	briscola: NeapolitanCard;
	trick: PlayedCard[];
	points: [number, number];
	/** Carte prese da ciascun giocatore */
	captured: [NeapolitanCard[], NeapolitanCard[]];
	turn: number;
	phase: "gioco" | "presa" | "fine";
	message: string;
	/** Nome dell'avversario CPU */
	cpuName: string;
	events: GameEvent[];
}

/** Restituisce true se `second` batte `first` (giocata per prima) */
export function beats(
	first: NeapolitanCard,
	second: NeapolitanCard,
	trump: NeapolitanSuit,
): boolean {
	if (second.suit === first.suit)
		return STRENGTH[second.rank] > STRENGTH[first.rank];
	return second.suit === trump;
}

export function createGame(cpuName = "CPU"): BriscolaState {
	const deck = shuffle(createNeapolitanDeck());
	const hands: [NeapolitanCard[], NeapolitanCard[]] = [
		deck.splice(-3),
		deck.splice(-3),
	];
	// La briscola è la carta in fondo al mazzo: verrà pescata per ultima
	return {
		hands,
		deck,
		briscola: deck[0],
		trick: [],
		points: [0, 0],
		captured: [[], []],
		turn: 0,
		phase: "gioco",
		message: "Tocca a te",
		cpuName,
		events: [],
	};
}

export function playCard(state: BriscolaState, cardId: string): BriscolaState {
	const player = state.turn;
	const card = state.hands[player].find((c) => c.id === cardId);
	if (!card || state.phase !== "gioco") return state;
	const hands = state.hands.map((h, i) =>
		i === player ? h.filter((c) => c.id !== cardId) : h,
	) as [NeapolitanCard[], NeapolitanCard[]];
	const trick = [...state.trick, { player, card }];
	return {
		...state,
		hands,
		trick,
		turn: 1 - player,
		phase: trick.length === 2 ? "presa" : "gioco",
	};
}

export function resolveTrick(state: BriscolaState): BriscolaState {
	const [first, second] = state.trick;
	const winner = beats(first.card, second.card, state.briscola.suit)
		? second.player
		: first.player;
	const gained = cardPoints(first.card) + cardPoints(second.card);
	const points: [number, number] = [...state.points];
	points[winner] += gained;

	// Pesca prima il vincitore della presa
	const deck = [...state.deck];
	const hands: [NeapolitanCard[], NeapolitanCard[]] = [
		[...state.hands[0]],
		[...state.hands[1]],
	];
	for (const p of [winner, 1 - winner]) {
		const drawn = deck.pop();
		if (drawn) hands[p].push(drawn);
	}

	const who =
		winner === 0 ? "Mano presa da te" : `Mano presa da ${state.cpuName}`;
	const finished = hands[0].length === 0 && hands[1].length === 0;
	const cpuMood = gained < 10 ? "neutral" : winner === 1 ? "happy" : "sad";
	let events = addEvent(state.events, `${who} (+${gained})`, "info", {
		[state.cpuName]: cpuMood,
	});
	const captured: [NeapolitanCard[], NeapolitanCard[]] = [
		[...state.captured[0]],
		[...state.captured[1]],
	];
	captured[winner].push(first.card, second.card);
	if (finished) {
		const tone =
			points[0] === points[1] ? "info" : points[0] > points[1] ? "win" : "lose";
		events = addEvent(events, finalMessage(points), tone, {
			[state.cpuName]:
				tone === "win" ? "sad" : tone === "lose" ? "happy" : "neutral",
		});
	}
	return {
		...state,
		events,
		hands,
		deck,
		points,
		captured,
		trick: [],
		turn: winner,
		phase: finished ? "fine" : "gioco",
		message: finished ? finalMessage(points) : `${who} (+${gained})`,
	};
}

function finalMessage([human, cpu]: [number, number]): string {
	if (human === cpu) return "60 a 60: pareggio!";
	return human > cpu
		? `Hai vinto ${human} a ${cpu}!`
		: `Hai perso ${human} a ${cpu}`;
}

/** Scelta della CPU: Facile a caso, Medio euristica, Difficile conserva i carichi e prende i punti */
export function cpuChoose(
	state: BriscolaState,
	difficulty: Difficulty = "medio",
): string {
	const hand = state.hands[1];
	if (difficulty === "facile")
		return hand[Math.floor(Math.random() * hand.length)].id;
	const trump = state.briscola.suit;
	const cost = (c: NeapolitanCard) =>
		cardPoints(c) + (c.suit === trump ? 20 : 0) + STRENGTH[c.rank] / 10;
	const cheapest = [...hand].sort((a, b) => cost(a) - cost(b));

	if (state.trick.length === 1) {
		const lead = state.trick[0].card;
		const winners = cheapest.filter((c) => beats(lead, c, trump));
		// Prende se la carta in tavola vale punti o se può prendere senza briscola
		const worthIt = winners.find((c) =>
			difficulty === "difficile"
				? cardPoints(lead) + cardPoints(c) >= 10 &&
					(c.suit !== trump || cardPoints(lead) >= 10)
				: cardPoints(lead) > 0 || c.suit !== trump,
		);
		if (worthIt) return worthIt.id;
	}
	return cheapest[0].id;
}
