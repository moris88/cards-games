import type { ReactNode } from "react";
import { cardSlotClass } from "../../components/CardFrame";

interface PileSlotProps {
	drop?: string;
	label?: string;
	children?: ReactNode;
	onClick?: () => void;
}

/** Spazio per una pila (fondazione, cella libera, mazzo) con bordo tratteggiato */
export function PileSlot({ drop, label, children, onClick }: PileSlotProps) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: il clic sul mazzo vuoto è un'alternativa al bottone dedicato
		// biome-ignore lint/a11y/useKeyWithClickEvents: vedi sopra
		<div
			data-drop={drop}
			onClick={onClick}
			className={`${cardSlotClass("francesi")} relative grid place-items-center rounded-md border-2 border-dashed border-white/30 text-2xl text-white/30`}
		>
			<span className="col-start-1 row-start-1">{label}</span>
			{children && <div className="col-start-1 row-start-1">{children}</div>}
		</div>
	);
}
