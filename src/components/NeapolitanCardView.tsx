import { type NeapolitanCard, neapolitanName } from "../core/deck";
import { CardFrame } from "./CardFrame";

interface NeapolitanCardViewProps {
	card: NeapolitanCard;
	faceDown?: boolean;
	selected?: boolean;
	small?: boolean;
	onClick?: () => void;
}

export function NeapolitanCardView({
	card,
	...props
}: NeapolitanCardViewProps) {
	return (
		<CardFrame
			deck="napoletane"
			layoutId={card.id}
			src={`/cards/napoletane/${card.suit}-${card.rank}.jpg`}
			alt={neapolitanName(card)}
			{...props}
		/>
	);
}
