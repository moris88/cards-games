import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import type { NeapolitanCard } from "../../core/deck";

interface CapturePileProps {
	cards: NeapolitanCard[];
	label: string;
}

/** Mazzetto delle prese: le ultime carte prese volano qui coperte */
export function CapturePile({ cards, label }: CapturePileProps) {
	return (
		<div className="flex flex-col items-center gap-1 text-xs">
			<div className="grid">
				{cards.slice(-2).map((card) => (
					<div key={card.id} className="col-start-1 row-start-1">
						<NeapolitanCardView card={card} small faceDown />
					</div>
				))}
				{cards.length === 0 && <div className="h-20 w-12" />}
			</div>
			{label}
		</div>
	);
}
