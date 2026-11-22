import { motion } from "framer-motion";

export type DeckType = "napoletane" | "francesi";

/**
 * Larghezza dalle variabili CSS (cambiano con lo schermo) e altezza dalle
 * proporzioni reali delle immagini: napoletane 330×545, francesi 2:3
 */
const ASPECT: Record<DeckType, string> = {
	napoletane: "aspect-[330/545]",
	francesi: "aspect-[2/3]",
};
const SIZES: Record<DeckType, { normal: string; small: string }> = {
	napoletane: {
		normal: `w-[var(--card-w)] ${ASPECT.napoletane}`,
		small: `w-[var(--card-w-sm)] ${ASPECT.napoletane}`,
	},
	francesi: {
		normal: `w-[var(--card-w)] ${ASPECT.francesi}`,
		small: `w-[var(--card-w-sm)] ${ASPECT.francesi}`,
	},
};

/** Segnaposto con le stesse dimensioni di una carta (pile vuote, spazi) */
export const cardSlotClass = (deck: DeckType, small = false) =>
	SIZES[deck][small ? "small" : "normal"];

const backImage = (deck: DeckType) =>
	`/cards/${deck}/retro.${deck === "napoletane" ? "jpg" : "png"}`;

interface CardFrameProps {
	deck: DeckType;
	/** Id della carta: la stessa carta vola da una zona all'altra del tavolo */
	layoutId?: string;
	src?: string;
	alt?: string;
	faceDown?: boolean;
	selected?: boolean;
	small?: boolean;
	onClick?: () => void;
}

/** Carta da gioco con immagine fronte/retro e animazioni di spostamento */
export function CardFrame({
	deck,
	layoutId,
	src,
	alt,
	faceDown,
	selected,
	small,
	onClick,
}: CardFrameProps) {
	const size = SIZES[deck][small ? "small" : "normal"];
	const ring = selected ? "ring-4 ring-yellow-400" : "";
	const covered = faceDown || !src;
	const image = covered ? backImage(deck) : src;

	return (
		<motion.button
			type="button"
			layoutId={layoutId}
			layout
			transition={{ type: "spring", stiffness: 260, damping: 26 }}
			animate={{ y: selected ? -16 : 0 }}
			whileHover={onClick ? { y: selected ? -20 : -8 } : undefined}
			title={covered ? "Carta coperta" : alt}
			disabled={!onClick}
			onClick={onClick}
			className={`${size} ${ring} ${onClick ? "cursor-pointer" : "cursor-default"} relative shrink-0 overflow-hidden rounded-md bg-white shadow-md shadow-black/40 select-none [perspective:600px]`}
		>
			{/* Cambiando faccia la carta si gira */}
			<motion.img
				key={covered ? "retro" : "fronte"}
				initial={{ rotateY: 90 }}
				animate={{ rotateY: 0 }}
				transition={{ duration: 0.25 }}
				src={image}
				alt={covered ? "Carta coperta" : alt}
				draggable={false}
				className="h-full w-full object-fill"
			/>
		</motion.button>
	);
}
