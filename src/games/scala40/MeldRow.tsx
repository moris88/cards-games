import { FrenchCardView } from "../../components/FrenchCardView";
import type { FrenchCard } from "../../core/deck";

interface MeldRowProps {
	cards: FrenchCard[];
	onClick?: () => void;
}

/** Combinazione esposta sul tavolo, con carte sovrapposte */
export function MeldRow({ cards, onClick }: MeldRowProps) {
	const content = cards.map((card) => (
		<div key={card.id} className="-mr-7 last:mr-0">
			<FrenchCardView card={card} small />
		</div>
	));
	if (!onClick) return <div className="flex p-1">{content}</div>;
	return (
		<button
			type="button"
			onClick={onClick}
			title="Attacca le carte selezionate"
			className="flex rounded-lg p-1 ring-2 ring-yellow-300/60 hover:bg-yellow-300/20"
		>
			{content}
		</button>
	);
}
