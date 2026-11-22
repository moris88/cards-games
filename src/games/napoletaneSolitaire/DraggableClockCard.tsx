import { motion } from "framer-motion";
import { useRef } from "react";
import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import type { NeapolitanCard } from "../../core/deck";

interface DraggableClockCardProps {
	card: NeapolitanCard;
	/** Chiamata con l'indice del mazzetto su cui è stata lasciata la carta */
	onDrop: (pileIndex: number) => void;
}

/** Mazzetto sotto il puntatore, letto dall'attributo data-pile */
function pileAt(x: number, y: number): number | null {
	for (const el of document.elementsFromPoint(x, y)) {
		const pile = el instanceof HTMLElement ? el.dataset.pile : undefined;
		if (pile !== undefined) return Number(pile);
	}
	return null;
}

/** Carta girata da trascinare sul mazzetto del suo valore */
export function DraggableClockCard({ card, onDrop }: DraggableClockCardProps) {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<motion.div
			ref={ref}
			drag
			dragSnapToOrigin
			dragMomentum={false}
			whileDrag={{ scale: 1.08, zIndex: 50 }}
			className="cursor-grab active:cursor-grabbing"
			style={{ touchAction: "none" }}
			// Durante il trascinamento la carta non copre i mazzetti sotto il puntatore
			onDragStart={() => {
				if (ref.current) ref.current.style.pointerEvents = "none";
			}}
			onDragEnd={(_, info) => {
				const pile = pileAt(
					info.point.x - window.scrollX,
					info.point.y - window.scrollY,
				);
				if (ref.current) ref.current.style.pointerEvents = "";
				if (pile !== null) onDrop(pile);
			}}
		>
			<NeapolitanCardView card={card} />
		</motion.div>
	);
}
