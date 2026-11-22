import type { ReactNode } from "react";
import type { FrenchCard } from "../../core/deck";
import { DraggableCard } from "./DraggableCard";
import { dropId, type dropTargetAt } from "./solitaireRules";

type Target = NonNullable<ReturnType<typeof dropTargetAt>>;

interface TableauColumnProps {
	index: number;
	cards: FrenchCard[];
	/** Quante carte in cima alla colonna sono coperte */
	faceDownCount?: number;
	canDrag: (cardIndex: number) => boolean;
	onDrop: (cardIndex: number, target: Target) => void;
	onDoubleClick: (cardIndex: number) => void;
}

/**
 * Colonna del tavolo: ogni carta contiene quelle successive, così trascinando
 * una carta si sposta tutta la pila sotto di lei.
 */
export function TableauColumn({
	index,
	cards,
	faceDownCount = 0,
	canDrag,
	onDrop,
	onDoubleClick,
}: TableauColumnProps) {
	const render = (i: number): ReactNode => {
		if (i >= cards.length) return null;
		const faceDown = i < faceDownCount;
		return (
			<div
				className={
					i === 0
						? ""
						: `absolute left-0 ${faceDown || i <= faceDownCount ? "top-[calc(var(--card-w)*0.15)]" : "top-[calc(var(--card-w)*0.32)]"}`
				}
			>
				<DraggableCard
					card={cards[i]}
					faceDown={faceDown}
					draggable={!faceDown && canDrag(i)}
					onDrop={(target) => onDrop(i, target)}
					onDoubleClick={
						i === cards.length - 1 ? () => onDoubleClick(i) : undefined
					}
				>
					{render(i + 1)}
				</DraggableCard>
			</div>
		);
	};

	return (
		<div
			data-drop={dropId("tableau", index)}
			className="min-h-[calc(var(--card-w)*5)] w-[var(--card-w)] rounded-md border-2 border-white/15"
		>
			{render(0)}
		</div>
	);
}
