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
	// Più carte ci sono, più si sovrappongono: così il ventaglio sta anche sul telefono
	const overlap =
		cards.length > 15
			? 0.38
			: cards.length > 10
				? 0.3
				: cards.length > 6
					? 0.22
					: 0.15;

	return (
		<div className="flex max-w-full flex-col items-center gap-1 sm:gap-2">
			{label && (
				<span className="text-center text-xs font-semibold text-emerald-100 sm:text-sm">
					{label}
				</span>
			)}
			<div className="flex items-end justify-center px-[calc(var(--card-w)*0.3)]">
				{cards.map((card, i) => (
					<div
						key={card.id}
						className="origin-bottom transition-transform"
						style={{
							marginInline: `calc(var(--card-w) * -${overlap})`,
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
