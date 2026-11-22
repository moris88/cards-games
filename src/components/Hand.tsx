import type { ReactNode } from "react";

interface HandProps<T extends { id: string }> {
	cards: T[];
	renderCard: (card: T) => ReactNode;
	label?: string;
}

/** Mano di carte disposte a ventaglio */
export function Hand<T extends { id: string }>({
	cards,
	renderCard,
	label,
}: HandProps<T>) {
	const middle = (cards.length - 1) / 2;
	const spread = Math.min(6, 40 / Math.max(cards.length, 1));

	return (
		<div className="flex flex-col items-center gap-2">
			{label && (
				<span className="text-sm font-semibold text-emerald-100">{label}</span>
			)}
			<div className="flex min-h-32 items-end justify-center px-4">
				{cards.map((card, i) => (
					<div
						key={card.id}
						className="-mx-3 origin-bottom transition-transform"
						style={{
							transform: `rotate(${(i - middle) * spread}deg) translateY(${Math.abs(i - middle) * 2}px)`,
						}}
					>
						{renderCard(card)}
					</div>
				))}
			</div>
		</div>
	);
}
