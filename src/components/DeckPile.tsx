import { CardFrame, cardSlotClass, type DeckType } from "./CardFrame";

interface DeckPileProps {
	deck: DeckType;
	/** Carte in cima al mazzo (l'ultima è la prossima pescata): da qui partono le animazioni */
	topIds: string[];
	count: number;
	label?: string;
	small?: boolean;
	onClick?: () => void;
}

/** Mazzo coperto: le carte in cima hanno il loro layoutId e volano verso la mano */
export function DeckPile({
	deck,
	topIds,
	count,
	label,
	small,
	onClick,
}: DeckPileProps) {
	return (
		<div className="flex flex-col items-center gap-1 text-xs">
			<div className="relative">
				{count > 0 ? (
					<>
						{/* Spessore del mazzo */}
						<div className="absolute top-1 left-1 opacity-70">
							<CardFrame deck={deck} faceDown small={small} />
						</div>
						<div className="grid">
							{topIds.map((id, i) => (
								<div key={id} className="col-start-1 row-start-1">
									<CardFrame
										deck={deck}
										layoutId={id}
										faceDown
										small={small}
										onClick={i === topIds.length - 1 ? onClick : undefined}
									/>
								</div>
							))}
						</div>
					</>
				) : (
					<div
						className={`${cardSlotClass(deck, small)} rounded-md border-2 border-dashed border-white/30`}
					/>
				)}
			</div>
			{label ?? `Mazzo (${count})`}
		</div>
	);
}
