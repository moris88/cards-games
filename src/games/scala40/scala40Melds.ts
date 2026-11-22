import type { FrenchCard } from "../../core/deck";

export const OPENING_POINTS = 40;

export interface MeldAnalysis {
	type: "tris" | "scala";
	value: number;
	/** Carte nell'ordine di esposizione sul tavolo */
	ordered: FrenchCard[];
}

export const isJolly = (c: FrenchCard) => c.suit === "jolly";

/** Valore di una posizione: asso alto (14) vale 11, asso basso 1, figure 10 */
const positionValue = (rank: number) =>
	rank === 14 ? 11 : rank === 1 ? 1 : Math.min(rank, 10);

/** Penalità di una carta rimasta in mano a fine mano */
export const penaltyValue = (c: FrenchCard) =>
	isJolly(c) ? 25 : c.rank === 1 ? 11 : Math.min(c.rank, 10);

function analyzeSet(
	naturals: FrenchCard[],
	jollies: FrenchCard[],
): MeldAnalysis | null {
	const total = naturals.length + jollies.length;
	if (total < 3 || total > 4 || naturals.length === 0) return null;
	const rank = naturals[0].rank;
	if (naturals.some((c) => c.rank !== rank)) return null;
	if (new Set(naturals.map((c) => c.suit)).size !== naturals.length)
		return null;
	const unit = rank === 1 ? 11 : Math.min(rank, 10);
	return {
		type: "tris",
		value: unit * total,
		ordered: [...naturals, ...jollies],
	};
}

function analyzeRun(
	naturals: FrenchCard[],
	jollies: FrenchCard[],
	aceHigh: boolean,
): MeldAnalysis | null {
	const total = naturals.length + jollies.length;
	if (total < 3 || naturals.length === 0) return null;
	if (new Set(naturals.map((c) => c.suit)).size !== 1) return null;
	const withPos = naturals
		.map((card) => ({ card, pos: aceHigh && card.rank === 1 ? 14 : card.rank }))
		.sort((a, b) => a.pos - b.pos);
	const positions = withPos.map((x) => x.pos);
	if (new Set(positions).size !== positions.length) return null;

	const min = positions[0];
	const max = positions[positions.length - 1];
	const gaps = max - min + 1 - naturals.length;
	if (gaps > jollies.length) return null;
	// I jolly avanzati estendono la scala in alto, poi in basso
	let start = min;
	let end = max;
	let spare = jollies.length - gaps;
	while (spare > 0 && end < (aceHigh ? 14 : 13)) {
		end++;
		spare--;
	}
	while (spare > 0 && start > (aceHigh ? 2 : 1)) {
		start--;
		spare--;
	}
	if (spare > 0) return null;

	const freeJollies = [...jollies];
	const ordered: FrenchCard[] = [];
	let value = 0;
	for (let pos = start; pos <= end; pos++) {
		const natural = withPos.find((x) => x.pos === pos);
		ordered.push(natural ? natural.card : (freeJollies.pop() as FrenchCard));
		value += positionValue(pos);
	}
	return { type: "scala", value, ordered };
}

/** Analizza un gruppo di carte: tris/poker o scala, al massimo un jolly */
export function analyzeMeld(cards: FrenchCard[]): MeldAnalysis | null {
	const jollies = cards.filter(isJolly);
	if (jollies.length > 1) return null;
	const naturals = cards.filter((c) => !isJolly(c));
	return (
		analyzeSet(naturals, jollies) ??
		analyzeRun(naturals, jollies, false) ??
		analyzeRun(naturals, jollies, true)
	);
}

/** Possibili combinazioni (anche sovrapposte) presenti in una mano */
export function meldCandidates(hand: FrenchCard[]): FrenchCard[][] {
	const naturals = hand.filter((c) => !isJolly(c));
	const jolly = hand.find(isJolly);
	const candidates: FrenchCard[][] = [];

	// Tris e poker: carte dello stesso valore con semi diversi
	const byRank = new Map<number, FrenchCard[]>();
	for (const c of naturals) {
		const group = byRank.get(c.rank) ?? [];
		if (!group.some((g) => g.suit === c.suit)) group.push(c);
		byRank.set(c.rank, group);
	}
	for (const group of byRank.values()) {
		if (group.length >= 3) candidates.push(group.slice(0, 4));
		if (jolly && group.length >= 2)
			candidates.push([...group.slice(0, 3), jolly]);
	}

	// Scale: sequenze consecutive dello stesso seme (asso basso o alto)
	for (const suit of new Set(naturals.map((c) => c.suit))) {
		const bySuit = new Map<number, FrenchCard>();
		for (const c of naturals.filter((n) => n.suit === suit)) {
			bySuit.set(c.rank, c);
			if (c.rank === 1) bySuit.set(14, c);
		}
		const positions = [...bySuit.keys()].sort((a, b) => a - b);
		for (let i = 0; i < positions.length; i++) {
			const seq: FrenchCard[] = [];
			for (let p = positions[i]; bySuit.has(p); p++) {
				const card = bySuit.get(p) as FrenchCard;
				if (seq.includes(card)) break;
				seq.push(card);
				if (seq.length >= 3) candidates.push([...seq]);
				if (jolly && seq.length >= 2) candidates.push([...seq, jolly]);
			}
			// Due carte con un buco colmabile dal jolly
			const gapCard = bySuit.get(positions[i] + 2);
			const first = bySuit.get(positions[i]) as FrenchCard;
			if (jolly && gapCard && gapCard !== first) {
				candidates.push([first, jolly, gapCard]);
			}
		}
	}
	return candidates.filter((c) => analyzeMeld(c) !== null);
}
