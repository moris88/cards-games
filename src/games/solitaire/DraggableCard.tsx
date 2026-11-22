import { motion } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { FrenchCardView } from "../../components/FrenchCardView";
import type { FrenchCard } from "../../core/deck";
import { dropTargetAt } from "./solitaireRules";

type DropTarget = ReturnType<typeof dropTargetAt>;

interface DraggableCardProps {
	card: FrenchCard;
	faceDown?: boolean;
	draggable: boolean;
	onDrop: (target: NonNullable<DropTarget>) => void;
	onDoubleClick?: () => void;
	onClick?: () => void;
	/** Carte sovrapposte che si trascinano insieme a questa */
	children?: ReactNode;
}

/** Carta trascinabile: porta con sé le carte sotto di lei nella colonna */
export function DraggableCard({
	card,
	faceDown,
	draggable,
	onDrop,
	onDoubleClick,
	onClick,
	children,
}: DraggableCardProps) {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<motion.div
			ref={ref}
			drag={draggable}
			dragSnapToOrigin
			dragMomentum={false}
			whileDrag={{ zIndex: 50, scale: 1.04 }}
			// Durante il trascinamento la pila non intercetta il puntatore:
			// così sotto di lei si trova la zona di rilascio
			onDragStart={() => {
				if (ref.current) ref.current.style.pointerEvents = "none";
			}}
			onDragEnd={(_, info) => {
				const target = dropTargetAt(
					info.point.x - window.scrollX,
					info.point.y - window.scrollY,
				);
				if (ref.current) ref.current.style.pointerEvents = "";
				if (target) onDrop(target);
			}}
			onDoubleClick={onDoubleClick}
			className={`relative ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
			style={{ touchAction: "none" }}
		>
			<FrenchCardView card={card} faceDown={faceDown} onClick={onClick} />
			{children}
		</motion.div>
	);
}
