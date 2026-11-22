import type { FrenchCard, FrenchSuit } from "../core/deck";
import { CardFrame } from "./CardFrame";

const SUIT_SYMBOLS: Record<FrenchSuit, string> = {
	cuori: "♥",
	quadri: "♦",
	fiori: "♣",
	picche: "♠",
};
const RANK_LABELS: Record<number, string> = {
	1: "A",
	11: "J",
	12: "Q",
	13: "K",
};

export function frenchLabel(card: FrenchCard): string {
	if (card.suit === "jolly") return "Jolly";
	return `${RANK_LABELS[card.rank] ?? card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

/** Metà dei jolly sono rossi e metà neri, come nei mazzi reali */
function imageFor(card: FrenchCard): string {
	if (card.suit === "jolly")
		return `/cards/francesi/jolly-${card.id.startsWith("jolly-a") ? "rosso" : "nero"}.png`;
	return `/cards/francesi/${card.suit}-${card.rank}.png`;
}

interface FrenchCardViewProps {
	card: FrenchCard;
	faceDown?: boolean;
	selected?: boolean;
	small?: boolean;
	onClick?: () => void;
}

export function FrenchCardView({ card, ...props }: FrenchCardViewProps) {
	return (
		<CardFrame
			deck="francesi"
			layoutId={card.id}
			src={imageFor(card)}
			alt={frenchLabel(card)}
			{...props}
		/>
	);
}
