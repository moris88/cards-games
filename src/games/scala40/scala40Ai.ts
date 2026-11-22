import type { FrenchCard } from "../../core/deck";
import type { Difficulty } from "../../core/settings";
import {
	attach,
	cancelOpening,
	confirmOpening,
	discardCard,
	drawFromDeck,
	drawFromDiscard,
	meld,
	type S40State,
} from "./scala40Logic";
import {
	analyzeMeld,
	isJolly,
	meldCandidates,
	OPENING_POINTS,
	penaltyValue,
} from "./scala40Melds";

/** Sceglie greedy le combinazioni di maggior valore senza sovrapposizioni */
export function bestMelds(hand: FrenchCard[]): FrenchCard[][] {
	const chosen: FrenchCard[][] = [];
	let remaining = [...hand];
	while (remaining.length > 1) {
		const best = meldCandidates(remaining)
			.filter((c) => c.length < remaining.length)
			.sort(
				(a, b) => (analyzeMeld(b)?.value ?? 0) - (analyzeMeld(a)?.value ?? 0),
			)[0];
		if (!best) break;
		chosen.push(best);
		remaining = remaining.filter((c) => !best.includes(c));
	}
	return chosen;
}

/** Utilità di una carta: quanto è vicina a formare una combinazione */
function usefulness(card: FrenchCard, hand: FrenchCard[]): number {
	if (isJolly(card)) return 100;
	return hand.filter(
		(o) =>
			o.id !== card.id &&
			!isJolly(o) &&
			(o.rank === card.rank ||
				(o.suit === card.suit && Math.abs(o.rank - card.rank) <= 2)),
	).length;
}

const apply = (state: S40State, result: S40State | string) =>
	typeof result === "string" ? state : result;

/** Una carta è utile se forma o allunga una combinazione */
const fitsSomewhere = (state: S40State, card: FrenchCard) =>
	meldCandidates([...state.players[state.current].hand, card]).some((m) =>
		m.includes(card),
	) || state.melds.some((m) => analyzeMeld([...m.cards, card]));

/** Pesca della CPU: a Difficile raccoglie lo scarto se le serve */
export function playCpuDraw(state: S40State, difficulty: Difficulty): S40State {
	const top = state.discard[state.discard.length - 1];
	if (
		difficulty === "difficile" &&
		top &&
		!isJolly(top) &&
		state.players[state.current].opened &&
		fitsSomewhere(state, top)
	) {
		return apply(state, drawFromDiscard(state));
	}
	return drawFromDeck(state);
}

/** Resto del turno della CPU: cala, attacca e scarta */
export function playCpuTurn(start: S40State, difficulty: Difficulty): S40State {
	let state = start.phase === "pesca" ? playCpuDraw(start, difficulty) : start;
	const hand = () => state.players[state.current].hand;
	const opened = state.players[state.current].opened;

	const melds = bestMelds(hand());
	const total = melds.reduce((s, m) => s + (analyzeMeld(m)?.value ?? 0), 0);
	if (opened || total >= OPENING_POINTS) {
		for (const m of melds) state = apply(state, meld(state, m));
		if (!opened) state = apply(state, confirmOpening(state));
		if (state.pending.length > 0) state = cancelOpening(state);
	}

	// A Facile la CPU dimentica spesso di attaccare
	const attaches = difficulty !== "facile" || Math.random() < 0.3;
	if (attaches && state.players[state.current].opened) {
		for (const card of hand().filter((c) => !isJolly(c))) {
			const target = state.melds.find((m) => analyzeMeld([...m.cards, card]));
			if (target) state = apply(state, attach(state, target.id, [card]));
		}
	}

	// Scarta la carta meno utile, a parità quella che pesa di più (a Facile una a caso)
	const nonJolly = hand().filter((c) => !isJolly(c));
	if (difficulty === "facile" && nonJolly.length > 0) {
		const random = nonJolly[Math.floor(Math.random() * nonJolly.length)];
		return apply(state, discardCard(state, random.id));
	}
	const toDiscard = [...hand()].sort(
		(a, b) =>
			usefulness(a, hand()) - usefulness(b, hand()) ||
			penaltyValue(b) - penaltyValue(a),
	)[0];
	return apply(state, discardCard(state, toDiscard.id));
}
